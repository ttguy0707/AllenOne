import {mkdir,cp,readdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await mkdir('dist',{recursive:true});
// Remove only obsolete generated artifacts inside the verified build directory.
const output=path.resolve('dist'),legacy=['vendor','model-kit.js','model-finishing.js','pet-models.js','atelier.css','icon.svg'];
for(const file of legacy){const target=path.resolve(output,file);if(!target.startsWith(output+path.sep))throw Error('Build path outside dist');await rm(target,{recursive:true,force:true});}
await cp('app','dist',{recursive:true,filter:source=>!legacy.includes(path.relative(path.resolve('app'),path.resolve(source)))});
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push('./'+path.relative('dist',p).replaceAll('\\','/'));}return out;}
const assets=(await walk('dist')).filter(p=>!p.endsWith('/sw.js')&&!p.endsWith('/asset-list.json'));
await writeFile('dist/asset-list.json',JSON.stringify(assets));
const hash=createHash('sha256');for(const file of assets)hash.update(await readFile(path.join('dist',file)));
await writeFile('dist/sw.js',(await readFile('app/sw.js','utf8')).replace('wildfit-shell-v1','wildfit-shell-'+hash.digest('hex').slice(0,12)));
console.log(`Built ${assets.length} local assets in dist/`);
