import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../example/package.json', import.meta.url));
const Hexo = require('hexo');
const yaml = require('js-yaml');
const root = fileURLToPath(new URL('../', import.meta.url));

async function render(settings, rootPath = '/', fixture = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'syutoi-config-'));
  const hexo = new Hexo(directory, { silent: true });
  try {
    await mkdir(join(directory, 'themes'), { recursive: true });
    await mkdir(join(directory, 'source/_posts'), { recursive: true });
    await symlink(root, join(directory, 'themes/syutoi'));
    await symlink(join(root, 'example/node_modules'), join(directory, 'node_modules'));
    await writeFile(join(directory, 'package.json'), JSON.stringify({name:'config-fixture',hexo:{version:'8.1.2'},dependencies:{'hexo-renderer-markdown-it':'7.1.1'}}));
    await writeFile(join(directory, '_config.yml'), yaml.dump({title:'Fixture',author:'Writer',theme:'syutoi',language:'en',url:'https://example.com'+rootPath,root:rootPath,ignore:['**/node_modules/**','**/themes/syutoi/example/**'],...fixture.config}));
    await writeFile(join(directory, '_config.syutoi.yml'), yaml.dump(settings));
    const posts = fixture.posts ?? ['---\ntitle: Example\ndate: 2020-01-01\n---\n## Heading\n\nA paragraph.\n'];
    await Promise.all(posts.map((post, index) => writeFile(join(directory, `source/_posts/post-${index}.md`), post)));
    for (const [path, content] of Object.entries(fixture.pages ?? {})) {
      const destination = join(directory, 'source', path, 'index.md');
      await mkdir(join(directory, 'source', path), {recursive:true});
      await writeFile(destination, content);
    }
    if (fixture.translations) {
      await mkdir(join(directory, 'source/_data'), {recursive:true});
      await writeFile(join(directory, 'source/_data/languages.yml'), yaml.dump(fixture.translations));
    }
    await hexo.init();
    await hexo.call('generate');
    if (fixture.paths) return await Promise.all(fixture.paths.map(path => readFile(join(directory, 'public', path), 'utf8')));
    return await readFile(join(directory, 'public/index.html'), 'utf8');
  } finally {
    await hexo.exit();
    await rm(directory, {recursive:true,force:true});
  }
}

test('Hexo renders structured social links and local paths safely under a subdirectory', async () => {
  const html = await render({branding:{name:'My & blog',avatar:'/images/avatar.jpg'},navigation:{menu:[{name:'Only link',url:'/reading/'}]},social:[{name:'<b>Mail</b>',url:'mailto:hello@example.com'},{name:'Unsafe',url:'javascript:alert(1)'}],footer:{since:2020}}, '/blog/');
  assert.match(html,/My &amp; blog/);
  assert.match(html,/href="\/blog\/reading\/"/);
  assert.match(html,/src="\/blog\/images\/avatar.jpg"/);
  assert.match(html,/href="mailto:hello@example.com"/);
  assert.match(html,/&lt;b&gt;Mail&lt;\/b&gt;/);
  assert.doesNotMatch(html,/javascript:|>Unsafe</);
  assert.match(html,new RegExp(`2020–${new Date().getFullYear()}`));
  const navigation = html.match(/<nav id="site-navigation"[\s\S]*?<\/nav>/)[0];
  assert.equal((navigation.match(/<a /g)||[]).length,1,'A menu override must replace defaults');
});

test('Hexo respects empty navigation, absent images and disabled sidebar/footer features', async () => {
  const html = await render({navigation:{menu:[]},branding:{avatar:'',favicon:''},sidebar:{enable:false},footer:{powered:false,rss:false}});
  assert.match(html,/site-layout without-sidebar/);
  assert.doesNotMatch(html,/<aside|class="hero-image"|rel="icon"|class="powered-by"/);
  assert.doesNotMatch(html,/id="site-navigation"|data-nav-toggle/);
  assert.match(html,/Example/);
});

test('Hexo legacy overrides preserve identity, navigation and theme preference', async () => {
  const html = await render({alternate:'Legacy name',darkmode:true,sidebar:{avatar:'avatar.jpg'},menu:{home:'/ || home'},social:{mail:'mailto:legacy@example.com || envelope'}});
  assert.match(html,/data-theme-default="dark"/);
  assert.match(html,/>Legacy name<\/p>/);
  assert.match(html,/src="\/images\/avatar.jpg"/);
  assert.match(html,/href="mailto:legacy@example.com"/);
});

const list = html => html.match(/<ol class="post-list">[\s\S]*?<\/ol>/)[0];
const post = (title, fields = '', content = 'Body paragraph.') => `---\ntitle: ${title}\ndate: 2020-01-01\n${fields}\n---\n${content}\n`;

