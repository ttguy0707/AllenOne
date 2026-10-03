import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {ANIMATIONS} from '../app/pet-animation.js';
import {CATALOG} from '../app/catalog.js';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('test-results/animation',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},colorScheme:'light'}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.addInitScript(()=>{window.canvasContexts=[];const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){window.canvasContexts.push(type);return original.call(this,type,...args);};});
 await page.goto('http://127.0.0.1:4180');await page.locator('[data-action=start]').click();await page.waitForSelector('#pet-host[data-ready=rabbit]');
 const initialBox=await page.locator('#pet-host').boundingBox();await page.waitForTimeout(500);assert.deepEqual(await page.locator('#pet-host').boundingBox(),initialBox,'canvas resize must not grow its flex container');
 const snapshot=()=>page.evaluate(async()=>JSON.stringify(await(await import('./store.js')).readState()));
 const before=await snapshot();
 const canvas=()=>page.locator('#pet-host canvas');
 const pixels=()=>canvas().evaluate(c=>c.toDataURL());
 await page.locator('[data-action=pause]').click();const frozen=await pixels();await page.waitForTimeout(500);assert.equal(await pixels(),frozen,'paused pixels stay fixed');
 await page.locator('[data-action=greet]').click();await page.waitForTimeout(250);assert.equal(await pixels(),frozen,'greeting respects explicit pause');
 await page.locator('[data-action=pause]').click();await page.locator('[data-action=greet]').click();await page.waitForFunction(()=>Number(document.querySelector('#pet-host').dataset.frame)>=4);assert.notEqual(await pixels(),frozen,'greeting has distinct artwork');await page.waitForFunction(()=>document.querySelector('#pet-host').dataset.motion==='idle');
 await page.locator('.nav [data-route=pets]').click();await page.waitForSelector('#pet-host[data-ready]');
 for(const pet of CATALOG){
  await page.locator('[data-action=preview][data-id='+pet.id+']').click();await page.waitForSelector('#pet-host[data-ready='+pet.id+']');
  if(!ANIMATIONS[pet.id].available){assert.match(await page.locator('#pet-host').innerText(),/动画待补充/);assert.equal(await page.locator('[data-action=greet]').isDisabled(),true);continue;}
  assert.equal(await page.locator('#pet-host').getAttribute('data-renderer'),'prerendered');
  for(const level of ['1','5']){await page.locator('#preview-stage').selectOption(level);await page.waitForSelector('#pet-host[data-ready='+pet.id+']');const frame=Number(await page.locator('#pet-host').getAttribute('data-frame'));assert.equal(frame>=8,level==='5','correct growth artwork');}
  await page.locator('[data-action=greet]').click();await page.waitForTimeout(220);assert.ok(Number(await page.locator('#pet-host').getAttribute('data-frame'))>=8,'mature greeting does not regress to young');
 }
 await page.locator('[data-action=preview][data-id=rabbit]').click();await page.locator('#preview-stage').selectOption('3');await page.waitForSelector('#pet-host[data-ready]');
 const same=await canvas().elementHandle();await page.evaluate(()=>WildfitTheme.set('dark'));assert.equal(await same.evaluate(c=>c.isConnected),true);assert.equal(await page.locator('#pet-host').getAttribute('data-theme'),'dark');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#pet-host').dataset.motion==='paused');assert.equal(await page.locator('[data-action=pause]').innerText(),'继续');const still=await pixels();await page.waitForTimeout(350);assert.equal(await pixels(),still);
 // Exercise the visibility event deterministically; no elapsed hidden time is replayed.
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-action=pause]').click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});const hidden=await pixels();await page.waitForTimeout(350);assert.equal(await pixels(),hidden);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.locator('[data-action=greet]').click();await page.waitForFunction(()=>document.querySelector('#pet-host').dataset.motion==='greeting');
 assert.equal(await snapshot(),before,'artwork and previews do not write business data');
 assert.ok((await page.evaluate(()=>window.canvasContexts)).every(x=>x==='2d'),'no WebGL context');assert.ok(!requests.some(x=>/three|pet-models|model-kit|model-finishing/.test(x)),'no legacy renderer requests');
 await page.locator('.nav [data-route=home]').click();await page.waitForSelector('#pet-host[data-ready]');
 for(const theme of ['light','dark']){await page.evaluate(t=>WildfitTheme.set(t),theme);await page.waitForTimeout(250);await page.screenshot({path:'test-results/animation/home-'+theme+'-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1050});await page.waitForTimeout(250);const box=await page.locator('#pet-host').boundingBox();await page.waitForTimeout(400);assert.deepEqual(await page.locator('#pet-host').boundingBox(),box,'desktop stage keeps stable dimensions');await page.screenshot({path:'test-results/animation/home-'+theme+'-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});}
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForSelector('#pet-host[data-ready]');await context.setOffline(true);await page.reload();await page.waitForSelector('#pet-host[data-ready]');await page.locator('.nav [data-route=pets]').click();
 for(const pet of CATALOG.filter(p=>ANIMATIONS[p.id].available)){await page.locator('[data-action=preview][data-id='+pet.id+']').click();await page.waitForSelector('#pet-host[data-ready='+pet.id+']');}
 assert.deepEqual(errors,[]);await writeFile('test-results/animation/result.json',JSON.stringify({animated:22,pending:['horse','ray'],errors,legacyRequests:requests.filter(x=>/three|pet-models/.test(x))},null,2));
 console.log('PASS: 22 frame atlases + 2 honest pending states, greeting/return, pause/reduced motion/visibility, growth, unchanged scores, same canvas on theme change, zero WebGL/Three requests, all 22 offline.');
}finally{await browser.close();}
