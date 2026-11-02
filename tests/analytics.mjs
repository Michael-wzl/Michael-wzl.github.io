// Network-free behavioral checks. No Google code or real telemetry is executed.
// Run: node --test tests/analytics.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const code = readFileSync(new URL('../assets/js/analytics.js', import.meta.url), 'utf8');
const key = 'site.analytics.consent.v1';
const origin = 'https://michael-wzl.github.io';
const id = 'G-1234567890';
const saved = choice => JSON.stringify({ version: 1, choice, at: Date.now() });

function browser(options = {}) {
  const documentHandlers = {};
  const windowHandlers = {};
  const requests = [];
  const storage = options.storage || new Map();
  const cookieWrites = [];
  let reloads = 0;
  let storageReads = 0;
  function element(name, attributes = {}, tagName = 'BUTTON') {
    return {
      name, attributes, tagName, hidden: true, textContent: '', dataset: {}, focusCount: 0,
      focus() { this.focusCount++; },
      hasAttribute(attr) { return Object.hasOwn(this.attributes, attr); },
      getAttribute(attr) { return this.attributes[attr] ?? null; },
      closest(selector) {
        if (selector.includes('data-analytics-settings') && this.name === 'settings') return this;
        if (selector.includes('data-analytics-accept') && this.name === 'accept') return this;
        if (selector.includes('data-analytics-decline') && this.name === 'decline') return this;
        if (selector.includes('data-analytics-close') && this.name === 'close') return this;
        if (selector.includes('#analytics-consent') && ['accept', 'decline', 'close', 'privacy'].includes(this.name)) return this;
        if (selector.includes('a[href]') && this.tagName === 'A') return this;
        if (selector.includes('button[data-analytics-id]') && this.tagName === 'BUTTON' && this.dataset.analyticsId) return this;
        return null;
      }
    };
  }
  const elements = {
    settings: element('settings', { 'data-analytics-settings': '' }),
    accept: element('accept', { 'data-analytics-accept': '' }),
    decline: element('decline', { 'data-analytics-decline': '' }),
    close: element('close', { 'data-analytics-close': '' }),
    title: element('title'), current: element('current'), status: element('status'),
    panel: element('panel')
  };
  elements.settings.hidden = false;
  elements.panel.querySelector = selector => selector === '[data-analytics-current]' ? elements.current : elements.close;
  const document = {
    currentScript: { dataset: { ga4Id: id, ga4Origin: origin, ...options.config } },
    activeElement: elements.settings,
    referrer: 'https://referrer.test/private/path?email=secret@example.test#token',
    querySelectorAll: () => [elements.settings],
    querySelector: () => options.duplicateTag ? {} : null,
    getElementById(name) {
      const which = { 'analytics-consent': 'panel', 'analytics-consent-title': 'title', 'analytics-status': 'status' }[name];
      return options.missingPanel && which === 'panel' ? null : elements[which];
    },
    createElement: () => ({ remove() { this.removed = true; } }),
    head: { appendChild: script => requests.push(script) },
    addEventListener(name, callback) { (documentHandlers[name] ||= []).push(callback); }
  };
  Object.defineProperty(document, 'cookie', {
    get() { return '_ga=browser; _ga_1234567890=session; preference=keep'; },
    set(value) { cookieWrites.push(value); }
  });
  const location = {
    origin, hostname: 'michael-wzl.github.io',
    href: origin + '/portfolio/?email=secret@example.test#fragment', pathname: '/portfolio/',
    reload() { reloads++; }, ...options.location
  };
  const window = {
    addEventListener(name, callback) { (windowHandlers[name] ||= []).push(callback); },
    ...(options.existingGtag ? { gtag() {} } : {})
  };
  const context = vm.createContext({ URL, Set, Date, Number, Object, Error, JSON, document, window, location,
    localStorage: {
      getItem(name) { storageReads++; if (options.noStorage) throw new Error('blocked'); return storage.get(name) ?? null; },
      setItem(name, value) { if (options.noStorage) throw new Error('blocked'); storage.set(name, value); }
    }
  });
  const run = () => vm.runInContext(code, context);
  run();
  function click(target, extra = {}) {
    const event = { target, button: 0, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...extra };
    for (const callback of documentHandlers.click || []) callback(event);
    return event;
  }
  return {
    window, location, elements, requests, storage, cookieWrites, run,
    get reloads() { return reloads; }, get storageReads() { return storageReads; },
    commands: () => Array.from(window.dataLayer || [], args => [...args]),
    events: () => Array.from(window.dataLayer || [], args => [...args]).filter(args => args[0] === 'event'),
    click, control: name => click(elements[name]),
    link(href, dataset = {}, extra = {}) {
      const link = element('link', { href }, 'A'); link.dataset = dataset;
      return click(link, extra);
    },
    button(dataset) { const button = element('button'); button.dataset = dataset; return click(button); },
    storageEvent(event) { for (const callback of windowHandlers.storage || []) callback(event); },
    keydown(keyName) { for (const callback of documentHandlers.keydown || []) callback({ key: keyName }); }
  };
}

