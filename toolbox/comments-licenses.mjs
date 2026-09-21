// Regenerate bundled dependency notices after changing the Waline lockfile.
import { build } from 'esbuild';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const { metafile } = await build({
  absWorkingDir:root, entryPoints:['src/client/comments/waline.ts'], bundle:true,
  write:false, metafile:true, minify:true,
  define:{__VUE_OPTIONS_API__:'false',__VUE_PROD_DEVTOOLS__:'false',__VUE_PROD_HYDRATION_MISMATCH_DETAILS__:'false'}
});
const packages = new Map();
for (const input of Object.keys(metafile.inputs).filter(path => path.includes('node_modules'))) {
  let directory = dirname(join(root, input));
  while (directory !== dirname(directory)) {
    try {
      const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
      packages.set(pkg.name, {...pkg,directory});
      break;
    } catch { directory = dirname(directory); }
  }
}
let notices = 'Licenses for the optional Waline browser bundle.\n\n';
for (const pkg of [...packages.values()].sort((a,b) => a.name.localeCompare(b.name))) {
  const files = (await readdir(pkg.directory)).filter(file => /^licen[sc]e(?:\.|$)/i.test(file));
  notices += `${pkg.name} ${pkg.version} (${pkg.license})\n`;
  if (files.length) notices += await readFile(join(pkg.directory,files[0]),'utf8');
  // @waline/api declares MIT and the same author but omits a license file.
  else if (pkg.name === '@waline/api' && pkg.license === 'MIT' && pkg.author?.name === 'Mr.Hope') notices += await readFile(join(root,'node_modules/@waline/client/LICENSE'),'utf8');
  else throw new Error(`Missing bundled license: ${pkg.name}`);
  notices += '\n\n';
}
notices = notices.trimEnd() + '\n';
const destination = join(root,'source/js/waline.LICENSE.txt');
if (process.argv.includes('--check')) {
  if (await readFile(destination,'utf8') !== notices) throw new Error('Waline licenses are out of date. Run node toolbox/comments-licenses.mjs.');
} else await writeFile(destination,notices);
