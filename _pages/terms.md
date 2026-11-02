---
permalink: /terms/
title: "Privacy"
modified: 2026-11-02
---

This is Ziling Wang’s personal website, hosted on GitHub Pages. This page describes the website’s optional analytics and the choices available to visitors.

{% assign ga4_id = site.analytics.google.tracking_id | default: '' | strip %}
{% assign ga4_prefix = ga4_id | slice: 0, 2 %}
{% assign ga4_length = ga4_id | size %}
{% if site.analytics.provider == 'google-analytics-4' and ga4_prefix == 'G-' and ga4_length == 12 and site.analytics.google.production_origin %}

## Optional website analytics

Google Analytics 4 is available on the production website. The Google tag loads only after you accept analytics. Declining leaves analytics off and does not restrict access to any content.

If you accept, Google receives information about page views, selected link and button clicks, downloads, approximate country/region/city, browser/device characteristics, and time that pages remain in focus. The site uses this information to understand which research and other content visitors find useful. Analytics reports are private to the site owner and people the owner explicitly authorizes; visitor counts, maps and dashboards are not published on this website.

This site’s analytics code omits URL query strings and fragments from the page and link URLs it sends, reduces referrers to their origin, and labels email/telephone contact clicks without sending the address, number or message. It does not collect form input, record sessions, generate heatmaps, or record mouse movements. Advertising personalization and Google signals are disabled. Analytics still processes usage and device data; this is not a promise of complete anonymity.

Google Analytics uses first-party cookies to distinguish browsers and sessions. This site stores your analytics choice in your browser for up to 180 days. That preference is separate from Google’s analytics cookies. If browser storage is unavailable, you may need to make the choice again on another page or visit.

Use <button type="button" class="privacy-settings-button" data-analytics-settings>Analytics settings</button> in the footer or here to accept or decline. Withdrawing acceptance disables analytics, removes this site’s accessible Google Analytics cookies, and reloads the page to remove the running tag. Data already sent before withdrawal is not withdrawn by this control. Clearing browser storage also resets the saved choice.

Time in focus is an engagement estimate, not proof that someone read a page. Geographic estimates may reflect a network or VPN location rather than a visitor’s actual location. Blocked scripts and declined analytics mean reports do not include every visit.

Read [Google’s privacy policy](https://policies.google.com/privacy) and [Google’s explanation of how it uses information from sites that use its services](https://policies.google.com/technologies/partner-sites).

{% else %}

## Website analytics is currently off

No Google Analytics tag or visitor-tracking widget is enabled on this website. Optional private analytics is being prepared; this page and the visitor controls will be updated when it is enabled. There is currently no analytics consent prompt or public visitor count.

{% endif %}

## Hosting and external links

GitHub serves this website and may process request information under the [GitHub privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

Links to papers, repositories and other external websites take you to services with their own privacy policies. Choosing an email link opens your email application; any message you send is handled by your email provider and mine.

## Contact

For questions about this website or its analytics, [email me](mailto:{{ site.author.email }}).
