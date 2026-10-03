import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {ANIMATIONS} from '../app/pet-animation.js';
import {CATALOG} from '../app/catalog.js';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('test-results/animation',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.addInitScript(()=>{window.canvasContexts=[];const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){window.canvasContexts.push(type);return original.call(this,type,...args);};});
 await page.goto('http://127.0.0.1:4180');await page.locator('[data-action=start]').click();await page.waitForSelector('#pet-host[data-ready=rabbit]');
 const snapshot=()=>page.evaluate(async()=>JSON.stringify(await(await import('./store.js')).readState()));
 const before=await snapshot(),initialBox=await page.locator('#pet-host').boundingBox();
 await page.waitForTimeout(250);assert.deepEqual(await page.locator('#pet-host').boundingBox(),initialBox);
 const pixels=()=>page.locator('#pet-host canvas').evaluate(c=>c.toDataURL());
 await page.locator('[data-action=pause]').click();const frozen=await pixels();
 await page.locator('[data-action=greet]').click();await page.waitForTimeout(200);assert.equal(await pixels(),frozen,'pause is honored');
 await page.locator('[data-action=pause]').click();await page.locator('[data-action=greet]').click();
 await page.waitForFunction(()=>document.querySelector('#pet-host').dataset.motion==='greeting');
 const actualStage=Number(await page.locator('#pet-host').getAttribute('data-stage'));
 await page.waitForTimeout(400);const frame=Number(await page.locator('#pet-host').getAttribute('data-frame'));
 assert.ok(frame>=(actualStage-1)*4&&frame<actualStage*4,'interaction retains real age');
 await page.locator('.nav [data-route=pets]').click();assert.equal(await page.locator('#preview-stage,[data-action=preview]').count(),0);
 assert.equal(await page.locator('.pet-card.is-locked').count(),23);
 assert.equal(await page.locator('.pet-card.is-locked .pet-portrait').first().evaluate(e=>getComputedStyle(e).filter),'grayscale(1)');
 await page.locator('[data-action=select-pet][data-id=horse]').click();
 assert.equal(await page.locator('#pet-host canvas').count(),0,'locked species have no appearance preview');
 assert.match(await page.locator('.hero').innerText(),/待解锁/);
 await page.locator('[data-action=select-pet][data-id=rabbit]').click();await page.waitForSelector('#pet-host[data-ready=rabbit]');
 const canvas=await page.locator('#pet-host canvas').elementHandle();
 await page.evaluate(()=>WildfitTheme.set('dark'));assert.equal(await canvas.evaluate(c=>c.isConnected),true);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#pet-host').dataset.motion==='paused');
 const still=await pixels();await page.waitForTimeout(200);assert.equal(await pixels(),still);
 await page.evaluate(()=>WildfitTheme.set('system'));await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 assert.equal(await snapshot(),before,'viewing does not alter business state');
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForSelector('#pet-host[data-ready]');
 await context.setOffline(true);await page.reload();await page.waitForSelector('#pet-host[data-ready]');
 // A test-only host exercises all assets/ages without introducing preview UI.
 await page.evaluate(()=>{const h=document.createElement('div');h.id='qa-pet';h.style.cssText='width:300px;height:300px';document.body.append(h);});
 for(const pet of CATALOG){
  assert.equal(ANIMATIONS[pet.id].available,true);assert.equal(ANIMATIONS[pet.id].rows,5);
  const images=[];
  for(let stage=1;stage<=5;stage++){
   await page.evaluate(async({id,stage})=>{window.qaView?.dispose();const h=document.querySelector('#qa-pet');delete h.dataset.ready;window.qaView=(await import('./pet-view.js')).mountPet(h,id,stage);},{id:pet.id,stage});
   await page.waitForFunction(id=>document.querySelector('#qa-pet').dataset.ready===id,pet.id);
   assert.equal(Number(await page.locator('#qa-pet').getAttribute('data-frame')),(stage-1)*4);
   images.push(await page.locator('#qa-pet canvas').evaluate(c=>c.toDataURL()));
  }
  assert.equal(new Set(images).size,5,pet.id+' five distinct growth rows');
 }
 assert.ok((await page.evaluate(()=>window.canvasContexts)).every(t=>t==='2d'));
 assert.ok(!requests.some(u=>/three|pet-models|model-kit|model-finishing/.test(u)));
 assert.deepEqual(errors,[]);await writeFile('test-results/animation/result.json',JSON.stringify({animated:24,stages:120,errors},null,2));
 console.log('PASS: 24 offline companions × 5 actual growth rows; no previews, grayscale locked catalog, pause/greet/reduced motion/system theme, unchanged business state, zero WebGL.');
}finally{await browser.close();}
