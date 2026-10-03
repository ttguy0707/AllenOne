import {ANIMATIONS} from './pet-animation.js';
import {petInfo} from './catalog.js';
// Canvas 2D plays baked transparent poses, with no WebGL, model or orbit camera.
export function mountPet(host,id,level=3){
 const asset=ANIMATIONS[id],info=petInfo(id),stage=Math.max(1,Math.min(5,Number(level)||1));
 if(!asset.available){
  host.innerHTML='<div class="animation-unavailable"><span>✧</span><p>'+info.name+'的动画待补充</p><small>伙伴与成长进度照常保留</small></div>';
  host.dataset.ready=id;host.dataset.renderer='unavailable';host.dataset.theme=document.documentElement.dataset.theme||'light';
  host.closest('.hero')?.querySelectorAll('.pet-controls button').forEach(b=>b.disabled=true);
  return {setTheme(theme){host.dataset.theme=theme;},greet(){},pause(){return true;},dispose(){host.replaceChildren();}};
 }
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches,disposed=false,loaded=false,raf=0,last=0,lastPaint=0,time=0,greeting=-1;
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),atlas=new Image();
 const status=document.createElement('span');status.className='animation-status';status.textContent='伙伴正在走来…';status.setAttribute('role','status');
 canvas.className='companion-canvas';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',info.name+'的立体逐帧动画');
 host.dataset.renderer='prerendered';host.dataset.stage=String(stage);host.dataset.motion=paused?'paused':'idle';
 host.replaceChildren(canvas,status);
 let width=1,height=1,dpr=1;
 function setTheme(theme){host.dataset.theme=theme;draw();}
 function resize(){const rect=host.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw();}
 function pose(){
  const mature=stage>=4,base=mature?8:0;
  if(greeting>=0){
   const elapsed=time-greeting;
   if(elapsed>=1500){greeting=-1;host.dataset.motion=paused?'paused':'idle';}
   else if(!mature){const sequence=[0,4,5,6,6,5,7,0];return sequence[Math.min(7,Math.floor(elapsed/187.5))];}
   else {const sequence=[0,1,1,2,3,3,1,0];return base+sequence[Math.min(7,Math.floor(elapsed/187.5))];}
  }
  // Hold the resting pose and play a short blink, instead of continuous flicker.
  const fraction=(time%asset.period)/asset.period;
  return base+(fraction<.58?0:fraction<.78?1:fraction<.82?2:fraction<.89?3:0);
 }
 function draw(){
  if(!loaded||disposed||!ctx)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
  const frame=pose(),sw=atlas.naturalWidth/4,sh=atlas.naturalHeight/3;
  const scale=[.70,.78,.86,.94,1][stage-1];
  const size=Math.min(width*.94,height*.97)*scale;
  const progress=greeting<0?0:Math.min(1,(time-greeting)/1500);
  const lift=asset.floating?Math.sin(time/1100)*3:0;
  const greetingLift=progress?Math.sin(progress*Math.PI)*7:0;
  const x=(width-size)/2,y=height*.94-size-lift-greetingLift;
  const dark=host.dataset.theme==='dark';
  if(stage>=4){const halo=ctx.createRadialGradient(width/2,height*.5,0,width/2,height*.5,size*.6);halo.addColorStop(0,dark?'#bca16520':'#bca16518');halo.addColorStop(1,'#bca16500');ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);}
  ctx.save();ctx.translate(width/2,height*.91);ctx.scale(1,.14);const shadow=ctx.createRadialGradient(0,0,0,0,0,size*.30);shadow.addColorStop(0,dark?'#00000045':'#273b342c');shadow.addColorStop(1,'#273b3400');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,size*.30,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(atlas,(frame%4)*sw,Math.floor(frame/4)*sh,sw,sh,x,y,size,size);
  host.dataset.frame=String(frame);
 }
 function tick(now){raf=0;if(disposed||paused||document.hidden||!loaded)return;const dt=last?Math.min(now-last,80):0;last=now;time+=dt;if(now-lastPaint>=1000/24){lastPaint=now;draw();}raf=requestAnimationFrame(tick);}
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function resume(){if(!raf&&!disposed&&!paused&&!document.hidden&&loaded)raf=requestAnimationFrame(tick);}
 function onVisibility(){if(document.hidden)stop();else resume();}
 function onReduced(){if(reduced.matches){paused=true;greeting=-1;stop();host.dataset.motion='paused';draw();host.dispatchEvent(new CustomEvent('pet-playback',{detail:{paused},bubbles:true}));}}
 function greet(){if(!loaded)return;if(paused){status.textContent=info.name+'向你问好';return;}greeting=time;host.dataset.motion='greeting';resume();}
 canvas.addEventListener('click',greet);
 const observer=new ResizeObserver(resize);observer.observe(host);resize();setTheme(document.documentElement.dataset.theme||'light');
 document.addEventListener('visibilitychange',onVisibility);reduced.addEventListener('change',onReduced);
 atlas.onload=()=>{if(disposed)return;loaded=true;status.textContent='';status.className='animation-announcement';delete host.dataset.error;host.dataset.ready=id;draw();resume();};
 atlas.onerror=()=>{if(disposed)return;status.textContent='动画暂未加载，点击重试';status.classList.add('retry');status.onclick=()=>{status.textContent='正在重试…';atlas.src=asset.src;};host.dataset.error='asset';};
 atlas.src=asset.src;
 return {setTheme,greet,pause(){paused=!paused;host.dataset.motion=paused?'paused':greeting>=0?'greeting':'idle';if(paused)stop();else resume();return paused;},
  dispose(){disposed=true;stop();observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onReduced);canvas.removeEventListener('click',greet);atlas.onload=atlas.onerror=null;host.replaceChildren();}
 };
}
