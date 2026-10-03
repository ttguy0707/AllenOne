import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';

// Package the imagegen artwork; the original and its prompt live in project memory.
const source=(await readFile('Projects/assets/allenone-a-typographic-v1.png')).toString('base64');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try {
  const page=await browser.newPage();
  for(const size of [32,192,512]) {
    const data=await page.evaluate(async({source,size})=>{
      const img=new Image();
      img.src='data:image/png;base64,'+source;
      await img.decode();
      const canvas=document.createElement('canvas');
      canvas.width=canvas.height=size;
      const ctx=canvas.getContext('2d');
      // iOS home-screen artwork has an opaque background.
      ctx.fillStyle='#ffffff';
      ctx.fillRect(0,0,size,size);
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';
      ctx.drawImage(img,0,0,size,size);
      return canvas.toDataURL('image/png').split(',')[1];
    },{source,size});
    await writeFile(`app/icon-${size}.png`,Buffer.from(data,'base64'));
  }
} finally {
  await browser.close();
}
