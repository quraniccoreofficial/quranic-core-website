// Usage: SITE_URL=https://your-domain.com node build.mjs   (output: ./website)
import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const D=path.dirname(fileURLToPath(import.meta.url)),OUT=path.join(D,'website');
const SITE=(process.env.SITE_URL||'https://www.quraniccore.example').replace(/\/$/,'');
const src=fs.readFileSync(path.join(D,'quranic-core.html'),'utf8');
const css=src.match(/<style>([\s\S]*?)<\/style>/)[1],defs=src.match(/<svg width="0"[\s\S]*?<\/svg>/)[0],ld=src.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/)[0],fonts=src.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/)[0];
const th0=src.match(/<script id="th0">[\s\S]*?<\/script>/)[0];
const js=[...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
// Reuse the exact page templates from the single-file source
let code=js.slice(js.indexOf('const F='),js.indexOf('const mb='));
code=code.replace(/LOGO='[^']*'/,"LOGO='/assets/logo.jpg'").replace(/BAN='[^']*'/,"BAN='/assets/banner.jpg'").replace('document.querySelector(s)','(FK[s]||(FK[s]={}))');
globalThis.matchMedia=()=>({matches:false});const FK={};
const M=new Function('FK',code+';return {P,C,ph,sec,bt}')(FK);
const PT={home:'/',about:'/about/',courses:'/courses/',nazra:'/courses/quran-nazra/',qaida:'/courses/qaida/',arabic:'/courses/basic-arabic-learning/',hifz:'/courses/hifz-revision/',teachers:'/teachers/',how:'/how-it-works/',trial:'/free-trial/',contact:'/contact/',faq:'/faq/',follow:'/follow-us/',ask:'/ask-a-question/',privacy:'/privacy-policy/'};
const fix=h=>h.replace(/href="#(\w+)"/g,(m,k)=>PT[k]?`href="${PT[k]}"`:m),esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const jl=o=>`<script type="application/ld+json">${JSON.stringify(Object.assign({'@context':'https://schema.org'},o))}</script>`;
const head=(t,d,u,extra='')=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${esc(t)}</title><meta name="description" content="${esc(d)}"><link rel="canonical" href="${u}"><meta property="og:type" content="website"><meta property="og:site_name" content="Quranic Core"><meta property="og:title" content="${esc(t)}"><meta property="og:description" content="${esc(d)}"><meta property="og:url" content="${u}"><meta property="og:image" content="${SITE}/assets/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Quranic Core — Learn. Recite. Grow."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(t)}"><meta name="twitter:description" content="${esc(d)}"><meta name="twitter:image" content="${SITE}/assets/og-image.jpg"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${fonts}<link rel="stylesheet" href="/assets/site.css">${th0}<script>document.documentElement.classList.add('js')</script>${ld}${extra}</head>`;
const hdr0=fix(FK['#nv'].innerHTML),ftr=fix(FK['#ft'].innerHTML),THREE='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer></script>';
const body=(k,main)=>{const act=M.C.some(c=>c[0]==k)?PT.courses:PT[k];let hdr=hdr0.replace(`class="l" href="${act}"`,`class="l on" href="${act}"`).replace(`<a href="${PT[k]}" data-k`,`<a class="on" href="${PT[k]}" data-k`);if(k=='courses'||M.C.some(c=>c[0]==k))hdr=hdr.replace('class="l dt"','class="l dt on"');return `<body>${defs}<header class="nv" id="nv">${hdr}</header><main id="app" tabindex="-1">${main}</main><footer class="ft" id="ft">${ftr}</footer>${k=='home'?THREE:''}<script src="/assets/site.js" defer></script></body></html>`};
const write=(f,s)=>{const p=path.join(OUT,f);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s)};
fs.rmSync(OUT,{recursive:true,force:true});
for(const k of Object.keys(PT)){const p=M.P[k],u=SITE+PT[k],t=k=='home'?'QURANIC CORE | '+p[0]:p[0]+' | QURANIC CORE';let ex='';
 if(k!='home')ex+=jl({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE+'/'},{'@type':'ListItem',position:2,name:p[0],item:u}]});
 const c=M.C.find(c=>c[0]==k);if(c)ex+=jl({'@type':'Course',name:c[2],description:c[4],url:u,provider:{'@type':'EducationalOrganization',name:'Quranic Core',url:SITE+'/'}});
 write(PT[k].slice(1)+'index.html',head(t,p[1],u,ex)+body(k,fix(p[2]())))}
write('404.html',head('Page Not Found | QURANIC CORE','This page could not be found. Return to the Quranic Core homepage.',SITE+'/404.html','<meta name="robots" content="noindex">')+body('404',fix(M.ph('PAGE NOT FOUND','The page you are looking for does not exist.')+M.sec('','',`<div class="bt" style="justify-content:center">${M.bt('GO TO HOMEPAGE','#home')}</div>`))));
write('assets/site.css',css);
const a=js.indexOf('function scene('),b=js.indexOf("addEventListener('hashchange'");
write('assets/site.js',`const W='https://wa.me/923719079975',$=s=>document.querySelector(s),RM=matchMedia('(prefers-reduced-motion:reduce)').matches;let raf,mx=0,cur;\n${js.slice(a,b)}\nconst mb=$('#mb'),mn=$('#mn');mb.onclick=()=>{const o=mn.classList.toggle('open');mb.setAttribute('aria-expanded',o)};const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v');io.unobserve(e.target)}}),{threshold:.06});document.querySelectorAll('.r').forEach(e=>io.observe(e));scene();\n`);
for(const f of fs.readdirSync(path.join(D,'assets')))fs.copyFileSync(path.join(D,'assets',f),path.join(OUT,'assets',f));
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.values(PT).map(p=>`  <url><loc>${SITE}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
// link check: every root-relative href/src must exist
let bad=0;const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
for(const f of walk(OUT).filter(f=>f.endsWith('.html')))for(const m of fs.readFileSync(f,'utf8').matchAll(/(?:href|src)="(\/[^"]*)"/g)){const t=m[1].split('#')[0],p=path.join(OUT,t.endsWith('/')?t+'index.html':t);if(!fs.existsSync(p)){bad++;console.log('MISSING',m[1],'in',path.relative(OUT,f))}}
console.log('Built',Object.keys(PT).length+1,'pages for',SITE,'| broken internal links:',bad);
