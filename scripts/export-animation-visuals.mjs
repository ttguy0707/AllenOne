import {chromium} from 'playwright';
import {mkdir,readFile} from 'node:fs/promises';
import {CATALOG} from '../app/catalog.js';
import {ANIMATIONS} from '../app/pet-animation.js';
await mkdir('Projects/assets',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050},colorScheme:'light',reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4180');await page.locator('[data-action=start]').click();await page.waitForSelector('#pet-host[data-ready]');
 for(const theme of ['light','dark']){
  await page.evaluate(t=>WildfitTheme.set(t),theme);await page.waitForTimeout(250);
  await page.screenshot({path:`Projects/assets/animation-home-${theme}.png`,fullPage:true});
  await page.locator('.hero').screenshot({path:`test-results/animation/hero-${theme}.png`});
 }
 const sources=await Promise.all(['light','dark'].map(async t=>'data:image/png;base64,'+(await readFile(`test-results/animation/hero-${t}.png`)).toString('base64')));
 await page.setViewportSize({width:1000,height:680});
 await page.setContent('<style>*{box-sizing:border-box}body{margin:0;background:#e9e6df;font-family:Arial;padding:28px;color:#314d41}.title{font-size:17px;letter-spacing:2px;margin:0 0 20px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}img{width:100%;border-radius:20px}.label{font-size:11px;letter-spacing:2px;margin-bottom:10px}</style><div class="title">森动 · 立体动画伙伴</div><div class="grid">'+sources.map((src,i)=>'<section><div class="label">'+(i===0?'LIGHT / 浅色':'DARK / 深色')+'</div><img src="'+src+'"></section>').join('')+'</div>');
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await page.screenshot({path:'Projects/assets/animation-theme-preview.png',fullPage:true});
 await page.goto('http://127.0.0.1:4180');await page.setViewportSize({width:1400,height:1640});
 await page.setContent('<style>body{margin:0;padding:24px;background:#eeeae2;font-family:Arial}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.card{height:243px;background:#faf8f4;border-radius:16px;text-align:center;overflow:hidden}.art{width:220px;height:220px;margin:auto;background-size:400% 300%}.name{margin-top:-8px;font-size:13px;color:#345}</style><div class="grid">'+CATALOG.map(p=>'<div class="card"><div class="art" style="'+(ANIMATIONS[p.id].available?'background-image:url('+ANIMATIONS[p.id].src+')':'')+'"></div><div class="name">'+p.name+(ANIMATIONS[p.id].available?'':' · 动画待补充')+'</div></div>').join('')+'</div>');
 await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.art')].map(e=>{const url=getComputedStyle(e).backgroundImage.match(/url\("?(.*?)"?\)/)?.[1];return url?new Promise(resolve=>{const i=new Image();i.onload=i.onerror=resolve;i.src=url;}):Promise.resolve();}));});
 await page.screenshot({path:'Projects/assets/animation-catalog-preview.png',fullPage:true});
 console.log('Exported actual app hero in two themes and all 24 catalog states.');
}finally{await browser.close();}
