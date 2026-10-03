import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {CATALOG} from '../app/catalog.js';
await mkdir('test-results/atelier',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1050},colorScheme:'light'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto('http://127.0.0.1:4180');assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.locator('[data-action=theme-toggle]').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.locator('[data-action=start]').click();await page.waitForSelector('#pet-host[data-ready]');
 const stateBefore=await page.evaluate(async()=>JSON.stringify(await (await import('./store.js')).readState()));
 for(const theme of ['light','dark']){
  await page.evaluate(theme=>window.WildfitTheme.set(theme),theme);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:width===390?844:1050});
   for(const route of ['home','records','pets','meals','settings']){
    await page.locator(`.nav [data-route=${route}]`).click();if(route==='home'||route==='pets')await page.waitForSelector('#pet-host[data-ready]');
    await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} ${route} ${width} overflow`);
    await page.screenshot({path:`test-results/atelier/${theme}-${route}-${width}.png`,fullPage:true});
   }
   await page.locator('.nav [data-route=home]').click();await page.locator('[data-action=workout][data-sport=running]').click();await page.locator('[name=notes]').fill('主题切换不丢失草稿');await page.screenshot({path:`test-results/atelier/${theme}-form-${width}.png`});await page.locator('[data-action=close]').click();
   // Discard only this test draft before the next form scenario.
   await page.locator('[data-action=resume]').click();await page.locator('[data-action=discard-draft]').click();await page.locator('[data-action=discard-confirm]').click();await page.waitForFunction(()=>!document.querySelector('dialog').open);
  }
  await page.setViewportSize({width:1440,height:1050});await page.locator('.nav [data-route=pets]').click();
  for(const pet of CATALOG){await page.locator(`[data-action=preview][data-id=${pet.id}]`).click();await page.waitForSelector(`#pet-host[data-ready=${pet.id}]`);await page.waitForTimeout(70);await page.locator('#pet-host').screenshot({path:`test-results/atelier/${theme}-${pet.id}.png`});}
 }
 // An explicit appearance persists; system mode follows changes without remounting the canvas.
 await page.evaluate(()=>window.WildfitTheme.set('dark'));await page.emulateMedia({colorScheme:'light'});assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 const canvas=await page.locator('#pet-host canvas').elementHandle();await page.evaluate(()=>window.WildfitTheme.set('system'));assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');assert.equal(await canvas.evaluate(n=>n.isConnected),true);assert.equal(await page.locator('#pet-host').getAttribute('data-theme'),'dark');
 await page.locator('.nav [data-route=settings]').click();assert.equal(await page.locator('[data-theme-mode=system]').getAttribute('aria-pressed'),'true');await page.locator('[data-theme-mode=light]').click();await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 const after=await page.evaluate(async()=>await (await import('./store.js')).readState());const before=JSON.parse(stateBefore);delete before.revision;delete after.revision;assert.deepEqual(after,before);
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.reload();await page.locator('[data-action=theme-toggle]').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.waitForSelector('#pet-host[data-ready]');assert.deepEqual(errors,[]);
 console.log('PASS: light/dark/system persistence, OS preference changes, unchanged canvas and business data, 5 routes + form at 390/1440, 24 companion states in both themes, offline theme switch; no JS/request errors.');
}finally{await browser.close();}
