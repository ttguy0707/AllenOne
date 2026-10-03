import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const assets=fileURLToPath(new URL('../../Projects/assets/',import.meta.url));
await fs.mkdir(assets,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:980}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
try{
 await page.goto('http://127.0.0.1:4173');
 await page.waitForFunction(()=>window.__petPreview?.ready && window.__petPreview.getState().frames>10);
 for(const pet of ['rabbit','dragon','dolphin','eagle']){
  await page.locator(`[data-pet="${pet}"]`).click();
  for(const stage of [1,3,5]){
   await page.locator('#stage').fill(String(stage));
   await page.waitForTimeout(220);
   const s=await page.evaluate(()=>window.__petPreview.getState());
   assert.equal(s.selected,pet);assert.equal(s.stage,stage);assert(s.triangles>1000);assert(s.meshes>10);
  }
  await page.screenshot({path:`${assets}/pet3d-v2-${pet}-desktop.png`});
 }
 const resourcesBefore=await page.evaluate(()=>window.__petPreview.getState());
 for(const pet of ['rabbit','dragon','dolphin','eagle']){await page.locator(`[data-pet="${pet}"]`).click();await page.waitForTimeout(100);}
 const resourcesAfter=await page.evaluate(()=>window.__petPreview.getState());
 assert.equal(resourcesAfter.geometries,resourcesBefore.geometries,'Geometry count must recover after a full species cycle');
 assert.equal(resourcesAfter.textures,resourcesBefore.textures,'Texture count must remain stable after warmup');
 await page.locator('#pause').click();
 const paused=await page.evaluate(()=>window.__petPreview.getState());await page.waitForTimeout(220);
 const still=await page.evaluate(()=>window.__petPreview.getState());assert.equal(still.time,paused.time);assert.equal(still.rootY,paused.rootY);
 await page.locator('#greet').click();await page.waitForTimeout(220);
 assert.equal(await page.evaluate(()=>window.__petPreview.getState().paused),false);
 await page.locator('#rotate').click();const before=await page.evaluate(()=>window.__petPreview.getState().camera);await page.waitForTimeout(250);const after=await page.evaluate(()=>window.__petPreview.getState().camera);assert.notDeepEqual(after,before);
 await page.locator('#rotate').click();
 await page.locator('#viewport').focus();await page.keyboard.press('ArrowLeft');assert.notDeepEqual(await page.evaluate(()=>window.__petPreview.getState().camera),after);
 await page.setViewportSize({width:390,height:844});await page.locator('[data-pet="rabbit"]').click();await page.locator('#stage').fill('1');await page.locator('#reset-view').click();await page.waitForTimeout(220);
 const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert(dims.scroll<=dims.width);
 await page.screenshot({path:`${assets}/pet3d-v2-mobile.png`,fullPage:true});
 for(const pet of ['rabbit','dragon','dolphin','eagle']){await page.locator(`[data-pet="${pet}"]`).click();await page.locator('#stage').fill('5');await page.locator('#reset-view').click();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(220);await page.screenshot({path:`${assets}/pet3d-v2-${pet}-mobile.png`});}
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>window.__petPreview?.ready);assert.equal(await page.evaluate(()=>window.__petPreview.getState().paused),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: all four pets at stages 1/3/5; rendering, pause, greeting, orbit, keyboard, 390px layout, reduced motion, stable geometry/texture counts after species cycle; no JS/shader/request errors.');
}finally{await browser.close();}