test('missing/malformed ID and nonproduction origin fail closed before storage or Google access', () => {
  for (const options of [
    { config: { ga4Id: '' } }, { config: { ga4Id: 'G-!!!!!!!!!!' } },
    { config: { ga4Id: '123456789' } }, { config: { ga4Origin: '' } },
    { config: { ga4Origin: origin + '/other/' } }, { config: { ga4Origin: origin + '/?secret=1' } },
    { location: { origin: 'http://localhost:4000', hostname: 'localhost' } },
    { location: { origin: 'https://preview.example.test', hostname: 'preview.example.test' } }
  ]) {
    const b = browser(options);
    assert.equal(b.requests.length, 0); assert.equal(b.storageReads, 0);
    assert.equal(b.elements.panel.hidden, true); assert.equal(b.elements.settings.hidden, true);
    assert.equal(b.window.SiteAnalytics, undefined);
  }
});

test('unknown choice shows the banner without loading Google or stealing focus', () => {
  const b = browser();
  assert.equal(b.requests.length, 0); assert.equal(b.elements.panel.hidden, false);
  assert.equal(b.elements.title.focusCount, 0); assert.equal(b.elements.close.hidden, true);
  b.link('https://example.test/');
  assert.equal(b.events().length, 0);
});

test('decline persists without a Google request, then settings can reopen and accept', () => {
  const b = browser(); b.control('decline');
  assert.equal(JSON.parse(b.storage.get(key)).choice, 'denied');
  assert.equal(b.requests.length, 0); assert.equal(b.reloads, 0);
  assert.equal(b.elements.panel.hidden, true);
  b.control('settings');
  assert.equal(b.elements.panel.hidden, false); assert.equal(b.elements.title.focusCount, 1);
  b.control('accept');
  assert.equal(b.requests.length, 1);
  assert.equal(JSON.parse(b.storage.get(key)).choice, 'granted');
});

test('accept loads one destination and sanitizes initial page/referrer metadata', () => {
  const b = browser(); b.control('accept'); b.control('accept');
  assert.equal(b.requests.length, 1);
  assert.equal(b.requests[0].referrerPolicy, 'no-referrer');
  const configs = b.commands().filter(args => args[0] === 'config');
  assert.equal(configs.length, 1);
  assert.equal(configs[0][1], id);
  assert.equal(configs[0][2].page_location, origin + '/portfolio/');
  assert.equal(configs[0][2].page_referrer, 'https://referrer.test/');
  assert.equal(configs[0][2].allow_google_signals, false);
  assert.equal(configs[0][2].allow_ad_personalization_signals, false);
  assert.equal(b.commands()[0][2].ad_storage, 'denied');
  assert.equal(b.commands()[0][2].ad_user_data, 'denied');
});

test('stored choices survive static-page navigation; denied choice makes no request', () => {
  const storage = new Map([[key, saved('granted')]]);
  assert.equal(browser({ storage }).requests.length, 1);
  assert.equal(browser({ storage }).requests.length, 1);
  storage.set(key, saved('denied'));
  const denied = browser({ storage });
  assert.equal(denied.requests.length, 0); assert.equal(denied.elements.panel.hidden, true);
});

test('expired, corrupt and future preferences do not imply acceptance', () => {
  for (const value of ['bad JSON', saved('other'), JSON.stringify({ version: 1, choice: 'granted', at: 0 }),
    JSON.stringify({ version: 1, choice: 'granted', at: Date.now() + 60000 })]) {
    const b = browser({ storage: new Map([[key, value]]) });
    assert.equal(b.requests.length, 0); assert.equal(b.elements.panel.hidden, false);
  }
});

test('unavailable storage still requires explicit acceptance', () => {
  const b = browser({ noStorage: true });
  assert.equal(b.requests.length, 0); b.control('accept');
  assert.equal(b.requests.length, 1); assert.match(b.elements.status.textContent, /could not save/);
});

