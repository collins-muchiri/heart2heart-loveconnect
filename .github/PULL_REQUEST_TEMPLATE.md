<!--
THANK YOU for contributing to the Heart 2 Heart & Love Connect Foundation website.
Complete every section below so your PR can be reviewed and merged quickly.
Keep the headings, and replace the guidance under each one with your own answers.
-->

## Summary

<!-- 2-4 sentences: WHAT changed and WHY. Mention any visual or behavioural impact. -->

## Linked issue

Refs: #

<!-- Reference the issue this PR addresses, e.g. `Refs: #12`. Use `Fixes: #12` instead if merging this PR fully resolves it. -->

## Screenshots

REQUIRED for any change that affects what visitors see. Capture BOTH themes
(light and dark) at desktop width AND at a 375px mobile viewport.

### Light theme

- Desktop:
- 375px viewport:

### Dark theme

- Desktop:
- 375px viewport:

## Accessibility notes

Be specific — reviewers will spot-check what you report here.

- **Keyboard pass:** Tab through every changed screen. Confirm the focus order is logical, focus is always visible, and nothing traps keyboard focus.
- **aria-live announcements:** If the change touches dynamic updates (stories filter, forms, calendar), describe what a screen reader announces when the state changes.
- **Contrast pairs touched:** List any foreground/background pairs you changed and confirm each still meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text and UI).

## Quality gates

You confirm all of the following before requesting review:

- [ ] `npx --yes html-validate@9 index.html` reports 0 errors
- [ ] `node scripts/smoke.test.mjs` is green
- [ ] Internal links pass — every `href="#..."` anchor in index.html resolves to an existing `id`
- [ ] No unfinished-work or filler-copy artifacts: `grep -rnEi "todo|lorem" index.html assets docs scripts` returns nothing
- [ ] Console is clean (no errors or warnings) in both light and dark themes

## Version-bump recommendation

Per the project semver policy:

- **MAJOR** — structural, navigation, or stored-schema changes
- **MINOR** — new section, programme, field, or i18n addition
- **PATCH** — copy, accessibility, or image fixes

Recommended bump: patch / minor / major (keep one)

Reasoning:

## Rollback note

<!-- How do we undo this if something breaks? Name the last known-good tag to redeploy, or write "revert this PR" if the change is self-contained. -->
