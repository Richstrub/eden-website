#!/usr/bin/env node
// Regenerates js/menu-data.js from data/menu.json.
// The page loads the menu as a script (not with fetch) so it also works when
// index.html is opened straight from disk.
//
//   node scripts/build-menu-data.mjs          write js/menu-data.js
//   node scripts/build-menu-data.mjs --check  exit 1 if js/menu-data.js is out of date

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'data', 'menu.json');
const out = join(root, 'js', 'menu-data.js');

const menu = JSON.parse(readFileSync(src, 'utf8'));
if (!menu || !Array.isArray(menu.tabs)) {
  console.error('data/menu.json must be an object with a "tabs" array.');
  process.exit(1);
}

const js =
  '/* Generated from data/menu.json by scripts/build-menu-data.mjs. Do not edit by hand:\n' +
  '   change data/menu.json (or use the menu editor) and run `npm run build:menu`. */\n' +
  'window.EDEN_MENU_SEED=' + JSON.stringify(menu).replace(/</g, '\\u003c') + ';\n';

if (process.argv.includes('--check')) {
  const current = existsSync(out) ? readFileSync(out, 'utf8') : '';
  if (current !== js) {
    console.error('js/menu-data.js is out of date. Run: npm run build:menu');
    process.exit(1);
  }
  console.log('js/menu-data.js matches data/menu.json');
} else {
  writeFileSync(out, js);
  const items = menu.tabs.reduce((n, t) => n + t.groups.reduce((m, g) => m + (g.items || []).length, 0), 0);
  console.log(`Wrote js/menu-data.js (${menu.tabs.length} tabs, ${items} items)`);
}
