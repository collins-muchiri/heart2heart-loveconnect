#!/usr/bin/env node
/**
 * bump.mjs — cut a release in one shot (zero dependencies, Node builtins only).
 *
 *   node scripts/bump.mjs <patch|minor|major> [--dry-run]
 *
 * What it does, in order:
 *   1. Computes the next semver from package.json. A prerelease suffix is
 *      always dropped first, npm-style:  0.1.0-rc.1 --patch--> 0.1.1
 *      (--minor--> 0.2.0, --major--> 1.0.0).
 *   2. Computes the new contents of three files (nothing is written yet):
 *        · package.json  — "version" field, indentation preserved
 *        · index.html    — <html data-app-version>, the first-line stamp
 *          comment (new version, built=today, short commit sha from
 *          `git rev-parse --short HEAD`, fallback "workdir" if git fails),
 *          and the footer <span data-version> text
 *        · CHANGELOG.md  — the current "## [Unreleased]" entries move under
 *          "## [<new-version>] - <today>" (### buckets reordered to
 *          Added/Changed/Fixed/Accessibility/Content/Security), an empty
 *          "## [Unreleased]" is recreated in its place, and if Unreleased
 *          was missing or empty the new section gets
 *          "- Release maintenance and build stamp refresh."
 *      Any missing contract pattern aborts BEFORE anything is written.
 *   3. Writes the three files, then runs scripts/smoke.test.mjs as a gate.
 *      If the gate fails, all three files are reverted to their original
 *      contents and we exit 1.
 *   4. git add <the three files>, commit "chore(release): v<new>" and create
 *      the annotated tag "v<new>" with message "v<new> — release".
 *      If the commit fails (e.g. no committer identity), instructions are
 *      printed instead of crashing. NEVER pushes — the exact push command
 *      ("git push origin main --follow-tags") is printed at the end.
 *
 *   --dry-run computes and prints everything, but writes no file and runs
 *   no mutating git command.
 *
 * Exit codes: 0 success (or --help/--dry-run) · 1 any failure.
 */
'use strict'; // no-op in ESM (modules are always strict); kept for clarity.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// ------------------------------------------------------------------ config

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..'); // repo root = parent of scripts/
const PKG_PATH = path.join(ROOT, 'package.json');
const HTML_PATH = path.join(ROOT, 'index.html');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');
const SMOKE_PATH = path.join(SCRIPT_DIR, 'smoke.test.mjs');

const KINDS = ['patch', 'minor', 'major'];
const BUCKETS = ['Added', 'Changed', 'Fixed', 'Accessibility', 'Content', 'Security'];

/** x.y.z, optionally with -prerelease and/or +build metadata. */
const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;

const USAGE = `bump.mjs — bump the version, restamp index.html, rotate the changelog,
validate with the smoke test, then commit and tag. Never pushes.

Usage:
  node scripts/bump.mjs <patch|minor|major> [--dry-run]

Arguments:
  <patch|minor|major>  Which semver part to bump. If the current version
                       carries a prerelease suffix it is dropped first,
                       npm-style:
                         0.1.0-rc.1 --patch--> 0.1.1
                         0.1.0-rc.1 --minor--> 0.2.0
                         0.1.0-rc.1 --major--> 1.0.0

Options:
  --dry-run            Compute and print everything (new version, rewritten
                       stamps, changelog section, git commands) without
                       writing any file or running any git command.
  -h, --help           Show this help and exit.

Files touched on a real run:
  package.json   "version" field (2-space indentation preserved)
  index.html     <html data-app-version>, first-line stamp comment
                 (version + built date + short commit sha, "workdir" if git
                 is unavailable) and the footer <span data-version> span
  CHANGELOG.md   "## [Unreleased]" entries move under "## [<new>] - <today>"
                 (buckets ordered Added/Changed/Fixed/Accessibility/Content/
                 Security); an empty "## [Unreleased]" is recreated. If
                 Unreleased is missing/empty, the new section gets
                 "- Release maintenance and build stamp refresh."

Safety: files are written only after their new contents fully compute, the
smoke test runs as a post-write gate, and a failing gate reverts all three
files to their original bytes. git tag failures leave the commit intact.
`;

function die(msg) {
  console.error(`bump: ${msg}`);
  process.exit(1);
}

// ----------------------------------------------------------------- helpers

/** Local calendar date as YYYY-MM-DD (a build stamp means "here", not UTC). */
function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Escape a literal string for embedding inside new RegExp(). */
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** `git rev-parse --short HEAD`, or the literal "workdir" when git fails. */
function shortSha() {
  const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
  const out = (r.stdout || '').trim();
  return r.status === 0 && out ? out : 'workdir';
}

