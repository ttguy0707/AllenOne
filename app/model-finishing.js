import * as T from 'three';
import {group,mesh,oval,curve,leaf,taper,material,profileTube,surfaceTexture} from './model-kit.js';

const cachedMaps=new Map();
const colors={rat:'#99816a',ox:'#677969',tiger:'#c18b45',rabbit:'#d5c5ae',dragon:'#376e5c',snake:'#58815e',horse:'#936448',goat:'#c2b496',monkey:'#99704c',rooster:'#7b4632',dog:'#b18c55',pig:'#c09a8e',eagle:'#694830',owl:'#81725f',crane:'#deddd0',parrot:'#47796a',peacock:'#24656b',penguin:'#344449',dolphin:'#467f94',whale:'#425e74',turtle:'#71835d',ray:'#526778',octopus:'#927889',jellyfish:'#ada1c0'};
function remember(p,m){p.materials.push(m);return m;}
function map(kind){
 if(cachedMaps.has(kind))return cachedMaps.get(kind);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');
 c.fillStyle='#888';c.fillRect(0,0,512,512);
 if(kind==='feather'){
  for(let y=0;y<512;y+=6){c.strokeStyle=y%12?'#737373':'#a7a7a7';c.lineWidth=1.3;c.beginPath();c.moveTo(0,y-46);c.quadraticCurveTo(90,y-26,255,y);c.quadraticCurveTo(400,y-24,512,y-47);c.stroke();}c.fillStyle='#aaa';c.fillRect(252,0,4,512);
 }else if(kind==='scales'){
  for(let y=-16;y<544;y+=22)for(let x=-20;x<540;x+=26){const offset=(Math.floor(y/22)%2)*13;c.fillStyle='#707070';c.beginPath();c.ellipse(x+offset,y,12,15,0,0,Math.PI*2);c.fill();c.strokeStyle='#b0b0b0';c.lineWidth=1.5;c.stroke();}
 }else{
  let seed=723;for(let i=0;i<14000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed/4294967296*512;seed=(seed*1664525+1013904223)>>>0;const y=seed/4294967296*512;c.strokeStyle=i%2?'#777':'#999';c.lineWidth=.65;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+1,y+3,x+3,y+7);c.stroke();}
 }
 const texture=new T.CanvasTexture(canvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;cachedMaps.set(kind,texture);return texture;
}
// Surface color belongs to the sculpt, so markings remain flush with the skin.
function colorSurface(object,base,kind='fur',head=false){
 const geo=object.geometry,positions=geo.attributes.position;geo.computeBoundingBox();const b=geo.boundingBox,size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3()),out=[];
 const main=new T.Color(base),cream=new T.Color(kind==='tiger'?'#ead8ad':'#ded2b9'),dark=new T.Color(kind==='tiger'?'#483d2b':'#574836');
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),ny=(y-b.min.y)/size.y,nz=(z-b.min.z)/size.z,nx=(x-center.x)/(size.x/2);const col=main.clone();
  if(!head)col.lerp(cream,Math.pow(Math.max(0,1-ny*2.1),1.5)*.62);else col.lerp(cream,Math.max(0,(-ny+.46))*1.1);
  if(kind==='tiger'){
   const stripe=Math.sin((head?x*34:z*32)+Math.sin(y*11)*1.2+Math.sin(x*10)*.42);
   const edge=T.MathUtils.smoothstep(stripe,.65,.85)*(head?Math.max(0,(ny-.45)*1.8):T.MathUtils.smoothstep(ny,.2,.42));col.lerp(dark,edge*.91);
  }else if(kind==='pig'){const patch=Math.sin(x*11+1)*Math.sin(z*8-.5)+Math.cos(y*9);col.lerp(new T.Color('#8d6f64'),T.MathUtils.smoothstep(patch,1.25,1.8)*.30);}
  else if(kind==='whale')col.lerp(cream,Math.pow(Math.max(0,1-ny*1.8),1.4)*.45);
  const variation=Math.sin(x*67+z*19)*Math.sin(y*53+z*37)*.011;col.offsetHSL(0,0,variation);out.push(col.r,col.g,col.b);
 }
 geo.setAttribute('color',new T.Float32BufferAttribute(out,3));object.material=object.material.clone();object.material.color.set(0xffffff);object.material.vertexColors=true;
}
function instances(parent,geometry,mat,transforms){
 const inst=new T.InstancedMesh(geometry,mat,transforms.length),dummy=new T.Object3D();
 transforms.forEach((s,i)=>{dummy.position.set(...s.pos);dummy.scale.set(...s.scale);dummy.rotation.set(...(s.rot||[0,0,0]));dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.castShadow=true;inst.receiveShadow=true;parent.add(inst);return inst;
}
function furTufts(parent,mat,center,radii,count=80){
 const transforms=[];for(let i=0;i<count;i++){const a=i*2.39996,u=.12+.80*(i+.5)/count,v=Math.acos(1-2*u),normal=new T.Vector3(Math.sin(v)*Math.cos(a),Math.cos(v),Math.sin(v)*Math.sin(a));if(normal.z>.5)continue;const pos=normal.clone().multiply(new T.Vector3(...radii)).add(new T.Vector3(...center));const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),normal),e=new T.Euler().setFromQuaternion(q);transforms.push({pos:pos.toArray(),scale:[.013,.043,.009],rot:[e.x,e.y,e.z]});}
 return instances(parent,new T.SphereGeometry(1,8,6),mat,transforms);
}
function detailFace(p,skin,cream,dark){
 if(!p.head)return;const h=p.head,id=p.kind,s=id==='horse'?.31:['rat','monkey'].includes(id)?(id==='rat'?.38:.43):id==='snake'?.25:id==='dragon'?.35:id==='crane'?.19:['rooster','owl','parrot','peacock','penguin'].includes(id)?(id==='owl'?.38:.29):id==='rabbit'?.57:id==='eagle'?.39:id==='turtle'?.22:.37;
 if(['rabbit','eagle','owl','crane','parrot','peacock','penguin','rooster','turtle'].includes(id))return;
 for(const sign of [-1,1]){
  curve(h,skin,[[sign*s*.24,s*.40,s*.68],[sign*s*.48,s*.42,s*.75],[sign*s*.74,s*.29,s*.57]],s*.055);
  if(['tiger','rat','dog','monkey'].includes(id)){
   oval(h,cream,[sign*s*.22,-s*.25,s*.88],[s*.24,s*.16,s*.095]);
   for(let j=0;j<3;j++)oval(h,dark,[sign*(s*.13+j*s*.08),-s*(.24+(j%2)*.10),s*.967],[s*.018,s*.018,s*.011]);
  }
  if(['rat','tiger','dragon'].includes(id))for(let j=0;j<3;j++)curve(h,cream,[[sign*s*.24,-s*.23,s*.96],[sign*s*.75,-s*(.08+j*.15),s*1.04],[sign*s*(1.25+j*.09),-s*(.01+j*.22),s*.78]],.0026);
 }
 curve(h,dark,[[-s*.22,-s*.45,s*.82],[0,-s*.52,s*.94],[s*.22,-s*.45,s*.82]],.0045);
 if(['dog','ox','horse'].includes(id)){for(const sign of [-1,1])oval(h,dark,[sign*s*.12,-s*.14,s*1.015],[s*.045,s*.030,s*.025]);}
}
function birdPlumage(p,base,cream,gold,level){
 const id=p.kind,bodyY=id==='crane'?1.1:.68,h=p.head;
 const featherMat=remember(p,material(base,{roughness:.61,sheen:.7,sheenColor:new T.Color('#d5dbc5'),bumpMap:map('feather'),bumpScale:.004}));
 const lightMat=remember(p,featherMat.clone());lightMat.color.lerp(new T.Color('#dfdbc1'),.20);
 // Small overlapping contour feathers follow the shoulders and flank instead of large flat plates.
 const halfHeight=id==='crane'?.36:.51;
 const pieces=[];for(let row=0;row<8;row++)for(let j=0;j<15;j++){
  const a=j/15*Math.PI*2+(row%2)*.16,y=bodyY+halfHeight*(.66-row*.18),rad=Math.sqrt(Math.max(.08,1-((y-bodyY)/halfHeight)**2));if(Math.cos(a)>.55)continue;
  pieces.push({pos:[Math.sin(a)*.356*rad,y,Math.cos(a)*.337*rad],scale:[.038,.063,.009],rot:[0,a,Math.PI+Math.sin(a)*.1]});
 }instances(p.bodyRoot,new T.SphereGeometry(1,10,8),featherMat,pieces);
 if(id==='owl'){
  for(const s of [-1,1]){for(let i=0;i<10;i++){const a=i/9*Math.PI*1.55+.40;const x=s*.17+Math.cos(a)*.185,y=Math.sin(a)*.218;const f=leaf(h,i%2?cream:lightMat,[x,y,.255],.13,.033,{bend:.01});f.rotation.z=-a+Math.PI/2;}
   for(let j=0;j<3;j++){const tuft=leaf(h,featherMat,[s*(.22+j*.035),.25,-.055],.30-j*.045,.055,{curl:-.10});tuft.rotation.z=-s*(.25+j*.15);}}
 }else if(id==='crane'){
  oval(h,remember(p,material('#9a493e',{roughness:.78})),[0,.125,0],[.13,.053,.13]);for(const s of [-1,1])curve(h,featherMat,[[s*.13,.045,.085],[s*.15,-.075,.07],[s*.09,-.18,.00]],.026);
 }else if(id==='parrot'){
  const yellow=remember(p,material('#bea768',{roughness:.65})),blue=remember(p,material('#3f727e',{roughness:.55,sheen:.6}));
  for(const [i,wing] of p.wings.entries())for(let j=0;j<6;j++){const f=leaf(wing,j<2?yellow:blue,[0,-j*.045,.035],.40,.055,{curl:-.07});f.rotation.z=Math.PI+(i?1:-1)*(.27+j*.04);}
  for(const s of [-1,1]){oval(h,cream,[s*.20,-.02,.215],[.08,.13,.025]);for(let j=0;j<4;j++)curve(h,featherMat,[[s*.16,-.06+j*.032,.24],[s*.23,-.04+j*.032,.232]],.003);}
 }else if(id==='peacock'){
  const teal=remember(p,material('#2e756d',{roughness:.39,metalness:.17,iridescence:.4,iridescenceIOR:1.3}));
  for(let i=-7;i<=7;i++){const a=-i*.15,l=1.39+(level-1)/4*.18;const x=-Math.sin(a)*l,y=bodyY-.24+Math.cos(a)*l;const center=[x,y,-.39];const ring=mesh(p.bodyRoot,new T.TorusGeometry(.083,.012,8,28),gold,center,[.7,1,1]);const iris=oval(p.bodyRoot,teal,[x,y,-.375],[.038,.064,.016]);}
 }else if(id==='penguin'){
  const amber=remember(p,material('#b59757',{roughness:.69}));for(const s of [-1,1]){const f=leaf(h,amber,[s*.22,-.17,.12],.30,.08,{bend:.014});f.rotation.z=s*.22+Math.PI;}
 }
}
function shellSeams(p,dark,cream){
 const shell=p.bodyRoot.children.filter(o=>o.geometry?.type==='CylinderGeometry');shell.forEach(o=>{o.geometry.dispose();p.bodyRoot.remove(o);});
 const seam=remember(p,material('#47583c',{roughness:.62}));const surface=(x,z)=>[x,.83+.34*Math.sqrt(Math.max(0,1-(x/.62)**2-((z+.06)/.73)**2))+.008,z];
 for(let row=-2;row<=2;row++)for(let col=-2;col<=2;col++){
  const r=.185,x=Math.sqrt(3)*r*(col+row/2),z=1.5*r*row-.06;if((x/.55)**2+((z+.06)/.65)**2>.72)continue;
  const points=[];for(let j=0;j<6;j++){const a=j/6*Math.PI*2+Math.PI/6,b=(j+1)/6*Math.PI*2+Math.PI/6;for(let k=0;k<5;k++){const t=k/5;points.push(surface(x+(Math.cos(a)*(1-t)+Math.cos(b)*t)*r,z+(Math.sin(a)*(1-t)+Math.sin(b)*t)*r));}}points.push(points[0]);curve(p.bodyRoot,seam,points,.006);
 }
 const rim=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;rim.push([Math.cos(a)*.61,.84,Math.sin(a)*.71-.06]);}curve(p.bodyRoot,cream,rim,.017);
}
export function finishPet(p,level){
 const id=p.kind,base=colors[id],fur=['rat','ox','tiger','rabbit','horse','goat','monkey','dog'].includes(id),bird=['rooster','eagle','owl','crane','parrot','peacock','penguin'].includes(id),scaly=['dragon','snake','turtle'].includes(id),marine=['dolphin','whale','ray','octopus'].includes(id);
 const mats=new Set();p.root.traverse(o=>{if(o.isMesh&&o.material){mats.add(o.material);o.receiveShadow=false;}});
 p.materials[0]?.color?.set(base);
 if(p.materials[0]?.isMeshPhysicalMaterial){p.materials[0].bumpMap=map(scaly?'scales':bird?'feather':'fur');p.materials[0].bumpScale=fur?.005:marine?.001:.002;p.materials[0].roughness=marine?.39:fur?.67:.53;}
 const skin=remember(p,material(base,{roughness:fur?.68:scaly?.43:.5,bumpMap:map(scaly?'scales':bird?'feather':'fur'),bumpScale:fur?.007:.003,sheen:fur?.48:.12,sheenColor:new T.Color('#c2b69b')}));
 const cream=remember(p,material('#ddcfad',{roughness:.64,sheen:.35})),dark=remember(p,material('#403c32',{roughness:.64})),gold=remember(p,material('#a58a55',{metalness:.55,roughness:.39}));
 for(const m of mats){if(!m.isMeshPhysicalMaterial)continue;if(m.roughness>.35){m.envMapIntensity=.72;if(m.bumpMap)m.bumpScale=Math.min(m.bumpScale,.006);m.sheen=Math.min(m.sheen||0,.45);}}
 const sculptMeshes=[];p.bodyRoot.traverse(o=>{if(o.userData.sculpt)sculptMeshes.push(o);});
 for(const object of sculptMeshes){
  if(['eagle','rabbit'].includes(id)&&object.parent===p.head)continue;
  if(id==='eagle')continue;
  colorSurface(object,base,['tiger','pig','whale'].includes(id)?id:'fur',object.parent===p.head);
  object.material.bumpMap=map(scaly?'scales':bird?'feather':'fur');object.material.bumpScale=marine?.001:scaly?.003:.006;object.material.roughness=marine?.35:scaly?.47:.66;
 }
 detailFace(p,skin,cream,dark);
 // Fine fur is a surface texture; avoid detached quills on the face silhouette.
 if(['rat','monkey'].includes(id)){
  for(const s of [-1,1])for(let j=0;j<3;j++)curve(p.bodyRoot,dark,[[s*.35+j*.018,.20,.43],[s*.35+j*.018,.18,.51]],.003);
  if(id==='rat'){for(let i=0;i<22;i++){const a=i/22*Math.PI*2;curve(p.bodyRoot,dark,[[Math.cos(a)*.22,.80,.57+Math.sin(a)*.20],[Math.cos(a)*.235,.86,.57+Math.sin(a)*.235]],.003);} }
 }
 if(id==='ox'||id==='horse'){
  const y=id==='horse'?1.5:.99;for(const s of [-1,1])curve(p.head,dark,[[s*.10,-.12,.34],[s*.13,-.10,.37]],.012);
  if(id==='horse'){const tail=group(p.bodyRoot,[0,.95,-.90]);for(let i=0;i<15;i++){const a=i/15*Math.PI*2;curve(tail,dark,[[Math.cos(a)*.06,0,Math.sin(a)*.04],[.08+Math.cos(a)*.045,-.22,-.19],[.02+Math.cos(a)*.015,-.65,-.2]],.009);}p.motion.push({g:tail,axis:'z',base:0,amplitude:.07,speed:1.3,phase:0});}
 }
 if(id==='tiger'){
  for(const s of [-1,1]){for(let j=0;j<4;j++){const tuft=leaf(p.head,cream,[s*(.29+j*.016),-.05-j*.044,.05],.22,.08,{curl:-.04});tuft.rotation.z=Math.PI+s*.6;}}
 }
 if(id==='goat'){
  const tufts=[];for(let i=0;i<260;i++){const a=i*2.39996,u=(i+.5)/260,v=Math.acos(1-2*u),nx=Math.sin(v)*Math.cos(a),ny=Math.cos(v),nz=Math.sin(v)*Math.sin(a);if(ny<-.44||nz>.73)continue;tufts.push({pos:[nx*.448,.90+ny*.43,-.15+nz*.84],scale:[.069,.061,.067]});}instances(p.bodyRoot,new T.SphereGeometry(1,12,8),cream,tufts);
  taper(p.head,cream,[[0,-.26,.14],[0,-.49,.2],[.04,-.62,.2]],.10);
 }
 if(id==='dog'){const chest=leaf(p.bodyRoot,cream,[0,.68,.42],.46,.20,{thickness:.035,bend:.055});chest.rotation.x=1.35;chest.rotation.z=Math.PI;}
 if(id==='pig'){const spiral=[];for(let i=0;i<48;i++){const a=i/47*Math.PI*3;spiral.push([.1+Math.cos(a)*.09,.95+Math.sin(a)*.09,-.91-i*.003]);}curve(p.bodyRoot,skin,spiral,.032);}
 if(id==='dragon'){
  const path=new T.CatmullRomCurve3([[-.92,.35,-.32],[-.5,.55,-.65],[.18,.72,-.6],[.48,1.03,-.25],[.23,1.38,.1],[-.26,1.57,.05],[-.42,1.86,.12],[-.1,2.1,.35]].map(v=>new T.Vector3(...v)));
  const vertices=[],indices=[],uv=[];for(let i=0;i<=80;i++){const t=i/80,point=path.getPoint(t),tangent=path.getTangent(t),side=new T.Vector3().crossVectors(tangent,new T.Vector3(0,0,1)).normalize();for(const s of [-1,1]){vertices.push(point.x+side.x*s*.10,point.y+side.y*s*.10,point.z+.158);uv.push(s===1?1:0,t*6);}if(i<80){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();const belly=remember(p,cream.clone());belly.side=T.DoubleSide;belly.bumpMap=map('scales');belly.bumpScale=.002;mesh(p.bodyRoot,geometry,belly);
  for(let i=0;i<18;i++){const point=path.getPoint(i/19);const fin=leaf(p.bodyRoot,skin,[point.x,point.y,point.z-.165],.19+(i%3)*.022,.068,{bend:-.05});fin.rotation.x=-Math.PI/2;}
  for(const s of [-1,1]){taper(p.head,gold,[[s*.28,.38,-.10],[s*.45,.55,-.18],[s*.51,.70,-.20]],.044);for(let j=0;j<3;j++){const mane=leaf(p.head,skin,[s*.28,-j*.065,-.055],.33,.09,{curl:-.16});mane.rotation.z=-s*1.3;}}
 }
 if(bird&&id!=='eagle')birdPlumage(p,base,cream,gold,level);
 if(id==='turtle')shellSeams(p,dark,cream);
 if(id==='whale'){
  for(const s of [-1,1])curve(p.bodyRoot,dark,[[s*.20,.66,1.17],[s*.37,.61,1.07],[s*.45,.61,.88]],.006);
  oval(p.bodyRoot,dark,[0,1.30,.28],[.07,.012,.10]);
 }
 if(id==='ray'){
  const spots=[];for(let i=0;i<38;i++){const x=Math.sin(i*2.399)*(.25+(i%8)*.10),z=Math.cos(i*1.9)*.32;spots.push({pos:[x,.948+Math.abs(x)*.01,z],scale:[.014,.006,.014]});}instances(p.bodyRoot,new T.SphereGeometry(1,8,6),cream,spots);
 }
 if(id==='octopus'){
  const spots=[];for(let i=0;i<50;i++){const a=i*2.4,y=.6+(i%10)*.065;const r=.47*Math.sqrt(Math.max(.1,1-((y-.87)/.59)**2));if(Math.cos(a)>.5)continue;spots.push({pos:[Math.sin(a)*r,y,Math.cos(a)*r*.88],scale:[.014,.012,.009],rot:[0,a,0]});}instances(p.bodyRoot,new T.SphereGeometry(1,8,6),cream,spots);
 }
 if(id==='jellyfish'){
  const rim=remember(p,material('#cec1d9',{transparent:true,opacity:.55,roughness:.34,emissive:'#695974',emissiveIntensity:.10}));
  const ring=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,r=.63+Math.sin(a*16)*.015;ring.push([Math.cos(a)*r,1.53+Math.cos(a*16)*.018,Math.sin(a)*r]);}curve(p.bodyRoot,rim,ring,.020);
  for(let j=0;j<8;j++){const a=j/8*Math.PI*2,pts=[];for(let i=0;i<=16;i++){const b=i/16*Math.PI*.53;pts.push([Math.cos(a)*.65*Math.sin(b),1.65+.487*Math.cos(b),Math.sin(a)*.65*Math.sin(b)]);}curve(p.bodyRoot,rim,pts,.006);}
 }
 // The finishing materials are owned by the pet; cached maps are shared across previews.
 p.finishVersion=2;
}
