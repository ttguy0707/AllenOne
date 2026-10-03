import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

// All meshes and surface detail are built locally. No remote model or texture service.
const V = (v) => new THREE.Vector3(...v);
const mix = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;
const smooth = (a,b,x) => THREE.MathUtils.smoothstep(x,a,b);
const textures = new Map();
function surfaceTexture(kind) {
  if(textures.has(kind))return textures.get(kind);
  const size=256, data=new Uint8Array(size*size*4);
  let seed=821;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    seed=(seed*1664525+1013904223)>>>0;
    const noise=(seed/4294967296-.5)*26;
    const fiber=kind==='fur'?Math.sin(x*1.8+Math.sin(y*.12)*2)*14:kind==='scale'?Math.cos(x*.27+(Math.floor(y/18)%2)*Math.PI)*Math.cos(y*.35)*16:Math.sin(y*.7+x*.03)*8;
  const c=clamp(128+noise+fiber,0,255),i=(y*size+x)*4;
    data[i]=data[i+1]=data[i+2]=c;data[i+3]=255;
  }
  const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;textures.set(kind,texture);return texture;
}
const material=(color,options={})=>new THREE.MeshPhysicalMaterial({color,roughness:.55,metalness:0,...options});
function group(parent,pos=[0,0,0]){const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g;}
function mesh(parent,geometry,mat,pos=[0,0,0],scale=[1,1,1]){const m=new THREE.Mesh(geometry,mat);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function oval(parent,mat,pos,scale){return mesh(parent,new THREE.SphereGeometry(1,36,24),mat,pos,scale);}
function curve(parent,mat,points,r=.012){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(V)),32,r,7,false),mat);}

// Smooth unions form a single continuous surface instead of visibly intersecting balls.
function sculpt(parent,mat,blobs,{center=[0,0,0],extent=1.5,resolution=58,blend=.12,colorize}={}){
  const field=new MarchingCubes(resolution,mat,false,false,50000);field.isolation=0;
  let index=0;
  for(let z=0;z<resolution;z++)for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
    const px=(x/resolution*2-1)*extent+center[0],py=(y/resolution*2-1)*extent+center[1],pz=(z/resolution*2-1)*extent+center[2];let distance=1e3;
    for(const b of blobs){const dx=px-b[0],dy=py-b[1],dz=pz-b[2];const k0=Math.hypot(dx/b[3],dy/b[4],dz/b[5]);const k1=Math.hypot(dx/(b[3]*b[3]),dy/(b[4]*b[4]),dz/(b[5]*b[5]));const d=k0*(k0-1)/Math.max(k1,.0001);const h=Math.max(blend-Math.abs(distance-d),0)/blend;distance=Math.min(distance,d)-h*h*blend*.25;}
    field.field[index++]=-distance;
  }
  field.update();
  const count=field.geometry.drawRange.count;
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(field.geometry.attributes.position.array.slice(0,count*3),3));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(field.geometry.attributes.normal.array.slice(0,count*3),3));
  geo.scale(extent,extent,extent);geo.translate(...center);
  const pos=geo.attributes.position,uv=[],colors=[];
  for(let i=0;i<pos.count;i++){const p=new THREE.Vector3().fromBufferAttribute(pos,i);uv.push(Math.atan2(p.z-center[2],p.x-center[0])/Math.PI/2+.5,(p.y-center[1])/extent*.5+.5);if(colorize){const c=colorize(p);colors.push(c.r,c.g,c.b);}}
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));if(colorize)geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  field.geometry.dispose();return mesh(parent,geo,mat);
}