/**
 * Next semver. kind must be patch|minor|major (validated by the caller).
 * Prerelease/build suffixes of the current version are dropped on any bump,
 * matching `npm version <kind>`: 0.1.0-rc.1 --patch--> 0.1.1.
 */
function nextVersion(current, kind) {
  const m = SEMVER_RE.exec(current);
  if (!m) throw new Error(`package.json version "${current}" is not valid semver (expected x.y.z or x.y.z-prerelease)`);
  let major = Number(m[1]);
  let minor = Number(m[2]);
  let patch = Number(m[3]);
  if (kind === 'major') { major += 1; minor = 0; patch = 0; }
  else if (kind === 'minor') { minor += 1; patch = 0; }
  else if (kind === 'patch') { patch += 1; }
  else throw new Error(`unknown bump kind "${kind}"`);
  return `${major}.${minor}.${patch}`;
}

/** package.json with only the "version" value replaced (indentation kept). */
function buildPkg(raw, newVersion) {
  const re = /^(\s*"version"\s*:\s*)"[^"]*"/m; // first "version" key at any indent
  if (!re.test(raw)) throw new Error('package.json: could not find a "version" field');
  return raw.replace(re, (whole, indentAndKey) => `${indentAndKey}"${newVersion}"`);
}

/**
 * index.html with the three version spots rewritten. Throws (before any
 * write happens) if any of the contract patterns is missing or already
 * drifted from the current package.json version.
 */
function buildHtml(raw, oldVersion, newVersion, date, sha) {
  let html = raw;

  // (1) <html … data-app-version="x.y.z">
  const attrRe = new RegExp(`(data-app-version=["'])${escapeRe(oldVersion)}(["'])`);
  if (!attrRe.test(html)) {
    throw new Error(`index.html: no data-app-version="${oldVersion}" found on the <html> tag`);
  }
  html = html.replace(attrRe, (whole, pre, post) => `${pre}${newVersion}${post}`);

  // (2) first-line stamp: … Foundation · v0.1.0 · built 2026-10-31 · commit abc1234 -->
  //     Rewrite version + built date, refresh the short sha (the trailing
  //     " -->" is left untouched by the match).
  const stampRe = new RegExp(
    `·\\s*v${escapeRe(oldVersion)}\\s*·\\s*built\\s*\\d{4}-\\d{2}-\\d{2}\\s*·\\s*commit\\s*[^\\s*]+`,
  );
  if (!stampRe.test(html)) {
    throw new Error('index.html: build-stamp comment "· v<version> · built <date> · commit <sha>" not found');
  }
  html = html.replace(stampRe, () => `· v${newVersion} · built ${date} · commit ${sha}`);

  // (3) footer: Prototype build <span data-version>v0.1.0</span>
  const footRe = new RegExp(`(<span\\s+data-version\\s*>\\s*)v${escapeRe(oldVersion)}\\s*(</span>)`);
  if (!footRe.test(html)) {
    throw new Error('index.html: footer <span data-version>v…</span> not found');
  }
  html = html.replace(footRe, (whole, pre, post) => `${pre}v${newVersion}${post}`);

  return html;
}

// ------------------------------------------------------- changelog machinery

/** Trim leading/trailing blank lines from a line array (no mutation). */
function trimBlankEdges(linesArr) {
  let a = 0;
  let b = linesArr.length;
  while (a < b && linesArr[a].trim() === '') a += 1;
  while (b > a && linesArr[b - 1].trim() === '') b -= 1;
  return linesArr.slice(a, b);
}

/**
 * Split a changelog into its header (everything before the first "## " line)
 * and its top-level sections [{ heading, body }], in document order.
 * Lines are normalised to LF.
 */
