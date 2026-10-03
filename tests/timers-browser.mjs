import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4180');await page.locator('[data-action=start]').click();
 await page.locator('[data-action=workout][data-sport=strength]').click();await page.locator('[data-action=pick-exercises]').click();await page.locator('[data-action=custom-exercise]').click();
 await page.locator('[name=name]').fill('虚构辅助划船');await page.locator('[name=basis]').selectOption('辅助重量');await page.locator('button[form=custom-form]').click();
 await page.locator('[name=weight-0-0]').fill('12.5');await page.locator('[name=done-0-0]').check();
 await page.locator('.rest-bar summary').click();await page.locator('#rest-seconds').fill('5');await page.locator('[data-action=rest-start]').click();await page.waitForFunction(()=>document.querySelector('#rest-clock')?.textContent==='0:00',{},{timeout:8000});assert.match(await page.locator('#toast').innerText(),/休息结束/);
 await page.locator('button[form=workout-form]').click();await page.waitForFunction(()=>!document.querySelector('dialog').open);
 const state=await page.evaluate(async()=>await(await import('./store.js')).readState());
 assert.equal(state.draft,null);assert.equal(state.recording_sessions.length,0);assert.equal(state.workouts[0].exercises[0].weight_basis,'辅助重量');assert.ok(state.workouts[0].duration_seconds>=5);assert.equal(state.workouts[0].duration_source,'timer');
 assert.deepEqual(errors,[]);console.log('PASS: custom action/weight basis, automatic workout timer, foreground rest alert, no stale recording after completion.');
}finally{await browser.close();}