// Tapered curved surfaces: feathers, fins, leaves and ears share this lightweight loft.
function leafGeometry(length,width,{bend=.1,curl=0,thickness=.035,sections=26,rings=12,asym=0}={}){
  const vertices=[],uv=[],indices=[];
  for(let j=0;j<=sections;j++){
    const t=j/sections,profile=Math.pow(Math.sin(Math.PI*t),.72)*(1-t*.27);
    for(let k=0;k<=rings;k++){
      const theta=k/rings*Math.PI*2,x=Math.cos(theta)*width*profile;
      vertices.push(x+asym*t*t,t*length,Math.sin(theta)*thickness*profile+bend*Math.sin(t*Math.PI)+curl*t*t);
      uv.push(k/rings,t);
      if(j<sections&&k<rings){const a=j*(rings+1)+k,b=a+rings+1;indices.push(a,b,a+1,a+1,b,b+1);}
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function leaf(parent,mat,pos,length,width,options={}){return mesh(parent,leafGeometry(length,width,options),mat,pos);}
function earInset(parent,mat,length,width,asym){
  const vertices=[],uv=[],indices=[],rows=28,cols=12;
  for(let j=0;j<=rows;j++){const t=.14+j/rows*.72,profile=Math.pow(Math.sin(Math.PI*t),.72)*(1-t*.27);for(let k=0;k<=cols;k++){const theta=Math.PI/2+(k/cols-.5)*1.42;vertices.push(Math.cos(theta)*width*profile+asym*t*t,t*length,Math.sin(theta)*.093*profile+.09*Math.sin(t*Math.PI)-.075*t*t+.004);uv.push(k/cols,j/rows);if(j<rows&&k<cols){const a=j*(cols+1)+k,b=a+cols+1;indices.push(a,b,a+1,a+1,b,b+1);}}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const inset=mesh(parent,geo,mat);inset.castShadow=false;return inset;
}
function taper(parent,mat,points,radius=.12){
  const path=new THREE.CatmullRomCurve3(points.map(V));const frames=path.computeFrenetFrames(32,false),vertices=[],uv=[],indices=[];
  for(let i=0;i<=32;i++){const t=i/32,p=path.getPointAt(t),r=radius*Math.pow(1-t,.7)+.001;for(let j=0;j<=16;j++){const a=j/16*Math.PI*2,off=frames.normals[i].clone().multiplyScalar(Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r);vertices.push(p.x+off.x,p.y+off.y,p.z+off.z);uv.push(j/16,t);if(i<32&&j<16){const n=i*17+j;indices.push(n,n+17,n+1,n+1,n+17,n+18);}}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return mesh(parent,geo,mat);
}
function eyes(parent,p,{spacing=.27,y=.06,z=.43,size=.13,angle=.13,iris=0x916839}={}){
  const parts=[];const rim=material(0x40392d,{roughness:.48}),white=material(0x372c22,{roughness:.22,clearcoat:1}),irisMat=material(iris,{roughness:.23,clearcoat:1,clearcoatRoughness:.05}),pupil=material(0x101e20,{roughness:.12,clearcoat:1}),shine=new THREE.MeshBasicMaterial({color:0xffffff});
  for(const sign of [-1,1]){const socket=group(parent,[sign*spacing,y,z]);socket.rotation.y=sign*angle;
    oval(socket,p.body,[0,0,-.055],[size*1.21,size*1.29,size*.48]);
    const eye=group(socket);oval(eye,rim,[0,0,-.018],[size*1.02,size*1.15,size*.36]);oval(eye,white,[0,0,-.009],[size,size*1.11,size*.38]);
    oval(eye,irisMat,[0,-size*.025,size*.24],[size*.82,size*.92,size*.17]);oval(eye,pupil,[0,0,size*.38],[size*.49,size*.68,size*.09]);oval(eye,shine,[-size*.24,size*.39,size*.49],[size*.19,size*.23,size*.055]);oval(eye,shine,[size*.25,-size*.23,size*.49],[size*.072,size*.09,size*.03]);
    curve(socket,rim,[[-size*.96,size*.35,size*.3],[-size*.54,size*1.03,size*.25],[size*.15,size*1.13,size*.2],[size*.94,size*.44,size*.29]],size*.055);
    socket.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});parts.push(eye);
  }
  return parts;
}
function flower(parent,mats,pos,size=.1){const f=group(parent,pos);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const petal=leaf(f,mats.ivory,[0,0,0],size*1.9,size*.48,{bend:.018,thickness:.018});petal.rotation.z=a;petal.rotation.x=.16;}oval(f,mats.gold,[0,0,.035],[size*.4,size*.4,.035]);return f;}
function feather(parent,mats,pos,length,width,angle,shade=0){
  const f=group(parent,pos);f.rotation.z=angle;
  leaf(f,mats.feathers[shade%mats.feathers.length],[0,0,0],length,width,{bend:.04,curl:-.07,thickness:.025});
  curve(f,mats.shaft,[[0,.035,.025],[0,length*.48,.065],[0,length*.93,-.02]],.006);
  return f;
}

export const profiles={
 rabbit:{name:'月芽兔',subtitle:'十二生肖 · 温柔又好奇的小伙伴',hint:'耳廓轻摆，眨眼和呼吸都有自己的节奏。'},
 dragon:{name:'青芽龙',subtitle:'十二生肖 · 鳞片与叶翼，随成长舒展',hint:'连续摆尾、柔和扇翼，试着和它打个招呼。'},
 dolphin:{name:'浪花豚',subtitle:'海洋伙伴 · 像一道轻盈的海浪',hint:'尾柄与尾鳍连贯起伏，胸鳍随游动轻摆。'},
 eagle:{name:'逐风鹰',subtitle:'天空伙伴 · 每一层羽翼，都朝向远方',hint:'分层飞羽随振翅展开，目光跟着轻轻转动。'}
};

function palette(kind){
 const base={rabbit:0xdcd2be,dragon:0x5f9e7d,dolphin:0x4c91ad,eagle:0x6b4732}[kind];
 const fur=kind==='rabbit'||kind==='eagle';
 const p={body:material(base,{roughness:fur?.68:.43,sheen:fur?1:.15,sheenColor:new THREE.Color(0xf8e9ca),sheenRoughness:.8,clearcoat:kind==='dolphin'?.5:.1,clearcoatRoughness:.25,bumpMap:surfaceTexture(fur?'fur':'scale'),bumpScale:fur?.014:.007}),ivory:material(0xf2e7cf,{roughness:.65,sheen:.7,sheenColor:new THREE.Color(0xffffff)}),pink:material(0xc88688,{roughness:.65}),dark:material(0x394038,{roughness:.6}),gold:material(0xc39b51,{metalness:.48,roughness:.34}),leaf:material(0x376d54,{roughness:.51}),leafLight:material(0x90b688,{roughness:.55}),horn:material(0xc2a26d,{roughness:.4,bumpMap:surfaceTexture('scale'),bumpScale:.012}),white:material(0xffffff,{roughness:.22})};
 p.feathers=[0x594130,0x765038,0x8c6345,0xa87c53,0xc8a577].map(c=>material(c,{roughness:.65,sheen:.8,sheenColor:new THREE.Color(0xdab994),bumpMap:surfaceTexture('fur'),bumpScale:.007}));p.shaft=material(0x9f805d,{roughness:.65});return p;
}

function rabbit(p,m,g,level){
 sculpt(p.bodyRoot,m.body,[[0,.78,0,.54,.68,.44],[0,.38,-.08,.57,.36,.44],[-.44,.24,.1,.29,.3,.36],[.44,.24,.1,.29,.3,.36],[0,1.23,.035,.3,.4,.29]],{center:[0,.8,0],extent:1.25,blend:.19,colorize:undefined});
 for(const s of [-1,1]){
  const foot=oval(p.bodyRoot,m.body,[s*.4,.145,.38],[.275,.17,.39]);foot.rotation.y=-s*.12;
  for(let i=-1;i<=1;i++)curve(p.bodyRoot,m.horn,[[s*.4+i*.075,.176,.68],[s*.4+i*.075,.19,.65],[s*.4+i*.075,.21,.6]],.0045);
  const arm=group(p.bodyRoot,[s*.42,.94,.13]);taper(arm,m.body,[[0,0,0],[s*.055,-.25,.12],[s*.015,-.51,.24]],.16);oval(arm,m.body,[s*.015,-.48,.23],[.15,.16,.17]);p.arms.push(arm);
 }
 const tail=oval(p.bodyRoot,m.ivory,[0,.43,-.48],[.24,.24,.24]);p.tail.push(tail);
 const head=group(p.bodyRoot,[0,1.59,.095]);p.head=head;
 sculpt(head,m.body,[[0,0,0,.57,.54,.46],[-.27,-.18,.23,.3,.26,.26],[.27,-.18,.23,.3,.26,.26],[0,-.26,.37,.26,.2,.22]],{extent:.88,blend:.14,resolution:62});
 p.eyes=eyes(head,m,{spacing:.285,y:.055,z:.427,size:.133,angle:.26,iris:0x92613c});
 for(const s of [-1,1]){
  const ear=group(head,[s*.255,.36,-.1]);ear.rotation.z=-s*.15;ear.rotation.x=-.08;
  const length=1.04+g*.12;
  leaf(ear,m.body,[0,0,0],length,.205,{bend:.09,curl:-.075,thickness:.093,asym:s*.06});
  earInset(ear,m.pink,length,.205,s*.06);
  curve(ear,m.ivory,[[s*-.07,.25,.075],[s*-.12,.57,.10],[s*.035,.94,.005]],.009);p.ears.push(ear);
  oval(head,m.pink,[s*.37,-.2,.442],[.074,.025,.014]);
  for(let i=0;i<3;i++)curve(head,m.ivory,[[s*.19,-.22-i*.035,.536],[s*.39,-.19-i*.05,.56],[s*(.61+i*.025),-.12-i*.09,.48]],.003);
 }
 const nose=mesh(head,new THREE.SphereGeometry(1,24,16),m.pink,[0,-.225,.574],[.065,.045,.038]);nose.rotation.z=Math.PI;
 curve(head,m.dark,[[0,-.26,.571],[0,-.30,.555],[-.055,-.32,.533]],.006);curve(head,m.dark,[[0,-.30,.555],[.055,-.32,.533]],.006);
 for(let i=-1;i<=1;i++){const tuft=leaf(head,m.ivory,[i*.09,.40,.2],.26,.055,{bend:.05,curl:-.035});tuft.rotation.z=i*.25;}
 if(level>=2){const collar=mesh(p.bodyRoot,new THREE.TorusGeometry(.29,.026,10,72),m.leaf,[0,1.24,.035]);collar.rotation.x=Math.PI/2;
  const charm=group(p.bodyRoot,[0,1.12,.345]);mesh(charm,new THREE.TorusGeometry(.083,.016,10,40),m.gold);oval(charm,m.leafLight,[0,0,0],[.063,.063,.026]);
  for(const s of [-1,1]){const l=leaf(charm,m.leaf,[s*.04,.02,0],.20,.067,{bend:.03});l.rotation.z=s*.8;}}
 if(level>=3){curve(head,m.leaf,[[-.42,.32,.23],[-.21,.47,.29],[.08,.49,.29],[.39,.33,.26]],.018);for(let i=0;i<level-1;i++){const x=(i-(level-2)/2)*.17;flower(head,m,[x,.43-Math.abs(x)*.2,.32],.066+(level-3)*.006);}for(const s of [-1,1]){const l=leaf(head,m.leaf,[s*.32,.3,.27],.27,.08,{bend:.03});l.rotation.z=-s*1.15;}}
}

function dragon(p,m,g,level){
 sculpt(p.bodyRoot,m.body,[[0,.81,0,.59,.78,.49],[0,1.32,.035,.34,.48,.33],[-.46,.23,.03,.32,.3,.38],[.46,.23,.03,.32,.3,.38]],{center:[0,.85,0],extent:1.25,blend:.18});
 // Overlapping belly plates follow the torso rather than making one separate white ball.
 for(let i=0;i<8;i++){const y=.32+i*.13;const w=.34*Math.sqrt(Math.max(.1,1-((y-.79)/.71)**2));oval(p.bodyRoot,m.ivory,[0,y,.42+Math.sin((y-.3)*2.2)*.052],[w,.098,.067]);}
 for(const s of [-1,1]){oval(p.bodyRoot,m.body,[s*.44,.145,.36],[.29,.18,.36]);for(let i=-1;i<=1;i++)taper(p.bodyRoot,m.ivory,[[s*.44+i*.1,.15,.59],[s*.44+i*.1,.095,.71],[s*.44+i*.1,.095,.76]],.041);
  const arm=group(p.bodyRoot,[s*.48,1.05,.14]);taper(arm,m.body,[[0,0,0],[s*.13,-.24,.12],[s*.11,-.43,.21]],.17);oval(arm,m.body,[s*.11,-.42,.22],[.16,.17,.19]);for(let i=-1;i<=1;i++)taper(arm,m.ivory,[[s*.11+i*.057,-.47,.33],[s*.11+i*.057,-.51,.39]],.022);p.arms.push(arm);}
 const head=group(p.bodyRoot,[0,1.75,.10]);p.head=head;
 sculpt(head,m.body,[[0,.02,0,.62,.53,.47],[0,-.19,.35,.43,.28,.35],[-.32,-.17,.22,.3,.28,.3],[.32,-.17,.22,.3,.28,.3]],{extent:.95,blend:.15,resolution:62});
 p.eyes=eyes(head,m,{spacing:.34,y:.065,z:.43,size:.16,angle:.28,iris:0xaa863e});
 curve(head,m.dark,[[-.30,-.28,.575],[-.15,-.32,.657],[0,-.33,.68],[.15,-.32,.657],[.3,-.28,.575]],.009);
 for(const s of [-1,1]){oval(head,m.dark,[s*.17,-.09,.673],[.036,.024,.012]);
  taper(head,m.horn,[[s*.39,.35,-.14],[s*.45,.63,-.18],[s*.57,.82+g*.17,-.28],[s*.54,.92+g*.17,-.39]],.135);
  for(let j=0;j<3;j++){const l=leaf(head,j%2?m.leafLight:m.leaf,[s*(.47+j*.018),.13-j*.13,-.17],.43-j*.055,.14,{bend:.04,curl:-.12});l.rotation.z=-s*(1.0+j*.26);l.rotation.y=s*.35;}
  const brow=leaf(head,m.leaf,[s*.1,.3,.39],.30,.072,{bend:.02});brow.rotation.z=-s*1.2;
 }
 // A continuous taper and a shared deformation field remove the old tail's ball joints.
 const tail=taper(p.bodyRoot,m.body,[[0,.45,-.32],[.12,.32,-.68],[.4,.28,-1.06],[.7,.42,-1.30],[.81,.73,-1.43]],.245);
 const basePositions=tail.geometry.attributes.position.array.slice();p.flex.push({mesh:tail,base:basePositions,kind:'tail'});
 for(const s of [-1,1]){const fin=leaf(p.bodyRoot,m.leaf,[.8,.67,-1.4],.38,.13,{bend:.05});fin.rotation.z=s*.65;fin.rotation.x=-.7;}
 // Webbed wings: curved membrane, connected ribs and softly scalloped edges.
 for(const s of [-1,1]){const wing=group(p.bodyRoot,[s*.46,1.16,-.21]);const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(.25,.62,.62,1.03,1.02,1.16);shape.quadraticCurveTo(.76,.64,1.10,.18);shape.quadraticCurveTo(.76,.32,.71,-.17);shape.quadraticCurveTo(.38,.02,.30,-.32);shape.quadraticCurveTo(.06,-.22,0,0);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.015,bevelEnabled:true,bevelSize:.021,bevelThickness:.021,bevelSegments:3,curveSegments:18,steps:1});const position=geo.attributes.position;for(let i=0;i<position.count;i++){const x=position.getX(i),y=position.getY(i);position.setZ(i,position.getZ(i)+Math.sin(x*2.6)*Math.sin(y*1.8)*.10);}geo.computeVertexNormals();const web=mesh(wing,geo,m.leafLight);web.scale.x=s;
  for(const endpoint of [[1.02,1.16],[1.1,.18],[.71,-.17],[.3,-.32]]){curve(wing,m.body,[[0,0,.04],[s*.36,.38,.12],[s*endpoint[0],endpoint[1],.04]],.031);}
  wing.scale.setScalar(.48+g*.40);p.wings.push(wing);}
 for(let row=0;row<5;row++)for(const s of [-1,1]){for(let j=0;j<3;j++){const y=.65+row*.145,x=s*(.44+j*.035),z=.23-j*.15;const scale=leaf(p.bodyRoot,row%2?m.leaf:m.body,[x,y,z],.15,.065,{bend:.02,thickness:.015});scale.rotation.z=-s*.55;scale.rotation.y=s*.7;}}
 for(let i=0;i<5;i++){const spike=leaf(p.bodyRoot,m.leaf,[0,1.35-i*.2,-.4],.24+g*.12,.11,{bend:-.06});spike.rotation.x=-.7;}
 if(level>=4){for(let i=-1;i<=1;i++){const jewel=mesh(head,new THREE.OctahedronGeometry(.065),m.gold,[i*.14,.34-Math.abs(i)*.04,.37]);jewel.scale.z=.38;}}
}

