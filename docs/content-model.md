# Content model: editor's guide

This guide is for the foundation's future editors. The whole site lives in one file, `index.html` at the repository root: structure (HTML), the "Warm Earth" styles (inline CSS) and behaviour (inline JS) are all inside it. There is no build step: edit the file, save, refresh.

## Map of index.html

Sections appear in this order:

| Location | What lives there |
| --- | --- |
| Top of `<body>` | Dismissible prototype disclaimer banner (state kept in `h2h.v1.banner`) |
| `<header>` (sticky) | Logo, navigation to `#home`, `#about`, `#programs`, `#volunteer`, `#blog`, `#events`, `#donate`, `#contact`, WhatsApp pill, theme toggle, mobile menu |
| `#home` | Hero: full-bleed photo, H1, tagline "Connecting Hearts with Love and Care", the founder's motto quote, Donate and Volunteer calls to action |
| `#home` (below the hero) | Impact counters card (200+ families reached, 3+ wheelchairs, 100+ girls supported, 10+ volunteers: sample figures), partner thanks and social links |
| `#about` | Official mission (verbatim), Vision 2026, and the values: compassion, connection, community engagement |
| `#programs` | Five expandable field-report programme cards (girls' dignity and mentorship; elderly and people with disabilities; children; the Shelter For Needy Family Initiative) |
| `#volunteer` | Four volunteer role cards plus the volunteer sign-up form (saved to `h2h.v1.volunteers`) |
| `#blog` | Six stories/posts with category filter chips, search, read-more expansion, and WhatsApp/Facebook share |
| `#events` | 2026 events calendar grid with a list toggle; each day opens an event modal with an RSVP form (saved to `h2h.v1.rsvp`) and a Google Calendar link |
| `#donate` | Donation portal: presets, custom amount, monthly toggle, donor details, community goal progress bar, Donor Wall of Hearts (built from local records), thank-you modal with the photo-receipt promise |
| `#contact` (footer) | Brand and socials, contact details with copy-to-clipboard, newsletter form, message form, legal row, prototype build version, back-to-top |

## Replacing sample copy

Anything provisional is marked with a `sample` badge in the page copy. To replace it:

1. Search `index.html` for `sample`: the impact counters and some stories are the usual spots.
2. Substitute the verified figures or stories and remove the badge markup.
3. Re-run the local checks from `CONTRIBUTING.md`, then bump the version (`patch` for copy corrections).

## Swapping a photo

1. Drop the new file at the **exact path** of the old one in `assets/img/` (for example `assets/img/elderly-care.jpg`) and **keep the filename**: `index.html` references the paths directly, so nothing else needs to change.
2. Keep the web treatment: maximum width 1600px, mozjpeg quality about 78, file under 300KB.
3. Update `assets/img/MANIFEST.md`: move the Consent column from `TBC` to `Y`, and add the date and the credit.
4. Once the foundation signs the media release, remove the "Photo slot: ..., with consent" caption chip for that image in `index.html`.

**Alt text guidance.** Write alt text that describes the scene in one sentence, is consent-aware (never name a beneficiary), and never starts with "image of" or "photo of": screen readers already announce that it is an image. Good: "Volunteers hand a food hamper to an elderly woman during a community outreach in Rongai." Avoid: "Image of people", or any wording that identifies a person beyond what their consent allows.

## Editing events

Events live in the `EV` array in the inline script near the end of `index.html`, one object per event:

| Field | Meaning |
| --- | --- |
| `d` | Date in ISO format `YYYY-MM-DD`. Drives the calendar grid position and the Google Calendar link. |
| `t` | Event title, shown in the calendar tooltip, the list view and the modal. |
| `time` | Start time (with end time where known), East Africa Time. Shown in the list view and the modal. |
| `place` | Venue or community, for example "Kuresoi North" or "Moricho, Rongai". |
| `type` | Category key. Drives the calendar dot colour and the grouping in the list view. Keep values consistent with the existing entries so the legend stays accurate. |

The shipped 2026 calendar: Jan 14 Volunteer Appreciation Day; May 3 Kuresoi North Wheelchair Distribution Drive; May 13 Shelter Anniversary Build Camp; Oct 11 International Day of the Girl Child; Nov 8 Rongai Outreach: Moricho; Dec 24-31 Christmas & New Year Feast. Replace or adjust these entries once dates and venues are confirmed by the foundation.

## Updating programmes and stories

- **Programmes** are native `<details>` cards inside `#programs`. The `<summary>` is the one-line title; the body carries the field report. Edit the text in place and keep each card to one report.
- **Stories** in `#blog` are self-contained article entries with a category, title, excerpt and expandable body. Keep the category consistent with the filter chips, since the chips and the search read those values.

## Donation presets and goal

- `PRESETS`: the constant defining the four preset buttons: 500 "Dignity Pack", 5,000 "Food Parcel", 20,000 "Wheelchair" and 50,000 "Shelter Kit" (amounts in KES). Change an amount or label here and the segmented controls, the summary and the thank-you flow follow.
- `GOAL`: the community goal constant (KES 500,000) behind the progress bar. Update it only when the foundation ratifies a new campaign target.

## Changing contact details

- `PHONE`: the single phone constant (`+254723887935`). It feeds the `tel:` links, the WhatsApp pill (`https://wa.me/254723887935`) and the floating WhatsApp button.
- Email: `info@heart2heart-loveconnect.org` appears in the contact area and footer. This address is a **placeholder pending confirmation**; when the foundation confirms the real address, replace it here and in `README.md` and `SECURITY.md`.
- Social profiles: `facebook.com/Amosbett35`, `instagram.com/Amosbett35` and `x.com/Amosbett35` in the header, footer and share links.

## When to bump the version

| Bump | Use it for |
| --- | --- |
| MAJOR | Structural redesign, navigation changes, or invalidating the stored localStorage schema (`h2h.v1.*` moves to `h2h.v2.*` plus migration) |
| MINOR | New section, programme, form field, event-data capability, or language |
| PATCH | Copy corrections, accessibility and contrast fixes, image swaps, bug fixes |

Run `node scripts/bump.mjs patch|minor|major` after your change is merged. The full release flow is in the README.
