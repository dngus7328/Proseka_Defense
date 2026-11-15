import assert from 'node:assert/strict';
import {Game} from '../src/core/Game.js';
import {MAPS} from '../src/data/maps.js';
import {CHARACTER_BY_ID} from '../src/data/characters.js';
import {
 HEARTS,MAX_HEART_CHOICES_PER_SEKAI,MAX_HEART_CASTS_PER_MATCH,
 MIN_HEART_INTERVAL_SECONDS,heartsAvailableInSekai,
 heartMatchesSekai,activeHeartsForGame
} from '../src/data/hearts.js';

const singers=['miku','rin','len','luka','meiko','kaito'];
assert.equal(HEARTS.length,331,'retain the full Heart collection');
assert.equal(HEARTS.filter(h=>h.type==='pair').length,325);
assert.equal(HEARTS.filter(h=>h.type==='group').length,6);

for(const map of MAPS){
 assert.equal(map.sekaiMembers.length,map.affinityGroup==='vs'?6:4,
  map.id+': incorrect world roster');
 const home=HEARTS.find(h=>h.type==='group'&&h.group===map.affinityGroup);
 const relevant=heartsAvailableInSekai(map);
 assert(home&&relevant.includes(home),map.id+': home Heart missing');
 assert(relevant.every(h=>heartMatchesSekai(h,map)));
 assert(!relevant.some(h=>h.type==='group'&&h.group!==map.affinityGroup));
 const g=new Game({mapId:map.id,difficulty:'normal'});
 g.units=Object.values(CHARACTER_BY_ID).map((c,i)=>({
  uid:i+1,id:c.id,star:3,x:i%9+1,y:1+Math.floor(i/9),
  cooldown:.1,jamTime:0
 }));
 const selected=activeHeartsForGame(g);
 assert.equal(selected.length,MAX_HEART_CHOICES_PER_SEKAI,map.id+': cap is not ten');
 assert(selected.some(entry=>entry.heart.id===home.id),
  map.id+': matching group finale was displaced');
 assert.equal(new Set(selected.map(entry=>entry.heart.id)).size,selected.length);
 for(const entry of selected)assert(relevant.includes(entry.heart));
}
// Use controlled random rolls to prove all six Virtual Singers are actually
// in the weighted summon pool of BOTH window worlds.
for(const mapId of ['closedwindow','openwindow']){
 const g=new Game({mapId,difficulty:'normal'});
 assert.deepEqual(g.map.sekaiMembers,singers,mapId+': incomplete singer roster');
 const originalRandom=Math.random;
 try{
  for(let i=0;i<6;i++){
   let calls=0;
   Math.random=()=>calls++%2===0?.01:(i+.5)/6;
   assert.equal(g.chooseCharacter().id,singers[i],mapId+' cannot summon '+singers[i]);
  }
 }finally{Math.random=originalRandom;}
}

// Ten activations in one run, with a single visual/effect at a time.
// The saved 331-entry catalog must not be trimmed to enforce the cast limit.
{
 const g=new Game({mapId:'roof',difficulty:'normal'});
 g.units=Object.values(CHARACTER_BY_ID).map((c,i)=>({
  uid:i+1,id:c.id,star:3,x:i%9+1,y:1+Math.floor(i/9),
  cooldown:.2,jamTime:0
 }));
 g.spawnEnemy('boss',5);
 for(let n=0;n<MAX_HEART_CASTS_PER_MATCH+2;n++){
  // Simulate the previous effect ending before the next cast.
  g.heartScene=null;g.heartStates=[];
  g.realTime+=MIN_HEART_INTERVAL_SECONDS+2;
  g.heartPulse=0;
  for(const {heart} of activeHeartsForGame(g))g.heartTimers[heart.id]=0;
  g.heartUpdate(.21,.21);
  assert.equal(g.heartCastsTotal,Math.min(n+1,MAX_HEART_CASTS_PER_MATCH));
  if(n<MAX_HEART_CASTS_PER_MATCH)assert(g.heartScene,'missing permitted cast');
  else assert.equal(g.heartScene,null,'cast exceeded cap');
 }
 assert.equal(g.castHeartIds.length,MAX_HEART_CASTS_PER_MATCH);
}
// A live field state must block a second cast even if ten candidates are ready.
{
 const g=new Game({mapId:'wonderland',difficulty:'normal'});
 g.units=Object.values(CHARACTER_BY_ID).map((c,i)=>({
  uid:i+1,id:c.id,star:3,x:i%9+1,y:1+Math.floor(i/9),cooldown:.1,jamTime:0
 }));
 g.spawnEnemy('tank',6);
 g.heartStates=[{type:'barrier',remaining:4,total:4}];
 g.realTime=500;
 for(const {heart} of activeHeartsForGame(g))g.heartTimers[heart.id]=0;
 g.heartUpdate(.21,.21);
 assert.equal(g.heartCastsTotal,0,'overlapping Heart animations are not allowed');
}
console.log('OK — 331 total Hearts, map-matched ten-choice caps, ten casts, two full six-Singer worlds');
