/* Private GA4 reports. Google loads only after affirmative consent.
 * Required property setting: Enhanced Measurement OFF. The sanitized click and
 * download events here replace its outbound/download collectors.
 * Do not add a second gtag/GTM snippet alongside this component. */
(function () {
  'use strict';

  const source = document.currentScript;
  const measurementId = source?.dataset.ga4Id || '';
  const configuredOrigin = source?.dataset.ga4Origin || '';
  const settingsButtons = document.querySelectorAll('[data-analytics-settings]');
  let productionOrigin;
  try {
    const configured = new URL(configuredOrigin);
    if (configured.protocol !== 'https:' || configured.username || configured.password ||
        configured.pathname !== '/' || configured.search || configured.hash) throw new Error('Invalid origin');
    productionOrigin = configured.origin;
    if (!/^G-[A-Z0-9]{10}$/.test(measurementId) || location.origin !== productionOrigin ||
        /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) throw new Error('Inactive analytics');
  } catch (_) {
    settingsButtons.forEach(button => { button.hidden = true; });
    return;
  }
  if (window.SiteAnalytics) return;

  const panel = document.getElementById('analytics-consent');
  if (!panel) return; // Consent controls must exist before tracking.
  const title = document.getElementById('analytics-consent-title');
  const status = document.getElementById('analytics-status');
  const current = panel.querySelector('[data-analytics-current]');
  const closeButton = panel.querySelector('[data-analytics-close]');
  if (!title || !status || !current || !closeButton) return;
  const storageKey = 'site.analytics.consent.v1';
  const choiceLifetime = 180 * 24 * 60 * 60 * 1000;
  const placements = new Set(['nav', 'hero', 'research', 'publication', 'news', 'project', 'contact', 'sidebar', 'footer', 'content']);
  const labelPattern = /^[a-z][a-z0-9_]{0,39}$/;
  const filePattern = /\.(pdf|xlsx?|docx?|txt|rtf|csv|exe|key|ppsx?|pptx?|7z|pkg|rar|gz|zip|avi|mov|mp4|mpe?g|wmv|midi?|mp3|wav|wma)$/i;
  const disableKey = 'ga-disable-' + measurementId;
  let consent = null;
  let started = false;
  let tag = null;
  let returnFocus = null;

  function syncBarSpace() {
    if (!document.documentElement?.style?.setProperty) return;
    const height = panel.hidden ? 0 : Math.ceil(panel.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--analytics-consent-height', height + 'px');
  }
  if (typeof ResizeObserver === 'function') new ResizeObserver(syncBarSpace).observe(panel);

  function readChoice() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (stored?.version === 1 && ['granted', 'denied'].includes(stored.choice) &&
          Number.isFinite(stored.at) && stored.at <= Date.now() && Date.now() - stored.at < choiceLifetime) {
        return stored.choice;
      }
    } catch (_) { /* Storage can be unavailable; no tracking is the default. */ }
    return null;
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, choice, at: Date.now() }));
      return true;
    } catch (_) { return false; }
  }

  function cleanURL(value) {
    try {
      const url = new URL(value, productionOrigin);
      return /^https?:$/.test(url.protocol) && !url.username && !url.password
        ? url.origin + url.pathname : '';
    } catch (_) { return ''; }
  }

  function cleanReferrer() {
    if (!document.referrer) return '';
    try {
      const url = new URL(document.referrer);
      return /^https?:$/.test(url.protocol) ? url.origin + '/' : '';
    } catch (_) { return ''; }
  }

  function elementLabel(element, fallback) {
    const value = element.dataset.analyticsId || '';
    return labelPattern.test(value) ? value : fallback;
  }

  function start() {
    if (consent !== 'granted' || started || location.origin !== productionOrigin) return;
    if (window.gtag || window.dataLayer || document.querySelector('script[src*="googletagmanager.com/gtag/js"],script[src*="googletagmanager.com/gtm.js"]')) {
      if (status) status.textContent = 'Analytics could not start. Your choice has been saved.';
      return; // Avoid sharing an unknown tag or collecting twice.
    }
    started = true;
    window[disableKey] = false;
    window.dataLayer = [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: true,
      page_location: cleanURL(location.href),
      page_referrer: cleanReferrer(),
      cookie_domain: location.hostname,
      cookie_path: '/',
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    tag = document.createElement('script');
    tag.async = true;
    tag.referrerPolicy = 'no-referrer';
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(tag);
  }

  function removeAnalyticsCookies() {
    let names;
    try {
      names = document.cookie.split(';').map(value => value.trim().split('=')[0])
        .filter(name => /^_ga(?:_|$)/.test(name));
    } catch (_) { return; }
    // This component sets cookies on the production host and root path only.
    for (const name of names) {
      for (const domain of ['', location.hostname, '.' + location.hostname]) {
        try {
          document.cookie = name + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;' +
            (domain ? ' domain=' + domain + ';' : '') + ' SameSite=Lax; Secure';
        } catch (_) { /* A browser may restrict cookie access. */ }
      }
    }
  }

  function stop() {
    window[disableKey] = true;
    tag?.remove();
    removeAnalyticsCookies();
    // Reload removes the existing Google listeners/timers. No consent-update
    // ping is sent on rejection. The next page reads the saved denied choice.
    if (started) location.reload();
  }

  function showSettings(opener) {
    returnFocus = opener || null;
    current.textContent = consent === 'granted' ? 'Your current choice: analytics accepted.'
      : consent === 'denied' ? 'Your current choice: analytics declined.' : 'Analytics is off until you accept.';
    current.hidden = consent === null;
    closeButton.hidden = consent === null;
    panel.hidden = false;
    syncBarSpace();
    if (opener) title.focus();
  }

  function hideSettings() {
    panel.hidden = true;
    syncBarSpace();
    returnFocus?.focus();
    returnFocus = null;
  }

  function choose(choice) {
    consent = choice;
    const saved = saveChoice(choice);
    hideSettings();
    status.textContent = (choice === 'granted' ? 'Analytics accepted.' : 'Analytics declined.') +
      (saved ? ' You can change this in Analytics settings.' : ' Your browser could not save this choice for your next visit.');
    if (choice === 'granted') start();
    else stop();
  }

  function send(name, values) {
    if (consent !== 'granted' || !started || window[disableKey] || location.origin !== productionOrigin) return;
    window.gtag('event', name, {
      send_to: measurementId,
      page_location: cleanURL(location.href),
      page_referrer: cleanReferrer(),
      source_path: location.pathname,
      ...values
    });
  }

  function trackClick(event) {
    if (consent !== 'granted' || event.defaultPrevented || (event.button != null && event.button !== 0)) return;
    const element = event.target?.closest?.('a[href],button[data-analytics-id]');
    if (!element || element.closest('[data-analytics-settings],#analytics-consent')) return;
    const requestedPlacement = element.dataset.analyticsPlacement;
    const placement = placements.has(requestedPlacement) ? requestedPlacement : 'content';
    if (element.tagName === 'BUTTON') {
      const elementId = elementLabel(element, '');
      if (elementId) send('button_click', { element_id: elementId, placement });
      return;
    }
    let destination;
    try { destination = new URL(element.getAttribute('href'), location.href); }
    catch (_) { return; }
    if (destination.protocol === 'mailto:' || destination.protocol === 'tel:') {
      send('contact_click', {
        element_id: elementLabel(element, destination.protocol === 'mailto:' ? 'contact_email' : 'contact_phone'), placement
      });
      return; // Never send email/telephone targets, link text, subjects or body.
    }
    const linkURL = cleanURL(destination.href);
    if (!linkURL) return;
    const file = destination.pathname.match(filePattern);
    const linkId = elementLabel(element, file ? 'download' : 'external_link');
    if (file) {
      send('file_download', {
        element_id: linkId, placement,
        file_extension: file[1].toLowerCase(), file_name: destination.pathname,
        link_url: linkURL, link_domain: destination.hostname, link_id: linkId
      });
    } else if (destination.origin !== productionOrigin) {
      send('click', {
        element_id: linkId, placement, outbound: true,
        link_url: linkURL, link_domain: destination.hostname, link_id: linkId
      });
    } else {
      const elementId = elementLabel(element, '');
      if (elementId) send('internal_link_click', { element_id: elementId, placement, link_url: linkURL });
    }
    // Never block navigation or wait for analytics delivery.
  }

  document.addEventListener('click', event => {
    const control = event.target?.closest?.('[data-analytics-settings],[data-analytics-accept],[data-analytics-decline],[data-analytics-close]');
    if (control) {
      event.preventDefault();
      if (control.hasAttribute('data-analytics-settings')) showSettings(control);
      else if (control.hasAttribute('data-analytics-accept')) choose('granted');
      else if (control.hasAttribute('data-analytics-decline')) choose('denied');
      else if (control.hasAttribute('data-analytics-close') && consent !== null) hideSettings();
      return;
    }
    trackClick(event);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden && consent !== null) hideSettings();
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    consent = readChoice();
    if (consent === 'granted') { hideSettings(); start(); }
    else {
      if (consent === null) showSettings();
      else hideSettings();
      stop();
    }
  });
  window.SiteAnalytics = Object.freeze({ openSettings: () => showSettings(document.activeElement) });
  consent = readChoice();
  if (consent === 'granted') start();
  else if (consent === null) showSettings();
  else window[disableKey] = true;
})();
