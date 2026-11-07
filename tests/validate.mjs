import assert from 'node:assert/strict';
import {MAPS} from '../src/data/maps.js';
import {CHARACTERS} from '../src/data/characters.js';
import {HEARTS} from '../src/data/hearts.js';
import {Game} from '../src/core/Game.js';
import {DIFFICULTIES} from '../src/data/enemies.js';
assert.equal(CHARACTERS.length,26,'Should include all 26 characters');
assert.equal(new Set(CHARACTERS.map(c=>c.id)).size,26);
assert.equal(MAPS.length,3);assert.equal(HEARTS.length>=12,true);
for(const m of MAPS){
 assert.notEqual(m.w,m.h,'Map rectangle need not be square');
 assert.equal(new Set(m.path.map(p=>`${p.x}:${p.y}`)).size,m.path.length,'No path overlap');
 for(let i=0;i<m.path.length;i++){
  const a=m.path[i],b=m.path[(i+1)%m.path.length];
  assert.equal(Math.abs(a.x-b.x)+Math.abs(a.y-b.y),1,`Path must be closed and contiguous for ${m.id}`);
  assert.ok(a.x>=0&&a.x<m.w&&a.y>=0&&a.y<m.h);
 }
 assert.ok(m.available.length>=20,`Enough deployment cells on ${m.id}`);
}
let seed=1234567;
Math.random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
const logs=[];
for(let s=0;s<3;s++){
 const g=new Game({mapId:MAPS[s].id,difficulty:'normal'},{});
 assert.equal(g.phase,'playing');
 // Summon + merges must preserve identity and never exceed ★4.
 g.gold=10000;
 for(let i=0;i<60;i++){
  g.summon();g.autoMerge();
 }
 assert.ok(g.units.every(u=>u.star>=1&&u.star<=4));
 assert.ok(g.units.some(u=>u.star>=3));
 for(let i=0;i<1500;i++)g.update(.05);
 assert.ok(g.wave>=3||g.phase==='ending'||g.phase==='ended');
 assert.ok(Object.values(g.damageByMember).every(v=>Number.isFinite(v)&&v>=0));
 logs.push({map:g.map.id,wave:g.wave,units:g.units.length,enemy:g.enemies.length,highest:Math.max(...g.units.map(u=>u.star)),gold:g.gold});
}
// Confirm controls and end transition.
const game=new Game({mapId:'roof',difficulty:'extreme'},{});
game.speed=2;game.end('win');
for(let i=0;i<35;i++)game.update(.05);
assert.equal(game.phase,'ended');assert.equal(game.result.status,'win');
assert.equal(game.continueEndless(),true);assert.equal(game.wave,21);assert.equal(game.phase,'playing');
console.log('VALIDATION OK',JSON.stringify(logs));