test('real Hexo pagination includes each post once and keeps sticky posts first', async () => {
  const pages = await render({}, '/blog/', {
    config: {per_page: 2},
    posts: Array.from({length: 5}, (_, i) => post(`Article ${i}`, i === 0 ? 'sticky: true' : '').replace('2020-01-01', `2020-01-0${i + 1}`)),
    paths: ['index.html', 'page/2/index.html', 'page/3/index.html']
  });
  const titles = pages.map(html => [...list(html).matchAll(/<h2><a[^>]*>(.*?)<\/a><\/h2>/g)].map(match => match[1]));
  assert.deepEqual(titles, [['Article 0', 'Article 4'], ['Article 3', 'Article 2'], ['Article 1']]);
  assert.match(pages[0], /href="\/blog\/page\/2\/"/);
  assert.match(pages[1], /href="\/blog\/page\/3\/"/);
  assert.match(pages[2], /href="\/blog\/page\/2\/"/);
});

test('list summaries support per-post opt-out, custom text, more markers and Unicode limits', async () => {
  const html = await render({post_list: {summary_length: 4}}, '/', {posts: [
    post('Custom', 'summary: "春😀秋冬季"'),
    post('Hidden', 'summary: false'),
    post('More', '', '前文\n\n<!-- more -->\n\n后文'),
    post('Empty', '', ''),
    post('Escaped', 'summary: "&lt;b&gt; &amp;"'),
    post('Covered', 'cover: /images/cover.jpg')
  ]});
  const cards = list(html);
  assert.match(cards, /春😀秋冬…/);
  assert.match(cards, /class="post-summary">前文<\/p>/);
  assert.match(cards, /class="post-summary">&lt;b&gt; …<\/p>/);
  assert.equal((cards.match(/class="post-summary"/g) || []).length, 4);
  assert.equal((cards.match(/class="post-cover"/g) || []).length, 1);
  assert.match(cards, /loading="lazy" decoding="async"/);
});

test('list switches hide summaries and covers without changing article content or SEO', async () => {
  const [home, article] = await render({post_list:{summary:false,cover:false}}, '/blog/', {
    config:{permalink:':title/'},
    posts:[post('Sample', 'cover: /images/cover.jpg\ndescription: Article description')],
    paths:['index.html','post-0/index.html']
  });
  assert.doesNotMatch(list(home), /post-summary|post-cover|has-cover|has-summary/);
  assert.match(article, /src="\/blog\/images\/cover.jpg"/);
  assert.match(article, /content="Article description"/);
  assert.match(article, /Body paragraph/);
});

test('empty and unpaginated sites render usable lists without pagination', async () => {
  const empty = await render({}, '/', {posts:[]});
  assert.match(list(empty), /class="empty-state"/);
  assert.doesNotMatch(empty, /class="pagination"/);
  const all = await render({}, '/', {config:{per_page:0}, posts:[post('One'),post('Two')]});
  assert.equal((list(all).match(/<h2>/g)||[]).length, 2);
  assert.doesNotMatch(all, /class="pagination"/);
});


