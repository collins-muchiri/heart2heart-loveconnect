# Image manifest

Every photograph used by the site is tracked here: file, source, status, consent state, credit and date. The matching `<img>` elements in `index.html` carry a small caption chip ("Photo slot: <subject>, with consent") until the foundation confirms the media release for that image.

| File | Source | Status | Consent (Y/N/TBC) | Credit | Date |
| --- | --- | --- | --- | --- | --- |
| hero-community-hands.jpg | Foundation field deck (2026-10-31 upload) | PRESENT: in repo | TBC | Heart 2 Heart volunteers | 2026-10-31 |
| elderly-care.jpg | Foundation field deck (2026-10-31 upload) | PRESENT: in repo | TBC | Foundation outreach archive | 2026-10-31 |
| dignity-girlchild.jpg | Foundation field deck (2026-10-31 upload) | PRESENT: in repo | TBC | School session: International Day of the Girl Child | 2026-10-31 |
| kapkures-mobility.jpg | Foundation field deck (2026-10-31 upload) | PRESENT: in repo | TBC | Donated by Rani Ramchandani Foundation, facilitated by Hon. Leonard Bor | 2026-10-31 |
| shelter-kipkemoi.jpg | Foundation field deck (2026-10-31 upload) | PRESENT: in repo | TBC | Shelter For Needy Family Initiative, Project 02 | 2026-10-31 |
| moricho-elderly.jpg | Foundation field deck (2026-10-31 upload) | PRESENT: in repo | TBC | With Rotary Club of Rehama Nairobi | 2026-10-31 |

Notes:

- All six files are compressed for web: maximum width 1600px, mozjpeg quality 78, each under 300KB: plain Git blobs, no Git LFS.
- Every `<img>` in `index.html` carries the caption chip "Photo slot: ..., with consent" until consent is confirmed.
- When the foundation signs the media release for an image: update its Consent to `Y` with the date here, confirm the credit, and remove the caption chip in `index.html`.
- Until then, track unresolved rows as `blocked:consent` in the issue tracker.
