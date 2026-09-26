// Read-only acceptance of the deployed demo. Requires curl; never deploys or pushes.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parseDocument, DomUtils } from 'htmlparser2';
import { guides } from './example-manual.mjs';
import { parseXml } from './xml.mjs';
const exec = promisify(execFile);
const base = new URL(process.env.SYUTOI_ONLINE_URL || 'https://hexo.syutoi.com/');
if (base.protocol !== 'https:') throw new Error('Online acceptance requires an HTTPS URL');
const directory = await mkdtemp(join(tmpdir(),'syutoi-online-'));
const report = {started:new Date().toISOString(),base:base.href,requests:[],checks:[],failures:[],externalImages:[],pages:[]};
const cache = new Map();
const normalize = value => {
  try { const url = new URL(value); url.pathname = url.pathname.replace(/\/index\.html$/, '/'); return url.href; }
  catch { return ''; }
};
const check = (passed,message) => {report.checks.push({message,passed:Boolean(passed)});if(!passed)report.failures.push(message);};
let serial=0;
async function get(path) {
  const url = new URL(path,base);
  if(url.origin!==base.origin)throw new Error(`Refusing external URL: ${url}`);
  url.hash='';
  if(cache.has(url.href))return cache.get(url.href);
  const promise=(async()=>{
    const file=join(directory,`${serial++}.body`);
    const {stdout}=await exec('curl',['--silent','--show-error','--location','--proto','=https','--proto-redir','=https','--max-time','20','--retry','2','--retry-all-errors','--output',file,'--write-out','%{json}',url.href],{maxBuffer:1024*1024});
    const meta=JSON.parse(stdout);const body=await readFile(file);
    const info={url:url.href,status:meta.http_code,finalUrl:meta.url_effective,contentType:meta.content_type,bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')};
    report.requests.push(info);return {info,body,text:body.toString('utf8')};
  })();
  cache.set(url.href,promise);return promise;
}
async function batch(items,fn) {
  for(let i=0;i<items.length;i+=2) {
    const results=await Promise.allSettled(items.slice(i,i+2).map(fn));
    results.forEach((result,index)=>{if(result.status==='rejected')check(false,`${items[i+index]}: ${result.reason.message}`);});
  }
}
try {
  const paths=['','docs/','examples/','markdown-extensions/','welcome/','syutoi-long-read/','friends/','archives/','categories/','categories/docs/','tags/','404.html',...guides.map(guide=>guide.path)];
  const assets=new Set();const links=new Map();
  await batch(paths,async path=>{
    const {info,text}=await get(path);
    check(info.status===200,`${path||'/'} HTTP 200`);
    check(info.contentType?.includes('text/html'),`${path||'/'} HTML content type`);
    const dom=parseDocument(text);
    const find=(name,predicate)=>DomUtils.findOne(node=>node.name===name&&predicate(node.attribs),dom.children,true);
    check(find('main',a=>a.id==='main'),`${path||'/'} main content`);
    const canonical=find('link',a=>a.rel==='canonical')?.attribs.href;
    report.pages.push({path,canonical});
    check(normalize(canonical)===normalize(new URL(path,base).href),`${path||'/'} canonical`);
    if(canonical && new URL(canonical).origin===base.origin)links.set(canonical,new URL(canonical));
    check(find('meta',a=>a.property==='og:url')?.attribs.content===canonical,`${path||'/'} Open Graph URL`);
    if(path==='404.html')check(find('meta',a=>a.name==='robots'&&a.content.includes('noindex')), '404 noindex');
    if(path==='markdown-extensions/')check((text.match(/class="markdown-alert markdown-alert-/g)||[]).length===5,'Five deployed alert types');
    for(const node of DomUtils.findAll(node=>['script','link','img'].includes(node.name),dom.children)) {
      const a=node.attribs;
      const src=node.name==='link'?(a.rel==='stylesheet'?a.href:null):a.src;
      if(!src||src.startsWith('data:'))continue;
      const url=new URL(src,info.finalUrl);
      if(url.origin===base.origin)assets.add(url.href);
      else if(node.name==='img')report.externalImages.push(url.href);
      else check(false,`External runtime asset ${url.href}`);
    }
    if(path==='docs/'||path.startsWith('docs/')) {
      const prose=find('div',a=>(a.class||'').split(' ').includes('prose'));
      for(const node of DomUtils.getElementsByTagName('a',prose?.children||[])) {
        if(!node.attribs.href)continue;
        const url=new URL(node.attribs.href,info.finalUrl);
        if(url.origin===base.origin)links.set(url.href,url);
      }
    }
  });
  await batch([...assets],async url=>{
    const {info,body}=await get(url);
    check(info.status===200,`${url} asset HTTP 200`);
    const path=new URL(url).pathname;
    const mime=path.endsWith('.css')?/text\/css/:path.endsWith('.js')?/(?:java|ecma)script/:/image\//;
    check(mime.test(info.contentType||''),`${path} asset content type`);
    if(path.endsWith('/css/syutoi.min.css')||path.endsWith('/js/syutoi.min.js')) {
      const local=await readFile(new URL('../source/'+path.split('/').slice(-2).join('/'),import.meta.url));
      check(body.equals(local),`${path} matches current local prebuilt asset`);
    }
  });
  await batch([...links.values()],async url=>{
    const {info,text}=await get(url.href);check(info.status===200,`Document link ${url.href}`);
    if(url.hash) {
      const id=decodeURIComponent(url.hash.slice(1));
      check(DomUtils.findOne(node=>node.attribs?.id===id,parseDocument(text).children,true),`Document anchor ${url.href}`);
    }
  });
  for(const path of ['rss.xml','atom.xml','sitemap.xml','feed.json']) {
    const {info,text}=await get(path);check(info.status===200,`${path} HTTP 200`);
    if(path.endsWith('.xml')) {
      const xml=parseXml(text);check(Boolean(xml),`${path} strict XML`);
      check(/xml/.test(info.contentType||''),`${path} XML content type`);
      if(path==='sitemap.xml') {
        const locations=DomUtils.getElementsByTagName('loc',parseDocument(text,{xmlMode:true}).children).map(node=>DomUtils.textContent(node));
        check(locations.length>0&&locations.every(url=>url.startsWith(base.href)),'Sitemap uses production origin');
        await batch(locations,async url=>check((await get(url)).info.status===200,`Sitemap destination ${url}`));
      }
    } else {
      const feed=JSON.parse(text);check(feed.items?.length>0,'JSON Feed has entries');
      check(normalize(feed.home_page_url)===normalize(base.href),'JSON Feed production home URL');
      check(feed.items.every(item=>item.url.startsWith(base.href)),'JSON Feed production article URLs');
      check(/json/.test(info.contentType||''),'JSON Feed content type');
    }
  }
  const missing=await get(`__syutoi_acceptance_missing_${Date.now()}/`);
  check(missing.info.status===404,'Unknown route returns HTTP 404');
  check(missing.text.includes('id="main"')&&missing.text.includes('syutoi.min.css'),'Unknown route uses theme 404 page');
} catch(error) {check(false,error.stack);}
report.externalImages=[...new Set(report.externalImages)];
report.finished=new Date().toISOString();
await writeFile(join(directory,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({requests:report.requests.length,checks:report.checks.length,failures:report.failures,report:join(directory,'report.json')},null,2));
if(report.failures.length)process.exitCode=1;
