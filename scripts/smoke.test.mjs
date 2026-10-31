#!/usr/bin/env node
/**
 * smoke.test.mjs — zero-dependency static smoke test for index.html.
 *
 * Reads index.html from the repo root (resolved relative to this script file,
 * so it behaves identically no matter which directory it is invoked from),
 * runs 21 structural/content checks, prints one compact line per check and a
 * final "N checks, M failures" summary suitable for pasting into a PR body.
 *
 * Usage:     node scripts/smoke.test.mjs
 * Exit code: 0 — every check passed
 *            1 — index.html missing, or one or more checks failed
 *
 * Node 20+, builtins only (node:fs, node:path, node:process, node:url).
 */
'use strict'; // no-op in ESM (modules are always strict); kept for clarity.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// ------------------------------------------------------------------ config

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..'); // repo root = parent of scripts/
const HTML_PATH = path.join(ROOT, 'index.html');
const PKG_PATH = path.join(ROOT, 'package.json');

/** Element ids that markup, CSS and JS depend on — every one must exist. */
const REQUIRED_IDS = [
  'home', 'about', 'programs', 'volunteer', 'blog', 'events', 'donate',
  'contact', 'main', 'menuBtn', 'nav', 'themeBtn', 'posts', 'cal', 'days',
  'monthLabel', 'prev', 'next', 'evList', 'donForm', 'sum', 'giveBtn',
  'volForm', 'volMsg', 'nl', 'nlBtn', 'nlMsg', 'cForm', 'clearData',
  'exportData', 'disclaimer',
];

/** Exact, case-sensitive strings that must survive every refactor. */
const VERBATIM_STRINGS = [
  'Connecting Hearts with Love and Care',
  'THIS IS A CHARITY ORGANIZATION STARTED BY AMOS BETT TO HELP THE POOR, THE NEEDY AND THE ORPHAN TO ACCESS THE FOOD, CLOTHES, SCHOOL AND MANY MORE',
  "that this be a year of radical change and transformation. We don't just want to reach people; we want to see lives completely made new.",
  '+254723887935',
];

/** Calendar event dates that must appear verbatim (YYYY-MM-DD). */
const EVENT_DATES = [
  '2026-01-14', '2026-05-03', '2026-05-13',
  '2026-10-11', '2026-11-08', '2026-12-24',
];

const SIZE_LIMIT = 120000; // bytes — hard ceiling for the single-file page (check u)

// -------------------------------------------------------------------- load

let htmlBuffer;
try {
  htmlBuffer = readFileSync(HTML_PATH);
} catch {
  // Missing page is the expected failure mode before the first build:
  // one clear line, exit 1 — never a stack trace.
  console.error(`smoke: index.html not found at ${HTML_PATH} — nothing to test (build the page first, then re-run).`);
  process.exit(1);
}
const html = htmlBuffer.toString('utf8');
const htmlLines = html.split(/\r?\n/); // reused for line-number reporting

let pkgVersion = null; // null → checks a–c fail with a clear message instead of crashing
try {
  const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
  if (typeof pkg.version === 'string') pkgVersion = pkg.version;
} catch {
  pkgVersion = null;
}

// ----------------------------------------------------------------- helpers

const failures = [];
let total = 0;

/**
 * Run one check. `fn` may return:
 *   - undefined / null / { ok:true }        → pass (optionally with detail)
 *   - a string, or { ok:false, detail }     → fail with that detail
 * Any thrown error is reported as a failing check — the run never crashes.
 */
function check(name, fn) {
  total += 1;
  let out;
  try {
    out = fn();
  } catch (err) {
    out = `internal error: ${err && err.message}`;
  }
  if (out === true || out == null) out = { ok: true };
  else if (out === false) out = { ok: false };
  else if (typeof out === 'string') out = { ok: false, detail: out };

  if (out.ok) {
    console.log(`  ok  ${name}${out.detail ? ` (${out.detail})` : ''}`);
  } else {
    failures.push(name);
    console.log(`  FAIL ${name}${out.detail ? ` (${out.detail})` : ''}`);
  }
}

