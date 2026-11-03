# Decisions: ADR log

Short architecture decision records for the Heart 2 Heart & Love Connect website. Each entry records the status, context, decision and consequences.

## ADR-001: Single-file `index.html` with no build step

- **Status:** Accepted
- **Context:** The site must run from `file://` (double-click), GitHub Pages and simple shared hosting, and the foundation's team works without a development toolchain.
- **Decision:** Ship the entire site as one `index.html` with inline CSS and JS. No bundler, no framework, no build step.
- **Consequences:** Maximum portability and a trivial deployment; the file needs editorial discipline (see `docs/content-model.md`), and CI plus the smoke test guard against breakage.

## ADR-002: Visual identity follows the supplied functional prototype

- **Status:** Accepted
- **Context:** Two directions existed: an earlier "Lake Nakuru" token draft, and the supplied functional prototype with the "Warm Earth" system (Poppins display + Merriweather body, warm creams, terracotta primary, deep greens).
- **Decision:** Adopt the supplied functional prototype as the approved look; the Warm Earth system is the visual identity of record.
- **Consequences:** The Lake Nakuru draft is retired; tokens are documented in `docs/a11y.md`; any future structural redesign is a MAJOR release under the semver policy.

## ADR-003: Persistence via localStorage (`h2h.v1.*`)

- **Status:** Accepted
- **Context:** The site is a static file with no backend, but the prototype's forms need to feel real and survive a reload.
- **Decision:** Store all prototype form data in the visitor's browser under the `localStorage` namespace `h2h.v1.*` (`gifts`, `volunteers`, `messages`, `rsvp`, `newsletter`, `theme`, `banner`), wrapped in `try/catch`, with a wipe button and a JSON export.
- **Consequences:** Data is device-local by design and nothing leaves the browser; the storage schema becomes part of the public contract, so invalidating it requires a MAJOR bump with migration; the store must never hold real records.

## ADR-004: Payments are simulated

- **Status:** Accepted
- **Context:** The foundation has not yet provided verified Paybill, bank or PayPal details, and publishing unverified payment details would be harmful.
- **Decision:** All donation rails (M-Pesa Paybill, bank transfer, PayPal, in-kind) are simulated end to end; nothing is charged, and no payment details are collected or stored in the repository.
- **Consequences:** The site cannot receive real donations until this ADR is superseded; `v1.0.0` requires verified rails; the disclaimer banner and the docs state the simulation plainly.

## ADR-005: `noindex` and pre-release while the disclaimer banner is live

- **Status:** Accepted
- **Context:** Version 0.1.0 ships with a live prototype disclaimer banner, sample figures, consent-pending photos and a placeholder contact email.
- **Decision:** Serve `robots: noindex` and treat all `0.x.y` versions as pre-releases until `v1.0.0`.
- **Consequences:** Search engines will not index the prototype; the banner and the pre-release status stay until the open items in the README close.

## ADR-006: Images compressed for plain Git blobs, no LFS

- **Status:** Accepted
- **Context:** Six real field photos must live in the repository, and Git LFS would add setup friction for contributors and hosts.
- **Decision:** Resize to a maximum of 1600px and compress with mozjpeg (quality about 78), keeping every file under 300KB (about 1.5MB in total), stored as plain Git blobs.
- **Consequences:** No LFS dependency anywhere in the toolchain; new photos must follow the same treatment (see `docs/content-model.md`) and be recorded in `assets/img/MANIFEST.md`.

## ADR-007: Dual deployment: GitHub Pages and Vercel mirror

- **Status:** Accepted
- **Context:** The project wants one canonical public URL plus a mirror that tracks the repository, and part of the team prefers Vercel's dashboard.
- **Decision:** Deploy GitHub Pages via Actions from `main` (tag-driven releases mark stable versions), and mirror the same repository to Vercel on the Hobby plan.
- **Consequences:** Two URLs must be kept in sync; the GitHub Pages URL is canonical in all documentation; the Vercel mirror URL is intentionally not published until the custom-domain decision (README open item 7).
