import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Game} from '../src/core/Game.js';
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