function dolphin(p,m,g,level){
 p.baseY=.70;p.bodyRoot.position.y=p.baseY;
 // One smoothly lofted body includes the forehead, rostrum and narrow tail peduncle.
 const samples=[[-1.65,.12,.1,.56],[-1.28,.18,.16,.57],[-.82,.32,.29,.61],[-.30,.46,.40,.66],[.3,.46,.42,.70],[.72,.38,.35,.74],[.96,.26,.23,.69],[1.10,.17,.12,.58],[1.48,.115,.085,.57],[1.61,.008,.008,.57]];
 const profilesCurve=new THREE.CatmullRomCurve3(samples.map(s=>new THREE.Vector3(s[0],s[1],s[2])));
 const centerCurve=new THREE.CatmullRomCurve3(samples.map(s=>new THREE.Vector3(s[0],s[3],0)));
 const verts=[],normColors=[],uv=[],indices=[],back=new THREE.Color(0x3a7c9b),belly=new THREE.Color(0xc1dce0);
 for(let i=0;i<=100;i++){const t=i/100,section=profilesCurve.getPoint(t),center=centerCurve.getPoint(t);for(let j=0;j<=48;j++){const angle=j/48*Math.PI*2;const x=Math.cos(angle)*Math.max(.001,section.y),y=center.y+Math.sin(angle)*Math.max(.001,section.z);verts.push(x,y,section.x);uv.push(j/48,t);const c=back.clone().lerp(belly,1-smooth(-.75,.12,Math.sin(angle)));normColors.push(c.r,c.g,c.b);if(i<100&&j<48){const n=i*49+j;indices.push(n,n+1,n+49,n+1,n+50,n+49);}}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(normColors,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
 const skin=material(0xffffff,{vertexColors:true,roughness:.42,clearcoat:.42,clearcoatRoughness:.32,metalness:0});const body=mesh(p.bodyRoot,geo,skin);p.flex.push({mesh:body,base:geo.attributes.position.array.slice(),kind:'swim'});
 const face=group(p.bodyRoot,[0,.75,.75]);p.eyes=eyes(face,m,{spacing:.353,y:.015,z:.04,size:.074,angle:1.02,iris:0x3e625d});
 for(const s of [-1,1])curve(p.bodyRoot,m.dark,[[s*.13,.52,1.50],[s*.17,.50,1.18],[s*.25,.5,.98],[s*.31,.56,.84]],.006);
 oval(p.bodyRoot,m.dark,[0,1.055,.43],[.049,.009,.08]);
 const dorsal=group(p.bodyRoot,[0,.97,-.28]);const ds=new THREE.Shape();ds.moveTo(0,0);ds.bezierCurveTo(.17,.12,.12,.48,-.19,.66);ds.bezierCurveTo(-.11,.27,-.31,.14,-.46,0);ds.closePath();const dg=new THREE.ExtrudeGeometry(ds,{depth:.018,bevelEnabled:true,bevelThickness:.017,bevelSize:.02,bevelSegments:3,curveSegments:24});const dm=mesh(dorsal,dg,m.body);dm.rotation.y=Math.PI/2;
 for(const s of [-1,1]){const fin=group(p.bodyRoot,[s*.31,.47,.35]);const f=leaf(fin,m.body,[0,0,0],.79+g*.1,.19,{bend:.025,curl:-.22,asym:s*.09,thickness:.035});f.rotation.z=-s*1.8;f.rotation.y=s*.55;p.wings.push(fin);}
 const tail=group(p.bodyRoot,[0,.56,-1.48]);for(const s of [-1,1]){const fluke=leaf(tail,m.body,[s*.015,0,-.06],.71,.235,{bend:.06,curl:-.15,asym:s*.11,thickness:.029});fluke.rotation.x=Math.PI/2;fluke.rotation.z=-s*1.02;}p.tail.push(tail);
 if(level>=3){for(const s of [-1,1])for(let i=0;i<5;i++){const z=.36-i*.15;const dot=mesh(p.bodyRoot,new THREE.OctahedronGeometry(.021+(4-i)*.003),m.gold,[s*.34,.89,z]);dot.rotation.z=.4;}}
 if(level>=4){const necklace=curve(p.bodyRoot,m.gold,[[-.39,.67,.53],[-.31,.40,.62],[0,.31,.67],[.31,.40,.62],[.39,.67,.53]],.012);const jewel=mesh(p.bodyRoot,new THREE.OctahedronGeometry(.065),m.leafLight,[0,.27,.71]);jewel.scale.y=1.35;}
}

function eagle(p,m,g,level){
 p.baseY=.62;p.bodyRoot.position.y=p.baseY;
 sculpt(p.bodyRoot,m.body,[[0,.71,0,.42,.59,.34],[0,1.14,.055,.26,.32,.25],[0,.33,-.16,.32,.30,.35]],{center:[0,.75,0],extent:1.0,blend:.15,resolution:58});
 // Layered chest and neck coverts give a feather silhouette at every stage.
 for(let row=0;row<7;row++)for(let j=-2;j<=2;j++){const width=.29*(1-row*.065),x=j*width/2+(row%2?.026:0),y=1.05-row*.112,z=.315+Math.sin(row*.46)*.025;const f=leaf(p.bodyRoot,row<2?m.ivory:m.feathers[(row+j+6)%3+1],[x,y,z],.235,.065,{bend:.015,curl:.01,thickness:.011});f.rotation.z=Math.PI+j*-.10;}
 const head=group(p.bodyRoot,[0,1.36,.1]);p.head=head;
 sculpt(head,m.ivory,[[0,.03,0,.39,.39,.35],[0,-.16,.13,.32,.23,.28]],{extent:.66,blend:.12,resolution:58});
 p.eyes=eyes(head,m,{spacing:.215,y:.035,z:.284,size:.087,angle:.42,iris:0xbf8f32});
 for(const s of [-1,1]){curve(head,m.ivory,[[s*.08,.15,.30],[s*.23,.14,.344],[s*.34,.14,.26]],.032);
  for(let j=0;j<4;j++){const f=leaf(head,m.ivory,[s*(.24+j*.018),-.05-j*.075,.08],.24,.065,{bend:.03});f.rotation.z=Math.PI+s*.47;f.rotation.y=s*.4;}}
 taper(head,m.gold,[[0,-.055,.3],[0,-.045,.47],[0,-.14,.57],[0,-.25,.49]],.12);curve(head,m.dark,[[-.10,-.145,.435],[0,-.19,.5],[.10,-.145,.435]],.005);
 for(const s of [-1,1]){const leg=group(p.bodyRoot,[s*.18,.24,.07]);taper(leg,m.gold,[[0,0,0],[0,-.22,.03],[0,-.33,.10]],.054);for(let j=-1;j<=1;j++){taper(leg,m.gold,[[0,-.29,.10],[j*.07,-.35,.23],[j*.095,-.34,.33]],.028);taper(leg,m.dark,[[j*.095,-.34,.30],[j*.10,-.37,.36],[j*.10,-.41,.345]],.020);}for(let j=0;j<4;j++){const ring=mesh(leg,new THREE.TorusGeometry(.051,.006,6,16),m.horn,[0,-.08-j*.045,.013]);ring.rotation.x=Math.PI/2;}
  const wing=group(p.bodyRoot,[s*.3,1.03,-.025]);
  const shoulder=leaf(wing,m.body,[0,0,0],.96,.29,{bend:.065,curl:-.09});shoulder.rotation.z=-s*1.28;
  for(let i=0;i<9;i++){const f=feather(wing,m,[s*(.30+i*.102),.025-i*.027,-.025-i*.027],.63+(i/8)*.20,.11,-s*(1.65+i*.08),i);}
  for(let i=0;i<7;i++)feather(wing,m,[s*(.16+i*.13),.055,-.008],.43,.10,-s*(1.88+i*.05),i+2);
  for(let i=0;i<5;i++)feather(wing,m,[s*(.10+i*.13),.10,.045],.26,.083,-s*1.65,i+3);
  wing.scale.setScalar(.77+g*.17);p.wings.push(wing);
 }
 const tail=group(p.bodyRoot,[0,.32,-.2]);for(let i=-2;i<=2;i++){const f=feather(tail,m,[i*.07,0,0],.63-Math.abs(i)*.05,.11,Math.PI+i*.18,i+2);f.rotation.x=.85;}p.tail.push(tail);
 if(level>=3){for(let i=-1;i<=1;i++){const plume=leaf(head,m.ivory,[i*.09,.31,-.08],.22+g*.06,.052,{bend:.01});plume.rotation.z=i*-.2;plume.rotation.x=-1.1;}curve(p.bodyRoot,m.gold,[[-.28,.99,.25],[0,.82,.4],[.28,.99,.25]],.013);mesh(p.bodyRoot,new THREE.OctahedronGeometry(.055),m.gold,[0,.79,.4]);}
}

export function makePet(scene,kind,level){
 const root=group(scene),bodyRoot=group(root),growth=(level-1)/4;
 root.scale.setScalar(.85+growth*.19);
 const p={root,bodyRoot,kind,growth,eyes:[],ears:[],wings:[],tail:[],arms:[],flex:[],head:null,baseY:0};
 const m=palette(kind);p.materials=Object.values(m).flat();
 ({rabbit,dragon,dolphin,eagle}[kind])(p,m,growth,level);
 return p;
}

export function animatePet(p,t,dt,greeting){
 const excited=greeting>0;const envelope=excited?Math.sin(Math.min(1,greeting/2.4)*Math.PI):0;
 const hop=excited?Math.abs(Math.sin(greeting*6.8))*envelope*.22:0;
 const airborne=p.kind==='eagle'||p.kind==='dolphin';
 p.bodyRoot.position.y=p.baseY+Math.sin(t*(airborne?1.8:1.4))*(airborne?.043:.008)+hop;
 p.bodyRoot.rotation.z=Math.sin(t*.9)*.015;
 p.bodyRoot.rotation.x=p.kind==='dolphin'?Math.sin(t*1.8)*.045:0;
 p.bodyRoot.scale.y=1+Math.sin(t*2.05)*.007;
 if(p.head){p.head.rotation.z=Math.sin(t*.73)*.035+envelope*Math.sin(t*7)*.025;p.head.rotation.y=Math.sin(t*.49)*.075;p.head.rotation.x=Math.sin(t*.9)*.022;}
 const phase=t%5.6,blink=phase<.19?Math.max(.07,Math.abs(phase-.095)/.095):1;
 p.eyes.forEach(e=>e.scale.y=blink);
 p.ears.forEach((ear,i)=>{const s=i?1:-1;ear.rotation.z=-s*.15+Math.sin(t*1.7+i)*.045+envelope*Math.sin(t*7+i)*.1;ear.rotation.x=-.08+Math.sin(t*.85+i)*.055;});
 p.wings.forEach((wing,i)=>{const s=i?1:-1;const speed=p.kind==='eagle'?(excited?7:2.6):p.kind==='dolphin'?1.8:1.6;const amount=p.kind==='eagle'?.31:p.kind==='dolphin'?.13:.12;wing.rotation.z=s*(Math.sin(t*speed)*amount+(p.kind==='eagle'?.05:0));wing.rotation.y=s*Math.sin(t*speed-.4)*.06;});
 p.arms.forEach((arm,i)=>{arm.rotation.z=excited&&i===1?-.4+Math.sin(t*9)*.27:Math.sin(t*1.5+i)*.026;});
 p.tail.forEach(part=>{part.rotation.x=Math.sin(t*(p.kind==='dolphin'?2.5:1.7))*(p.kind==='dolphin'?.15:.055);});
 for(const f of p.flex){const a=f.mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=f.base[i*3],y=f.base[i*3+1],z=f.base[i*3+2];if(f.kind==='swim'){const strength=Math.max(0,-z-.20);a.setY(i,y+Math.sin(t*2.5+z*.85)*strength*strength*.065);}else{const strength=Math.max(0,-z-.35);a.setX(i,x+Math.sin(t*1.8+z*1.3)*strength*.10);}}a.needsUpdate=true;}
}
export function disposePet(scene,p){const geometries=new Set(),materials=new Set(p.materials);p.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.remove(p.root);}
