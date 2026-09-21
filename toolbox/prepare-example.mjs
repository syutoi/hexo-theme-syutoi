import { syncExampleDocs } from './example-docs.mjs';
import { lstat, mkdir, realpath, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = join(root, 'example/themes/syutoi');
await mkdir(dirname(destination), { recursive: true });

try {
  await lstat(destination);
  if (await realpath(destination) !== await realpath(root)) {
    throw new Error(`${destination} already exists and does not point to this theme.`);
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  await symlink(root, destination, process.platform === 'win32' ? 'junction' : 'dir');
}

console.log('Example site linked to the local Syutoi theme.');

await syncExampleDocs();
