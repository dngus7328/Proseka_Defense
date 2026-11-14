// Original, code-drawn enemy silhouettes for SEKAI Random Defense.
// No copyrighted enemy sprites. Design language: musical interference,
// flat pixel blocks, deliberate dark outlines, no bloom or generative textures.
import {ENEMIES} from '../data/enemies.js';

const TILE=32;
function block(c,x,y,w,h,color){
 c.fillStyle=color;
 c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function poly(c,points,color){
 c.fillStyle=color;c.beginPath();c.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);
 c.closePath();c.fill();
}
function ellipse(c,x,y,rx,ry,color){
 c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
}
function frame(c,x,y,w,h,fill,stroke='#263348',line=2){
 block(c,x-line,y-line,w+line*2,h+line*2,stroke);
 block(c,x,y,w,h,fill);
}
function eye(c,x,y,light='#f8e9c4'){
 block(c,x-1,y,4,4,'#24334b');block(c,x,y,2,2,light);
}
function pulse(c,t,flash){
 const lift=Math.sin(t*6)*1.7;
 // Headphone-like outer fins and one bent, trembling music-note antenna.
 frame(c,-12,-5+lift,5,10,'#925b79');
 frame(c,7,-5-lift,5,10,'#925b79');
 frame(c,-9,-9,18,19,flash?'#fff1d1':'#d47f91');
 block(c,-7,7,14,3,'#724f73');
 block(c,-5,-7,10,4,'#f1b6a8');
 block(c,3,-15,3,9,'#273550');block(c,5,-15,5,3,'#e2c09b');
 eye(c,-4,-1);eye(c,3,-1);
 block(c,-3,5,6,2,'#463a57');
 // Pulse bars beat in opposite phase: more readable than a wobbling square.
 block(c,-14,-2+lift*.5,3,4,'#efb5ae');block(c,12,-2-lift*.5,3,4,'#efb5ae');
}
function dash(c,t,flash){
 // Arrowhead made of speed lines and an irregular off-beat metronome wedge.
 const surge=(Math.sin(t*11)>0?.8:0);
 poly(c,[[0,-17],[-13,7],[-6,12],[0,6],[6,12],[13,7]],'#2d3d58');
 poly(c,[[0,-13],[-9,6],[-4,7],[0,1],[4,7],[9,6]],flash?'#fff0cc':'#e8ad78');
 poly(c,[[0,-10],[-4,1],[0,-1],[4,1]],'#f8e7c8');
 block(c,-5,3,3,3,'#48526e');block(c,3,3,3,3,'#48526e');
 block(c,-5,10,10,2,'#f4d29d');
 for(let i=0;i<3;i++)block(c,-14+i*10,-3+i*2+surge,3+i,2,i===1?'#e5ccad':'#8e8ca2');
 block(c,-15,12+surge,6,2,'#fff1c5');block(c,9,12+surge,6,2,'#fff1c5');
}
function tank(c,t,flash){
 // Stacked amplifier with a heavy grill and two sound drivers.
 const stomp=Math.sin(t*4)>0?1:0;
 frame(c,-14,-13,28,27,flash?'#f9efd8':'#728da3','#2a3651',3);
 block(c,-10,-9,20,5,'#a5b8c5');block(c,-8,-7,16,1,'#e3d9c5');
 for(const y of [-1,8]){
  ellipse(c,0,y,8,6,'#26364d');ellipse(c,0,y,5,4,'#b5b0c4');
  ellipse(c,0,y,2,2,'#5c6a86');
 }
 block(c,-15,15,8,4,'#4e586f');block(c,7,15-stomp,8,4,'#4e586f');
 block(c,-12,-16,6,4,'#f3d1ab');block(c,6,-16,6,4,'#f3d1ab');
 for(const x of [-11,10])block(c,x,-11,2,3,'#e7bfa5');
}
function split(c,t,flash){
 // Two offset half-discs held together by a torn score-strip.
 const spread=2.2+Math.sin(t*5)*1.1;
 c.save();c.translate(-spread,Math.sin(t*5)*.8);
 poly(c,[[-10,-10],[-2,-13],[0,-3],[-1,9],[-10,12],[-13,1]],'#30364e');
 poly(c,[[-9,-8],[-2,-10],[-2,8],[-9,9],[-11,1]],flash?'#fff0dc':'#c3a1bf');
 eye(c,-6,-1);c.restore();
 c.save();c.translate(spread,-Math.sin(t*5)*.8);
 poly(c,[[10,-10],[2,-13],[0,-3],[1,9],[10,12],[13,1]],'#30364e');
 poly(c,[[9,-8],[2,-10],[2,8],[9,9],[11,1]],flash?'#fff0dc':'#aa81ad');
 eye(c,5,-1);c.restore();
 for(let y=-9;y<12;y+=5)block(c,-1+(y%2),y,2,3,'#f1d5e6');
 block(c,-4,-16,8,3,'#a287ad');
}
function resist(c,t,flash){
 // Dissonance shield: octagonal bezel, green padded core and shield windows.
 const radius=15+.9*Math.sin(t*2.4);
 const corners=[];
 for(let i=0;i<8;i++){const a=(i+.5)*Math.PI/4;corners.push([Math.cos(a)*radius,Math.sin(a)*radius]);}
 poly(c,corners,'#273c4a');
 const inner=corners.map(v=>v.map(x=>x*.81));poly(c,inner,'#93b398');
 poly(c,inner.map(v=>v.map(x=>x*.74)),flash?'#f5efd2':'#476b6d');
 block(c,-4,-8,8,16,'#d3d5b2');block(c,-8,-2,16,4,'#d3d5b2');
 eye(c,-4,-6,'#c8e7ce');eye(c,4,-6,'#c8e7ce');
 block(c,-3,9,6,2,'#253e49');
 // Small detached side guards.
 block(c,-17,-5,4,9,'#d3d5b2');block(c,13,-5,4,9,'#d3d5b2');
}
function shard(c,t,flash){
 // Flying chip left by split enemies; asymmetric, fast spin.
 c.rotate(Math.sin(t*7)*.28);
 poly(c,[[0,-11],[8,-2],[5,10],[-6,7],[-9,-2]],'#354056');
 poly(c,[[0,-8],[5,-1],[3,6],[-5,4],[-6,-2]],flash?'#fff4dc':'#d6b2c8');
 block(c,-1,-5,3,3,'#754c86');block(c,3,7,2,3,'#eecee0');
}
function boss(c,t,flash){
 // The Discordant Conductor: a theatrical broken metronome mask.
 const beat=Math.sin(t*2.75);
 const shell=flash?'#fff0d6':'#76718f';
 // Two independently moving pendulums behind the face.
 c.save();c.rotate(beat*.28);
 frame(c,-3,-25,6,14,'#e9bb94','#2d3850',2);
 block(c,-6,-26,12,4,'#d59c91');c.restore();
 c.save();c.rotate(-beat*.18);
 block(c,-23,-8,8,18,'#3e455f');block(c,15,-8,8,18,'#3e455f');
 block(c,-24,-11,9,4,'#d9ac98');block(c,15,-11,9,4,'#d9ac98');
 c.restore();
 // Angular cape and split coat.
 poly(c,[[-20,-8],[-23,15],[-12,25],[0,19],[12,25],[23,15],[20,-8]],'#364359');
 poly(c,[[-14,8],[-14,17],[-3,20],[0,12],[3,20],[14,17],[14,8]],'#9f809a');
 // Diamond-faced conductor mask, central broken beat mark.
 poly(c,[[0,-21],[16,-12],[20,6],[9,18],[-9,18],[-20,6],[-16,-12]],'#28374d');
 poly(c,[[0,-17],[13,-10],[16,5],[8,13],[-8,13],[-16,5],[-13,-10]],shell);
 poly(c,[[-10,-7],[0,-13],[10,-7],[7,-3],[-7,-3]],'#f3c7a4');
 eye(c,-8,2,'#f6e0aa');eye(c,7,2,'#f6e0aa');
 block(c,-2,-4,4,15,'#343e5c');block(c,0,2,3,9,'#e0b6a0');
 // Crown-shaped rhythm crest (not a literal crown or skull).
 poly(c,[[-16,-19],[-13,-28],[-6,-22],[0,-31],[7,-22],[13,-28],[16,-19]],'#35405a');
 poly(c,[[-10,-21],[-8,-25],[-3,-21],[0,-26],[4,-21],[9,-25],[11,-21]],'#f0c59c');
 block(c,-17,12,6,5,'#e2b99c');block(c,11,12,6,5,'#e2b99c');
}
export function drawEnemyArt(c,game,e,time,rotated=false,reduceMotion=false){
 const p=game.enemyPos(e),meta=ENEMIES[e.kind];
 if(!meta)return;
 const x=Math.round((p.x+.5)*TILE),y=Math.round((p.y+.5)*TILE);
 const moving=!reduceMotion,age=(e.age||0)+(e.visualSeed||0);
 const slow=e.slow>0,flash=e.flash>0;
 const wobble=moving?Math.sin(age*(e.kind==='dash'?11:5))*(e.kind==='tank'?.8:1.4):0;
 const lift=moving?(e.kind==='dash'?Math.sin(age*11)*1.8:e.kind==='boss'?Math.sin(age*2.2)*1.1:wobble):0;
 const hitPulse=e.hitPulse||0;
 const hitScale=hitPulse>0?1+Math.sin(hitPulse/.24*Math.PI)*.11:1;
 const size=e.kind==='boss'?1:e.kind==='shard'?.78:e.kind==='tank'?1.04:1;
 const arrive=Math.max(0,Math.min(1,(e.emerge||0)/(e.kind==='boss'?.65:.32)));
 c.save();c.translate(x,y);
 // Shadows stay below moving bodies and do not interfere with collision tiles.
 ellipse(c,0,13,e.kind==='boss'?20:e.kind==='tank'?15:11,e.kind==='boss'?6:3.6,'#27354788');
 c.translate(0,Math.round(lift-arrive*6));
 if(rotated)c.rotate(-Math.PI/2);
 c.scale(size*hitScale*(1-arrive*.22),size*hitScale*(1-arrive*.22));
 if(e.kind==='dash'){
  // The arrow-shaped runner should face the path it is actually following.
  const nodes=game.map.path,at=((Math.floor(e.progress)%nodes.length)+nodes.length)%nodes.length;
  const current=nodes[at],next=nodes[(at+1)%nodes.length];
  const heading=Math.atan2(next.y-current.y,next.x-current.x)+Math.PI/2;
  c.rotate(heading+(rotated?Math.PI/2:0)+(moving?Math.sin(age*10)*.055:0));
 }
 if(e.kind==='pulse')pulse(c,age,flash);
 else if(e.kind==='dash')dash(c,age,flash);
 else if(e.kind==='tank')tank(c,age,flash);
 else if(e.kind==='split')split(c,age,flash);
 else if(e.kind==='resist')resist(c,age,flash);
 else if(e.kind==='shard')shard(c,age,flash);
 else if(e.kind==='boss')boss(c,age,flash);
 if(slow){
  c.strokeStyle='#b8dded';c.lineWidth=1.7;c.strokeRect(e.kind==='boss'?-23:-16,e.kind==='boss'?-29:-18,e.kind==='boss'?46:32,e.kind==='boss'?55:34);
  block(c,-2,-24,4,3,'#e6f9f9');
 }
 if(e.tempo>0&&e.kind!=='boss'){
  // Two amber beat bars mark the short boss tempo boost.
  block(c,-9,-21,6,2,'#e7b597');block(c,1,-21,6,2,'#f1d2a5');
 }
 c.restore();
 // Health bars stay horizontal in the real display, including landscape.
 if(e.kind==='boss'||e.kind==='tank'||e.hp<e.maxHp*.8){
  const width=e.kind==='boss'?46:e.kind==='tank'?32:24;
  const y0=y+(e.kind==='boss'?-36:e.kind==='tank'?-24:-20);
  c.save();c.translate(x,y0);
  if(rotated)c.rotate(-Math.PI/2);
  frame(c,-width/2,-1,width,4,'#29364c','#1b2b3b',1);
  block(c,-width/2+1,0,Math.max(0,(width-2)*e.hp/e.maxHp),2,e.kind==='boss'?'#ecc29c':'#a8d5bb');
  if(e.kind==='boss'){
   for(let i=1;i<=4;i++)block(c,-width/2+width*i/5,-1,1,4,'#28354a');
  }
  c.restore();
 }
}
