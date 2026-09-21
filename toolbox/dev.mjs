import { watch } from 'node:fs';
import { syncExampleDocs } from './example-docs.mjs';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { once } from 'node:events';
import { createAssetContext, root } from './assets.mjs';
import './prepare-example.mjs';

const context = await createAssetContext();
let server;
let stopping = false;
let docsQueue = Promise.resolve();
const docsWatcher = watch(join(root, 'docs'), {recursive:true}, () => {
  docsQueue = docsQueue.then(() => syncExampleDocs()).catch(error => console.error('Documentation sync failed:', error));
});

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  docsWatcher.close();
  await docsQueue;
  process.exitCode = code;
  if (server?.pid && server.exitCode === null && server.signalCode === null) {
    const exited = once(server, 'exit').catch(() => {});
    server.kill('SIGTERM');
    const timeout = setTimeout(() => server.kill('SIGKILL'), 3000);
    timeout.unref();
    await exited;
    clearTimeout(timeout);
  }
  await context.dispose();
}

process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());

try {
  await context.rebuild();
  if (!stopping) {
    await context.watch();
    const require = createRequire(new URL('../example/package.json', import.meta.url));
    server = spawn(process.execPath, [
      require.resolve('hexo/bin/hexo'), 'server', '--ip', '127.0.0.1', ...process.argv.slice(2)
    ], { cwd: join(root, 'example'), stdio: 'inherit' });
    server.once('error', error => {
      console.error(error);
      void stop(1);
    });
    server.once('exit', (code, signal) => {
      if (!stopping) void stop(code ?? (signal ? 1 : 0));
    });
  }
} catch (error) {
  console.error(error);
  await stop(1);
}
