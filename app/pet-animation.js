import {CATALOG} from './catalog.js';
export const ANIMATIONS=Object.fromEntries(CATALOG.map(p=>[p.id,{
 available:!['horse','ray'].includes(p.id),
 src:'./assets/companions/'+p.id+'-v1.webp',poster:'./assets/companions/'+p.id+'-poster-v1.webp',columns:4,rows:3,
 period:p.family==='海洋'?4200:p.id==='dog'?2400:3600,
 floating:p.family==='海洋'||p.id==='dragon'||p.id==='eagle'
}]));
export function portrait(id){return ANIMATIONS[id].available?'<img class="pet-portrait" src="'+ANIMATIONS[id].poster+'" alt="" loading="lazy" width="96" height="96">':'<span class="pet-portrait pending-portrait">动画<br>待补充</span>';}
