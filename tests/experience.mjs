import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Game} from '../src/core/Game.js';
import {HEARTS} from '../src/data/hearts.js';
import {MusicDirector} from '../src/core/MusicDirector.js';
import {heartEffectDetails,heartCasterDescription} from '../src/data/heartEffects.js';
import {mechanicForHeart,advanceHeartAbilities,heartMoveFactor,
 heartAfterMovement,heartHeroIntervalFactor,heartAbilityDescription}
 from '../src/core/HeartAbilities.js';
import {bgmForMap,BGM_TRACKS} from '../src/data/musicTracks.js';
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
// With 26 in-game characters, every unordered two-member pairing is discoverable.
// This is deliberately fan-game combat cooperation, not a canon relationship list.
{
 const pairs=HEARTS.filter(h=>h.type==='pair');
 const groups=HEARTS.filter(h=>h.type==='group');
 assert.equal(pairs.length,325,'the 26 characters must form 325 two-person partnerships');
 assert.equal(groups.length,6,'six group ultimate abilities must remain');
 assert.equal(HEARTS.length,331);
 assert.equal(new Set(pairs.map(h=>[...h.required].sort().join('+'))).size,325);
 assert(HEARTS.some(h=>h.id==='emu-nene'&&!h.isGenerated),'retain featured duo names');
 const g=new Game({mapId:'roof',difficulty:'normal'});
 g.units=[
  {uid:1,id:'ichika',star:1,x:1,y:1},
  {uid:2,id:'saki',star:1,x:2,y:1},
  {uid:3,id:'honami',star:1,x:3,y:1}
 ];
 assert(g.discoveredActive.some(h=>h.required.length===2&&h.isGenerated),
  'ordinary character pairs must discover new cooperation hearts');
 g.realTime=12;g.spawnEnemy('boss',1);
 g.heartUpdate(.2,.2);
 const queued=g.heartQueue.filter(q=>q.heart.type==='pair').length+
   (g.heartScene?.heart.type==='pair'?1:0);
 assert(queued<=1,'duo queue may not overflow with multiple simultaneous CPs');
}
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

// Group ultimates have six different strategic jobs rather than six colors
// of the same full-board damage effect.
const groupRoles={
 leo:'ensemble',mmj:'spotlight',vbs:'beat',wxs:'barrier',n25:'quiet',vs:'portal'
};
for(const [group,role] of Object.entries(groupRoles)){
 const heart=HEARTS.find(h=>h.group===group&&h.type==='group');
 assert(heart,'missing group '+group);
 assert.equal(mechanicForHeart(heart),role);
 const game=new Game({mapId:'roof',difficulty:'normal'});
 game.wave=12;
 const enemies=Array.from({length:4},(_,i)=>game.spawnEnemy(i===0?'boss':'tank',5+i*3));
 const hp=enemies.map(e=>e.hp);
 const participants=heart.required.map((id,i)=>({
  uid:i+1000,id,star:3,x:Math.min(i+1,9),y:6,
  cooldown:2,jamTime:0
 }));
 game.units=participants;
 const start=enemies[0].progress;
 if(role==='quiet'){
  game.interference={uid:participants[0].uid,id:participants[0].id,
   x:participants[0].x,y:participants[0].y,type:'silence',remaining:3};
 }
 game.fireHeart(heart,participants);
 const state=game.heartStates.at(-1);
 assert.equal(state?.type,role,group+' did not establish its actual skill');
 assert(state.remaining>3,group+' effect cannot be seen long enough');
 assert(game.effects.some(e=>e.type==='heart'),group+' activation flash missing');
 // Other roles should not deal disguised, arbitrary full-map damage.
 assert.deepEqual(enemies.map(e=>e.hp),hp,group+' uses a generic nuke');
 if(role==='ensemble'){
  assert(heartHeroIntervalFactor(game,participants[0])<.6,'linked member attack speed missing');
  assert(state.unitIds.length>=4,'four-character ensemble missing');
 }
 if(role==='spotlight'){
  assert.equal(state.zones.length,3,'stage should place three useful lights');
  enemies[0].progress=state.zones[0].index;
  assert(heartMoveFactor(game,enemies[0])<.8,'spotlight must slow enemy movement');
 }
 if(role==='beat'){
  advanceHeartAbilities(game,.1);
  assert(enemies.some(e=>e.stun>0&&e.exposed>0),'VBS beat must repeatedly stagger');
 }
 if(role==='barrier'){
  assert.equal(state.gates.length,3,'show should install three world barriers');
  const gate=state.gates[0],enemy=enemies[0];
  enemy.progress=gate.index+.2;
  heartAfterMovement(game,enemy,gate.index-.1);
  assert(enemy.stun>.3&&enemy.progress<gate.index,'stage gate failed to block traversal');
 }
 if(role==='quiet'){
  assert(enemies.some(e=>e.stun>=1),'silence must stop enemies');
  assert.equal(game.interference,null,'silence must interrupt imminent hazards');
 }
 if(role==='portal'){
  assert(enemies[0].progress<start,'portal should recall an enemy');
  assert(state.portals.length>=2,'return gates should remain in battlefield');
 }
 for(const language of ['ko','ja','en']){
  const details=heartEffectDetails(heart,{average:3},language);
  assert(details.short.length>=7&&details.detail.length>=18,
   role+' not explained in '+language);
  assert(!/범위 피해|Area damage|範囲ダメージ/.test(details.detail),
   role+' fallback text wrongly claims area damage');
 }
 assert.equal(game.lastHeartEffect?.mechanic,role);
 assert(game.lastHeartEffect.actorId,'the actual caster is not identified');
 const participated=heartCasterDescription(heart,participants,CHARACTER_BY_ID,'ko');
 assert(participated.includes(CHARACTER_BY_ID[participants[0].id].names.ko));
 game.togglePause();const time=state.remaining;
 game.update(4);
 assert.equal(state.remaining,time,'paused game must freeze ongoing skill');
}

