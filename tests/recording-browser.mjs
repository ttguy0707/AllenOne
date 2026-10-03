import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const saved=()=>page.evaluate(async()=>await(await import('./store.js')).readState());
 const action=a=>page.locator(`[data-action="${a}"]`).first();
 const sport=async s=>page.locator(`[data-action=workout][data-sport=${s}]`).click();
 const finish=async()=>{await page.locator('button[form=workout-form]').click();await page.waitForFunction(()=>!document.querySelector('dialog').open);};
 await page.goto('http://127.0.0.1:4180');await action('start').click();
 await sport('strength');assert.equal(await page.locator('[name=duration]').count(),0);
 await action('pick-exercises').click();await page.locator('[name=pick-exercise][value=bench]').check();await page.locator('[name=pick-exercise][value=squat]').check();await action('add-exercises').click();
 assert.equal(await page.locator('.exercise-card').count(),2);
 await page.locator('[name=weight-0-0]').fill('40');await page.locator('[name=done-0-0]').check();await action('close').click();
 await sport('running');await page.locator('[name=duration]').fill('30');await page.locator('[name=distance]').fill('5');await finish();
 let s=await saved();assert.equal(s.workouts.length,1);assert.equal(s.recording_sessions[0].sport,'strength');assert.equal(s.recording_sessions[0].exercises[0].sets[0].weight,'40');
 // Editing another record does not block or replace an in-progress strength session.
 await action('detail').first().click();await action('workout-edit').click();await page.locator('[name=distance]').fill('6');await finish();assert.equal((await saved()).recording_sessions.length,1);
 await page.reload();await sport('strength');assert.equal(await page.locator('[name=weight-0-0]').inputValue(),'40');
 for(const input of await page.locator('[name^=weight-]').all())await input.fill('40');
 await page.locator('.record-options summary').click();await action('save-template').click();await page.locator('[name=name]').fill('测试训练');await page.locator('button[form=template-form]').click();
 await finish();await page.waitForTimeout(350);s=await saved();assert.equal(s.recording_sessions.length,0);assert.equal(s.workouts.at(-1).duration_source,'timer');assert.ok(s.workouts.at(-1).duration_seconds>0);
 await sport('strength');await action('entry-mode').click();await page.locator('[name=duration]').fill('45');await action('pick-exercises').click();await page.locator('#exercise-search').fill('卧推');assert.ok(await page.locator('.exercise-choice:visible').count()>=1);await page.locator('[name=pick-exercise][value=bench]').check();await action('add-exercises').click();assert.equal(await page.locator('[name=weight-0-0]').inputValue(),'40');assert.equal(await page.locator('[name=done-0-0]').isChecked(),false);await page.locator('[name=done-0-0]').check();await finish();assert.equal((await saved()).workouts.at(-1).duration_seconds,2700);
 await sport('basketball');await page.locator('[name=start]').fill('2026-09-29T23:30');await page.locator('[name=end]').fill('2026-09-30T00:30');await finish();assert.equal((await saved()).workouts.at(-1).duration_seconds,3600);
 await sport('cycling');await page.locator('[name=duration]').fill('60');await page.locator('[name=distance]').fill('20');await action('close').click();await page.reload();await sport('cycling');assert.equal(await page.locator('[name=distance]').inputValue(),'20');await finish();
 await sport('strength');await action('pick-exercises').click();await page.locator('[name=pick-exercise][value=bench]').check();await action('add-exercises').click();
 for(const theme of ['light','dark']){await page.evaluate(t=>WildfitTheme.set(t),theme);await page.screenshot({path:`test-results/recording-${theme}.png`});assert.equal(await page.evaluate(()=>document.querySelector('dialog').scrollWidth>innerWidth),false);}
 await action('close').click();await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.context().setOffline(true);await page.reload();await sport('strength');assert.equal(await page.locator('.exercise-card').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS: four sports, live/manual timing, batch/search actions, prior values, interruption recovery, independent edit/save, templates, two themes, offline.');
}finally{await browser.close();}
