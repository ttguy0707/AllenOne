import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {CATALOG} from '../app/catalog.js';
import {ANIMATIONS} from '../app/pet-animation.js';

// Format conversion and runtime atlas slicing only. Original artwork is retained.
await mkdir('app/assets/companions',{recursive:true});
await mkdir('test-results/animation',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const results=[];
try{
 const page=await browser.newPage();
 for(const pet of CATALOG){
  if(!ANIMATIONS[pet.id].available)continue;
  const input=await readFile(`Projects/assets/animation-source/${pet.id}-v1.png`);
  const data=await page.evaluate(async({base64})=>{
   const img=new Image();img.src='data:image/png;base64,'+base64;await img.decode();
   const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
   const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   let transparent=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]<16)transparent++;
   // Generated grids can deviate a few pixels from exact cell boundaries.
   // Locate transparent gutters before repacking, so feathers and noses are not cut.
   function cuts(axis,count){
    const length=axis==='x'?canvas.width:canvas.height,cross=axis==='x'?canvas.height:canvas.width,step=length/count,out=[0];
    for(let n=1;n<count;n++){
     const expected=Math.round(n*step),start=Math.round(expected-step*.10),end=Math.round(expected+step*.10),scores=[];
     for(let a=start;a<=end;a++){let sum=0;for(let b=0;b<cross;b++){const x=axis==='x'?a:b,y=axis==='x'?b:a;if(pixels[(y*canvas.width+x)*4+3]>64)sum++;}scores.push({a,sum});}
     const min=Math.min(...scores.map(s=>s.sum)),candidates=scores.filter(s=>s.sum===min);
     out.push(candidates[Math.floor(candidates.length/2)].a);
    }out.push(length);return out;
   }
   const xs=cuts('x',4),ys=cuts('y',3),packed=document.createElement('canvas');packed.width=1536;packed.height=1152;
   const pack=packed.getContext('2d'),cell=384;
   const scale=360/Math.max(...xs.slice(1).map((v,i)=>v-xs[i]),...ys.slice(1).map((v,i)=>v-ys[i]));
   const frames=[];
   for(let f=0;f<12;f++){
    const col=f%4,row=Math.floor(f/4),x=xs[col],y=ys[row],w=xs[col+1]-x,h=ys[row+1]-y;
    const values=ctx.getImageData(x,y,w,h).data;
    let opaque=0;for(let i=3;i<values.length;i+=4)if(values[i]>128)opaque++;
    frames.push(opaque/(values.length/4));
    pack.drawImage(img,x,y,w,h,col*cell+(cell-w*scale)/2,row*cell+(cell-h*scale)/2,w*scale,h*scale);
   }
   const atlas=packed.toDataURL('image/webp',.91).split(',')[1];
   canvas.width=canvas.height=128;
   ctx.drawImage(packed,0,0,cell,cell,0,0,128,128);
   return {atlas,poster:canvas.toDataURL('image/webp',.9).split(',')[1],width:img.naturalWidth,height:img.naturalHeight,transparent:transparent/(pixels.length/4),frames,cuts:{x:xs,y:ys}};
  },{base64:input.toString('base64')});
  if(data.transparent<.2||data.frames.some(x=>x<.025))throw Error(`Invalid transparency or empty cell: ${pet.id}`);
  await writeFile(`app/assets/companions/${pet.id}-v1.webp`,Buffer.from(data.atlas,'base64'));
  await writeFile(`app/assets/companions/${pet.id}-poster-v1.webp`,Buffer.from(data.poster,'base64'));
  const {atlas,poster,...check}=data;results.push({id:pet.id,...check,bytes:Buffer.from(atlas,'base64').length});
 }
 await writeFile('test-results/animation/asset-checks.json',JSON.stringify(results,null,2));
 console.log(`Prepared ${results.length} transparent atlases and posters, ${(results.reduce((n,x)=>n+x.bytes,0)/1024/1024).toFixed(2)} MiB.`);
}finally{await browser.close();}
