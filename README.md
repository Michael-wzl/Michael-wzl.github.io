# Ziling Wang’s academic website

Jekyll source for [michael-wzl.github.io](https://michael-wzl.github.io/), published by GitHub Pages. The current layout follows the approved academic design while retaining the original AcademicPages content collections and public URLs.

## Editing content

- `_data/home.yml`: biography, research focus, and recent news.
- `_publications/`: publication records. `selected: true` includes a paper on the homepage; `conference`, `author_role`, `award`, `author_names`, and `selected_summary` control its preview.
- `_portfolio/`: project pages. A numeric `selected_order` includes a project in the curated portfolio. Its preview uses `selected_description`, optional `selected_meta`, `selected_kind`, `codeurl`, and optional `moreurl`.
- `_pages/cv.md`: CV. The other page permalinks remain available.
- `_includes/research-*.html`: shared homepage, publication, project, navigation, and footer templates.
- `assets/css/research.css`: responsive styles for the homepage and inner pages.

The homepage is rendered by Jekyll. Reading the profile, papers, news, and projects does not require JavaScript.

## Build and checks

```sh
bundle install
bundle exec jekyll serve
node --test tests/analytics.mjs
```

The analytics checks use a simulated browser and do not contact Google. `local/` holds ignored previews and private setup notes; `tests/` and `local/` are excluded from published output.

## Optional GA4

Analytics is controlled by `_config.yml`. Keep `analytics.provider: false` and the measurement ID blank until the dedicated web stream is ready. To enable it, set the provider to `google-analytics-4`, supply that stream’s `G-…` measurement ID, and retain the exact production HTTPS origin.

The Google library loads only after a visitor accepts analytics, and only on the configured production origin. Visitors can decline or change their choice using the footer control. Google Signals and advertising personalization are disabled. No AdSense or Google Ads code is included.

**Required web-stream setting:** Enhanced Measurement must be off. The site sends sanitized outbound/download events itself, alongside named internal/contact/button events. Enabling a second collector would duplicate measurements. Google’s normal page/session/engagement collection still supplies the core metrics after consent.

In the private GA4 property, register event-scoped custom dimensions for `element_id`, `placement`, and `source_path` to build click-placement reports. Standard reports provide page engagement and geography. The measurement ID does not provide dashboard access; account credentials and reporting API secrets must never be committed here.

See [Google’s setup documentation](https://support.google.com/analytics/answer/9304153) and [Enhanced Measurement settings](https://support.google.com/analytics/answer/9216061). The website’s visitor-facing notice is at `/terms/`.

## Attribution

This repository originated from [AcademicPages](https://github.com/academicpages/academicpages.github.io), based on Minimal Mistakes. Existing license files are retained. The current layout is an independently implemented academic design; it does not install or depend on the al-folio theme.
