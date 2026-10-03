import {chromium} from 'playwright';
import {mkdir,readFile,writeFile,access} from 'node:fs/promises';
import {CATALOG} from '../app/catalog.js';

// Lossy format conversion and atlas extraction only; retain generated source art.
await mkdir('test-results/growth',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const checks=[];
try {
 const page=await browser.newPage();
 for(const pet of CATALOG){
  const source=`Projects/assets/animation-source/${pet.id}-growth-v2.png`;
  try{await access(source);}catch{continue;}
  const result=await page.evaluate(async({base64})=>{
   const img=new Image();img.src='data:image/png;base64,'+base64;await img.decode();
   const source=document.createElement('canvas');source.width=img.naturalWidth;source.height=img.naturalHeight;
   const sc=source.getContext('2d');sc.drawImage(img,0,0);
   const W=source.width,H=source.height,pixels=sc.getImageData(0,0,W,H).data;
   const alpha=(x,y)=>pixels[(y*W+x)*4+3];
   // Generated rows are not reliably equal height. Detect the twenty isolated
   // silhouettes, then crop their bounding rectangles instead of cutting ears.
   const visited=new Uint8Array(W*H),labels=new Int32Array(W*H),queue=new Int32Array(W*H),components=[];let componentId=0;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const first=y*W+x;if(visited[first]||alpha(x,y)<64)continue;
    let head=0,tail=1;queue[0]=first;visited[first]=1;componentId++;
    let left=x,right=x,top=y,bottom=y,opaque=0;
    while(head<tail){const v=queue[head++],vx=v%W,vy=Math.floor(v/W);labels[v]=componentId;opaque++;left=Math.min(left,vx);right=Math.max(right,vx);top=Math.min(top,vy);bottom=Math.max(bottom,vy);
     for(const [nx,ny] of [[vx-1,vy],[vx+1,vy],[vx,vy-1],[vx,vy+1]])if(nx>=0&&nx<W&&ny>=0&&ny<H){const n=ny*W+nx;if(!visited[n]&&alpha(nx,ny)>=64){visited[n]=1;queue[tail++]=n;}}
    }
    if(opaque>500)components.push({componentId,left,right,top,bottom,opaque,edge:Number(left===0||top===0||right===W-1||bottom===H-1),x0:0,x1:W,y0:0,y1:H});
   }
   components.sort((a,b)=>b.opaque-a.opaque);
   if(components.length<20)throw Error('Connected silhouettes: '+components.length+' (expected 20)');
   const selected=components.slice(0,20).sort((a,b)=>(a.top+a.bottom)-(b.top+b.bottom));
   const ys={positions:[],scores:[]},cell=384,packed=document.createElement('canvas');packed.width=4*cell;packed.height=5*cell;
   const pc=packed.getContext('2d'),frames=[],xs=[];
   for(let row=0;row<5;row++){
    const boxes=selected.slice(row*4,row*4+4).sort((a,b)=>a.left-b.left);
    xs.push(boxes.map(b=>[b.left,b.top,b.right,b.bottom]));
    const scale=cell*.86/Math.max(...boxes.map(b=>Math.max(b.right-b.left+1,b.bottom-b.top+1)));
    for(let col=0;col<4;col++){
     const b=boxes[col],pad=2,l=Math.max(b.x0,b.left-pad),t=Math.max(b.y0,b.top-pad),w=Math.min(b.x1,b.right+pad+1)-l,h=Math.min(b.y1,b.bottom+pad+1)-t;
     // Extract only this sprite. Bounding rectangles can contain a neighboring
     // wing tip; retain the original alpha plus a 2px antialias fringe.
     const piece=document.createElement('canvas');piece.width=w;piece.height=h;const ic=piece.getContext('2d'),fragment=sc.getImageData(l,t,w,h);
     for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      let own=labels[(t+y)*W+l+x]===b.componentId;
      if(!own&&fragment.data[(y*w+x)*4+3])for(let dy=-2;dy<=2&&!own;dy++)for(let dx=-2;dx<=2;dx++)if(labels[(t+y+dy)*W+l+x+dx]===b.componentId){own=true;break;}
      if(!own)fragment.data[(y*w+x)*4+3]=0;
     }
     ic.putImageData(fragment,0,0);
     pc.drawImage(piece,0,0,w,h,col*cell+(cell-w*scale)/2,row*cell+cell*.94-h*scale,w*scale,h*scale);
     frames.push({row,col,opaque:b.opaque,edge:b.edge,width:w,height:h});
    }
   }
   const poster=document.createElement('canvas');poster.width=poster.height=144;
   poster.getContext('2d').drawImage(packed,0,0,cell,cell,0,0,144,144);
   const strip=document.createElement('canvas');strip.width=5*240;strip.height=260;const cc=strip.getContext('2d');
   cc.fillStyle='#f3f4f6';cc.fillRect(0,0,strip.width,strip.height);
   for(let row=0;row<5;row++)cc.drawImage(packed,0,row*cell,cell,cell,row*240,0,240,240);
   return {atlas:packed.toDataURL('image/webp',.91).split(',')[1],poster:poster.toDataURL('image/webp',.9).split(',')[1],strip:strip.toDataURL('image/png').split(',')[1],width:W,height:H,rows:ys,columns:xs,frames};
  },{base64:(await readFile(source)).toString('base64')});
  if(result.frames.some(f=>f.opaque<150))throw Error('Empty growth frame: '+pet.id);
  await writeFile(`app/assets/companions/${pet.id}-growth-v2.webp`,Buffer.from(result.atlas,'base64'));
  await writeFile(`app/assets/companions/${pet.id}-poster-v2.webp`,Buffer.from(result.poster,'base64'));
  await writeFile(`test-results/growth/${pet.id}.png`,Buffer.from(result.strip,'base64'));
  const {atlas,poster,strip,...check}=result;checks.push({id:pet.id,bytes:Buffer.from(atlas,'base64').length,...check});
 }
 if(checks.length!==CATALOG.length)throw Error('Missing growth sources: '+(CATALOG.length-checks.length));
 await writeFile('test-results/growth/asset-checks.json',JSON.stringify(checks,null,2));
 console.log(JSON.stringify({count:checks.length,MiB:checks.reduce((n,p)=>n+p.bytes,0)/1024/1024,cutEdges:checks.filter(p=>p.frames.some(f=>f.edge>0)).map(p=>({id:p.id,edges:p.frames.map(f=>f.edge)}))}));
}finally{await browser.close();}
