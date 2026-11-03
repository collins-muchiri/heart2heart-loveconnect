# Heart 2 Heart & Love Connect Foundation: Website

[![CI](https://github.com/collins-muchiri/heart2heart-loveconnect/actions/workflows/ci.yml/badge.svg)](https://github.com/collins-muchiri/heart2heart-loveconnect/actions/workflows/ci.yml)
[![Release](https://img.shields.io/badge/release-v0.1.0-blue)](https://github.com/collins-muchiri/heart2heart-loveconnect/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live](https://img.shields.io/badge/live-GitHub%20Pages-success)](https://collins-muchiri.github.io/heart2heart-loveconnect/)

Heart 2 Heart & Love Connect Foundation is a community charity in Nakuru, Kenya, founded by Amos Bett with the motto "Connecting Hearts with Love and Care". It serves Kuresoi North, Rongai and Nakuru town through girls' dignity and mentorship programmes, support for elderly people and people with disabilities (mobility aids, food hampers), children's welfare (food, clothes, school support) and the Shelter For Needy Family Initiative. This repository holds the foundation's website: a production-grade, single-page, single-file prototype (`index.html` at the repo root, inline CSS and JS, no build step).

> **Prototype disclaimer (v0.1.0 pre-release).** Donation rails are **simulated**: nothing is charged, and no Paybill, bank or PayPal details are collected in this prototype. All form data stays in your browser's local storage on your device. Some photographs and impact figures are samples pending the foundation's confirmation, and the published email address is a placeholder pending confirmation. A dismissible disclaimer banner is shown on the site itself while this pre-release is live.

## View it live

| Where | URL |
| --- | --- |
| GitHub Pages | https://collins-muchiri.github.io/heart2heart-loveconnect/ |
| Source repository | https://github.com/collins-muchiri/heart2heart-loveconnect |
| Vercel mirror | https://heart2heart-loveconnect.vercel.app/ |

## 60-second local run

**Option A: tiny local server**

```bash
git clone https://github.com/collins-muchiri/heart2heart-loveconnect.git
cd heart2heart-loveconnect
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

**Option B: no tools at all**

Double-click `index.html`. Because the site is a single self-contained file, everything works from `file://`: navigation, the theme toggle, forms, local persistence, the events calendar and the donation portal.

## Repo map

```text
heart2heart-loveconnect/
├── index.html                  # The whole site: markup, Warm Earth CSS and all behaviour in one file
├── package.json                # Version source of truth ("version" field) and npm scripts
├── README.md                   # This overview
├── CHANGELOG.md                # Release history in Keep a Changelog format
├── CONTRIBUTING.md             # Ground rules, branch and commit conventions, review expectations
├── SECURITY.md                 # How to report security and privacy issues
├── CODE_OF_CONDUCT.md          # Contributor Covenant v2.1 plus a project-specific dignity clause
├── LICENSE                     # MIT license
├── docs/
│   ├── a11y.md                 # Accessibility statement, WCAG 2.2 AA contrast audit, keyboard checklist
│   ├── content-model.md        # Editor's guide: where every piece of content lives and how to change it
│   └── decisions.md            # Architecture decision records (ADR log)
├── assets/
│   └── img/
│       ├── MANIFEST.md         # Photo manifest: source, status, consent, credit, date
│       ├── hero-community-hands.jpg
│       ├── elderly-care.jpg
│       ├── dignity-girlchild.jpg
│       ├── kapkures-mobility.jpg
│       ├── shelter-kipkemoi.jpg
│       └── moricho-elderly.jpg
├── scripts/
│   ├── bump.mjs                # Release automation: bump, smoke test, changelog, release commit, annotated tag
│   └── smoke.test.mjs          # Node smoke test run by CI and before every release
└── .github/
    └── workflows/
        ├── ci.yml              # HTML validation and smoke test on every push and pull request
        ├── pages.yml           # Deploys the site to GitHub Pages from main
        └── release.yml         # Publishes a GitHub release when a version tag is pushed
```

## How to update content

Everything an editor needs is in [`docs/content-model.md`](docs/content-model.md). Quick summary:

- Most copy lives directly in `index.html`, section by section (`#home`, `#about`, `#programs`, `#volunteer`, `#blog`, `#events`, `#donate`, `#contact`).
- Copy marked with a `sample` badge is provisional: replace it with verified figures and stories.
- Photos live in `assets/img/` at fixed filenames and are tracked in `assets/img/MANIFEST.md` (consent column).
- Events are entries of the `EV` array; donation presets and the community goal are the `PRESETS` and `GOAL` constants; the phone number is the `PHONE` constant.
- Bump the version when content changes (see below).

## Versioning & releases

Versioning follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The version lives in `package.json` and is mirrored to the `<html data-app-version>` attribute, the top-of-file stamp comment and the footer "Prototype build" line.

| Bump | Use it for |
| --- | --- |
| MAJOR | Structural redesign, navigation changes, or invalidating the stored localStorage schema (namespace `h2h.v1.*` moves to `h2h.v2.*` plus migration) |
| MINOR | New section, programme, form field, event-data capability, or language |
| PATCH | Copy corrections, accessibility and contrast fixes, image swaps, bug fixes |

The current version is **0.1.0**, a pre-release cut while the prototype disclaimer banner is live. **v1.0.0** marks the first public launch: real photos with consent, the registration number, and real payment rails.

Release flow (maintainers):

```bash
node scripts/bump.mjs patch   # or minor / major
```

The script updates the version in all four places, runs the smoke test, writes the changelog entry, commits `chore(release): vX.Y.Z` and creates an annotated tag. It never pushes: push the commit and tag and let CI finish the release.

## Accessibility

We target **WCAG 2.2 AA**. Highlights: keyboard-first navigation with a skip link and a focus-trapped mobile menu; visible 3px gold `focus-visible` outlines; 44px minimum touch targets; screen-reader labels and `aria-live` status regions; `prefers-reduced-motion` respected; light and dark themes honouring `prefers-color-scheme`; no-JS fallbacks for navigation and content expansion. The full statement, the contrast audit tables and the keyboard test checklist are in [`docs/a11y.md`](docs/a11y.md).

## Data & privacy

- **Your data on this device.** Prototype form data never leaves the visitor's browser. It is stored in `localStorage` under the keys `h2h.v1.gifts`, `h2h.v1.volunteers`, `h2h.v1.messages`, `h2h.v1.rsvp`, `h2h.v1.newsletter`, `h2h.v1.theme` and `h2h.v1.banner`, all wrapped in `try/catch`. The site discloses this under "Your data on this device", and offers the `#clearData` wipe button and a `#exportData` JSON download so visitors can remove or take their data at any time.
- **Simulated payments.** Donation rails are simulated. Nothing is charged, and no Paybill, bank or PayPal details are collected in this prototype.
- **No trackers.** No analytics, no cookies, no fingerprinting, no advertising scripts. The only third-party requests are the Google Fonts stylesheets.

## Deployment

- **GitHub Pages** deploys from `main` via GitHub Actions (`pages.yml`). The live URL is https://collins-muchiri.github.io/heart2heart-loveconnect/.
- **Releases** are cut by pushing the annotated version tags created by `scripts/bump.mjs`; the release workflow publishes the matching GitHub release from the changelog.
- **Vercel mirror.** The project is also deployed from this repository via Vercel on the Hobby plan at https://heart2heart-loveconnect.vercel.app/. The mirror tracks the same branch (`main`), so every push deploys both surfaces; the GitHub Pages URL above remains the canonical address. A custom-domain decision is still open (see Open items).

## Open items

Owned by the foundation; each blocks `v1.0.0` unless noted:

1. Real photos and media-release consent confirmations (see `assets/img/MANIFEST.md`).
2. Charity registration number.
3. Official email (the current `info@heart2heart-loveconnect.org` is a placeholder) plus verified Paybill, bank and PayPal details.
4. Verified impact statistics to replace the sample counters.
5. Event dates and venue confirmations for the 2026 calendar.
6. Team roles confirmation.
7. Custom domain decision.
8. Analytics decision: currently none, by design.
9. Real payment integration to replace the simulated rails.
10. Safeguarding and privacy policy finalisation.

## Credits

With gratitude to the partners who make the work possible:

- **Rani Ramchandani Foundation**: mobility aids donated to the Kuresoi North drive.
- **Rotary Club of Rehama Nairobi**: joint outreach at Moricho, Rongai.
- **Hon. Leonard Bor**: facilitation of the mobility-aids donation.

Founded and led by **Amos Bett**, together with the foundation's volunteers and the communities of Kuresoi North, Rongai and Nakuru town.

## License

Released under the [MIT License](LICENSE). Copyright (c) 2026 Heart 2 Heart & Love Connect Foundation.

## Verification (v0.1.0)

Quality gates executed on this release: `node scripts/smoke.test.mjs` (21 checks):

```text
Heart 2 Heart & Love Connect: static smoke test (index.html)
  ok  a · package.json version ↔ <html data-app-version> (0.1.0)
  ok  b · package.json version ↔ build-stamp comment (v0.1.0)
  ok  c · package.json version ↔ footer <span data-version> (v0.1.0)
  ok  d · required element ids present (31/31)
  ok  e · verbatim strings present (4/4)
  ok  f · event dates present in calendar data (6/6)
  ok  g · in-page anchors (#…) all resolve to ids (42 anchor target(s))
  ok  h · every <img> has alt; non-hero images lazy-load (13 <img> tag(s), hero exempted via fetchpriority="high")
  ok  i · referenced local assets exist on disk (6 asset(s))
  ok  j · no forbidden artifacts (TODO/lorem/[entity-/canonical_name/¦) (clean)
  ok  k · localStorage keys use the h2h.v1. namespace (all h2h. occurrences are namespaced)
  ok  l · <title> present and ≤ 60 chars (59 chars: "Heart 2 Heart & Love Connect Foundation | Nakuru, Kenya")
  ok  m · meta description present and ≤ 155 chars (147 chars)
  ok  n · lang="en-KE" on <html> (en-KE)
  ok  o · JSON-LD organization block (@type NGO)
  ok  p · social meta (og:title, og:image, twitter:card) (3/3)
  ok  q · inline SVG favicon (rel="icon" + data: URI)
  ok  r · prefers-reduced-motion CSS present
  ok  s · :focus-visible styling present
  ok  t · <noscript> fallback present
  ok  u · index.html ≤ 120000 bytes

21 checks, 0 failures
```

Additional gates: `npx --yes html-validate@9 index.html` → **0 errors**; artifact grep
(`grep -nE "TODO|lorem|\[entity-|canonical_name" index.html`) → **no matches**; Prettier
note: `prettier --check` flags formatting because Prettier's default void-element style
(`<meta/>`) contradicts html-validate's `void-style` rule; this repo keeps the
html-validate-canonical style and treats the Prettier pass as advisory (see `ci.yml`).