function splitTopSections(text) {
  const linesArr = text.split(/\r?\n/);
  let first = linesArr.findIndex((l) => /^## /.test(l));
  if (first === -1) first = linesArr.length;
  const header = linesArr.slice(0, first);
  const sections = [];
  let cur = null;
  for (let i = first; i < linesArr.length; i++) {
    if (/^## /.test(linesArr[i])) {
      cur = { heading: linesArr[i], body: [] };
      sections.push(cur);
    } else if (cur) {
      cur.body.push(linesArr[i]);
    }
  }
  return { header, sections };
}

/**
 * Re-serialise an Unreleased body so its "### Bucket" blocks appear in the
 * canonical BUCKETS order (unknown bucket names follow, original order kept).
 * Returns "" when there is no usable content.
 */
function renderBuckets(bodyLines) {
  const preamble = [];
  const order = []; // bucket names in first-seen order
  const blocks = new Map(); // bucket name → lines below its heading
  let cur = null;
  for (const raw of bodyLines) {
    const line = raw.replace(/\s+$/, '');
    const m = /^###\s+(.+?)\s*$/.exec(line);
    if (m) {
      cur = m[1];
      if (!blocks.has(cur)) {
        blocks.set(cur, []);
        order.push(cur);
      }
      continue;
    }
    if (cur === null) {
      if (line.trim() !== '') preamble.push(line); // stray prose before any bucket
      continue;
    }
    blocks.get(cur).push(line);
  }
  const known = BUCKETS.filter((b) => blocks.has(b));
  const extra = order.filter((b) => !BUCKETS.includes(b));
  const parts = [];
  if (preamble.length > 0) parts.push(preamble.join('\n').trim());
  for (const b of [...known, ...extra]) {
    const body = blocks.get(b).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    if (body !== '') parts.push(`### ${b}\n\n${body}`);
  }
  return parts.join('\n\n');
}

/**
 * CHANGELOG.md with "## [Unreleased]" rotated into "## [<newVersion>] - <date>".
 * The empty Unreleased heading is recreated exactly where the old one sat, so
 * a classic layout keeps the new section right under the header block (and an
 * "## Index" block, if present, stays at the top). All other sections keep
 * their order and bodies (including trailing link references/footers).
 */
function buildChangelog(raw, newVersion, date) {
  const { header, sections } = splitTopSections(raw);
  const unrel = sections.find((s) => s.heading.startsWith('## [Unreleased]'));

  const moved = unrel ? renderBuckets(unrel.body) : '';
  const newBody = moved !== '' ? moved : '- Release maintenance and build stamp refresh.';
  const newSection = [`## [${newVersion}] - ${date}`, '', ...newBody.split('\n')];

  // Where does the rotated block go? At the old Unreleased position; if there
  // was none, right after the header block.
  const insertAt = unrel ? sections.indexOf(unrel) : -1;

  const out = [...trimBlankEdges(header)];
  const rendered = []; // section blocks to append after the header
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (s === unrel) {
      rendered.push('', '## [Unreleased]'); // recreated, empty (Keep a Changelog)
      rendered.push('', ...newSection);     // rotated version section right below it
      continue;
    }
    const body = trimBlankEdges(s.body);
    rendered.push('', s.heading);
    if (body.length > 0) rendered.push('', ...body);
  }
  if (insertAt === -1) {
    // No Unreleased existed: prepend empty Unreleased + new section to the front.
    out.push('', '## [Unreleased]', '', ...newSection, ...rendered);
  } else {
    out.push(...rendered);
  }
  return `${out.join('\n').replace(/\s*$/, '')}\n`; // single trailing newline
}

// --------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
if (argv.includes('-h') || argv.includes('--help')) {
  console.log(USAGE);
  process.exit(0);
}
let kind = null;
let dryRun = false;
for (const arg of argv) {
  if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg.startsWith('-') && arg !== '-') {
    die(`unknown option "${arg}" (see --help)`);
  } else if (kind === null) {
    kind = arg;
  } else {
    die(`unexpected extra argument "${arg}" (see --help)`);
  }
}
if (!KINDS.includes(kind)) {
  die(`first argument must be one of: ${KINDS.join(' | ')} (see --help)`);
}

// ------------------------------------------------------- read + compute

// Read all three originals into memory up front so a post-write failure can
// restore them byte-for-byte.
function readOrDie(p, label) {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    die(`${label} not found at ${p} — nothing was changed`);
    return null; // unreachable, satisfies readers
  }
}
const pkgRaw = readOrDie(PKG_PATH, 'package.json');
const htmlRaw = readOrDie(HTML_PATH, 'index.html');
const changelogRaw = readOrDie(CHANGELOG_PATH, 'CHANGELOG.md');
if (!existsSync(SMOKE_PATH)) {
  die(`smoke gate missing at ${SMOKE_PATH} — refusing to release unvalidated`);
}

let oldVersion = null;
try {
  const parsed = JSON.parse(pkgRaw);
  if (typeof parsed.version === 'string') oldVersion = parsed.version;
} catch (err) {
  die(`package.json is not valid JSON: ${err.message}`);
}
if (oldVersion == null) die('package.json has no "version" field');