test('article metadata, taxonomy, attribution and neighbors survive subdirectory rendering', async () => {
  const [article, single] = await render({}, '/blog/', {
    config:{permalink:':title/'},
    posts:[
      post('Older', 'updated: 2020-01-01'),
      post('Reading & notes', 'date: 2021-02-03\nupdated: 2021-02-05\nauthor: Guest Writer\ncategories: [Notes, Reading]\ntags: [Books]', '## Heading\n\nMain content.').replace('date: 2020-01-01\n', '')
    ],
    paths:['post-1/index.html','post-0/index.html']
  });
  assert.match(article, /<h1>Reading &amp; notes<\/h1>/);
  assert.match(article, /datetime="2021-02-03"/);
  assert.match(article, /datetime="2021-02-05"/);
  assert.match(article, /© 2021 Guest Writer/);
  assert.match(article, /href="\/blog\/categories\/Notes\/Reading\/"/);
  assert.match(article, /href="\/blog\/tags\/Books\/"/);
  assert.match(article, /href="\/blog\/post-1\/" rel="bookmark">https:\/\/example.com\/blog\/post-1\//);
  assert.match(article, /href="#Heading"/);
  assert.match(article, /id="Heading"/);
  assert.match(article, /class="post-neighbors"[\s\S]*href="\/blog\/post-0\/"/);
  assert.doesNotMatch(single, /Edited on/);
});

test('standalone pages render title, cover, body and optional native TOC without post metadata', async () => {
  const [about, plain, onlyPost] = await render({}, '/blog/', {
    config:{permalink:':title/'},
    pages:{
      about:'---\ntitle: About & projects\ncover: /images/about.jpg\n---\n## Projects\n\nIndependent page body.',
      plain:'---\ntitle: Plain\ntoc: false\n---\n## Heading\n\nPlain content.'
    },
    paths:['about/index.html','plain/index.html','post-0/index.html']
  });
  assert.match(about, /<h1>About &amp; projects<\/h1>/);
  assert.match(about, /src="\/blog\/images\/about.jpg"/);
  assert.match(about, /Independent page body/);
  assert.match(about, /href="#Projects"/);
  assert.match(about, /id="Projects"/);
  assert.doesNotMatch(about, /article-footer|post-neighbors|article-attribution/);
  assert.doesNotMatch(plain, /article-toc/);
  assert.doesNotMatch(onlyPost, /post-neighbors/);
});

test('archives paginate by year without losing posts and can generate an empty archive', async () => {
  const pages = await render({}, '/blog/', {
    config:{per_page:2,archive_generator:{per_page:2}},
    posts:[post('First'),post('Second').replace('2020-01-01','2020-02-01'),post('Third').replace('2020-01-01','2021-03-01')],
    paths:['archives/index.html','archives/page/2/index.html','archives/2020/index.html','archives/2020/02/index.html']
  });
  assert.match(pages[0], /class="archive-year">2021<\/h2>[\s\S]*class="archive-year">2020<\/h2>/);
  const titles = pages.slice(0,2).flatMap(html => [...html.matchAll(/<h3><a[^>]*>(.*?)<\/a><\/h3>/g)].map(match=>match[1]));
  assert.deepEqual(titles, ['Third','Second','First']);
  assert.match(pages[0], /href="\/blog\/archives\/page\/2\/"/);
  assert.match(pages[2], /<h1>Archive \/ 2020<\/h1>/);
  assert.match(pages[3], /<h1>Archive \/ 2020 \/ 2<\/h1>/);
  assert.match(pages[3], /datetime="2020-02-01"/);
  const [empty] = await render({}, '/', {posts:[],paths:['archives/index.html']});
  assert.match(empty, /No posts yet/);
  assert.doesNotMatch(empty, /class="pagination"/);
});

test('monthly and daily archives work independently of yearly archives', async () => {
  const [month, day] = await render({}, '/', {
    config:{archive_generator:{yearly:false,monthly:true,daily:true}},
    paths:['archives/2020/01/index.html','archives/2020/01/01/index.html']
  });
  assert.match(month, /<h1>Archive \/ 2020 \/ 1<\/h1>/);
  assert.match(day, /<h1>Archive \/ 2020 \/ 1 \/ 1<\/h1>/);
});


test('page language, language lists and custom translations render consistently', async () => {
  const [home, english, traditional, unknown] = await render({navigation:{menu:[{name:'menu.home',url:'/'},{name:'menu.friends',url:'/friends/'}]}}, '/', {
    config:{language:['zh-CN','en']},
    translations:{en:{menu:{home:'Start & read'}}},
    pages:{
      english:'---\ntitle: English page\nlang: en-US\n---\nBody',
      traditional:'---\ntitle: Traditional page\nlang: zh_hant\n---\n內文',
      unknown:'---\ntitle: French page\nlang: fr\n---\nTexte'
    },
    paths:['index.html','english/index.html','traditional/index.html','unknown/index.html']
  });
  assert.match(home, /<html lang="zh-CN"/);
  assert.match(home, /aria-label="主导航"/);
  assert.match(english, /<html lang="en-US"/);
  assert.match(english, /aria-label="Main navigation"/);
  assert.match(english, />Start &amp; read<\/a>/);
  assert.match(english, />Friends<\/a>/);
  assert.match(english, /data-copy-label="Copy"/);
  assert.match(traditional, /<html lang="zh-Hant"/);
  assert.match(traditional, /aria-label="主導覽"/);
  assert.match(traditional, /data-copy-label="複製"/);
  assert.match(unknown, /<html lang="fr"/);
  assert.match(unknown, /aria-label="主导航"/);
});

test('unsupported site languages use English UI and empty taxonomy messages describe the right content', async () => {
  const [categories, tags, missing] = await render({}, '/', {
    config:{language:'fr'},posts:[],paths:['categories/index.html','tags/index.html','404.html']
  });
  assert.match(categories, /<html lang="fr"/);
  assert.match(categories, /No categories yet/);
  assert.match(tags, /No tags yet/);
  assert.match(missing, /<h1>Page not found<\/h1>/);
});
