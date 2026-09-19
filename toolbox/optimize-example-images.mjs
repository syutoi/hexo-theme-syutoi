// Optional maintenance tool: requires cwebp (tested with 1.3.2).
// Original JPEGs remain available for historical content and regeneration.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const assets = new URL('../example/source/assets/', import.meta.url);
for (const [id, width] of [['878514', 1920], ['2311325', 800], ['2572384', 1280]]) {
  execFileSync('cwebp', ['-q', '78', '-m', '6', '-resize', String(width), '0',
    fileURLToPath(new URL(`wallpaper-${id}.jpg`, assets)), '-o',
    fileURLToPath(new URL(`wallpaper-${id}.webp`, assets))], { stdio: 'inherit' });
}