let newVersion;
try {
  newVersion = nextVersion(oldVersion, kind);
} catch (err) {
  die(`${err.message} — nothing was changed`);
}

const date = today();
const sha = shortSha(); // "workdir" fallback keeps the stamp valid outside git

// Compute all three new contents up front; any contract drift aborts here,
// before a single byte is written.
let pkgNew;
let htmlNew;
let changelogNew;
try {
  pkgNew = buildPkg(pkgRaw, newVersion);
  htmlNew = buildHtml(htmlRaw, oldVersion, newVersion, date, sha);
  changelogNew = buildChangelog(changelogRaw, newVersion, date);
} catch (err) {
  die(`${err.message} — nothing was changed`);
}

// ---------------------------------------------------------------- dry run

if (dryRun) {
  console.log('bump: dry-run — no files written, no git commands run');
  console.log(`  bump kind:    ${kind}`);
  console.log(`  version:      ${oldVersion} → ${newVersion}`);
  console.log(`  build stamp:  v${newVersion} · built ${date} · commit ${sha}`);
  console.log('  package.json: "version": "<new>"');
  console.log('  index.html:   data-app-version + stamp comment + footer span rewritten');
  console.log('  CHANGELOG.md  (preview, first 16 lines):');
  for (const line of changelogNew.split('\n').slice(0, 16)) console.log(`    | ${line}`);
  console.log('  git (after a passing smoke test):');
  console.log('    git add package.json index.html CHANGELOG.md');
  console.log(`    git commit -m "chore(release): v${newVersion}"`);
  console.log(`    git tag -a v${newVersion} -m "v${newVersion} — release"`);
  console.log('  push (manual, this script never pushes):');
  console.log('    git push origin main --follow-tags');
  process.exit(0);
}

// ------------------------------------------------- write + smoke gate + git

writeFileSync(PKG_PATH, pkgNew, 'utf8');
writeFileSync(HTML_PATH, htmlNew, 'utf8');
writeFileSync(CHANGELOG_PATH, changelogNew, 'utf8');
console.log(`bump: wrote package.json, index.html, CHANGELOG.md (${oldVersion} → ${newVersion})`);

// Post-write validation gate. On any failure, restore the originals exactly.
const smoke = spawnSync(process.execPath, [SMOKE_PATH], { cwd: ROOT, stdio: 'inherit' });
if (smoke.error || smoke.status !== 0) {
  writeFileSync(PKG_PATH, pkgRaw, 'utf8');
  writeFileSync(HTML_PATH, htmlRaw, 'utf8');
  writeFileSync(CHANGELOG_PATH, changelogRaw, 'utf8');
  console.error('bump: smoke test FAILED — reverted package.json, index.html and CHANGELOG.md to their original contents');
  process.exit(1);
}
console.log('bump: smoke test passed');

function git(args) {
  return spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

const add = git(['add', 'package.json', 'index.html', 'CHANGELOG.md']);
if (add.error || add.status !== 0) {
  console.error((add.stderr || add.error?.message || 'git add failed').trim());
  die('git add failed — the three files ARE updated and validated on disk; stage them manually and commit');
}

const commit = git(['commit', '-m', `chore(release): v${newVersion}`]); // -m only, never -S
if (commit.error || commit.status !== 0) {
  console.error((commit.stderr || commit.stdout || commit.error?.message || 'git commit failed').trim());
  console.error('');
  console.error('bump: git commit failed — most likely no committer identity is configured.');
  console.error('The three files are updated AND staged; finish the release manually:');
  console.error('');
  console.error('  git config user.name  "Your Name"');
  console.error('  git config user.email "you@example.com"');
  console.error(`  git commit -m "chore(release): v${newVersion}"`);
  console.error(`  git tag -a v${newVersion} -m "v${newVersion} — release"`);
  process.exit(1);
}
if (commit.stdout && commit.stdout.trim()) console.log(commit.stdout.trim());
console.log(`bump: commit "chore(release): v${newVersion}" created`);

const tag = git(['tag', '-a', `v${newVersion}`, '-m', `v${newVersion} — release`]);
if (tag.error || tag.status !== 0) {
  console.error((tag.stderr || tag.error?.message || 'git tag failed').trim());
  die(`git tag failed — the commit itself succeeded. If v${newVersion} already exists: git tag -d v${newVersion}, then retry the command above`);
}
console.log(`bump: annotated tag v${newVersion} created`);

console.log('');
console.log('Release ready — push when you are ready (this script never pushes):');
console.log('  git push origin main --follow-tags');
