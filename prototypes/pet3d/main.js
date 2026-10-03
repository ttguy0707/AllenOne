import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makePet, animatePet, disposePet, profiles } from './pets.js';

const $ = id => document.getElementById(id);
const host=$('viewport');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}
catch(error){$('scene-error').hidden=false;throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
host.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
scene.environment=pmrem.fromScene(room,.05).texture;scene.environmentIntensity=.58;room.dispose();pmrem.dispose();
const camera=new THREE.PerspectiveCamera(37,1,.1,60);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.enablePan=false;
controls.minDistance=5;controls.maxDistance=11;
controls.minPolarAngle=.45;controls.maxPolarAngle=1.62;controls.autoRotateSpeed=1.05;
function resetCamera(){camera.position.set(3.5,2.8,7.2);controls.target.set(0,1.18,0);controls.update();}
resetCamera();
scene.add(new THREE.HemisphereLight(0xf7f5e9,0x566451,1.0));
const key=new THREE.DirectionalLight(0xffefd7,2.35);key.position.set(-3.4,6,4.5);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-3.6;key.shadow.camera.right=3.6;key.shadow.camera.top=4.6;key.shadow.camera.bottom=-3.6;key.shadow.camera.near=.5;key.shadow.camera.far=18;key.shadow.normalBias=.018;key.shadow.bias=-.00015;key.shadow.radius=3;scene.add(key);
const rim=new THREE.DirectionalLight(0xe5f3ff,2.2);rim.position.set(3.5,4,-4);scene.add(rim);
const fill=new THREE.DirectionalLight(0xf7e9d7,.45);fill.position.set(4,2,5);scene.add(fill);
const mat=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const stone=mat(0xdedccd),edge=mat(0x939e87),gold=mat(0xc1a068,.35,.45);
const disk=new THREE.Mesh(new THREE.CylinderGeometry(1.72,1.76,.17,100),stone);disk.position.y=-.105;disk.receiveShadow=true;disk.castShadow=true;scene.add(disk);
for(const radius of [1.57,1.64]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.009,8,120),gold);ring.rotation.x=Math.PI/2;ring.position.y=-.012;scene.add(ring);}
for(let i=0;i<32;i++){const a=i/32*Math.PI*2;const marker=new THREE.Mesh(new THREE.BoxGeometry(.009,.005,i%4===0?.05:.023),gold);marker.position.set(Math.sin(a)*1.605,-.01,Math.cos(a)*1.605);marker.rotation.y=a;scene.add(marker);}
const base=new THREE.Mesh(new THREE.CylinderGeometry(1.57,1.65,.16,100),edge);base.position.y=-.265;scene.add(base);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.14}));floor.rotation.x=-Math.PI/2;floor.position.y=-.36;floor.receiveShadow=true;scene.add(floor);

let active,selected='rabbit',stage=3,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
let t=0,last=performance.now(),greeting=0,frameCount=0;
const stages=['初生','萌芽','成长','觉醒','进化'];
function selectPet(kind,level=stage){
 if(active)disposePet(scene,active);
 selected=kind;stage=level;greeting=0;active=makePet(scene,kind,stage);
 const p=profiles[kind];$('pet-title').textContent=p.name;$('pet-subtitle').textContent=p.subtitle;
 $('action-description').textContent=p.hint;$('stage-output').textContent=stages[stage-1];$('stage').value=stage;
 document.querySelectorAll('[data-pet]').forEach(b=>{const on=b.dataset.pet===kind;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
}
document.querySelectorAll('[data-pet]').forEach(b=>b.addEventListener('click',()=>selectPet(b.dataset.pet)));
$('stage').addEventListener('input',e=>selectPet(selected,Number(e.target.value)));
$('greet').addEventListener('click',()=>{if(paused){paused=false;updatePause();}greeting=2.4;$('action-description').textContent=profiles[selected].name+'回应了你！';});
function updatePause(){$('pause').textContent=paused?'继续动作':'暂停动作';$('pause').setAttribute('aria-pressed',String(paused));if(paused){controls.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');}}
$('pause').addEventListener('click',()=>{paused=!paused;updatePause();});
$('rotate').addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;$('rotate').setAttribute('aria-pressed',String(controls.autoRotate));});
$('reset-view').addEventListener('click',resetCamera);
host.addEventListener('keydown',e=>{if(e.key==='Home'){resetCamera();e.preventDefault();return;}if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;const v=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(v);if(e.key==='ArrowLeft')s.theta-=.13;if(e.key==='ArrowRight')s.theta+=.13;if(e.key==='ArrowUp')s.phi-=.1;if(e.key==='ArrowDown')s.phi+=.1;s.phi=THREE.MathUtils.clamp(s.phi,.45,1.62);camera.position.copy(new THREE.Vector3().setFromSpherical(s).add(controls.target));controls.update();e.preventDefault();});
function resize(){const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.fov=camera.aspect<.9?46:37;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();selectPet('rabbit');updatePause();
function render(now){requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.045);last=now;if(document.hidden)return;if(!paused){t+=dt;greeting=Math.max(0,greeting-dt);animatePet(active,t,dt,greeting);}controls.update();renderer.render(scene,camera);frameCount++;}
requestAnimationFrame(render);
window.__petPreview={getState:()=>({version:2,selected,stage,paused,frames:frameCount,time:t,meshes:renderer.info.render.calls,triangles:renderer.info.render.triangles,camera:camera.position.toArray(),rootY:active.bodyRoot.position.y,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}),ready:true};
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('scene-error').hidden=false;});
renderer.domElement.addEventListener('webglcontextrestored',()=>{$('scene-error').hidden=true;});
