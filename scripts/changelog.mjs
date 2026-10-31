#!/usr/bin/env node
/**
 * changelog.mjs — extract one release section from CHANGELOG.md
 * (Keep a Changelog format, zero dependencies).
 *
 * Usage:
 *   node scripts/changelog.mjs --tag v0.1.0 [--out notes.md]
 *
 * Finds the "## [<version>]" section (a leading "v" on --tag is optional;
 * prerelease suffixes like 0.1.0-rc.1 work), copies everything from below
 * that heading up to — not including — the next "## " heading, trims it and
 * strips any trailing Keep-a-Changelog link-reference definitions
 * ("[0.1.0]: https://…") so the output is clean release-note prose.
 *
 * Exit codes: 0 success (or --help) · 1 bad usage, missing file or missing
 * section.
 */
'use strict'; // no-op in ESM (modules are always strict); kept for clarity.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');

const USAGE = `changelog.mjs — extract a release section from CHANGELOG.md

Usage:
  node scripts/changelog.mjs --tag v0.1.0 [--out notes.md]

Options:
  --tag <version>   Tag/section to extract. A leading "v" is optional and
                    stripped; prerelease suffixes work (e.g. 0.1.0-rc.1).
  --out <file>      Write the notes to <file> instead of stdout.
  -h, --help        Show this help and exit.

Behaviour:
  Looks for the "## [<version>]" heading in CHANGELOG.md, takes everything
  from below that line up to the next "## " heading, trims it, and strips
  trailing Keep-a-Changelog link references ("[0.1.0]: https://...").

Examples:
  node scripts/changelog.mjs --tag v0.1.0
  node scripts/changelog.mjs --tag v0.1.0-rc.1 --out release-notes.md
`;

function die(msg) {
  console.error(`changelog: ${msg}`);
  process.exit(1);
}

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
if (argv.includes('-h') || argv.includes('--help')) {
  console.log(USAGE);
  process.exit(0);
}

let tagArg = null;
let outPath = null;
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--tag') {
    tagArg = argv[++i];
    if (tagArg == null) die('--tag requires a value (see --help)');
  } else if (arg === '--out') {
    outPath = argv[++i];
    if (outPath == null) die('--out requires a value (see --help)');
  } else {
    die(`unknown option "${arg}" (see --help)`);
  }
}
if (!tagArg) die('missing required --tag <version> (see --help)');

const version = tagArg.replace(/^v/, ''); // v0.1.0 → 0.1.0 · v0.1.0-rc.1 → 0.1.0-rc.1

// ------------------------------------------------------------------ extract

let text;
try {
  text = readFileSync(CHANGELOG_PATH, 'utf8');
} catch {
  die(`CHANGELOG.md not found at ${CHANGELOG_PATH}`);
}

const lines = text.split(/\r?\n/);

// Scan top-level "## [<name>]" headings; remember the one we need.
const headingRe = /^##\s+\[([^\]]+)\]/;
const available = [];
let start = -1;
for (let i = 0; i < lines.length; i++) {
  const m = headingRe.exec(lines[i]);
  if (!m) continue;
  if (start === -1 && m[1] === version) start = i;
  if (!available.includes(m[1])) available.push(m[1]);
}
if (start === -1) {
  die(`no "## [${version}]" section in CHANGELOG.md (sections found: ${available.join(', ') || 'none'})`);
}

// Body runs until the next top-level "## " heading (exclusive) or EOF.
let end = lines.length;
for (let i = start + 1; i < lines.length; i++) {
  if (/^## /.test(lines[i])) {
    end = i;
    break;
  }
}

// The heading line itself is excluded (slice starts after it). From what is
// left, drop trailing blank lines and trailing link-reference definitions
// such as "[0.1.0]: https://github.com/.../compare/v0.0.9...v0.1.0".
const body = lines.slice(start + 1, end);
while (body.length > 0) {
  const last = body[body.length - 1].trim();
  if (last === '' || /^\[[^\]]+\]:\s*\S+$/.test(last)) {
    body.pop();
    continue;
  }
  break;
}

const notes = body.join('\n').trim();
if (notes === '') {
  console.error(`changelog: warning: section [${version}] is empty`);
}

// ------------------------------------------------------------------- output

if (outPath) {
  const payload = notes === '' ? '' : `${notes}\n`;
  try {
    writeFileSync(outPath, payload, 'utf8');
  } catch (err) {
    die(`cannot write ${outPath}: ${err.message}`);
  }
  console.error(`changelog: wrote ${outPath} (${Buffer.byteLength(payload)} bytes)`); // status on stderr, stdout stays clean
} else {
  process.stdout.write(notes === '' ? '' : `${notes}\n`);
}
