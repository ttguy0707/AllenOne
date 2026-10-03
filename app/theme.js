/* Load before styles to apply the saved appearance before the first paint. */
(()=>{
  const key='wildfit-appearance',system=matchMedia('(prefers-color-scheme: dark)');
  let mode='system';
  try{const saved=localStorage.getItem(key);if(['system','light','dark'].includes(saved))mode=saved;}catch{}
  function apply(){
    const resolved=mode==='system'?(system.matches?'dark':'light'):mode;
    document.documentElement.dataset.theme=resolved;
    document.documentElement.style.colorScheme=resolved;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',resolved==='dark'?'#111318':'#f8fafd');
    dispatchEvent(new CustomEvent('wildfit-theme',{detail:{mode,resolved}}));
  }
  window.WildfitTheme={get mode(){return mode;},get resolved(){return document.documentElement.dataset.theme;},set(value){
    if(!['system','light','dark'].includes(value))return;
    mode=value;try{localStorage.setItem(key,value);}catch{}apply();
  }};
  system.addEventListener('change',()=>{if(mode==='system')apply();});apply();
})();
