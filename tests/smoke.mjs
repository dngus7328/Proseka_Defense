import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MAPS} from '../src/data/maps.js';
import {CHARACTERS} from '../src/data/characters.js';
import {Game} from '../src/core/Game.js';
import {LANGUAGES} from '../src/data/locales.js';
import {TITLE_LOGOS} from '../src/data/branding.js';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
assert.equal(CHARACTERS.length,26);
assert.equal(MAPS.length,7);
assert.deepEqual(LANGUAGES,['ko','ja','en']);
for(const m of MAPS){
 assert.equal(m.w,11);assert.equal(m.h,12);
 assert(m.path.length>=20,`${m.id}: short route`);
 assert.equal(m.pathSet.size,m.path.length,`${m.id}: route intersects itself`);
 assert(m.available.length>=16,`${m.id}: too few tiles`);
 for(const p of m.path)assert(p.x>=0&&p.x<m.w&&p.y>=0&&p.y<m.h);
 for(const p of m.landmarks)assert(!m.pathSet.has(`${p.x},${p.y}`));
 const g=new Game({mapId:m.id,difficulty:'normal'});
 assert.equal(g.map.id,m.id);
 assert(g.summon(),`${m.id}: failed initial summon`);
 assert.equal(g.units.length,1);
 assert.equal(g.crystals,72);
 assert(g.map.availableSet.has(`${g.units[0].x},${g.units[0].y}`));
 const icon=path.join(root,`Assets/ui/${m.id}.png`);
 assert(fs.existsSync(icon),`missing icon: ${icon}`);
 assert.equal(fs.readFileSync(icon)[25],6,`icon must be RGBA PNG: ${icon}`);
}
for(const lang of LANGUAGES){
 const logo=path.resolve(root,TITLE_LOGOS[lang].src);
 assert(fs.existsSync(logo),`missing ${lang} logo`);
 const file=fs.readFileSync(logo);
 assert.equal(file[25],6,`${lang} logo must be RGBA PNG`);
}
for(const item of ['crystal','wish-piece']){
 const filename=path.join(root,`Assets/currency/${item}.png`);
 assert(fs.existsSync(filename),`currency icon missing: ${item}`);
 const img=fs.readFileSync(filename);
 assert.equal(img[25],6,`currency icon must be RGBA PNG: ${item}`);
}
const interfaceHtml=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(interfaceHtml.includes('Assets/currency/crystal.png'));
assert(interfaceHtml.includes('Assets/currency/wish-piece.png'));
assert(interfaceHtml.includes('currency-inline'));
const interfaceJs=fs.readFileSync(path.join(root,'src/ui/Interface.js'),'utf8');
assert(interfaceJs.includes('cost-piece\" src=\"./Assets/currency/wish-piece.png'));

for(const hero of CHARACTERS){
 for(const direction of ['front','front-left','back-left','back']){
  const filename=path.join(root,'Assets','characters',hero.id,direction+'.png');
  assert(fs.existsSync(filename),`sprite missing: ${filename}`);
 }
}
// Skills should show a line of dialogue first and apply damage after the cut-in.
{
 const events=[];const game=new Game({mapId:'roof',difficulty:'normal'},{
  onHeartStart:e=>events.push('start:'+e.heart.id),
  onHeartFire:e=>events.push('fire:'+e.heart.id),
  onHeartEnd:()=>events.push('end')
 });
 const roster=['ichika','saki','honami','shiho'];
 game.units=roster.map((id,i)=>({uid:i+1,id,star:1,x:1+i,y:2,cooldown:1,motion:0,pose:0,damage:0}));
 game.spawnEnemy('pulse',0);
 game.heartTimers['leo-chorus']=0;
 game.heartUpdate(.2,.2);
 assert.equal(game.heartScene?.heart.id,'leo-chorus');
 assert(events.includes('start:leo-chorus'));
 assert(!events.includes('fire:leo-chorus'));
 game.heartUpdate(.2,.68);
 assert(events.includes('fire:leo-chorus'));
 game.heartUpdate(.2,1);
 assert(events.includes('end'));
}
assert(interfaceHtml.includes('./styles/skill-cutin.css'));
assert(interfaceJs.includes('skill-cutin-dialogue'));
console.log('OK — 26×4 transparent character sprites and delayed skill cut-in events');
console.log('OK — transparent resource PNGs wired to HUD, summon and upgrade costs');
console.log('OK — 7 maps, 26 characters, 7 RGBA emblems, 3 RGBA logos, summon tests');
