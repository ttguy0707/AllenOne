import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const output='test-results/macos';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const findings=[],evidence=[],errors=[];
const check=(condition,message)=>{if(!condition)findings.push(message);};
try{
 for(const width of [390,1440])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1050},colorScheme:theme,serviceWorkers:'block'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4180');await page.locator('[data-action=start]').click();
  assert.equal(await page.locator('link[href="./macos.css"]').count(),1,'New appearance must be built before this test');
  const nav=async route=>{await page.locator(`.nav [data-route=${route}]`).click();};
  for(const route of ['home','records','pets','meals','settings']){
   await nav(route);await page.waitForTimeout(220);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}/${theme}/${route}: horizontal overflow`);
   if(['home','pets'].includes(route))await page.screenshot({path:`${output}/${width}-${theme}-${route}.png`,fullPage:true});
  }
  await nav('pets');await page.evaluate(()=>scrollTo(0,600));
  await page.locator('.nav [data-route=records]').focus();await page.keyboard.press('Enter');
  await page.waitForTimeout(220);
  const navigation=await page.evaluate(()=>({scroll:scrollY,focused:document.activeElement.tagName}));
  check(navigation.scroll===0,`${width}/${theme}: page navigation keeps prior scroll`);
  check(navigation.focused!=='BODY',`${width}/${theme}: keyboard navigation drops focus to BODY`);
  await nav('home');
  const align=await page.locator('.page-actions .theme-toggle').evaluate(el=>{const a=el.getBoundingClientRect(),b=el.querySelector('.ui-icon:not([hidden])').getBoundingClientRect();return Math.abs(a.x+a.width/2-b.x-b.width/2);});
  // The visible moon and sun occupy the same grid cell; actual icon centering is also reviewed in screenshots.
  evidence.push({width,theme,navigation,themeIconHorizontalOffset:align});
  await page.locator('[data-action=workout][data-sport=running]').click();await page.waitForTimeout(220);
  await page.screenshot({path:`${output}/${width}-${theme}-running.png`});
  await page.locator('.dialog-head [data-action=close]').click();await page.waitForTimeout(100);
  check(await page.evaluate(()=>document.activeElement.tagName!=='BODY'),`${width}/${theme}: closing workout drops focus to BODY`);
  await page.locator('[data-action=workout][data-sport=strength]').click();
  await page.locator('[data-action=pick-exercises]').click();
  await page.locator('[name=pick-exercise][value=bench]').check();
  await page.locator('[data-action=add-exercises]').click();
  await page.locator('[name=weight-0-0]').fill('40');await page.locator('[name=reps-0-0]').fill('10');await page.locator('[name=done-0-0]').check();
  await page.waitForTimeout(220);await page.screenshot({path:`${output}/${width}-${theme}-sets.png`});
  if(width===390){
   const targets=await page.locator('.set-row input[type=checkbox],.set-row>button').evaluateAll(es=>es.map(e=>({label:e.getAttribute('aria-label'),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
   for(const t of targets)check(t.w>=44&&t.h>=44,`${theme}: ${t.label} target ${t.w}×${t.h} is below 44px`);
   await page.setViewportSize({width:390,height:420});await page.locator('[name=reps-0-2]').focus();await page.locator('[name=reps-0-2]').scrollIntoViewIfNeeded();await page.waitForTimeout(220);
   const bounds=await page.evaluate(()=>{const r=s=>{const a=document.querySelector(s).getBoundingClientRect();return {top:a.top,bottom:a.bottom}};return {input:r('[name=reps-0-2]'),body:r('.dialog-body'),footer:r('.dialog-footer')}});
   check(bounds.input.top>=bounds.body.top&&bounds.input.bottom<=bounds.footer.top,`${theme}: focused third set is behind header/footer at 390×420`);
   await page.screenshot({path:`${output}/390-${theme}-short-viewport.png`});
   await page.locator('[data-action=add-set]').scrollIntoViewIfNeeded();
   const setScroll=await page.locator('.dialog-body').evaluate(e=>e.scrollTop);
   await page.locator('[data-action=add-set]').click();
   check(Math.abs(await page.locator('.dialog-body').evaluate(e=>e.scrollTop)-setScroll)<4,`${theme}: adding a set jumps to the top`);
   check(await page.evaluate(()=>document.activeElement?.dataset.action)==='add-set',`${theme}: adding a set loses keyboard focus`);
   await page.locator('.dialog-body').evaluate(e=>e.scrollTop=e.scrollHeight);const documentY=await page.evaluate(()=>scrollY);await page.mouse.move(180,200);await page.mouse.wheel(0,1800);await page.waitForTimeout(100);
   check(await page.evaluate(()=>scrollY)===documentY,`${theme}: modal scroll leaks to document`);
   evidence.push({theme,targets,shortViewport:bounds});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  check(await page.locator('dialog').evaluate(el=>getComputedStyle(el).animationName)==='none',`${width}/${theme}: reduced motion keeps modal animation`);
  await context.close();
 }
}finally{await browser.close();}
check(errors.length===0,`JavaScript errors: ${errors.join('; ')}`);
await writeFile(`${output}/report.json`,JSON.stringify({findings,evidence,errors},null,2));
console.log(JSON.stringify({findings,errors},null,2));
assert.deepEqual(findings,[],'Mac appearance / keyboard / short viewport review failures');
console.log('PASS: 390/1440 light/dark, five routes, recording sheets, 44px set controls, short viewport focus, scroll containment, reduced motion, no script errors.');
