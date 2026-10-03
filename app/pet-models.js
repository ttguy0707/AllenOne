import * as T from 'three';
import {group,mesh,oval,curve,sculpt,leaf,taper,eyes,feather,palette,material,profileTube,makePet as original,animatePet as animateOriginal,disposePet} from './model-kit.js';
import {petInfo} from './catalog.js';
import {finishPet} from './model-finishing.js';
export {disposePet};
function part(p,g,axis,amplitude,speed,phase=0){p.motion.push({g,axis,base:g.rotation[axis],amplitude,speed,phase});return g;}
function branch(p,m,y=.6){curve(p.bodyRoot,m.horn,[[-1,y-.1,-.15],[-.4,y,.02],[.5,y,.1],[1,y+.2,.05]],.085);for(let i=0;i<3;i++){const l=leaf(p.bodyRoot,m.leaf,[.6+i*.12,y+.1,.04],.3,.09);l.rotation.z=-1-i*.2;}}
function face(p,m,pos,size=.4){const h=group(p.bodyRoot,pos);sculpt(h,m.body,[[0,0,0,size,size*.95,size*.85],[0,-size*.3,size*.5,size*.7,size*.45,size*.55]],{extent:size*1.5,blend:.09,resolution:38});p.eyes=eyes(h,m,{spacing:size*.5,y:size*.12,z:size*.72,size:size*.19,angle:.32});p.head=h;return h;}
function land(p,m,id,g){
 const sitting=['rat','monkey'].includes(id),low=['tiger','dog'].includes(id),pig=id==='pig';
 if(sitting){sculpt(p.bodyRoot,m.body,[[0,.65,0,.42,.55,.35],[0,.3,-.05,.46,.28,.38]],{center:[0,.6,0],extent:.95,resolution:40,blend:.16});const h=face(p,m,[0,1.3,.12],id==='rat'?.38:.43);
  for(const s of [-1,1]){oval(h,m.body,[s*.38,.19,-.02],[.2,.24,.09]);oval(h,m.pink,[s*.39,.19,.052],[.14,.16,.025]);const a=group(p.bodyRoot,[s*.31,.87,.08]);taper(a,m.body,[[0,0,0],[s*.1,-.2,.17],[s*(id==='rat'?-.1:.16),-.21,.38]],.095);part(p,a,'z',.08,1.4,s);const leg=group(p.bodyRoot,[s*.28,.32,.13]);profileTube(leg,m.body,[[0,0,0],[s*.07,-.15,.2],[s*.08,-.22,.45]],[.16,.12,.075]);oval(leg,m.body,[s*.08,-.22,.45],[.10,.07,.14]);part(p,leg,'x',id==='monkey'?.18:.015,1.8,s);}
  const tail=group(p.bodyRoot);taper(tail,id==='rat'?m.pink:m.body,[[0,.35,-.25],[.45,.1,-.5],[.8,.07,-.22],[.9,.1,.35],[.6,.15,.7]],.065);part(p,tail,'y',.06,1.2);
  if(id==='rat'){oval(p.bodyRoot,m.horn,[0,.65,.57],[.22,.28,.22]);oval(p.bodyRoot,m.dark,[0,.85,.57],[.235,.10,.235]);taper(p.bodyRoot,m.horn,[[0,.92,.57],[.04,1.02,.57]],.03);oval(h,m.pink,[0,-.1,.39],[.07,.05,.05]);}else{branch(p,m,.04);p.bodyRoot.position.y=.45;oval(h,m.ivory,[0,-.11,.34],[.25,.2,.07]);}
  p.bodyRoot.rotation.y=id==='rat'?-.45:.22;return;
 }
 const y=id==='dog'?.82:low?.58:.9,headZ=.83,headY=id==='dog'?.42:id==='tiger'?.55:id==='horse'?1.5:id==='goat'?1.22:.99;
 const torso=id==='dog'?[[0,.86,-.4,.42,.43,.49],[0,.57,.24,.34,.28,.52]]:[[0,y,-.15,.45,.43,.85],[0,y+.06,.4,.35,.38,.38]];
 for(const side of [-1,1])for(const end of [-1,1])torso.push([side*.29,id==='dog'?(end===1?.43:.76):y-.13,end*.53,.20,.24,.23]);
 sculpt(p.bodyRoot,m.body,torso,{center:[0,y,0],extent:1.35,resolution:44,blend:.18});
 for(const s of [-1,1])for(const end of [-1,1]){const z=end*.56,front=end===1;const leg=group(p.bodyRoot,[s*.32,y-.13,z]);const h=low?(front?.27:.51):y-.15;
  profileTube(leg,m.body,[[0,0,0],[s*.035,-h*.43,front&&low?.20:0],[s*.025,-h+.05,front&&low?.55:.08]],[pig?.18:.15,pig?.13:.105,pig?.095:.08]);oval(leg,['ox','horse','goat'].includes(id)?m.dark:m.body,[s*.025,-h+.025,front&&low?.55:.12],[.15,.10,.21]);
  if(id==='horse'&&front&&s===1){leg.rotation.x=-.8;part(p,leg,'x',.06,1.2);}if(id==='goat'&&front){leg.position.y+=.18;leg.rotation.x=-.15;}if(id==='dog'){if(front){leg.position.y=.31;part(p,leg,'x',.06,2.4,s);}else{leg.scale.y=1.45;leg.position.y=.78;}}
 }
 if(['horse','goat'].includes(id))profileTube(p.bodyRoot,m.body,[[0,y,.3],[0,headY-.15,.58],[0,headY,.78]],[.30,.21,.19]);
 const head=face(p,m,[0,headY,headZ],id==='horse'?.31:.37);head.rotation.y=id==='horse'?-.45:id==='ox'?.2:.0;
 for(const s of [-1,1]){const e=leaf(head,id==='pig'?m.pink:m.body,[s*.27,.22,-.02],id==='dog'?.43:.26,.12,{bend:.09,thickness:.06});e.rotation.z=s*(id==='dog'?2.5:.65);part(p,e,'z',.035,1.7,s);}
 if(['ox','goat'].includes(id))for(const s of [-1,1]){const points=id==='ox'?[[s*.2,.25,-.05],[s*.45,.36,-.06],[s*.52,.62,-.1]]:[[s*.23,.25,-.06],[s*.45,.48,-.16],[s*.38,.58,-.42],[s*.2,.39,-.47],[s*.32,.26,-.29]];taper(head,m.horn,points,.11+g*.035);}
 if(id==='pig'){oval(head,m.pink,[0,-.09,.35],[.23,.16,.10]);for(const s of [-1,1])oval(head,m.dark,[s*.075,-.075,.437],[.033,.04,.012]);p.bodyRoot.rotation.z=1.35;p.bodyRoot.position.y=.42;}
 else oval(head,m.dark,[0,-.11,.36],[.13,.075,.075]);
 const tail=group(p.bodyRoot,[0,y,-.8]);taper(tail,m.body,[[0,0,0],[.12,.1,-.3],[.3,.28,-.48],[.35,.50,-.42]],id==='dog'?.14:.065);part(p,tail,'y',id==='dog'?.55:.14,id==='dog'?6:1.7);

 if(id==='horse'){for(let i=0;i<8;i++){const tuft=leaf(p.bodyRoot,m.dark,[0,1.44-i*.075,.68-i*.062],.3,.075);tuft.rotation.x=-1;}taper(tail,m.dark,[[.1,.1,-.1],[.12,-.2,-.3],[.1,-.5,-.25]],.16);}
 if(id==='goat'){const rock=mesh(p.root,new T.DodecahedronGeometry(.54,1),m.horn,[0,.10,.65],[1,.65,1]);}
 p.bodyRoot.rotation.y=-.55;
}
function serpent(p,m,id,g){
 if(id==='snake'){const pts=[];for(let i=0;i<45;i++){const a=i/44*Math.PI*4.2,r=.70-i*.007;pts.push([Math.cos(a)*r,.18+i*.004,Math.sin(a)*r]);}pts.push([.15,.7,.1],[.08,1.1,.33]);curve(p.bodyRoot,m.body,pts,.135);const head=face(p,m,[.08,1.12,.38],.25);for(let i=0;i<12;i++){const a=i*.52;oval(p.bodyRoot,m.gold,[Math.cos(a)*.65,.30,Math.sin(a)*.65],[.05,.015,.065]);}part(p,head,'z',.08,1.1);return;}
 const pts=[[-.92,.35,-.32],[-.5,.55,-.65],[.18,.72,-.6],[.48,1.03,-.25],[.23,1.38,.1],[-.26,1.57,.05],[-.42,1.86,.12],[-.1,2.1,.35]];
 curve(p.bodyRoot,m.body,pts,.185);taper(p.bodyRoot,m.body,[pts[0],[-1.12,.25,-.1],[-1.3,.43,.15]],.18);
 const h=face(p,m,[-.07,2.09,.41],.35);for(const s of [-1,1]){taper(h,m.horn,[[s*.2,.25,-.06],[s*.3,.49,-.18],[s*.22,.70,-.3]],.085);taper(h,m.gold,[[s*.2,-.16,.26],[s*.53,-.23,.42],[s*.7,-.03,.35]],.014);const arm=group(p.bodyRoot,[s*.22,1.40,.10]);taper(arm,m.body,[[0,0,0],[s*.3,-.1,.15],[s*.35,-.3,.37]],.09);for(let j=-1;j<=1;j++)taper(arm,m.ivory,[[s*.35+j*.04,-.3,.37],[s*.40+j*.04,-.35,.47]],.025);part(p,arm,'x',.10,1.5,s);}
 p.floating=true;p.bodyRoot.rotation.y=-.3;
}
function bird(p,m,id,g){
 const crane=id==='crane',penguin=id==='penguin',owl=id==='owl',peacock=id==='peacock';
 const bodyY=crane?1.1:.68;sculpt(p.bodyRoot,m.body,[[0,bodyY,0,.36,crane?.36:.51,.33],[0,bodyY-.2,-.1,.3,.28,.33]],{center:[0,bodyY,0],extent:.85,resolution:40,blend:.15});oval(p.bodyRoot,m.ivory,[0,bodyY-.01,.26],[.26,.35,.075]);
 let hy=bodyY+.48,hz=.10;if(crane){profileTube(p.bodyRoot,m.ivory,[[0,bodyY,.22],[0,1.5,.23],[0,1.75,.04],[0,1.95,.17]],[.10,.072,.065,.072]);hy=2.0;hz=.2;}
 const h=face(p,m,[0,hy,hz],crane?.19:owl?.38:.29);if(id==='rooster')h.rotation.y=-.65;if(owl)for(const s of [-1,1])oval(h,m.ivory,[s*.17,0,.24],[.19,.23,.06]);
 if(owl)p.eyes=eyes(h,m,{spacing:.17,y:0,z:.31,size:.11});
 taper(h,crane?m.dark:m.gold,[[0,-.05,.22],[0,-.08,crane?.75:.43],[0,-.18,crane?.8:.40]],crane?.06:.09);
 for(const s of [-1,1]){const leg=group(p.bodyRoot,[s*.14,bodyY-.35,0]);const len=crane?.67:.24;taper(leg,m.gold,[[0,0,0],[0,-len*.65,.025],[0,-len,.05]],.028);for(let j=-1;j<=1;j++)taper(leg,m.gold,[[0,-len,.05],[j*.07,-len-.025,.20]],.024);if(crane&&s===1)leg.rotation.x=-1.3;if(id==='rooster'&&s===1){leg.rotation.x=-.55;leg.position.y+=.04;}if(penguin)oval(leg,m.gold,[0,-len,.12],[.11,.035,.17]);
  const wing=group(p.bodyRoot,[s*.3,bodyY+.15,0]);if(penguin){const f=leaf(wing,m.body,[0,0,0],.58,.12,{thickness:.035});f.rotation.z=Math.PI+s*.52;}else for(let i=0;i<7;i++){const f=feather(wing,m,[s*.01,0,-i*.025],.53-i*.015,.075,Math.PI+s*(.25+i*.065),i);f.rotation.y=s*.3;}part(p,wing,'z',penguin?.06:.035,1.6,s);p.wings.push(wing);
 }
 if(!penguin){const tail=group(p.bodyRoot,[0,bodyY-.24,-.24]);if(peacock){tail.rotation.x=-.12;for(let i=-7;i<=7;i++){const f=feather(tail,m,[0,0,0],1.6+g*.28,.11,-i*.15,i);f.rotation.x=-.16;const dot=oval(f,m.gold,[0,1.40+g*.18,.07],[.075,.12,.024]);oval(f,m.leaf,[0,1.42+g*.18,.095],[.04,.07,.014]);}part(p,tail,'y',.04,.8);}else for(let i=-2;i<=2;i++){const f=feather(tail,m,[i*.045,0,0],id==='parrot'?.9:id==='rooster'?.95:.45,.09,Math.PI+i*.18,i);f.rotation.x=id==='rooster'?2.6:.55;} }
 if(['owl','parrot'].includes(id)){branch(p,m,.03);p.bodyRoot.position.y=.35;}if(id==='rooster'){for(let i=0;i<4;i++)oval(h,m.pink,[0,.23+i*.025,-.13+i*.095],[.045,.15,.085]);oval(h,m.pink,[0,-.27,.15],[.07,.12,.055]);}if(peacock)for(let i=-1;i<=1;i++)taper(h,m.leaf,[[i*.045,.22,0],[i*.08,.50,-.03]],.023);
 p.bodyRoot.rotation.y=id==='parrot'?-.6:peacock?.45:crane?-.4:.08;if(id==='parrot')p.bodyRoot.rotation.x=.16;if(penguin)p.bodyRoot.rotation.x=.12;
}
function sea(p,m,id,g){p.floating=true;
 if(id==='whale'){sculpt(p.bodyRoot,m.body,[[0,.85,0,.51,.48,1.1],[0,.78,.7,.49,.37,.55],[0,.77,-.9,.22,.21,.55]],{center:[0,.9,0],extent:1.8,resolution:48,blend:.2});p.eyes=eyes(p.bodyRoot,m,{spacing:.46,y:.88,z:.73,size:.057,angle:1.1});for(const s of [-1,1]){const f=leaf(p.bodyRoot,m.body,[s*.38,.64,.25],.75,.17,{curl:-.2});f.rotation.z=-s*1.9;part(p,f,'z',.1,.9,s);const tail=leaf(p.bodyRoot,m.body,[0,.8,-1.3],.7,.23);tail.rotation.x=Math.PI/2;tail.rotation.z=s*1.05;part(p,tail,'x',.1,1.2);}for(let i=-2;i<=2;i++)curve(p.bodyRoot,m.ivory,[[i*.075,.50,1.02],[i*.12,.4,.60],[i*.13,.42,.1]],.008);p.bodyRoot.rotation.y=-.7;return;}
 if(id==='turtle'){oval(p.bodyRoot,m.body,[0,.75,0],[.68,.30,.83]);oval(p.bodyRoot,m.horn,[0,.83,-.06],[.62,.34,.73]);for(let i=0;i<12;i++){const a=i*Math.PI*2/12;const tile=mesh(p.bodyRoot,new T.CylinderGeometry(.17,.18,.035,6),i%2?m.leaf:m.horn,[Math.cos(a)*.43,1.01,Math.sin(a)*.50]);tile.rotation.z=-Math.cos(a)*.36;tile.rotation.x=Math.sin(a)*.36;}mesh(p.bodyRoot,new T.CylinderGeometry(.25,.25,.04,6),m.leaf,[0,1.18,-.02]);face(p,m,[0,.72,.86],.22);for(const s of [-1,1])for(const z of [-1,1]){const fin=group(p.bodyRoot,[s*.44,.65,z*.4]);const f=leaf(fin,m.body,[0,0,0],z===1?.82:.52,.20,{bend:.04});f.rotation.set(-Math.PI/2,0,-s*1.6);fin.rotation.y=s*z*.6;part(p,fin,'z',.13,1.4,z+s);}p.bodyRoot.rotation.y=.65;p.bodyRoot.rotation.x=.12;return;}
 if(id==='ray'){oval(p.bodyRoot,m.body,[0,.9,0],[.39,.13,.7]);for(const s of [-1,1]){const wing=group(p.bodyRoot,[s*.12,.9,.10]);const surface=leaf(wing,m.body,[0,0,0],1.35,.64,{bend:.06,thickness:.055,curl:-.10});surface.rotation.set(-Math.PI/2,0,-s*Math.PI/2);part(p,wing,'z',.17,1.6,s*.4);}taper(p.bodyRoot,m.body,[[0,.88,-.5],[0,.80,-1.2],[.2,.85,-1.8]],.07);p.eyes=eyes(p.bodyRoot,m,{spacing:.20,y:.97,z:.49,size:.055,angle:.4});p.bodyRoot.rotation.z=.12;p.bodyRoot.rotation.y=-.35;return;}
 if(id==='octopus'){oval(p.bodyRoot,m.body,[0,.87,0],[.48,.59,.43]);p.eyes=eyes(p.bodyRoot,m,{spacing:.23,y:.79,z:.37,size:.10});for(let i=0;i<8;i++){const a=i/8*Math.PI*2,arm=group(p.bodyRoot);const pts=[[Math.cos(a)*.23,.45,Math.sin(a)*.23],[Math.cos(a)*.55,.18,Math.sin(a)*.55],[Math.cos(a)*.92,.13,Math.sin(a)*.92],[Math.cos(a+.35)*1.1,i===2?.62:.25,Math.sin(a+.35)*1.1]];taper(arm,m.body,pts,.17);for(let j=0;j<5;j++){const r=.48+j*.105;oval(arm,m.pink,[Math.cos(a)*r,.22,Math.sin(a)*r],[.052,.032,.052]);}part(p,arm,'y',.045,1.4,i*.8);}p.floating=false;return;}
 if(id==='jellyfish'){const glass=material(0xc5b1dc,{transparent:true,opacity:.72,roughness:.22,metalness:.05,side:T.DoubleSide});mesh(p.bodyRoot,new T.SphereGeometry(.65,48,24,0,Math.PI*2,0,Math.PI*.58),glass,[0,1.65,0],[1,.75,1]);oval(p.bodyRoot,m.pink,[0,1.65,0],[.3,.18,.3]);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,t=group(p.bodyRoot,[Math.cos(a)*.42,1.5,Math.sin(a)*.42]);const pts=[];for(let j=0;j<8;j++)pts.push([Math.sin(j*.8+i)*.07,-j*.14,Math.cos(j*.7+i)*.05]);taper(t,i%2?m.ivory:m.pink,pts,.027);part(p,t,'z',.07,1.1,i);}p.materials.push(glass);}
}
export function createPet(scene,id,level=3){
 let p;if(['rabbit','dolphin','eagle'].includes(id)){p=original(scene,id,level);p.original=true;p.motion=[];
  if(id==='rabbit'){p.bodyRoot.rotation.y=-.62;p.bodyRoot.rotation.x=.13;p.ears[0].rotation.z=1.0;p.arms.forEach(a=>a.rotation.x=-.12);}
  if(id==='dolphin'){p.bodyRoot.rotation.y=-.9;p.bodyRoot.rotation.z=-.18;}
  if(id==='eagle'){p.bodyRoot.rotation.x=.62;p.bodyRoot.rotation.z=-.22;p.bodyRoot.rotation.y=.4;}
 }else{const root=group(scene),bodyRoot=group(root);p={root,bodyRoot,kind:id,motion:[],eyes:[],wings:[],materials:[],head:null};const m=palette('rabbit');m.body.color.set(petInfo(id).color);m.feathers.forEach((f,i)=>f.color.set(petInfo(id).color).offsetHSL((i-2)*.015,0,(i-2)*.055));p.materials=Object.values(m).flat();const g=(level-1)/4;if(['snake','dragon'].includes(id))serpent(p,m,id,g);else if(['rat','ox','tiger','horse','goat','monkey','dog','pig'].includes(id))land(p,m,id,g);else if(['rooster','owl','crane','parrot','peacock','penguin'].includes(id))bird(p,m,id,g);else sea(p,m,id,g);
  if(level>=4&&id!=='jellyfish'){const charm=mesh(bodyRoot,new T.OctahedronGeometry(.07+g*.015),m.gold,[0,.65,.45]);charm.rotation.z=.4;}
 }
 finishPet(p,level);
 p.pose=p.bodyRoot.rotation.clone();p.origin=p.bodyRoot.position.clone();p.headPose=p.head?.rotation.clone();p.root.scale.setScalar(.79+(level-1)*.055);p.level=level;return p;
}
export function animate(p,t,dt,greeting){
 const e=greeting>0?Math.sin(greeting/2.4*Math.PI):0;
 if(p.original){animateOriginal(p,t,dt,greeting);p.bodyRoot.rotation.copy(p.pose);if(p.kind==='rabbit'){p.ears[0].rotation.z=1+Math.sin(t*1.8)*.08;p.ears[1].rotation.z=-.13+Math.sin(t*.8)*.04;p.arms.forEach(a=>a.rotation.x=-.12);p.bodyRoot.position.x=Math.sin(greeting*3)*e*.12;}if(p.kind==='eagle'){p.wings.forEach((w,i)=>w.rotation.z=(i?1:-1)*(Math.sin(t*.85)*.055+e*Math.sin(t*5)*.3));p.bodyRoot.rotation.z+=Math.sin(t*.7)*.09;}if(p.kind==='dolphin')p.bodyRoot.rotation.x=Math.sin(t*1.4)*.1;return;}
 p.bodyRoot.position.copy(p.origin);p.bodyRoot.rotation.copy(p.pose);p.bodyRoot.position.y+=Math.sin(t*(p.floating?.9:1.6))*(p.floating?.08:.008)+e*.10;
 p.bodyRoot.scale.y=1+Math.sin(t*(p.kind==='jellyfish'?2.4:1.8))*(p.kind==='jellyfish'?.065:.008);
 if(p.head){p.head.rotation.copy(p.headPose);p.head.rotation.y+=Math.sin(t*.7)*(['owl','parrot'].includes(p.kind)?.23:.04);p.head.rotation.z+=e*.1;}
 const blink=t%5<.16?Math.max(.08,Math.abs(t%5-.08)/.08):1;p.eyes.forEach(o=>o.scale.y=blink);
 for(const a of p.motion)a.g.rotation[a.axis]=a.base+Math.sin(t*a.speed+a.phase)*a.amplitude*(1+e*1.4);
 if(p.kind==='penguin')p.bodyRoot.rotation.z+=Math.sin(t*2)*.1;if(p.kind==='pig')p.bodyRoot.rotation.z+=e*.18;
}
