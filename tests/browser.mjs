import {chromium} from 'playwright';
import {mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4180');await page.locator('[data-action=start]').click();
 await page.locator('.nav [data-route=meals]').click();await page.locator('[data-action=meal]').first().click();
 await page.locator('[name=notes]').fill('虚构测试 <聚餐>');await page.locator('button[form=meal-form]').click();
 await page.waitForFunction(()=>!document.querySelector('dialog').open);
 assert.match(await page.locator('main').innerText(),/虚构测试 <聚餐>/);
 const before=await page.evaluate(async()=>await(await import('./store.js')).readState());
 await page.locator('.nav [data-route=settings]').click();
 const event=page.waitForEvent('download');await page.locator('[data-action=export-json]').click();await(await event).saveAs('test-results/roundtrip.json');
 const data=JSON.parse(await readFile('test-results/roundtrip.json','utf8'));assert.ok(JSON.stringify(data).includes('虚构测试 <聚餐>'));
 await page.locator('#import-file').setInputFiles('test-results/roundtrip.json');await page.locator('#replace-ack').check();await page.locator('[data-action=import-confirm]').click();
 await page.waitForFunction(()=>!document.querySelector('dialog').open);
 const after=await page.evaluate(async()=>await(await import('./store.js')).readState());
 assert.deepEqual(after.meals,before.meals);assert.equal(after.total_score,before.total_score);assert.deepEqual(after.pets,before.pets);
 assert.deepEqual(errors,[]);console.log('PASS: meal entry, escaped text, JSON download/import roundtrip and unchanged scores.');
}finally{await browser.close();}
