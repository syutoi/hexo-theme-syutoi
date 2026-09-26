import { parseDocument, DomUtils } from 'htmlparser2';
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
const themeVersion = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).version;

async function render(settings, rootPath = '/', fixture = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'syutoi-config-'));
  const hexo = new Hexo(directory, { silent: true });
  try {
    await mkdir(join(directory, 'themes'), { recursive: true });
    await mkdir(join(directory, 'source/_posts'), { recursive: true });
    await symlink(root, join(directory, 'themes/syutoi'));
    await symlink(join(root, 'example/node_modules'), join(directory, 'node_modules'));
    await writeFile(join(directory, 'package.json'), JSON.stringify({name:'config-fixture',hexo:{version:'8.1.2'},dependencies:{'hexo-renderer-markdown-it':'7.1.1',...fixture.dependencies}}));
    await writeFile(join(directory, '_config.yml'), yaml.dump({title:'Fixture',author:'Writer',theme:'syutoi',language:'en',url:'https://example.com'+rootPath,root:rootPath,ignore:['**/node_modules/**','**/themes/syutoi/example/**'],...fixture.config}));
    await writeFile(join(directory, '_config.syutoi.yml'), yaml.dump(settings));
    const posts = fixture.posts ?? ['---\ntitle: Example\ndate: 2020-01-01\n---\n## Heading\n\nA paragraph.\n'];
    await Promise.all(posts.map((post, index) => writeFile(join(directory, `source/_posts/post-${index}.md`), post)));
    for (const [path, content] of Object.entries(fixture.pages ?? {})) {
      const destination = join(directory, 'source', path, 'index.md');
      await mkdir(join(directory, 'source', path), {recursive:true});
      await writeFile(destination, content);
    }
    for (const [path, content] of Object.entries(fixture.postFiles ?? {})) {
      const destination = join(directory, 'source/_posts', path);
      await mkdir(join(destination, '..'), {recursive:true});
      await writeFile(destination, content);
    }
    if (fixture.translations) {
      await mkdir(join(directory, 'source/_data'), {recursive:true});
      await writeFile(join(directory, 'source/_data/languages.yml'), yaml.dump(fixture.translations));
    }
    await hexo.init();
    await hexo.call('generate');
    if (fixture.verify) await fixture.verify(hexo, directory);
    for (const path of fixture.absentPaths || []) assert.equal(hexo.route.get(path), undefined, `Unexpected route: ${path}`);
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
  const [article, single] = await render({columns:{categories:[]}}, '/blog/', {
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


test('article metadata uses current identity, escaped descriptions, absolute covers and real timestamps', async () => {
  const [article, page] = await render({post_list:{summary:false,cover:false},branding:{name:'Theme brand'}}, '/blog/', {
    config:{timezone:'Asia/Shanghai',title:'My & site',author:'Site author',description:'Site description',permalink:':title/',pretty_urls:{trailing_index:false}},
    posts:[post('A & <B>', 'author: Guest\ndescription: "<b>Say &quot;hello&quot;</b> &amp; 世界"\ncover: /images/cover.jpg\nupdated: 2020-01-03')],
    pages:{about:'---\ntitle: About\ndescription: An empty page description\n---\n'},
    paths:['post-0/index.html','about/index.html']
  });
  const head = article.match(/<head>[\s\S]*?<\/head>/)[0];
  assert.match(head, /<title>A &amp; &lt;B&gt; · My &amp; site<\/title>/);
  assert.match(head, /name="description" content="Say &quot;hello&quot; &amp; 世界"/);
  assert.match(head, /rel="canonical" href="https:\/\/example.com\/blog\/post-0\/"/);
  assert.match(head, /property="og:url" content="https:\/\/example.com\/blog\/post-0\/"/);
  assert.match(head, /property="og:image" content="https:\/\/example.com\/blog\/images\/cover.jpg"/);
  assert.match(head, /name="author" content="Guest"/);
  assert.match(head, /article:published_time" content="2019-12-31T16:00:00.000Z"/);
  assert.match(head, /article:modified_time" content="2020-01-02T16:00:00.000Z"/);
  assert.match(head, /twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(head, /Theme brand|Ruri|Yume|yoursite\.com/);
  assert.match(page, /name="description" content="An empty page description"/);
  assert.doesNotMatch(page, /article:published_time|name="author"/);
});

test('pagination, fallback descriptions, unsafe covers and 404 metadata are distinct', async () => {
  const pages = await render({}, '/blog/', {
    config:{language:'zh-CN',per_page:1,permalink:':title/',description:'Site fallback',pretty_urls:{trailing_index:false}},
    posts:[post('One','cover: "javascript:alert(1)"','<p>第一段</p><p>第二段 &amp; 尾声</p><script>SHOULD_NOT_APPEAR</script>'),post('Two')],
    paths:['index.html','page/2/index.html','archives/page/2/index.html','post-0/index.html','404.html']
  });
  const heads=pages.map(html=>html.match(/<head>[\s\S]*?<\/head>/)[0]);
  assert.match(heads[0], /name="description" content="Site fallback"/);
  assert.match(heads[1], /<title>Fixture · 第 2 页<\/title>/);
  assert.match(heads[1], /rel="canonical" href="https:\/\/example.com\/blog\/page\/2\/"/);
  assert.match(heads[2], /<title>归档 · 第 2 页 · Fixture<\/title>/);
  assert.match(heads[3], /content="第一段 第二段 &amp; 尾声"/);
  assert.doesNotMatch(heads[3], /SHOULD_NOT_APPEAR|og:image|twitter:image|javascript:/);
  assert.match(heads[3], /twitter:card" content="summary"/);
  assert.match(heads[4], /name="robots" content="noindex, follow"/);
});


test('body images get native loading, subdirectory URLs and valid standalone captions', async () => {
  const [html] = await render({}, '/blog/', {
    pages:{pictures:'---\ntitle: Pictures\n---\n![Cat](/images/cat.jpg "Photo & note")\n\n<figure><img src="/images/tall.png" width="300" height="1200" loading="eager"><figcaption>Existing</figcaption></figure>\n'},
    paths:['pictures/index.html']
  });
  assert.match(html, /<figure><img src="\/blog\/images\/cat.jpg"[^>]*loading="lazy"[^>]*decoding="async"[^>]*><figcaption>Photo &amp; note<\/figcaption><\/figure>/);
  assert.match(html, /src="\/blog\/images\/tall.png" width="300" height="1200" loading="eager" decoding="async"/);
  assert.doesNotMatch(html, /\/blog\/blog\//);
  assert.equal((html.match(/<figcaption>/g)||[]).length,2);
});


test('TOC presentations share heading targets and honor site and page switches', async () => {
  const fixture = {
    config:{permalink:':title/'},
    posts:[post('Contents', '') + '\n## Duplicate\n\nText.\n\n## Duplicate\n\nText.\n'],
    paths:['post-0/index.html']
  };
  const [html] = await render({}, '/blog/', fixture);
  assert.match(html, /<details class="mobile-toc">/);
  assert.match(html, /data-toc="desktop"/);
  const desktop = html.match(/<nav[^>]*data-toc="desktop"[\s\S]*?<\/nav>/)[0];
  const mobile = html.match(/<nav[^>]*data-toc="mobile"[\s\S]*?<\/nav>/)[0];
  const targets = value => [...value.matchAll(/href="(#[^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(targets(desktop), targets(mobile));
  assert.equal(new Set(targets(desktop)).size, targets(desktop).length);
  for (const settings of [{sidebar:{toc:false}}, {sidebar:{enable:false}}]) {
    const [disabled] = await render(settings, '/blog/', fixture);
    assert.doesNotMatch(disabled, /data-toc=|class="mobile-toc"/);
  }
});

test('article reading estimates localize, honor switches and keep Page metadata separate', async () => {
  const posts = [post('Short', 'lang: en\nreading_time: true\nauthor: A & B\nupdated: 2020-01-02\ncover: /images/cover.webp\ncover_alt: "Sky & <clouds>"', 'A short paragraph.'),
    post('Long', 'lang: zh-TW\ncover: false', '文'.repeat(301)),
    post('Hidden', 'reading_time: false', 'Body'), post('Empty', '', '')];
  const fixture = {config:{permalink:':title/'},posts,
    pages:{about:'---\ntitle: About\ncover: /images/cover.webp\ncover_alt: "Sky & clouds"\n---\nBody'},
    paths:['post-0/index.html','post-1/index.html','post-2/index.html','post-3/index.html','about/index.html']};
  const [short, long, hidden, empty, page] = await render({}, '/blog/', fixture);
  const header = short.match(/<header class="page-heading">[\s\S]*?<\/header>/)[0];
  assert.match(header,/Published on/);
  assert.match(header,/Edited on/);
  assert.match(header,/A &amp; B/);
  assert.match(header,/About 1 minute to read/);
  assert.equal((short.match(/Edited on/g)||[]).length,1);
  assert.match(short,/src="\/blog\/images\/cover.webp" alt="Sky &amp; &lt;clouds&gt;"/);
  assert.match(long,/預計閱讀 2 分鐘/);
  assert.doesNotMatch(long,/class="article-cover"/);
  for (const html of [hidden,empty,page]) assert.doesNotMatch(html,/class="reading-time"/);
  assert.match(page,/alt="Sky &amp; clouds"/);
  const disabled = await render({post:{reading_time:false}}, '/', fixture);
  for (const html of disabled) assert.doesNotMatch(html,/class="reading-time"/);
});

test('lightbox opt-in isolates assets to eligible post/page bodies and preserves root and translations', async () => {
  const image = '<img src="/images/example.svg" alt="Example">';
  const fixture = {
    config:{permalink:':title/'},
    posts:[post('Image', '', image), post('Optout', 'lightbox: false', image), post('Empty')],
    pages:{gallery:`---\ntitle: Gallery\nlang: zh-CN\n---\n${image}`},
    paths:['index.html','post-0/index.html','post-1/index.html','post-2/index.html','gallery/index.html']
  };
  for (const settings of [{}, {lightbox:{enable:false}}]) {
    const pages = await render(settings, '/blog/', fixture);
    for (const html of pages) assert.doesNotMatch(html, /data-syutoi-lightbox|data-lightbox-entry|(?:lightbox|photoswipe)\.min/);
  }
  const [home, article, optout, empty, page] = await render({lightbox:{enable:true}}, '/blog/', fixture);
  for (const html of [home, optout, empty]) assert.doesNotMatch(html, /data-syutoi-lightbox|data-lightbox-entry|(?:lightbox|photoswipe)\.min/);
  for (const html of [article, page]) {
    assert.match(html, /data-syutoi-lightbox/);
    assert.match(html, /href="(?:&#x2F;|\/)blog(?:&#x2F;|\/)images(?:&#x2F;|\/)example.svg"/);
    assert.doesNotMatch(html, /blog(?:&#x2F;|\/)blog/);
    assert(html.includes(`src="/blog/js/lightbox.min.js?v=${themeVersion}"`));
    const attributes = html.replaceAll('&#x2F;', '/').replaceAll('&#x3D;', '=');
    assert(attributes.includes(`data-core="/blog/js/photoswipe.min.js?v=${themeVersion}"`));
    assert(attributes.includes(`data-style="/blog/css/lightbox.min.css?v=${themeVersion}"`));
    assert.doesNotMatch(html, /<link[^>]+lightbox/);
  }
  assert.match(page, /data-close="关闭图片查看器"/);
});

test('SEO overrides render escaped sharing metadata, locale and article taxonomy without changing visible titles', async () => {
  const [article, page] = await render({seo:{default_image:'/images/default.png',default_image_alt:'Site picture',twitter_site:'syutoi'}}, '/blog/', {
    config:{language:'zh-TW',permalink:':title/'},
    posts:[post('Visible title', 'cover: /images/cover.jpg\ncategories: [Writing]\ntags: [Hexo, "A & B"]\nseo:\n  title: "Share <title>"\n  description: "<b>Share &amp; read</b>"\n  canonical: https://original.example/story/?edition=1#part\n  image: /images/share.png\n  image_alt: "Paper & ink"\n  twitter_creator: "@guest"\n  noindex: true')],
    pages:{about:'---\ntitle: About\nlang: en-GB\n---\nHello'},
    paths:['post-0/index.html','about/index.html']
  });
  const head = article.match(/<head>[\s\S]*?<\/head>/)[0];
  assert.match(article, /<h1>Visible title<\/h1>/);
  assert.match(head, /<title>Share &lt;title&gt; · Fixture<\/title>/);
  assert.match(head, /name="description" content="Share &amp; read"/);
  assert.match(head, /rel="canonical" href="https:\/\/original.example\/story\/\?edition=1"/);
  assert.match(head, /og:url" content="https:\/\/original.example\/story\/\?edition=1"/);
  assert.match(head, /og:image" content="https:\/\/example.com\/blog\/images\/share.png"/);
  assert.match(head, /og:image:alt" content="Paper &amp; ink"/);
  assert.match(head, /twitter:image:alt" content="Paper &amp; ink"/);
  assert.match(head, /twitter:site" content="@syutoi"/);
  assert.match(head, /twitter:creator" content="@guest"/);
  assert.match(head, /og:locale" content="zh_TW"/);
  assert.match(head, /article:section" content="Writing"/);
  assert.match(head, /article:tag" content="A &amp; B"/);
  assert.match(head, /robots" content="noindex, follow"/);
  assert.match(page, /og:locale" content="en_GB"/);
  assert.match(page, /og:image" content="https:\/\/example.com\/blog\/images\/default.png"/);
  assert.match(page, /og:image:alt" content="Site picture"/);
  assert.doesNotMatch(page, /article:section|article:tag|twitter:creator|robots"/);
});

test('sharing switches, explicit image opt-out and invalid URLs preserve canonical and descriptions', async () => {
  const [article, search] = await render({seo:{open_graph:false,twitter_card:false,noindex:true}}, '/', {
    config:{permalink:':title/'},
    posts:[post('Switches','seo:\n  noindex: false\n  canonical: javascript:alert(1)')],
    pages:{search:'---\ntitle: Search\ntype: search\n---\nSearch fallback'},
    paths:['post-0/index.html','search/index.html']
  });
  const head = article.match(/<head>[\s\S]*?<\/head>/)[0];
  assert.doesNotMatch(head, /property="og:|name="twitter:|property="article:|javascript:/);
  assert.match(head, /rel="canonical" href="https:\/\/example.com\/post-0\/"/);
  assert.match(head, /name="description"/);
  assert.match(head, /name="author" content="Writer"/);
  assert.match(head, /robots" content="noindex, follow"/);
  assert.match(search, /robots" content="noindex, follow"/);
  const pages = await render({seo:{default_image:'https://images.example/share.png',default_image_alt:'Fallback'}}, '/blog/', {
    config:{permalink:':title/'},
    posts:[post('No image','cover: /images/cover.jpg\nseo:\n  image: false'),post('Unsafe','seo:\n  canonical: https://user:password@example.com/private\n  image: javascript:alert(1)\n  image_alt: Wrong image\n  twitter_creator: "bad account"')],
    paths:['post-0/index.html','post-1/index.html']
  });
  const heads = pages.map(html => html.match(/<head>[\s\S]*?<\/head>/)[0]);
  assert.doesNotMatch(heads[0], /og:image|twitter:image/);
  assert.match(heads[0], /twitter:card" content="summary"/);
  assert.match(heads[1], /og:image" content="https:\/\/images.example\/share.png"/);
  assert.match(heads[1], /og:image:alt" content="Fallback"/);
  assert.doesNotMatch(heads[1], /javascript:|password|twitter:creator|Wrong image/);
});

test('typed social links support the PRD schema, custom labels, maps and legacy entries', async () => {
  const html = await render({social:[{type:'github',url:'https://github.com/example'},{type:'email',url:'mailto:hello@example.com'},{type:'custom',name:'<My link>',url:'/about/'},{type:'unknown',url:'https://example.com'},{type:'x',url:'javascript:alert(1)'}]}, '/blog/');
  const nav = html.match(/<nav class="social-links"[\s\S]*?<\/nav>/)[0];
  assert.match(nav, /aria-label="GitHub" title="GitHub"/);
  assert.match(nav, /<svg[^>]+aria-hidden="true"/);
  assert.match(nav, /aria-label="Email" title="Email"/);
  assert.match(nav, /href="\/blog\/about\/">&lt;My link&gt;/);
  assert.equal((nav.match(/<a /g)||[]).length,3);
  assert.doesNotMatch(nav, /javascript:|unknown/);
  const mapped = await render({social:{github:{url:'https://github.com/example'},email:{name:'Contact',url:'mailto:hello@example.com'},legacy:'https://example.com || old-icon'}});
  assert.match(mapped, /aria-label="GitHub" title="GitHub"/);
  assert.match(mapped, /aria-label="Contact" title="Contact"/);
  assert.match(mapped, />legacy /);
});


test('historical migration fixtures retain source attribution and readable fallbacks', async () => {
  const posts = await Promise.all(['special.md', 'week-2.md'].map(name => readFile(new URL(`./fixtures/legacy/${name}`, import.meta.url), 'utf8')));
  const [legacy, notes] = await render({}, '/', {
    config: {permalink: ':title/'}, posts,
    paths: ['post-0/index.html', 'post-1/index.html']
  });
  assert.match(legacy, /历史文档/);
  assert.match(legacy, /https:\/\/shoka\.lostyu\.me/);
  assert.match(legacy, /class="media-links"/);
  assert.doesNotMatch(notes, /:::note|\{\.quiz/);
  assert.match(notes, /huang/);
});

const extensionConfig = {
  permalink: ':title/',
  markdown: {
    preset: 'default', render: {html: true},
    plugins: [
      {name: 'markdown-it-attrs', options: {allowedAttributes: ['width', 'height']}},
      {name: './themes/syutoi/lib/markdown-alerts.cjs'}
    ],
    images: {lazyload: true, prepend_root: true}
  }
};
test('optional Markdown extensions preserve images, captions, quotes and escaped examples in Hexo', async () => {
  const content = `![Avatar](/images/avatar.png "Caption"){width=100 height="100" onerror="evil()" class=bad}

> [!TIP]
> **Useful** [link](/docs/).
>
> - First
> - Second
>
> > Ordinary nested quote

## After alert

> [!UNKNOWN]
> Plain text

> \\[!TIP]
> Escaped marker

\`\`\`markdown
![Avatar](/a.png){width=100}
> [!NOTE]
\`\`\`
`;
  const [html] = await render({lightbox:{enable:true}}, '/blog/', {config: extensionConfig, posts: [post('Extensions', '', content)], paths: ['post-0/index.html']});
  assert.match(html, /src="\/blog\/images\/avatar.png"[^>]*width="100"[^>]*height="100"/);
  assert.match(html, /<figcaption>Caption<\/figcaption>/);
  const viewer = DomUtils.findOne(node => node.name === 'a' && Object.hasOwn(node.attribs, 'data-syutoi-lightbox'), parseDocument(html).children, true);
  assert.equal(viewer?.attribs.href, '/blog/images/avatar.png');
  assert.doesNotMatch(html, /onerror=|class="bad"/);
  assert.equal((html.match(/class="markdown-alert markdown-alert-tip"/g) || []).length, 1);
  assert.match(html, /<strong>Useful<\/strong>/);
  assert.match(html, /<blockquote>\s*<p>Ordinary nested quote<\/p>\s*<\/blockquote>/);
  assert.match(html, /\[!UNKNOWN\]/);
  assert.match(html, /\[!TIP\]/);
  assert.match(DomUtils.textContent(parseDocument(html)), /\{width=100\}/);
  assert.match(html, /After alert/);
});
test('Markdown extensions are opt-in and all five alert kinds render without scripts', async () => {
  const body = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'].map(name => `> [!${name}]\n> Body`).join('\n\n');
  const [on] = await render({}, '/', {config: extensionConfig, posts: [post('Alerts', '', body)], paths: ['post-0/index.html']});
  for (const name of ['note', 'tip', 'important', 'warning', 'caution']) assert.match(on, new RegExp(`class="markdown-alert markdown-alert-${name}"`));
  const [off] = await render({}, '/', {config: {permalink: ':title/'}, posts: [post('Off', '', body + '\n\n![x](/x.png){width=100}')], paths: ['post-0/index.html']});
  assert.doesNotMatch(off, /class="markdown-alert/);
  assert.match(off, /\[!NOTE\]/);
  assert.match(DomUtils.textContent(parseDocument(off)), /\{width=100\}/);
});

test('Baidu Analytics renders once per layout with async HTTPS loading under a subdirectory', async () => {
  const id = '0123456789abcdef0123456789abcdef';
  const pages = await render({analytics:{baidu:id}}, '/blog/', {
    config:{permalink:':title/'},
    pages:{about:'---\ntitle: About\n---\nAbout this blog.'},
    paths:['index.html', 'post-0/index.html', 'about/index.html', 'archives/index.html', '404.html']
  });
  for (const html of pages) {
    const document = parseDocument(html);
    const scripts = DomUtils.getElementsByTagName('script', document);
    const trackers = scripts.filter(node => node.attribs.src?.startsWith('https://hm.baidu.com/'));
    assert.equal(trackers.length, 1);
    assert.equal(trackers[0].attribs.src, `https://hm.baidu.com/hm.js?${id}`);
    assert.ok(Object.hasOwn(trackers[0].attribs, 'async'));
    assert.equal(trackers[0].parent.name, 'head');
    const queue = scripts.find(node => DomUtils.textContent(node).includes('window._hmt = window._hmt || []'));
    assert.ok(queue);
    assert.ok(scripts.indexOf(queue) < scripts.indexOf(trackers[0]));
  }
});

test('Baidu Analytics emits no script when disabled or misconfigured', async () => {
  for (const settings of [{}, {analytics:{baidu:''}}, {analytics:{baidu:'"><script>alert(1)</script>'}}]) {
    const html = await render(settings);
    assert.doesNotMatch(html, /hm\.baidu\.com|window\._hmt|alert\(1\)/);
  }
});

test('built-in social icons render accessible local SVGs with safe text fallback', async () => {
  const types = ['github','gitlab','x','twitter','zhihu','xiaohongshu','bilibili','weibo','telegram','youtube','instagram','mastodon','bluesky','email','rss','website'];
  const social = types.map(type => ({type:type.toUpperCase(),name:`${type} <profile>`,url:`https://example.com/${type}`}));
  social.push({type:'../../head/head',name:'Custom site',url:'/about/'}, {name:'Plain GitHub',url:'https://github.com/example'});
  const html = await render({social}, '/blog/');
  const document = parseDocument(html);
  const nav = DomUtils.getElementsByTagName('nav',document).find(node => node.attribs.class === 'social-links');
  const links = DomUtils.getElementsByTagName('a',nav);
  assert.equal(links.length, social.length);
  for (const [index, type] of types.entries()) {
    const link = links[index];
    assert.equal(link.attribs['aria-label'], `${type} <profile>`);
    assert.equal(link.attribs.title, `${type} <profile>`);
    assert.equal(link.attribs.href, `https://example.com/${type}`);
    const [svg] = DomUtils.getElementsByTagName('svg',link);
    assert.ok(svg, `${type} must have an icon`);
    assert.equal(svg.attribs['aria-hidden'], 'true');
    assert.equal(svg.attribs.focusable, 'false');
    assert.equal(DomUtils.getElementsByTagName('script', link).length, 0);
    assert.equal(DomUtils.getElementsByTagName('img', link).length, 0);
  }
  for (const link of links.slice(types.length)) {
    assert.equal(DomUtils.getElementsByTagName('svg',link).length, 0);
    assert.ok(DomUtils.textContent(link).trim());
  }
  assert.equal(links[types.length].attribs.href, '/blog/about/');
});

test('TOC numbering can be disabled without changing nested heading targets', async () => {
  const fixture = {config:{permalink:':title/'},posts:[post('Nested', '', '## First\n\n### Child\n\n#### Detail\n\n### Sibling\n\n## Second')],paths:['post-0/index.html']};
  const [on] = await render({}, '/', fixture);
  const [off] = await render({sidebar:{toc_number:false}}, '/', fixture);
  const navs = html => DomUtils.getElementsByTagName('nav', parseDocument(html)).filter(node => node.attribs['data-toc']);
  const numbered = navs(on);
  const plain = navs(off);
  assert.equal(numbered.length, 2);
  assert.equal(plain.length, 2);
  for (let i=0; i<2; i++) {
    const numbers = node => DomUtils.getElementsByTagName('span',node).filter(span => span.attribs.class === 'toc-number').map(span => DomUtils.textContent(span).trim());
    assert.deepEqual(numbers(numbered[i]), ['1.','1.1.','1.1.1.','1.2.','2.']);
    assert.deepEqual(numbers(plain[i]), []);
    const links = node => DomUtils.getElementsByTagName('a',node).map(link=>link.attribs.href);
    assert.deepEqual(links(numbered[i]), links(plain[i]));
    assert.equal(links(plain[i]).length, 5);
  }
});

test('columns provide complete ordered directories and scoped neighbors under a subdirectory', async () => {
  const fixture={config:{permalink:':title/',category_generator:{per_page:1}},absentPaths:['categories/Guide/page/2/index.html'],posts:[
    post('Last','categories: [Guide]\ncolumn_order: 30', '## Heading\n\nBody'),
    post('First','categories: [Guide]\ncolumn_order: 10', '## Heading\n\nBody'),
    post('Middle','categories: [Guide]\ncolumn_order: 20', '## Heading\n\nBody'),
    post('Unrelated','categories: [Notes]'),
    post('Private','categories: [Guide]\npassword: secret'),
    post('Optout','categories: [Guide]\ncolumn: false')
  ],paths:['post-1/index.html','post-2/index.html','post-0/index.html','categories/Guide/index.html','post-3/index.html']};
  const pages=await render({columns:{categories:['Guide']}},'/blog/',fixture);
  for (const html of pages.slice(0,4)) {
    const dom=parseDocument(html);
    const directory=DomUtils.getElementsByTagName('ol',dom).find(node=>node.attribs.class==='column-entries');
    assert.ok(directory);
    const links=DomUtils.getElementsByTagName('a',directory);
    assert.deepEqual(links.map(a=>DomUtils.textContent(a).replace(/^\d+\.\s*/,'')),['First','Middle','Last']);
    assert.deepEqual(links.map(a=>a.attribs.href),['/blog/post-1/','/blog/post-2/','/blog/post-0/']);
    assert.doesNotMatch(html,/href="\/blog\/categories\/Guide\/page\/2\//);
  }
  for (const [index,expected] of [[0,['/blog/post-2/']],[1,['/blog/post-1/','/blog/post-0/']],[2,['/blog/post-2/']]]) {
    const html=pages[index];
    const nav=DomUtils.getElementsByTagName('nav',parseDocument(html)).find(n=>n.attribs.class==='post-neighbors column-neighbors');
    assert.deepEqual(DomUtils.getElementsByTagName('a',nav).map(a=>a.attribs.href),expected);
    assert.match(html,/aria-current="page"/);
    assert.match(html,/data-reading-tabs/);
    assert.match(html,/class="mobile-column"/);
  }
  assert.doesNotMatch(pages[4],/data-reading-tabs|column-neighbors|column-entries/);
  const [noToc]=await render({columns:{categories:['Guide']},sidebar:{toc:false}},'/',{...fixture,paths:['post-1/index.html']});
  assert.match(noToc,/data-column="desktop"/);
  assert.doesNotMatch(noToc,/data-reading-tabs/);
  const [noSidebar]=await render({columns:{categories:['Guide']},sidebar:{enable:false}},'/',{...fixture,paths:['post-1/index.html']});
  assert.match(noSidebar,/mobile-column column-inline/);
  assert.doesNotMatch(noSidebar,/data-column="desktop"/);
});

test('all categories have column navigation by default and an empty list restores ordinary categories', async () => {
  const fixture={dependencies:{'hexo-generator-category':'1.0.0'},config:{permalink:':title/',category_generator:{per_page:1}},posts:[
    post('Guide one','categories: [Guide]'),post('Guide two','categories: [Guide]'),
    post('Notes one','categories: [Notes]'),post('Uncategorized')
  ],paths:['post-0/index.html','post-2/index.html','categories/Guide/index.html','categories/Notes/index.html','post-3/index.html'],absentPaths:['categories/Guide/page/2/index.html']};
  const pages=await render({},'/blog/',fixture);
  for(const html of pages.slice(0,4)) assert.match(html,/class="column-entries"/);
  assert.doesNotMatch(pages[4],/class="column-entries"/);
  const [ordinary,second]=await render({columns:{categories:[]}},'/blog/',{...fixture,absentPaths:[],paths:['post-0/index.html','categories/Guide/page/2/index.html']});
  assert.doesNotMatch(ordinary,/column-neighbors|column-entries/);
  assert.match(second,/class="post-list"/);
});


test('colocated index homes render intro and chapters, keep feeds clean, and survive native file updates', async () => {
  const intro = post('Guide home', 'categories: [Guide]\npermalink: guide/', 'Intro content.');
  await render({}, '/blog/', {
    dependencies: {'hexo-generator-category':'1.0.0', 'hexo-generator-sitemap':'3.0.1'},
    config: {sitemap:{path:'sitemap.xml',categories:true}},
    posts: [post('Chapter', 'categories: [Guide]\npermalink: chapter/'), post('Other chapter','categories: [Other]')],
    postFiles: {'guide/index.md':intro, 'other/index.md':post('Other home','categories: [Other]', 'Other intro.')},
    verify: async (hexo, directory) => {
      const html = await readFile(join(directory,'public/guide/index.html'),'utf8');
      assert.match(html,/Intro content/);
      assert.match(html,/class="column-entries"/);
      assert.match(html,/href="\/blog\/chapter\/"/);
      assert.equal(hexo.locals.get('posts').length,2);
      assert.equal(hexo.locals.get('pages').filter(p => p.column_home).length,2);
      const other = await readFile(join(directory,'public/categories/Other/index.html'),'utf8');
      assert.match(other,/Other intro/);
      const sitemap = await readFile(join(directory,'public/sitemap.xml'),'utf8');
      const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
      assert.equal(new Set(urls).size,urls.length);
      assert.ok(urls.includes('https://example.com/blog/guide/'));
      assert.ok(urls.includes('https://example.com/blog/categories/Other/'));
      const source = join(directory,'source/_posts/guide/index.md');
      await writeFile(source,intro.replace('Intro content.','Updated intro.'));
      await hexo.call('generate');
      assert.match(await readFile(join(directory,'public/guide/index.html'),'utf8'),/Updated intro/);
      await rm(source);
      await hexo.call('generate');
      assert.equal(hexo.route.get('guide/index.html'),undefined);
      assert.equal(hexo.locals.get('posts').length,2);
      assert.equal(hexo.locals.get('column_homes').Guide,undefined);
      assert.ok(hexo.route.get('categories/Guide/index.html'));
      await writeFile(source,intro);
      await hexo.call('generate');
      assert.ok(hexo.route.get('guide/index.html'));
      assert.equal(hexo.locals.get('posts').length,2);
    }
  });
});
