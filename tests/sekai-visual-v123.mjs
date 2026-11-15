import assert from 'node:assert/strict';
import {MAPS} from '../src/data/maps.js';
import {HEARTS} from '../src/data/hearts.js';
import {drawSekaiWorld} from '../src/core/SekaiMapArtV2.js';
import {drawHeartStates,drawHeartCinematic} from '../src/core/HeartVFXV2.js';
import {drawHeartSpectacle} from '../src/core/HeartVFXSpectacle.js';
import {mechanicForHeart} from '../src/core/HeartAbilities.js';

// Lightweight Canvas2D spy: the browser's real canvas is also checked by the
// existing Chromium visual walkthrough. This catches skipped world themes,
// inaccessible canvas methods, and VFX that lack visible actor/effect cues.
function spy(){
 const state={ops:0,text:[],filled:0,stroked:0};
 const ctx=new Proxy({},{
  get(target,key){
   if(key in target)return target[key];
   if(key==='measureText')return text=>({width:String(text).length*8});
   if(typeof key==='symbol')return undefined;
   return (...args)=>{
    state.ops++;
    if(key==='fillText'||key==='strokeText')state.text.push(String(args[0]));
    if(key==='fillRect'||key==='fill')state.filled++;
    if(key==='stroke'||key==='strokeRect')state.stroked++;
   };
  },
  set(target,key,value){target[key]=value;return true;}
 });
 return {ctx,state};
}
const expected=['school','stage','street','wonderland','empty','closed','open'];
assert.deepEqual(MAPS.map(m=>m.theme),expected);
for(const map of MAPS){
 assert.equal(map.pathSet.size,map.path.length,map.id+' must preserve one closed route');
 assert(map.landmarks.every(p=>!map.pathSet.has(p.x+','+p.y)),map.id+' blocks the route');
 const {ctx,state}=spy();
 drawSekaiWorld(ctx,map,1.2,false);
 assert(state.ops>70,map.id+' should paint scenery, roads, and readable landmarks');
 assert(state.filled>20,map.id+' background looks blank');
 assert(state.stroked>8,map.id+' paths/props are not distinguishable');
 const smaller=spy();drawSekaiWorld(smaller.ctx,map,1.2,true);
 assert(smaller.state.ops>60,map.id+' missing reduced-motion fallback');
}
const zones=[{x:4,y:5,index:3},{x:7,y:8,index:15}];
const sampleActor=[{uid:1,id:'ichika',x:4,y:4},{uid:2,id:'saki',x:5,y:4}];
for(const type of ['ensemble','spotlight','beat','barrier','quiet','portal','tether','armor','rescue','mirror','stage']){
 const map=MAPS[0];
 const heart=HEARTS.find(h=>mechanicForHeart(h)===type);
 assert(heart,'missing '+type+' skill');
 const state={id:'demo',heartId:heart.id,type,total:7,remaining:4,
  unitIds:[1,2],actorIds:['ichika','saki'],casterId:'ichika',
  zones,gates:zones,portals:zones,targets:[42]};
 const game={
  map,language:'ko',units:sampleActor,
  enemies:[{uid:42,hp:100,stun:2,exposed:2}],heartStates:[state],
  enemyPos:()=>({x:6,y:7}),
  heartScene:{heart,actorUid:1,actorId:'ichika',elapsed:.82,fired:true}
 };
 const {ctx,state:render}=spy();
 drawHeartStates(ctx,game,5,32,false,false);
 drawHeartStates(ctx,game,5,32,true,false);
 drawHeartCinematic(ctx,game,5,32,false);
 drawHeartSpectacle(ctx,game,5,32,false);
 assert(render.ops>30,type+' VFX seems absent');
 assert(render.text.length>=2,type+' needs a readable skill/actor cue');
 assert(render.text.some(text=>text.includes('이치카')),type+' caster not named');
 const lite=spy();
 drawHeartStates(lite.ctx,game,5,32,false,true);
 drawHeartCinematic(lite.ctx,game,5,32,true);
 drawHeartSpectacle(lite.ctx,game,5,32,true);
 assert(lite.state.ops>10,type+' reduced motion must still show the skill');
 // The windup has no mechanical state yet: it must still have a caster cue.
 game.heartStates=[];game.heartScene.elapsed=.32;
 const windup=spy();drawHeartSpectacle(windup.ctx,game,5,32,false);
 assert(windup.state.stroked>2&&windup.state.filled>5,type+' needs a readable pre-cast spectacle');
}
console.log('OK — seven original SEKAI environments and eleven visible, live Heart mechanics');
