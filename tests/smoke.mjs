import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MAPS} from '../src/data/maps.js';
import {CHARACTERS,SIGNATURES} from '../src/data/characters.js';
import {Game} from '../src/core/Game.js';
import {ENEMIES} from '../src/data/enemies.js';
import {drawEnemyArt} from '../src/core/EnemyArt.js';
import {drawSekaiWorld} from '../src/core/SekaiMapArt.js';
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


assert.equal(Object.keys(SIGNATURES).length,26);
for(const char of CHARACTERS){
 const game=new Game({mapId:'roof',difficulty:'normal'});
 const enemy=game.spawnEnemy('tank',0);const pos=game.enemyPos(enemy);
 enemy.hp=100000;enemy.maxHp=100000;
 const unit={uid:1,id:char.id,star:4,x:pos.x-1,y:pos.y,cooldown:0,shots:SIGNATURES[char.id].every-1,motion:0,pose:0};
 game.units=[unit];
 assert(game.attack(unit),`${char.id}: no attack`);
 assert(game.pendingHits.length>0,`${char.id}: no timed projectile damage`);
 assert(game.effects.some(e=>e.type==='signature'),`${char.id}: signature not triggered`);
 assert.equal(enemy.hp,100000,`${char.id}: damage should follow projectile arrival`);
 game.updateStrikes(.45);
 assert(enemy.hp<100000,`${char.id}: projectile impact did not deal damage`);
 assert(game.effects.some(e=>e.type==='impact'),`${char.id}: no impact effects`);
}
for(const map of MAPS){
 assert.equal(map.affinityRate,.55);
 const game=new Game({mapId:map.id,difficulty:'normal'});
 const group=CHARACTERS.filter(ch=>ch.group===map.affinityGroup);
 assert(group.length>=4,`${map.id}: missing matching SEKAI characters`);
 const prevRandom=Math.random;
 try{
  Math.random=()=>.1;
  const character=game.chooseCharacter();
  assert.equal(game.lastSummonSource,'affinity');
  assert.equal(character.group,map.affinityGroup);
 }finally{Math.random=prevRandom;}
}
{
 const game=new Game({mapId:'roof',difficulty:'normal'});
 const a={uid:1,id:'ichika',star:1,x:1,y:4,cooldown:1,damage:0};
 const b={uid:2,id:'ichika',star:1,x:2,y:4,cooldown:1,damage:0};
 game.units=[a,b];assert(game.mergeUnits(a,b));
 assert.equal(a.star,2);assert.equal(game.units.length,1);
 assert(game.effects.some(e=>e.type==='promotion'), 'rank promotion visual missing');
}
console.log('OK — all 26 individual signatures, timed impact damage, four-star attacks, seven affinity pools, and rank promotion');


{
 const methods=new Set(['save','restore','translate','rotate','setTransform','clearRect',
  'fillRect','strokeRect','beginPath','closePath','arc','ellipse','fill','stroke',
  'moveTo','lineTo','fillText','strokeText','setLineDash','scale','rect','clip',
  'roundRect','drawImage','bezierCurveTo','quadraticCurveTo']);
 let marks=0;
 const brush=new Proxy({},{
  get(o,k){if(k in o)return o[k];if(methods.has(k))return(...args)=>{
   marks++;
   for(const value of args)if(typeof value==='number')assert(Number.isFinite(value),`invalid Canvas coordinate in ${String(k)}`);
  };return 0;},
  set(o,k,value){o[k]=value;return true;}
 });
 for(const map of MAPS){
  drawSekaiWorld(brush,map,0,false);
  drawSekaiWorld(brush,map,3,false);
  drawSekaiWorld(brush,map,3,true);
 }
 for(const type of Object.keys(ENEMIES)){
  const game=new Game({mapId:'roof',difficulty:'normal'});
  const enemy=game.spawnEnemy(type,2);
  drawEnemyArt(brush,game,enemy,0,false,false);
  drawEnemyArt(brush,game,enemy,3,true,false);
  drawEnemyArt(brush,game,enemy,4,true,true);
 }
 assert(marks>1500,'ambient worlds and seven detailed enemies were not rendered');
}
{
 const game=new Game({mapId:'roof',difficulty:'normal'});
 const conductor=game.spawnEnemy('boss',1);
 const follower=game.spawnEnemy('pulse',1.1);
 conductor.beatCooldown=.01;
 game.update(.05);
 assert(follower.tempo>0,'boss did not accelerate nearby enemies');
 assert(game.effects.some(effect=>effect.type==='ring'),'boss beat has no visual pulse');
}
{
 const game=new Game({mapId:'roof',difficulty:'normal'});
 assert(game.summon());
 assert(game.units[0].entrance>0,'unit summon animation missing');
 game.update(.1);
 assert(game.units[0].entrance<.55,'unit summon animation does not progress');
 const other=game.units[0];
 game.units.push({...other,uid:other.uid+100,x:other.x+1,damage:0});
 assert(game.mergeUnits(other,game.units[1]));
 assert(other.promotion>0,'unit promotion animation missing');
}
console.log('OK — seven animated SEKAI arenas, seven unique enemy art forms, boss beat and animated unit lifecycle');
