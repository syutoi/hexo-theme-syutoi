import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

// Decimal KB, strict PRD limits. Includes the complete generated core bundles.
const assets = [
  ['source/js/syutoi.min.js', 50000, 30000],
  ['source/css/syutoi.min.css', 40000, null],
  // Optional viewer resources are independent of the core PRD budget.
  ['source/js/lightbox.min.js', 6000, null],
  ['source/js/photoswipe.min.js', 20000, null],
  ['source/css/lightbox.min.css', 3000, null],
  ['source/js/search.min.js', 6000, null],
  ['source/css/search.min.css', 3000, null],
  ['source/js/comments.min.js', 4000, null],
  ['source/css/comments.min.css', 2000, null],
  ['source/js/waline.min.js', 100000, null],
  ['source/css/waline.min.css', 10000, null]
];
const results = await Promise.all(assets.map(async ([path, limitBytes, stretchBytes]) => {
  const bytes = await readFile(new URL(`../${path}`, import.meta.url));
  const gzipBytes = gzipSync(bytes, { level: 9 }).length;
  return { path, bytes: bytes.length, gzipBytes, limitBytes, stretchBytes,
    passed: gzipBytes < limitBytes, sha256: createHash('sha256').update(bytes).digest('hex') };
}));
console.log(JSON.stringify({ gzipLevel: 9, unit: 'bytes (1 KB = 1000 bytes)', assets: results }, null, 2));
assert(results.every(asset => asset.passed), 'Theme bundle gzip budget exceeded');
