# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes — while the prototype disclaimer banner is live |
| < 0.1.0 | No |

## Reporting a vulnerability

Email `info@heart2heart-loveconnect.org` with the subject line `[security]`, or message **+254723887935** on WhatsApp (https://wa.me/254723887935).

Note: the email address above is the foundation's published placeholder address and is still to be confirmed; if the inbox does not respond, use WhatsApp. We aim to acknowledge every report **within 72 hours**.

Please include: what you found, the steps to reproduce it, the URL(s) affected, and — if you have one — a suggested fix. Do not include other people's personal data in your report.

## Scope

This is a **static prototype**: no backend, no user accounts, no payment processing. All donation rails are simulated — nothing is charged and no payment details are collected.

**In scope:**

- Cross-site scripting or HTML injection through any input rendered by the page (form fields, event data, story content).
- Dependency issues in the CI and release tooling (`scripts/*.mjs`, the workflow files, `npx html-validate`).
- Privacy issues in the localStorage handling: data written outside the `h2h.v1.*` namespace, the wipe (`#clearData`) or export (`#exportData`) controls misbehaving, or prototype data persisting where it should not.

**Out of scope:**

- Social engineering of foundation staff, volunteers or partners.
- Automated scanning or load testing against the live GitHub Pages or Vercel mirror URLs without prior written coordination.

## Safe harbour

If you make a good-faith effort to comply with this policy during your research, we will consider your activity authorised, will not pursue or support any action against you, and will work with you to understand and resolve the issue quickly.

## Confidentiality and safeguarding

We ask you to keep the details of any accepted report confidential until a fix is published. Independently of this policy: **any report that touches the safety or wellbeing of a beneficiary — a child, a girl in the mentorship programme, an elderly person or a person with disabilities — is escalated to the foundation leadership immediately**, ahead of any technical remediation.
