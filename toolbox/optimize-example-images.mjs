// Optional maintenance tool: requires cwebp (tested with 1.3.2).
// Original JPEGs remain available for historical content and regeneration.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const assets = new URL('../example/source/assets/', import.meta.url);
// The detailed portrait cover uses q70 after G4a visual and performance checks.
for (const [id, width, quality] of [['878514', 1920, 78], ['2311325', 800, 70], ['2572384', 1280, 78]]) {
  execFileSync('cwebp', ['-q', String(quality), '-m', '6', '-resize', String(width), '0',
    fileURLToPath(new URL(`wallpaper-${id}.jpg`, assets)), '-o',
    fileURLToPath(new URL(`wallpaper-${id}.webp`, assets))], { stdio: 'inherit' });
}
