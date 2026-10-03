import {chromium} from 'playwright';
import {mkdir,readFile,copyFile} from 'node:fs/promises';
await mkdir('Projects/assets',{recursive:true});
await copyFile('test-results/home-desktop.png','Projects/assets/ui-atelier-light.png');
await copyFile('test-results/atelier/dark-home-1440.png','Projects/assets/ui-atelier-dark.png');
await copyFile('test-results/pet-contact-sheet.png','Projects/assets/pet-catalog-refined.png');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:660}}),sources=await Promise.all(['ui-atelier-light.png','ui-atelier-dark.png'].map(async name=>'data:image/png;base64,'+(await readFile('Projects/assets/'+name)).toString('base64')));
 await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#dcded4;color:#293c32;font:16px 'Microsoft YaHei',sans-serif}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px}h1{font-size:23px;font-weight:400;letter-spacing:3px;margin:0}small{font-size:11px;letter-spacing:2px;color:#677165}main{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;overflow:hidden;border-radius:15px;background:#f5f3ee;border:1px solid #bfcbbe}figure:nth-child(2){background:#121c1b;color:#e0e7d7;border-color:#30463a}figcaption{padding:16px 20px;font-size:13px;letter-spacing:2px;border-bottom:1px solid #9caf992a}img{width:100%;display:block}</style><header><h1>森动 · 两种光线，同一份坚持</h1><small>APPEARANCE / 2026.10</small></header><main><figure><figcaption>浅色 · 暖白石色</figcaption><img src="${sources[0]}"></figure><figure><figcaption>深色 · 深墨绿</figcaption><img src="${sources[1]}"></figure></main>`);
 await page.screenshot({path:'Projects/assets/ui-theme-comparison.png',fullPage:true});
}finally{await browser.close();}
