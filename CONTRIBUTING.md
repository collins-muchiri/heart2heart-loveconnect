# Contributing to the Heart 2 Heart & Love Connect website

Thank you for wanting to help. This site speaks for a charity that works with girls, children, elderly people and people with disabilities in Kuresoi North, Rongai and Nakuru town, so the way we build it matters as much as what we build. This guide keeps contributions warm, safe and predictable.

## Ground rules

**Dignity first.** Do not publish a beneficiary's full name, or any health detail about them, anywhere in this repository. Photographs and stories that depend on the foundation's media release are labelled `blocked:consent` in the issue tracker until consent is documented. Write about people the way the foundation does: with respect, no pity, no identifying detail beyond what consent allows.

**No secrets.** Never commit tokens, API keys, M-Pesa Paybill or bank details, or any personal data. The email address `info@heart2heart-loveconnect.org` published in the docs and the site is a placeholder pending confirmation: do not introduce other contact or payment details until the foundation has verified them.

**Prototype boundaries.** Payment rails stay simulated. Do not wire real payment endpoints into the prototype; that work belongs to a coordinated release with the foundation (see `docs/decisions.md`, ADR-004).

## Workflow

1. Branch from `main` using one of these prefixes:
   - `feat/<slug>`: new section, capability or programme content
   - `fix/<slug>`: bug fixes
   - `content/<slug>`: copy, stories, photos, events
   - `a11y/<slug>`: accessibility improvements
   - `chore/<slug>`: tooling, CI, documentation housekeeping
2. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `content:`, `a11y:`, `docs:`, `chore:`. Keep the subject at most 72 characters and imperative ("Add shelter story", not "Added shelter story"), and use the body to explain **why** the change is needed.
3. Keep history linear: run `git pull --rebase` before you push, and maintainers merge with `--ff-only`. Avoid merge commits.

## Local checks before pushing

```bash
npx html-validate index.html
node scripts/smoke.test.mjs
grep -nE "TODO|lorem|\[entity-|canonical_name" index.html   # must print nothing
```

If the grep prints anything, clean it up before opening the pull request.

## Pull request expectations

- Use the pull request template if one is present; otherwise cover the points below.
- Describe the change and why it is needed, in plain language.
- Include screenshots in **light and dark themes**, at **desktop width and 375px**.
- Add accessibility notes: the keyboard path through your change, any new `aria-live`, `aria-pressed` or `aria-expanded` usage, and the contrast of any new colour pair.
- Recommend a version bump: `patch` for copy, accessibility, image or bug fixes; `minor` for a new section, programme, form field, event-data capability or language; `major` for structural or navigation changes or storage schema invalidation. The full table is in the README.

## Release process (maintainers)

```bash
node scripts/bump.mjs patch   # or minor / major
```

The script bumps the version in `package.json`, mirrors it to the `data-app-version` attribute, the top-of-file stamp comment and the footer build line, runs the smoke test, writes the changelog entry, commits `chore(release): vX.Y.Z` and creates an annotated tag. It never pushes: push the commit and the tag, and the release workflow publishes the GitHub release.

While the prototype disclaimer banner is live, versions remain pre-releases (`0.x.y`). `v1.0.0` is the first public launch: real photos with consent, the registration number, and real payment rails.