test('click reports route each interaction once, omit private payloads and preserve navigation', () => {
  const b = browser(); b.control('accept');
  const link = b.link('https://github.com/HKU-TASR/AFRBench?email=secret@example.test#private', {
    analyticsId: 'afrbench_repository', analyticsPlacement: 'research'
  });
  assert.equal(link.defaultPrevented, false);
  b.link('https://paper.test/paper.pdf?token=secret#page=2', { analyticsId: 'protego_paper' });
  b.link('/cv/?secret=1#private', { analyticsId: 'nav_cv', analyticsPlacement: 'nav' });
  b.link('mailto:secret@example.test?subject=secret&body=secret');
  b.link('tel:+123456789');
  b.button({ analyticsId: 'project_expand', analyticsPlacement: 'project' });
  assert.deepEqual(b.events().map(args => args[1]), ['click', 'file_download', 'internal_link_click', 'contact_click', 'contact_click', 'button_click']);
  assert.equal(b.events()[0][2].link_url, 'https://github.com/HKU-TASR/AFRBench');
  assert.equal(b.events()[1][2].file_name, '/paper.pdf');
  assert.equal(b.events()[2][2].placement, 'nav');
  const payloads = JSON.stringify(b.commands());
  for (const forbidden of ['secret', '+123456789', '?', '#', 'mailto:', 'tel:']) assert.equal(payloads.includes(forbidden), false);
});

test('unselected/internal, nonweb, credential-bearing and prevented links emit nothing', () => {
  const b = browser(); b.control('accept');
  b.link('/cv/'); b.link('javascript:alert(1)'); b.link('data:text/html,private');
  b.link('https://user:password@example.test/');
  b.link('https://example.test/', {}, { defaultPrevented: true });
  b.link('https://example.test/', {}, { button: 1 });
  b.button({ analyticsId: 'invalid arbitrary text' });
  assert.equal(b.events().length, 0);
});

test('consent controls are never analytics button events and closing restores focus', () => {
  const b = browser(); b.control('accept'); b.control('settings');
  b.keydown('Escape');
  assert.equal(b.elements.panel.hidden, true); assert.ok(b.elements.settings.focusCount > 0);
  assert.equal(b.events().length, 0);
});

test('withdrawal disables collection, removes accessible GA cookies, reloads and persists denial', () => {
  const b = browser(); b.control('accept');
  const commandCount = b.commands().length;
  b.control('settings'); b.control('decline');
  assert.equal(b.window['ga-disable-' + id], true); assert.equal(b.requests[0].removed, true);
  assert.equal(b.reloads, 1); assert.equal(b.commands().length, commandCount);
  assert.equal(JSON.parse(b.storage.get(key)).choice, 'denied');
  assert.ok(b.cookieWrites.some(value => value.startsWith('_ga=')));
  assert.ok(b.cookieWrites.some(value => value.startsWith('_ga_1234567890=')));
  assert.equal(b.cookieWrites.some(value => value.startsWith('preference=')), false);
  b.link('https://example.test/'); assert.equal(b.events().length, 0);
  assert.equal(browser({ storage: b.storage }).requests.length, 0);
});

test('cross-tab revocation stops the accepted page without sending another event', () => {
  const b = browser({ storage: new Map([[key, saved('granted')]]) });
  b.storage.set(key, saved('denied')); b.storageEvent({ key });
  assert.equal(b.window['ga-disable-' + id], true); assert.equal(b.reloads, 1);
  assert.equal(b.commands().some(args => args[0] === 'event'), false);
});

test('duplicate component execution or an existing tag never starts a second collector', () => {
  const b = browser(); b.run(); b.control('accept');
  assert.equal(b.requests.length, 1); b.link('https://example.test/');
  assert.equal(b.events().length, 1);
  for (const options of [{ duplicateTag: true }, { existingGtag: true }]) {
    const conflict = browser(options); conflict.control('accept'); conflict.link('https://example.test/');
    assert.equal(conflict.requests.length, 0); assert.equal(conflict.events().length, 0);
  }
});

test('missing consent controls prevent a saved acceptance from loading Google', () => {
  const b = browser({ missingPanel: true, storage: new Map([[key, saved('granted')]]) });
  assert.equal(b.requests.length, 0); assert.equal(b.window.SiteAnalytics, undefined);
});
