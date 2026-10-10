#!/usr/bin/env node
// Project health check (no dependencies). Run with: npm run check
//  - required files exist
//  - every local file referenced by index.html exists
//  - every JavaScript file parses
//  - data/menu.json is valid and js/menu-data.js is in sync with it
//  - every in-page "#link" points at a section or a known page route
//  - no private keys or obvious secrets are committed

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { Script } from 'node:vm';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rel = p => relative(root, p) || '.';
let errors = 0, warnings = 0;
const fail = m => { errors++; console.log('  ✗ ' + m); };
const warn = m => { warnings++; console.log('  ! ' + m); };
const ok = m => console.log('  ✓ ' + m);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = join(dir, name);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

console.log('Required files');
for (const f of ['index.html', 'css/styles.css', 'js/config.js', 'js/runtime.js', 'js/country-maps.js', 'js/menu-data.js', 'js/catering.js', 'js/app.js', 'data/menu.json', 'README.md', '.gitignore', '.nojekyll']) {
  existsSync(join(root, f)) ? ok(f) : fail('missing ' + f);
}

const html = readFileSync(join(root, 'index.html'), 'utf8');

console.log('Files referenced by index.html');
const refs = [...html.matchAll(/\b(?:src|href)="([^"#][^"]*)"/g)].map(m => m[1])
  .filter(u => !/^(https?:|mailto:|tel:|data:|\/\/)/.test(u));
for (const r of new Set(refs)) existsSync(join(root, r)) ? ok(r) : fail('index.html references a missing file: ' + r);
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const order = ['js/config.js', 'js/runtime.js', 'js/country-maps.js', 'js/menu-data.js', 'js/catering.js', 'js/app.js'];
JSON.stringify(scripts) === JSON.stringify(order) ? ok('scripts load in the right order') : fail('script order should be ' + order.join(', '));

console.log('JavaScript syntax');
for (const f of walk(root).filter(p => /\.(m?js)$/.test(p))) {
  try {
    if (f.endsWith('.mjs')) execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    else new Script(readFileSync(f, 'utf8'), { filename: rel(f) });
    ok(rel(f));
  } catch (e) { fail(rel(f) + ': ' + String(e.stderr || e.message).split('\n').slice(0, 3).join(' ')); }
}

console.log('Menu data');
try {
  const menu = JSON.parse(readFileSync(join(root, 'data/menu.json'), 'utf8'));
  if (!Array.isArray(menu.tabs) || !menu.tabs.length) fail('data/menu.json has no tabs');
  const ids = new Set();
  let items = 0;
  for (const t of menu.tabs) {
    if (!t.id || !t.label || !Array.isArray(t.groups)) fail(`tab "${t.label || t.id}" is missing id, label or groups`);
    for (const g of t.groups || []) {
      if (!g.id) fail(`a section in "${t.label}" has no id`);
      else if (ids.has(g.id)) fail(`duplicate section id ${g.id}`);
      ids.add(g.id);
      if (!Array.isArray(g.items)) fail(`section ${g.id} has no items list`);
      items += (g.items || []).length;
    }
  }
  ok(`data/menu.json: ${menu.tabs.length} tabs, ${ids.size} sections, ${items} items` + (menu.supper ? ', Supper Club page' : ''));
  if (!menu.supper) warn('data/menu.json has no "supper" section (Supper Club page will use the text built into index.html)');
  try { execFileSync(process.execPath, [join(root, 'scripts/build-menu-data.mjs'), '--check'], { stdio: 'pipe' }); ok('js/menu-data.js is in sync'); }
  catch { fail('js/menu-data.js is out of date. Run: npm run build:menu'); }
} catch (e) { fail('data/menu.json is not valid JSON: ' + e.message); }

console.log('In-page links');
const ids = new Set([...html.matchAll(/\bid="([^"'+]+)"/g)].map(m => m[1]));
const routes = new Set(['home', 'editor', 'ipad', 'exit-ipad', 'catering', 'supper', 'supper-menu', 'menu']);
const hashes = new Set([...html.matchAll(/href="#([^"]*)"/g)].map(m => m[1]).filter(h => !h.includes("'")));
for (const h of hashes) (ids.has(h) || routes.has(h)) ? ok('#' + h) : fail(`link to #${h} has no matching section`);

console.log('Secrets');
const secretPatterns = [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, /"private_key"\s*:/, /\bsk_live_[0-9a-zA-Z]{10,}/, /\bghp_[0-9A-Za-z]{30,}/, /\bxox[bap]-[0-9A-Za-z-]{10,}/];
let clean = true;
for (const f of walk(root).filter(p => /\.(js|mjs|json|html|md|rules|txt|yml|yaml)$/.test(p))) {
  const text = readFileSync(f, 'utf8');
  for (const re of secretPatterns) if (re.test(text)) { clean = false; fail(`${rel(f)} looks like it contains a secret (${re})`); }
}
if (clean) ok('no private keys or tokens found');

console.log(`\n${errors ? errors + ' problem(s)' : 'All checks passed'}${warnings ? `, ${warnings} warning(s)` : ''}.`);
process.exit(errors ? 1 : 0);
