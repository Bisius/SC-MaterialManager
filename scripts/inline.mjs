/**
 * Post-build script: inlines all CSS and JS into a single index.html.
 * Usage: node scripts/inline.mjs
 * Output: dist/sc-material-manager/browser/app.html
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const BROWSER_DIR = join(import.meta.dirname, '..', 'dist', 'sc-material-manager', 'browser');
const INPUT  = join(BROWSER_DIR, 'index.html');
const OUTPUT = join(BROWSER_DIR, 'app.html');

let html = readFileSync(INPUT, 'utf8');

// Inline <link rel="stylesheet" href="..."> (skip media=print async-load pattern too)
html = html.replace(
  /<link\s[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
  (match, href) => {
    if (href.startsWith('http') || href.startsWith('//')) return match; // keep external
    const css = readFileSync(join(BROWSER_DIR, href), 'utf8');
    return `<style>${css}</style>`;
  }
);

// Remove the <noscript> fallback link tags left by the async-load pattern
html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

// Inline <script src="..." type="module">
html = html.replace(
  /<script\s[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
  (match, src) => {
    if (src.startsWith('http') || src.startsWith('//')) return match; // keep external
    const js = readFileSync(join(BROWSER_DIR, src), 'utf8');
    return `<script type="module">${js}</script>`;
  }
);

writeFileSync(OUTPUT, html, 'utf8');
console.log(`✓  Single-file build written to: ${OUTPUT}`);
