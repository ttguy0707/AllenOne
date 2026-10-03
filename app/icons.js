const names=new Set(['home','records','pets','meals','settings','strength','running','cycling','basketball','moon','sun','system','add','close','next','previous','external','check']);

// PNG alpha masks preserve one neutral color in both themes.
export function icon(name) {
  if(!names.has(name))throw new Error('Unknown UI icon: '+name);
  return `<span class="ui-icon ui-icon-${name}" aria-hidden="true"></span>`;
}
