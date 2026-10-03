import {chromium} from 'playwright';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';

// Package the pinned, unmodified official artwork as local transparent PNGs.
const base='Projects/assets/material-symbols-rounded';
const catalog=JSON.parse((await readFile(base+'/sources.json','utf8')).replace(/^\uFEFF/,''));
await mkdir('app/assets/ui-icons',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try {
  const page=await browser.newPage();
  for(const {id} of catalog.icons) {
    const source=(await readFile(base+'/'+id+'.svg')).toString('base64');
    const png=await page.evaluate(async source=>{
      const image=new Image();
      image.src='data:image/svg+xml;base64,'+source;
      await image.decode();
      const canvas=document.createElement('canvas');
      canvas.width=canvas.height=96;
      canvas.getContext('2d').drawImage(image,0,0,96,96);
      return canvas.toDataURL('image/png').split(',')[1];
    },source);
    await writeFile('app/assets/ui-icons/'+id+'.png',Buffer.from(png,'base64'));
  }
} finally {
  await browser.close();
}
await copyFile(base+'/LICENSE','app/assets/ui-icons/LICENSE.txt');
await writeFile('app/assets/ui-icons/NOTICE.txt',
  'Material Symbols Rounded by Google\nSource: '+catalog.source+'\nRevision: '+catalog.revision+
  '\nLicense: Apache-2.0 (see LICENSE.txt)\nModified only by rasterizing SVG to transparent 96px PNG.\n');
console.log('Packaged '+catalog.icons.length+' monochrome UI icons.');
