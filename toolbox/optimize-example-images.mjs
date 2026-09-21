// Optional maintenance tool: requires cwebp (tested with 1.3.2).
// Generated PNG originals are retained for reproducible WebP encoding.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const assets = new URL('../example/source/assets/', import.meta.url);
// Keep display assets small while retaining the soft painted texture.
for (const [id, width, quality] of [['pastoral-evening', 1920, 78], ['sunlit-desk', 800, 75], ['cottage-garden', 1280, 78]]) {
  execFileSync('cwebp', ['-q', String(quality), '-m', '6', '-resize', String(width), '0',
    fileURLToPath(new URL(`${id}.png`, assets)), '-o',
    fileURLToPath(new URL(`${id}.webp`, assets))], { stdio: 'inherit' });
}