const ok = (detail) => ({ ok: true, detail });
const fail = (detail) => ({ ok: false, detail });

/** Parse the attributes of a whole tag string ("<meta …>") into a lowercase map. */
function tagAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>`]+)))?/g)) {
    const key = m[1].toLowerCase();
    if (!(key in attrs)) attrs[key] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

/** content of the first <meta name|property="key" …>, or null when absent. */
function findMeta(key) {
  const wanted = key.toLowerCase();
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = tagAttrs(m[0]);
    if ((a.name || '').toLowerCase() === wanted || (a.property || '').toLowerCase() === wanted) {
      return a.content ?? null;
    }
  }
  return null;
}

/** Collect every id="…" in the document (won't match data-id= or el.id=). */
function collectIds() {
  return new Set([...html.matchAll(/(?:^|\s)id=["']([^"']+)["']/g)].map((m) => m[1]));
}

/** 1-based line number for a character index. */
function lineOf(index) {
  return html.slice(0, index).split('\n').length;
}

/** Collapse whitespace and clamp a string for one-line reporting. */
function shorten(s, n = 72) {
  const flat = s.replace(/\s+/g, ' ').trim();
  return flat.length > n ? `${flat.slice(0, n - 1)}…` : flat;
}

// ------------------------------------------------------------------ checks

console.log('Heart 2 Heart & Love Connect — static smoke test (index.html)');

// (a) package.json version ↔ <html data-app-version>
check('a · package.json version ↔ <html data-app-version>', () => {
  if (pkgVersion == null) return fail('package.json missing, unreadable, or has no version field');
  const m = html.match(/<html\b[^>]*?\bdata-app-version=["']([^"']+)["']/i);
  if (!m) return fail('no data-app-version attribute on the <html> tag');
  return m[1] === pkgVersion
    ? ok(pkgVersion)
    : fail(`package.json=${pkgVersion} vs data-app-version=${m[1]}`);
});

// (b) package.json version ↔ first-line build stamp comment "· vX.Y.Z · built …"
check('b · package.json version ↔ build-stamp comment', () => {
  if (pkgVersion == null) return fail('package.json missing, unreadable, or has no version field');
  const m = html.match(/·\s*v([0-9A-Za-z.+-]+)\s*·\s*built\s*\d{4}-\d{2}-\d{2}/);
  if (!m) return fail('stamp comment "· vX.Y.Z · built YYYY-MM-DD · commit …" not found');
  return m[1] === pkgVersion
    ? ok(`v${m[1]}`)
    : fail(`package.json=${pkgVersion} vs stamp=v${m[1]}`);
});

// (c) package.json version ↔ footer <span data-version>v…</span>
check('c · package.json version ↔ footer <span data-version>', () => {
  if (pkgVersion == null) return fail('package.json missing, unreadable, or has no version field');
  const m = html.match(/<span\s+data-version\s*>\s*v([^<\s]+)\s*<\/span>/i);
  if (!m) return fail('footer <span data-version>v…</span> not found');
  return m[1] === pkgVersion
    ? ok(`v${m[1]}`)
    : fail(`package.json=${pkgVersion} vs footer=v${m[1]}`);
});

// (d) every required element id is present
check('d · required element ids present', () => {
  const ids = collectIds();
  const missing = REQUIRED_IDS.filter((id) => !ids.has(id));
  return missing.length === 0
    ? ok(`${REQUIRED_IDS.length}/${REQUIRED_IDS.length}`)
    : fail(`missing: ${missing.join(', ')}`);
});

// (e) verbatim strings (exact, case-sensitive)
check('e · verbatim strings present', () => {
  const missing = VERBATIM_STRINGS.filter((s) => !html.includes(s));
  return missing.length === 0
    ? ok(`${VERBATIM_STRINGS.length}/${VERBATIM_STRINGS.length}`)
    : fail(`missing ${missing.length}/${VERBATIM_STRINGS.length}: ${shorten(missing[0], 60)}${missing.length > 1 ? ' …' : ''}`);
});

// (f) all six event dates appear in the calendar data
check('f · event dates present in calendar data', () => {
  const missing = EVENT_DATES.filter((d) => !html.includes(d));
  return missing.length === 0
    ? ok(`${EVENT_DATES.length}/${EVENT_DATES.length}`)
    : fail(`missing: ${missing.join(', ')}`);
});

// (g) every internal href="#target" resolves to an existing id
check('g · in-page anchors (#…) all resolve to ids', () => {
  const ids = collectIds();
  const targets = new Set();
  for (const m of html.matchAll(/href=["']#([^"']*)["']/g)) {
    const t = m[1].trim();
    if (t && !/[$]/.test(t)) targets.add(t); // skip "" and dynamic "${…}" template refs
  }
  const unknown = [...targets].filter((t) => !ids.has(t));
  return unknown.length === 0
    ? ok(`${targets.size} anchor target(s)`)
    : fail(`no matching id for: ${unknown.slice(0, 10).map((t) => `#${t}`).join(', ')}${unknown.length > 10 ? ' …' : ''}`);
});

// (h) images: non-empty alt everywhere; loading="lazy" on all but the hero
check('h · every <img> has alt; non-hero images lazy-load', () => {
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  if (imgs.length === 0) return fail('no <img> tags found (six brand images expected)');
  const problems = [];
  for (const tag of imgs) {
    const alt = /\balt=["']([^"']*)["']/i.exec(tag);
    if (!alt || !alt[1].trim()) problems.push(`no alt: ${shorten(tag, 56)}`);
    const isHero = /\bfetchpriority=["']high["']/i.test(tag); // hero is exempt from lazy
    if (!isHero && !/\bloading=["']lazy["']/i.test(tag)) problems.push(`not lazy: ${shorten(tag, 56)}`);
  }
  return problems.length === 0
    ? ok(`${imgs.length} <img> tag(s), hero exempted via fetchpriority="high"`)
    : fail(`${problems.length} problem(s): ${problems.slice(0, 5).join(' | ')}`);
});

// (i) every referenced local asset (src="assets/…") exists on disk
check('i · referenced local assets exist on disk', () => {
  const srcs = [...new Set(
    [...html.matchAll(/\bsrc=["'](?:\.\/)?(assets\/[^"']+)["']/g)].map((m) => m[1]),
  )];
  if (srcs.length === 0) return fail('no src="assets/…" references found');
  const missing = srcs.filter((src) => !existsSync(path.join(ROOT, src)));
  return missing.length === 0
    ? ok(`${srcs.length} asset(s)`)
    : fail(`missing files: ${missing.join(', ')}`);
});

// (j) forbidden placeholder/leak artifacts are absent (line numbers on hit)
check('j · no forbidden artifacts (TODO/lorem/[entity-/canonical_name/¦)', () => {
  const rules = [
    { re: /TODO/i, label: 'TODO' },           // case-insensitive
    { re: /lorem/i, label: 'lorem' },         // case-insensitive
    { re: /\[entity-/, label: '[entity-' },   // exact
    { re: /canonical_name/, label: 'canonical_name' },
    { re: /¦/, label: '¦' },
  ];
  const hits = [];
  for (const [i, line] of htmlLines.entries()) {
    for (const rule of rules) {
      if (rule.re.test(line)) hits.push(`L${i + 1}:${rule.label}`);
    }
  }
  return hits.length === 0
    ? ok('clean')
    : fail(`${hits.length} hit(s): ${hits.slice(0, 8).join(', ')}${hits.length > 8 ? ' …' : ''}`);
});

// (k) localStorage keys all live in the h2h.v1. namespace
check('k · localStorage keys use the h2h.v1. namespace', () => {
  const bad = [];
  for (const m of html.matchAll(/h2h\./g)) {
    // Every "h2h." occurrence must be immediately followed by "v1."
    if (!html.startsWith('v1.', m.index + 4)) {
      bad.push(`L${lineOf(m.index)}: ${shorten(html.slice(Math.max(0, m.index - 12), m.index + 20), 40)}`);
    }
  }
  if (bad.length > 0) {
    return fail(`${bad.length} occurrence(s) missing the v1 segment: ${bad.slice(0, 5).join(' | ')}`);
  }
  return /h2h\.v1\./.test(html)
    ? ok('all h2h. occurrences are namespaced')
    : fail('no h2h.v1.* localStorage usage found at all');
});

// (l) <title> exists and stays within 60 chars
check('l · <title> present and ≤ 60 chars', () => {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!m || !m[1].trim()) return fail('<title> missing or empty');
  const title = m[1].trim();
  return title.length <= 60
    ? ok(`${title.length} chars — "${shorten(title, 64)}"`)
    : fail(`${title.length} chars (max 60) — "${shorten(title, 64)}"`);
});

// (m) meta description exists and stays within 155 chars
check('m · meta description present and ≤ 155 chars', () => {
  const desc = findMeta('description');
  if (desc == null || !desc.trim()) return fail('<meta name="description"> missing or empty');
  return desc.length <= 155
    ? ok(`${desc.length} chars`)
    : fail(`${desc.length} chars (max 155)`);
});

// (n) html lang attribute is en-KE
check('n · lang="en-KE" on <html>', () => {
  const m = html.match(/<html\b[^>]*?\blang=["']([^"']+)["']/i);
  if (!m) return fail('no lang attribute on the <html> tag');
  return m[1] === 'en-KE' ? ok('en-KE') : fail(`found lang="${m[1]}"`);
});

// (o) JSON-LD structured data declares an NGO
check('o · JSON-LD organization block (@type NGO)', () => {
  return /"@type"\s*:\s*"NGO"/.test(html) ? ok() : fail('no "@type":"NGO" found in any JSON-LD block');
});

// (p) Open Graph + Twitter card meta
check('p · social meta (og:title, og:image, twitter:card)', () => {
  const missing = ['og:title', 'og:image', 'twitter:card'].filter((key) => {
    const v = findMeta(key);
    return v == null || !v.trim();
  });
  return missing.length === 0 ? ok('3/3') : fail(`missing: ${missing.join(', ')}`);
});

// (q) inline SVG favicon via data: URI
check('q · inline SVG favicon (rel="icon" + data: URI)', () => {
  let iconLink = false;
  let dataUri = false;
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const a = tagAttrs(m[0]);
    if ((a.rel || '').toLowerCase().split(/\s+/).includes('icon')) {
      iconLink = true;
      if ((a.href || '').startsWith('data:')) dataUri = true;
    }
  }
  if (!iconLink) return fail('no <link rel="icon"> found');
  return dataUri ? ok() : fail('rel="icon" present but its href is not a data: URI');
});

// (r) reduced-motion support
check('r · prefers-reduced-motion CSS present', () => {
  return html.includes('prefers-reduced-motion') ? ok() : fail('@media (prefers-reduced-motion) not found');
});

// (s) keyboard focus styling
check('s · :focus-visible styling present', () => {
  return html.includes(':focus-visible') ? ok() : fail('no :focus-visible rule found');
});

// (t) no-JS fallback
check('t · <noscript> fallback present', () => {
  return /<noscript[\s>]/i.test(html) ? ok() : fail('<noscript> not found');
});

// (u) single-file size ceiling
check('u · index.html ≤ 120000 bytes', () => {
  const size = htmlBuffer.length;
  return size <= SIZE_LIMIT ? ok(`${size} B`) : fail(`${size} B (limit ${SIZE_LIMIT} B)`);
});

// ----------------------------------------------------------------- summary

console.log('');
console.log(`${total} checks, ${failures.length} failure${failures.length === 1 ? '' : 's'}`);
process.exit(failures.length === 0 ? 0 : 1);