// Pair synergies should depend on which two people meet, not just add coins.
for(const role of ['tether','stage','armor','barrier','rescue','mirror']){
 const heart=HEARTS.find(h=>h.type==='pair'&&mechanicForHeart(h)===role);
 assert(heart,'missing pair role '+role);
 const game=new Game({mapId:'roof',difficulty:'normal'});
 const enemies=[game.spawnEnemy('tank',4),game.spawnEnemy('pulse',8)];
 const members=heart.required.map((id,i)=>({
  uid:500+i,id,star:2,x:i+3,y:6,cooldown:2,jamTime:0
 }));
 game.units=members;game.fireHeart(heart,members);
 assert.equal(game.heartStates.at(-1)?.type,role,'pair skill role mismatch '+role);
 if(role==='tether')assert(enemies.some(e=>e.stun>0),'pair must bind targets');
 if(role==='armor')assert(enemies.some(e=>e.exposed>0),'pair must expose armor');
 if(role==='stage')assert(game.heartStates.at(-1).zones?.length>=1,'pair needs a floor zone');
 if(role==='barrier')assert(game.heartStates.at(-1).gates?.length>=1,'pair needs an obstacle');
 if(role==='rescue'||role==='mirror')
  assert(heartHeroIntervalFactor(game,members[0])<1,'pair should visibly empower its two participants');
}
{
 const h=HEARTS.find(h=>h.type==='group'&&h.group==='wxs');
 const g=new Game({mapId:'roof',difficulty:'normal'});
 g.units=h.required.map((id,i)=>({uid:i+1,id,star:4,x:i+1,y:6,cooldown:0}));
 const enemy=g.spawnEnemy('tank',7);
 g.fireHeart(h,g.units);
 const before=g.heartStates[0].remaining;
 g.speed=2;g.update(.05);
 assert(Math.abs(g.heartStates[0].remaining-(before-.05))<.01,
  'real seconds of effect should not become half as long at 2x speed');
}
// A disabled audio device keeps combat working, but original map score and
// the cinematic skill cue must both be reachable from SoundEngine.
{
 const director=new MusicDirector(()=>null,()=>.35);
 assert(Object.values(BGM_TRACKS).every(track=>track===null),
  'do not ship synthesized or unapproved BGM before Suno masters exist');
 assert.equal(bgmForMap('roof'),null);
 director.start('roof');
 assert.equal(director.audio,null,'empty Suno slot must stay silent');
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
 const cardCSS=fs.readFileSync(path.join(root,'styles/heart-clarity-v120.css'),'utf8');
 const heartEffects=fs.readFileSync(path.join(root,'src/data/heartEffects.js'),'utf8');
 const titleJS=fs.readFileSync(path.join(root,'src/ui/TitleIntro.js'),'utf8');
 const uiSource=fs.readFileSync(path.join(root,'src/ui/Interface.js'),'utf8');
 const music=fs.readFileSync(path.join(root,'src/core/MusicDirector.js'),'utf8');
 assert(cardCSS.includes('.heart-ability')&&cardCSS.includes('.skill-cutin-speaker'),
  'skill explanations must be readable in both collection and combat');
 assert(heartEffects.includes('heartAbilityDescription'),
  'collection text must come from real ability logic rather than old damage labels');
 const world=fs.readFileSync(path.join(root,'src/core/HeartVFX.js'),'utf8');
 const director=fs.readFileSync(path.join(root,'src/core/HeartAbilities.js'),'utf8');
 assert(world.includes('drawHeartStates')&&world.includes('barrier(')&&world.includes('portal('),
  'persistent on-board abilities are not rendered');
 assert(director.includes('heartAfterMovement')&&director.includes('heartHeroIntervalFactor'),
  'world-changing roles are not connected to movement and attacks');
 assert(html.includes('title-game-v121.css')&&html.includes('heart-skills-v121.css'),
  'new title and live skills status must load');
 assert(uiSource.includes('heartEffectDetails(heart,strength,lang)'),
  'skill banner must name the actual applied ability');
 assert(!titleJS.includes('paintPortraitCrowd')&&!html.includes('titlePortraitCrowd'),
  'artist-supplied crowd must not be sliced, repeated or recomposited');
 const cue=music.slice(music.indexOf(' heartCue('),music.indexOf(' finish('));
 assert(!cue.includes('this.tone('),'skill impact sound must not ring with pitched melodies');
 assert(music.includes('this.whoosh('),'short soft noise hit is required');

}
console.log('OK — six real group ultimates, distinctive duo roles, persistent world props, readable effects and Suno slots');
