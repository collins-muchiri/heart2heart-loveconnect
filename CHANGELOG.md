# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Index

- [Unreleased](#unreleased)
- [0.1.0-2026-10-31](#010-2026-10-31)

## [Unreleased]

### Changed

- CI: the release workflow no longer redeploys Pages. Pages deploys from `main` via `pages.yml`, and release tags are always cut from `main` HEAD, so the redundant job only caused deployment races (and false release failures).

## [0.1.1] (2026-10-31)

### Fixed

- Replaced every em dash and spaced en dash across the page copy with natural punctuation (commas, colons and full stops), and switched calendar date ranges to plain "to" phrasing. No wording or meaning changed.

## [0.1.0] (2026-10-31)

First prototype release of the Heart 2 Heart & Love Connect Foundation website, cut as a pre-release while the on-site disclaimer banner is live.

### Added

- Single-file website prototype (`index.html`) covering the hero, the about strip, five programme field-report cards, volunteer roles with a sign-up form, stories with category filters and search, the 2026 events calendar with an RSVP flow, the donation portal and the contact footer.
- "Warm Earth" design system: Poppins display and Merriweather body typography, with light and dark themes that honour `prefers-color-scheme` plus a persisted manual toggle.
- Release machinery: CI, GitHub Pages deployment and tag-driven release workflows.
- Node smoke test (`scripts/smoke.test.mjs`) and the `scripts/bump.mjs` release tool for version bumps, changelog updates, release commits and annotated tags.
- Image manifest (`assets/img/MANIFEST.md`) tracking source, status, consent, credit and date for every field photograph.

### Accessibility

- Keyboard-first navigation: skip link, focus-trapped mobile menu, 3px gold `focus-visible` outlines, 44px minimum touch targets.
- `aria-live` regions for the donation summary, filter result counts, RSVP confirmation, copy-to-clipboard results and form errors.
- `aria-pressed` on the theme toggle and category filter chips; `aria-expanded` on the mobile menu button.
- `prefers-reduced-motion` respected across animations and transitions.
- No-JS fallbacks: plain navigation links, `<details>`-based expansion for programmes and stories, a static events list and a `<noscript>` notice near forms.
- WCAG 2.2 AA contrast audit across both themes (see `docs/a11y.md`).

### Content

- Six field photographs added, each carrying a consent-pending caption chip until the foundation confirms the media release.
- Sample stories and sample impact figures included and clearly labelled for replacement with verified data.

### Security

- No secrets in the repository; no analytics, trackers or cookies.
- Donation rails fully simulated: nothing is charged and no Paybill, bank or PayPal details are collected in this prototype.
- All prototype form data stays on the device in `localStorage` (namespace `h2h.v1.*`, wrapped in `try/catch`) with a device wipe button and a JSON export for portability.

---

This project is released under the [MIT License](LICENSE). Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
