// Canvas-only original enemy characters — a small family of distorted music creatures.
// Four reusable animation poses per enemy are cached, then composited to the board.
const TILE=32;
const TAU=Math.PI*2;
const CACHE=new Map();
function rounded(c,x,y,w,h,r,fill,stroke='#273c52',sw=2){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();
 if(stroke){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke()}
}
function ellipse(c,x,y,rx,ry,fill,stroke=null,sw=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke()}}
function poly(c,points,fill,stroke='#293c50',sw=2){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke()}}
function line(c,points,color='#2f435a',sw=2){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.strokeStyle=color;c.lineWidth=sw;c.stroke()}
function eye(c,x,y){ellipse(c,x,y,2.3,3,'#203748');ellipse(c,x-.65,y-1,0.7,1,'#fff9e6')}
function pulse(c,t){
 const sway=Math.sin(t*3);
 rounded(c,-12+sway*1.2,-11,24,24,10,'#ee9aa4');
 poly(c,[[-9,-11],[-11,-19],[-3,-14]],'#e4b7c0');
 poly(c,[[9,-11],[11,-19],[3,-14]],'#e4b7c0');
 ellipse(c,0,4,10,7,'#f6e5d3');eye(c,-4,-2);eye(c,4,-2);
 rounded(c,-3.8,7,7.6,2.5,1,'#b76f80',null);
 for(let i=0;i<3;i++){const h=4+(Math.sin(t*3+i)*2);rounded(c,-15+i*15,14-h/2,4,h,1,'#f7d6c8','#5c6173',1)}
}
function dash(c,t){
 const s=Math.sin(t*2.9)*1.2;
 poly(c,[[0,-20],[-13,5],[-6,17],[0,13],[6,17],[13,5]],'#f0af72');
 poly(c,[[0,-13],[-7,5],[0,2],[7,5]],'#fbe9ca',null);
 ellipse(c,-3,6,2.2,2.9,'#3c425b');ellipse(c,4,6,2.2,2.9,'#3c425b');
 line(c,[[-11,19+s],[-4,19+s]],'#f4d1a2',2);line(c,[[4,19-s],[11,19-s]],'#f4d1a2',2);
}
function tank(c,t){
 const stomp=Math.sin(t*2.6)*1.2;
 rounded(c,-18,-19,36,39,8,'#7d9db4');
 rounded(c,-14,-15,28,30,6,'#b6c8ce','#45576c',1.8);
 rounded(c,-10,-12,20,5,2,'#8c9ba8','#435468',1);
 for(const y of [-2,9]){
  ellipse(c,0,y,8,7,'#425470','#26374b',2);ellipse(c,0,y,4.3,3.8,'#9faabd','#6a748b',1);
 }
 rounded(c,-16,-22,32,6,3,'#58758c');
 rounded(c,-13,18,9,5,2,'#405568');rounded(c,4,18-stomp,9,5,2,'#405568');
}
function split(c,t){
 const s=Math.sin(t*3)*2;
 c.save();c.translate(-2-s,0);
 poly(c,[[-12,-12],[-4,-17],[0,-8],[0,12],[-8,18],[-15,7]],'#d0a9cb');eye(c,-6,-2);c.restore();
 c.save();c.translate(2+s,0);
 poly(c,[[12,-12],[4,-17],[0,-8],[0,12],[8,18],[15,7]],'#b98fb8');eye(c,6,-2);c.restore();
 for(let i=0;i<4;i++)ellipse(c,0,-10+i*7,1.4,1.4,'#fff3db');
}
function resist(c,t){
 const r=18;
 poly(c,[[0,-r],[-r*.77,-r*.65],[-r,4],[-r*.55,r],[r*.55,r],[r,4],[r*.77,-r*.65]],'#a0c4b6');
 poly(c,[[0,-13],[-11,-9],[-13,3],[-7,12],[7,12],[13,3],[11,-9]],'#5e8b86','#d4e5d6',1.5);
 rounded(c,-2,-7,4,18,1,'#d9ead9',null);rounded(c,-9,-1,18,4,1,'#d9ead9',null);
 eye(c,-5,-8);eye(c,5,-8);
}
function shard(c,t){c.rotate(Math.sin(t*3)*.13);poly(c,[[0,-13],[11,-1],[7,14],[-8,10],[-12,-2]],'#aa91c8');poly(c,[[0,-9],[7,-1],[4,8],[-6,6]],'#e6d0e8','#d7b9dd',1);ellipse(c,-2,-3,2,2,'#52617c')}
function boss(c,t){
 const baton=Math.sin(t*2.2)*.13;
 c.save();c.rotate(baton);line(c,[[-25,-20],[26,16]],'#f7d4a5',3);disc(c,26,16,3,'#f7d4a5');c.restore();
 poly(c,[[-21,-12],[-24,14],[-16,28],[0,19],[16,28],[24,14],[21,-12]],'#574966');
 poly(c,[[-16,1],[-12,18],[0,16],[12,18],[16,1]],'#a18ca7');
 poly(c,[[0,-24],[18,-14],[19,8],[10,20],[-10,20],[-19,8],[-18,-14]],'#8b829a');
 poly(c,[[-12,-11],[0,-18],[12,-11],[11,-3],[-11,-3]],'#d6bac2','#d6bac2',1);
 eye(c,-7,5);eye(c,7,5);
 line(c,[[-3,-1],[0,13],[3,5]],'#34435b',3);
 poly(c,[[-17,-19],[-11,-28],[-5,-22],[0,-33],[6,-22],[13,-28],[17,-19]],'#4e4c66');
 poly(c,[[-11,-20],[-9,-24],[0,-28],[9,-24],[11,-20]],'#f6d5ab','#a3858b',1);
 rounded(c,-21,10,6,12,2,'#a28eab');rounded(c,15,10,6,12,2,'#a28eab');
}
function disc(c,x,y,r,fill){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=fill;c.fill()}
const DRAW={pulse,dash,tank,split,resist,shard,boss};
function frameFor(kind,pose,flash){
 const key=kind+':'+pose+':'+(flash?'f':'n');
 if(CACHE.has(key))return CACHE.get(key);
 let surface;
 try{
  if(typeof OffscreenCanvas==='function')surface=new OffscreenCanvas(92,92);
  else if(typeof document!=='undefined'){surface=document.createElement('canvas');surface.width=92;surface.height=92;}
  const ctx=surface?.getContext('2d');if(!ctx)return null;
  ctx.translate(46,46);ctx.lineJoin='round';ctx.lineCap='round';
  DRAW[kind]?.(ctx,pose*Math.PI/5);
  if(flash){ctx.globalCompositeOperation='source-atop';ctx.fillStyle='#fff2df99';ctx.fillRect(-46,-46,92,92)}
  CACHE.set(key,surface);return surface;
 }catch{return null;}
}
export function drawEnemyArt(c,game,e,time,rotated=false,reduceMotion=false){
 const p=game.enemyPos(e),x=(p.x+.5)*TILE,y=(p.y+.5)*TILE;
 const age=(e.age||time)+(e.visualSeed||0),moving=!reduceMotion;
 const n=e.kind==='boss'?2.6:e.kind==='tank'?3.3:e.kind==='dash'?10:5.3;
 const pose=moving?(Math.floor(age*n)&3):0;
 const size=e.kind==='boss'?.82:e.kind==='tank'?.7:e.kind==='shard'?.45:.6;
 const rise=moving?Math.sin(age*(e.kind==='dash'?10:4.5))*1.2:0;
 const screenAngle=rotated?-Math.PI/2:0;
 c.save();c.translate(x,y);
 c.fillStyle='#1c36434a';c.beginPath();c.ellipse(0,12,e.kind==='boss'?19:12,4,0,0,TAU);c.fill();
 c.translate(0,rise);
 c.rotate(screenAngle);
 let hitScale=e.hitPulse>0?1.10:1;
 c.scale(size*hitScale,size*hitScale);
 if(e.kind==='dash'){
  const path=game.map.path,n=path.length,i=Math.floor(e.progress)%n;
  const a=path[i],b=path[(i+1)%n];
  c.rotate(Math.atan2(b.y-a.y,b.x-a.x)+Math.PI/2);
 }
 const img=frameFor(e.kind,pose,e.flash>0);
 if(img)c.drawImage(img,-46,-46);
 else DRAW[e.kind]?.(c,age);
 if(e.slow>0){c.strokeStyle='#c2e4ed';c.lineWidth=2;c.strokeRect(-20,-24,40,48)}
 c.restore();
 if(e.kind==='boss'||e.kind==='tank'||e.hp/e.maxHp<.66){
  const bw=e.kind==='boss'?46:28,yy=y-(e.kind==='boss'?30:23);
  c.save();c.translate(x,yy);if(rotated)c.rotate(screenAngle);
  rounded(c,-bw/2,-2,bw,5,2,'#253f4e',null);
  rounded(c,-bw/2+1,-1,Math.max(0,(bw-2)*e.hp/e.maxHp),3,1,e.kind==='boss'?'#eac1a4':'#a5d1c0',null);
  c.restore();
 }
}