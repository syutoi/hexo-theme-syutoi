import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const require = createRequire(new URL('../example/package.json', import.meta.url));
const Hexo = require('hexo');
const { unescapeHTML } = require('hexo-util');
const { normalizeConfig } = require('../lib/config.cjs');
const { commentsSlot, serverUrl } = require('../lib/comments.cjs');
const root = fileURLToPath(new URL('../', import.meta.url));

test('comments require an explicit provider, valid server and eligible content', () => {
  for (const value of ['', null, {}, '//example.com', 'javascript:alert(1)', '/api', 'https://user:secret@example.com', 'https://example.com/?token=secret', 'https://example.com/#fragment']) assert.equal(serverUrl(value), '');
  assert.equal(serverUrl(' https://comments.example.com/service/ '), 'https://comments.example.com/service');
  const config = normalizeConfig({}, { comments: { provider: 'waline', server_url: 'https://comments.example.com/' } }).comments;
  const page = { path: '中文/index.html', lang: 'zh-Hant' };
  const url = value => `/blog/${value}`;
  assert.deepEqual(commentsSlot(config, page, true, url), {provider:'waline', serverURL:'https://comments.example.com', path:'/blog/中文/', lang:'zh-TW'});
  for (const data of [{comments:false}, {password:'secret'}, {published:false}, ...['categories','tags','search','404'].map(type => ({type}))]) assert.equal(commentsSlot(config, {...page, ...data}, true, url), null);
  assert.equal(commentsSlot(config, page, false, url), null);
  for (const provider of [undefined, 'none', 'unknown', true]) assert.equal(commentsSlot(normalizeConfig({}, {comments:{provider,server_url:config.server_url}}).comments, page, true, url), null);
  assert.equal(commentsSlot({...config, server_url:''}, page, true, url), null);
});

test('Hexo isolates comments assets to enabled posts and standalone pages, including subdirectory sites', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'syutoi-comments-'));
  const hexo = new Hexo(directory, {silent:true});
  t.after(async () => { await hexo.exit(); await rm(directory, {recursive:true, force:true}); });
  await mkdir(join(directory, 'themes'), {recursive:true});
  await mkdir(join(directory, 'source/_posts'), {recursive:true});
  await symlink(root, join(directory, 'themes/syutoi'));
  await symlink(join(root, 'example/node_modules'), join(directory, 'node_modules'));
  await writeFile(join(directory, 'package.json'), JSON.stringify({name:'comments-fixture', hexo:{version:'8.1.2'}, dependencies:{'hexo-renderer-markdown-it':'7.1.1'}}));
  await writeFile(join(directory, '_config.yml'), 'theme: syutoi\nlanguage: zh-TW\nurl: https://example.com/blog\nroot: /blog/\npermalink: :title/\nignore: ["**/node_modules/**", "**/themes/syutoi/example/**"]\n');
  await writeFile(join(directory, '_config.syutoi.yml'), 'comments:\n  provider: waline\n  server_url: https://comments.example.com\nsearch:\n  provider: pagefind\n');
  for (const [path, content] of Object.entries({
    '_posts/article.md':'title: Article', '_posts/disabled.md':'title: Disabled\ncomments: false',
    'about/index.md':'title: About\nlang: en', 'categories/index.md':'type: categories',
    'tags/index.md':'type: tags', '404.md':'type: 404\npermalink: 404.html'
  })) {
    const file = join(directory, 'source', path);
    await mkdir(join(file, '..'), {recursive:true});
    await writeFile(file, `---\n${content}\ndate: 2020-01-01\n---\nArticle body.`);
  }
  await hexo.init();
  await hexo.call('generate');
  const html = path => readFile(join(directory, 'public', path), 'utf8').then(unescapeHTML);
  for (const path of ['article/index.html', 'about/index.html']) {
    const output = await html(path);
    assert.match(output, /data-comments-slot/);
    assert.match(output, /\/blog\/js\/comments.min.js/);
    assert.match(output, /\/blog\/css\/comments.min.css/);
    assert.match(output, /data-core="\/blog\/js\/waline.min.js/);
    assert.doesNotMatch(output, /<(?:script|link)[^>]*(?:src|href)="https:\/\/comments.example.com/);
    assert.equal((output.match(/id="comments-content"/g) || []).length, 1);
  }
  assert.match(await html('article/index.html'), /data-path="\/blog\/article\/"/);
  assert.match(await html('article/index.html'), /data-lang="zh-TW"/);
  assert.match(await html('about/index.html'), /data-lang="en"/);
  for (const path of ['index.html','disabled/index.html','categories/index.html','tags/index.html','404.html','search/index.html']) assert.doesNotMatch(await html(path), /data-comments-slot|comments.min\.(?:js|css)|waline.min/);
  hexo.config.theme_config.comments.provider = 'none';
  await hexo.call('generate');
  assert.doesNotMatch(await html('article/index.html'), /data-comments-slot|comments.min\.(?:js|css)|waline.min/);
});

test('distributed Waline notices match bundled dependency versions', async () => {
  await promisify(execFile)(process.execPath, ['toolbox/comments-licenses.mjs', '--check'], {cwd:root});
});
