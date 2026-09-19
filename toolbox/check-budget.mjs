import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

// Decimal KB, strict PRD limits. Includes the complete generated core bundles.
const assets = [
  ['source/js/syutoi.min.js', 50000, 30000],
  ['source/css/syutoi.min.css', 40000, null]
];
const results = await Promise.all(assets.map(async ([path, limitBytes, stretchBytes]) => {
  const bytes = await readFile(new URL(`../${path}`, import.meta.url));
  const gzipBytes = gzipSync(bytes, { level: 9 }).length;
  return { path, bytes: bytes.length, gzipBytes, limitBytes, stretchBytes,
    passed: gzipBytes < limitBytes, sha256: createHash('sha256').update(bytes).digest('hex') };
}));
console.log(JSON.stringify({ gzipLevel: 9, unit: 'bytes (1 KB = 1000 bytes)', assets: results }, null, 2));
assert(results.every(asset => asset.passed), 'Core bundle gzip budget exceeded');
