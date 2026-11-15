import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Game} from '../src/core/Game.js';
import {HEARTS} from '../src/data/hearts.js';
import {MusicDirector} from '../src/core/MusicDirector.js';
import {MAPS} from '../src/data/maps.js';
import {CHARACTER_BY_ID} from '../src/data/characters.js';
import {INTERFERENCE_BY_MAP,INTERFERENCE_WARNING_SECONDS,interferenceForMap} from '../src/data/interference.js';
import {situationalLine,pairDiscoveryLine} from '../src/data/battleChatter.js';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
assert.equal(Object.keys(INTERFERENCE_BY_MAP).length,7);
assert.equal(INTERFERENCE_WARNING_SECONDS,5);
// 7 stage-specific warnings produce predictable, avoidable effects.
for(const map of MAPS){
 const events=[];
 const game=new Game({mapId:map.id,difficulty:'normal'},{
  onThreatStart:()=>events.push('warning'),
  onThreatHit:()=>events.push('hit'),
  onThreatAvoid:()=>events.push('avoid')
 });
 assert(game.summon()&&game.summon(),map.id+': cannot summon a pair');
 game.startWave(5);
 game.spawnEnemy('pulse',0);
 assert(game.beginThreat(),map.id+': no warning');
 const warning=game.interference;
 assert.equal(warning.remaining,5);
 assert.equal(warning.type,interferenceForMap(map.id).type);
 game.updateThreat(4);
 assert(game.interference,map.id+': no readable warning window');
 game.updateThreat(1);
 assert.equal(game.interference,null,map.id+': failed to resolve danger');
 assert.equal(game.threatStats.hit,1);
 assert.deepEqual(events,['warning','hit']);
 const target=game.units.find(u=>u.uid===warning.uid);
 if(warning.type!=='rush')assert(target.jamTime>0,'interference must interrupt attacks');
 else assert(game.enemies[0].surge>0,'rush must accelerate enemy');
}
for(const id of ['roof','city','closedwindow']){
 const game=new Game({mapId:id,difficulty:'normal'});
 assert(game.summon()&&game.summon());
 game.startWave(5);assert(game.beginThreat());
 const threat=game.interference,from=game.fragments,to=game.crystals;
 const free=game.map.available.find(p=>game.canPlace(p.x,p.y)&&(p.x!==threat.x||p.y!==threat.y));
 assert(free,'no free relocation square');
 game.selection(threat.uid);game.moveSelected();game.clickTile(free.x,free.y);
 assert.equal(game.threatStats.avoided,1);
 assert.equal(game.interference,null,'warning did not clear');
 assert.equal(game.fragments,from+8,'fragment dodge reward missing');
 assert.equal(game.crystals,to+12,'crystal dodge reward missing');
 assert(game.counterTime>6.9,'dodge must grant a seven-second counterattack');
}
{
 const g=new Game({mapId:'roof',difficulty:'normal'});
 g.summon();g.startWave(5);g.beginThreat();
 const before=g.interference.remaining;
 g.togglePause();g.update(10);
 assert.equal(g.interference.remaining,before,'pause does not freeze the warning');
}
{
 const g=new Game({mapId:'roof',difficulty:'normal'});
 g.summon();g.startWave(5);g.beginThreat();g.speed=2;
 const before=g.interference.remaining;
 g.update(.05);
 assert(Math.abs(g.interference.remaining-(before-.05))<.001,
  '2x combat must not shorten the warning to half its promised real time');
}
{
 const g=new Game({mapId:'roof',difficulty:'normal'});
 g.summon();g.startWave(5);
 // An occupied board must never schedule a threat with no legal safe destination.
 for(const tile of g.map.available){
  if(g.canPlace(tile.x,tile.y))g.units.push({
   ...g.units[0],uid:g.nextUnitId++,x:tile.x,y:tile.y
  });
 }
 assert.equal(g.beginThreat(),false,'full board should not produce an unavoidable warning');
}
{
 const g=new Game({mapId:'roof',difficulty:'normal'});
 g.summon();g.startWave(5);g.beginThreat();
 const target=g.interference,free=g.map.available.find(p=>g.canPlace(p.x,p.y));
 g.selection(target.uid);g.moveSelected();g.clickTile(free.x,free.y);
 const before=g.counterTime;g.speed=2;g.update(.05);
 assert(Math.abs(g.counterTime-(before-.05))<.001,
  'counterattack must last seven real seconds even at 2x speed');
}
{
 const g=new Game({mapId:'roof',difficulty:'normal'});
 const startFragments=g.fragments,startCrystals=g.crystals;
 assert(g.summon());
 assert.equal(g.fragments,startFragments-28,'summon must use fragments');
 assert.equal(g.crystals,startCrystals);
 g.upgrade('income');
 assert(g.crystals<startCrystals,'upgrades must use crystals');
 assert.equal(g.fragments,startFragments-28,'upgrades must not use fragments');
}
for(const group of ['leo','mmj','vbs','wxs','n25','vs']){
 for(const lang of ['ko','ja','en']){
  assert(situationalLine(group,'danger',lang).length>7);
  assert(situationalLine(group,'avoid',lang).length>7);
  assert(situationalLine(group,'hit',lang).length>7);
 }
}
assert(pairDiscoveryLine('emu-nene','ko').includes('에무'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles/battle-experience-v1.css'),'utf8');
const ui=fs.readFileSync(path.join(root,'src/ui/BattleExperience.js'),'utf8');
const interfaceSrc=fs.readFileSync(path.join(root,'src/ui/Interface.js'),'utf8');
const main=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
for(const name of ['dangerBanner','dangerMove','battleDialogue','resultInsight','summonButton'])
 assert(html.includes(`id="${name}"`),'missing '+name+' element');
assert(css.includes('@media (orientation:landscape)'));
assert(main.includes('onThreatStart:')&&main.includes('onThreatAvoid:')&&main.includes('onThreatHit:'));
assert(ui.includes('focusThreat()')&&ui.includes('showResult(result)'));
assert(interfaceSrc.includes('this.experience?.update()'),'experience controller not hooked');
assert(html.includes('<span id="summonCost">28</span> <img class="currency-inline" src="./Assets/currency/wish-piece.png"'),
 'summon must show fragment icon');
console.log('OK — seven threats, manual counterplay, paused warning, economy, localized chatter, and responsive UI wiring');

// Six heart styles must have real effects, not identical cosmetic area damage.
for(const style of ['star','rain','slash','burst','wave','orbit']){
 const heart=HEARTS.find(h=>h.style===style);
 assert(heart,'missing heart '+style);
 const g=new Game({mapId:'roof',difficulty:'normal'});
 g.wave=12;
 g.spawnEnemy('boss',6);
 const enemy=g.enemies[0];
 const oldHp=enemy.hp,oldPos=enemy.progress;
 const beforeCrystals=g.crystals;
 const participants=heart.required.map((id,i)=>({
  uid:i+1000,id,star:3,x:i+1,y:6,cooldown:0,
  jamTime:0
 }));
 g.units=participants;
 g.fireHeart(heart,participants);
 assert(g.effects.some(e=>e.type==='heart'&&e.style===style),
  style+': no visible battlefield attack');
 if(style==='wave')assert(enemy.slow>=2,style+': missing slow field');
 if(style==='star')assert(enemy.slow>0,style+': missing gravity effect');
 if(style==='rain')assert(g.crystals>beforeCrystals,style+': missing stage resources');
 if(style==='burst')assert(enemy.progress<oldPos,style+': missing knockback');
 if(style==='slash')assert(oldHp-enemy.hp>230,style+': no focused double strike');
 if(style==='orbit')assert(g.counterTime>=4,style+': no team resonance buff');
 assert(g.cameraShake>0,style+': attack lacks impact');
}
// A disabled audio device keeps combat working, but original map score and
// the cinematic skill cue must both be reachable from SoundEngine.
{
 const director=new MusicDirector(()=>null,()=>.35);
 director.start('roof');
 assert.equal(director.mapId,'roof');
 director.heartAnticipation('star');
 director.heartCue('burst');
 director.stop();
 assert.equal(director.mapId,null);
}
{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const responsive=fs.readFileSync(path.join(root,'styles/gameplay-v118.css'),'utf8');
 const cinema=fs.readFileSync(path.join(root,'styles/skill-cinema-v118.css'),'utf8');
 const main=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
 const audio=fs.readFileSync(path.join(root,'src/core/Audio.js'),'utf8');
 assert(html.includes('gameplay-v118.css')&&html.includes('skill-cinema-v118.css'));
 assert(responsive.includes('aspect-ratio:var(--map-aspect,11/12)'));
 assert(responsive.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
 assert(cinema.includes('skill-cutin.impact')&&cinema.includes('skill-cutin-lead'));
 assert(main.includes('sound.startMusic(')&&main.includes('sound.endMusic('));
 assert(audio.includes('heartCue('),'audio heart cue missing');
}
console.log('OK — distinct six-style heart mechanics, original music and responsive controls');
