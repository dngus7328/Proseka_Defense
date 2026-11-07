import {CHARACTER_BY_ID,STAR_SCALE} from '../data/characters.js';
import {ENEMIES} from '../data/enemies.js';
import {tileKey} from '../data/maps.js';
import {drawSekaiWorld} from './SekaiMapArt.js';
const TILE=32;
const hash=(x,y,n=0)=>((x*374761393+y*668265263+n*1442695041)>>>0)%100000;
const lerp=(a,b,t)=>a+(b-a)*t;
const point=(x,y)=>({x,y});
export class Renderer {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.currentMap=null;this.tileSize=TILE;this.ctx.imageSmoothingEnabled=false;}
 setMap(map){
  // A portrait-oriented map stays one logical world in every orientation.
  // For landscape we rotate its camera, not the units or the enemy path.
  const rotated=window.innerWidth>window.innerHeight;
  if(this.currentMap?.id===map.id&&this.rotated===rotated)return;
  this.currentMap=map;this.rotated=rotated;
  this.canvas.width=(rotated?map.h:map.w)*TILE;
  this.canvas.height=(rotated?map.w:map.h)*TILE;
  this.canvas.style.aspectRatio=`${this.canvas.width}/${this.canvas.height}`;
  this.canvas.style.setProperty('--map-aspect',`${this.canvas.width}/${this.canvas.height}`);
  document.querySelector('.board-frame')?.style.setProperty('--map-aspect',`${this.canvas.width}/${this.canvas.height}`);
  document.querySelector('.board-frame')?.style.setProperty('--map-ratio',String(this.canvas.width/this.canvas.height));
  this.ctx.imageSmoothingEnabled=false;
 }
 mapClick(event){
  const r=this.canvas.getBoundingClientRect();
  const px=(event.clientX-r.left)/r.width,py=(event.clientY-r.top)/r.height;
  // Clockwise camera rotation: displayed [x,y] maps back to [y,1-x].
  if(this.rotated)return {x:Math.floor(py*this.currentMap.w),y:Math.floor((1-px)*this.currentMap.h)};
  return {x:Math.floor(px*this.currentMap.w),y:Math.floor(py*this.currentMap.h)};
 }
 draw(game){
  if(!game)return;this.setMap(game.map);
  const c=this.ctx,m=game.map,time=game.visualTime;
  c.setTransform(1,0,0,1,0,0);
  c.clearRect(0,0,this.canvas.width,this.canvas.height);
  c.save();
  if(this.rotated){c.translate(this.canvas.width,0);c.rotate(Math.PI/2);}
  drawSekaiWorld(c,m,time);
  this.drawPlacement(c,m,game);
  if(game.selected)this.drawRange(c,game.selected,game);
  const bodies=[...game.enemies.map(e=>({y:game.enemyPos(e).y,enemy:e})),...game.units.map(u=>({y:u.y,hero:u}))].sort((a,b)=>a.y-b.y);
  for(const item of bodies){if(item.enemy)this.drawEnemy(c,game,item.enemy,time);else this.drawHero(c,game,item.hero,time);}
  this.drawEffects(c,game,time);
  if(game.phase==='ending'){
   const k=Math.min(1,game.endReal/1.5);
   c.fillStyle=`rgba(14,21,31,${k*.42})`;
   c.fillRect(0,0,m.w*TILE,m.h*TILE);
  }
  c.restore();
 }
 drawPlacement(c,m,game){
  const used=new Set(game.units.map(u=>tileKey(u.x,u.y)));
  for(const {x,y} of m.available){
   if(used.has(tileKey(x,y)))continue;
   const sx=x*TILE,sy=y*TILE;
   if(game.moveMode){
    c.fillStyle='#c4f7cc37';c.fillRect(sx+2,sy+2,28,28);
    c.strokeStyle='#ecffe8d4';c.lineWidth=1;c.strokeRect(sx+4.5,sy+4.5,23,23);
   }else{
    // Quiet placement marker keeps the map art readable until the user chooses to move a unit.
    c.fillStyle=m.theme==='empty'?'#728d9a77':'#c3eee384';
    c.fillRect(sx+14,sy+14,4,4);
   }
  }
 }
 drawRange(c,u,game){
  const r=(CHARACTER_BY_ID[u.id].range+.11*(u.star-1))*TILE;
  const x=(u.x+.5)*TILE,y=(u.y+.5)*TILE;
  c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);
  c.fillStyle='#d5f8ee24';c.fill();c.setLineDash([5,5]);c.strokeStyle='#e4fff0bf';c.lineWidth=1.5;c.stroke();c.setLineDash([]);
  c.fillStyle='#f4f1d6';for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
   const qx=x+Math.cos(a)*r,qy=y+Math.sin(a)*r;
   c.fillRect(Math.floor(qx)-2,Math.floor(qy)-2,4,4);
  }
  c.restore();
 }
 drawHero(c,game,u,time){
  const s=CHARACTER_BY_ID[u.id],x=(u.x+.5)*TILE,y=(u.y+.5)*TILE;
  const bob=Math.round(Math.sin(time*3.7+u.uid*1.8)*.65);
  const attackMotion=u.motion>0?(u.motion/.2):0;
  const swing=attackMotion?Math.sin((1-attackMotion)*Math.PI)*u.pose*11:Math.sin(time*1.8+u.uid)*1.8;
  const jump=attackMotion?Math.sin((1-attackMotion)*Math.PI)*2:0;
  const scale=(.83+(u.star-1)*.09)*1.16;
  c.save();c.translate(Math.round(x),Math.round(y+bob-jump));c.rotate(swing*Math.PI/180);c.scale(scale,scale);
  this.drawPixelPerson(c,s,u.facing||'front',u.star);
  c.restore();
  const color=game.selectedId===u.uid?'#f8edbe':u.star===4?'#e7d9a1':'#49636a';
  c.fillStyle='#243e3aab';c.fillRect(x-13,y+12,26,4);
  c.fillStyle=color;
  for(let i=0;i<u.star;i++)c.fillRect(Math.round(x-u.star*2.5+i*5+1),Math.round(y+13),3,3);
  if(game.selectedId===u.uid){c.strokeStyle='#f9f2d8';c.lineWidth=1.5;c.strokeRect(x-15,y-17,30,31);}
 }
 drawPixelPerson(c,s,facing='front',star=1){
  // The entire 2-direction mock character is a custom programmatic pixel sprite.
  // Replace this renderer with owned character PNGs later without changing the game rules.
  const px=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  const dark='#2e3447',skin='#f1d7c1',cloth=s.cloth,hair=s.hair;
  px(-10,7,20,11,dark);px(-9,7,18,10,cloth);px(-10,11,4,8,dark);px(6,11,4,8,dark);
  px(-8,17,6,4,dark);px(2,17,6,4,dark);
  px(-10,-11,20,21,dark);px(-9,-12,18,20,hair);
  if(s.style===1){px(-11,-8,5,19,hair);px(6,-10,5,22,hair);}
  if(s.style===2){px(-7,-14,15,5,hair);px(-11,-7,4,13,hair);}
  if(s.style===3){px(-11,-5,4,13,hair);px(7,-8,5,18,hair);px(-8,-13,17,4,hair);}
  if(s.style===4){px(-8,-13,17,4,hair);px(-9,-5,4,8,hair);}
  if(facing==='front'){
    px(-7,-6,14,12,skin);px(-5,-8,13,4,hair);px(-5,-1,2,2,dark);px(4,-1,2,2,dark);
    px(-1,3,3,1,'#c2948a');
  }else{
    px(-7,-6,14,12,hair);px(-5,-8,12,4,hair);
    px(-5,7,10,3,s.cloth);
  }
  if(s.style===2){px(7,-10,4,4,hair);px(-10,-9,3,3,hair);}
  if(s.style===3){px(-11,1,4,11,hair);px(8,1,4,11,hair);}
  px(-7,7,14,2,'#f3ede69c');
 }
 drawEnemy(c,game,e,time){
  const p=game.enemyPos(e),t=ENEMIES[e.kind],x=Math.round((p.x+.5)*TILE),y=Math.round((p.y+.5)*TILE),r=e.radius*TILE;
  const size=Math.round(r*2);c.save();c.translate(x,y);
  c.fillStyle='#20333ba8';c.fillRect(-Math.round(r),Math.round(r*.65),size+1,3);
  c.fillStyle=e.flash>0?'#fff4d6':t.color;
  if(e.kind==='dash'){
    c.beginPath();c.moveTo(0,-r);c.lineTo(r,r);c.lineTo(-r,r);c.closePath();c.fill();
  }else if(e.kind==='tank'||e.kind==='boss'){
    const q=e.kind==='boss'?2:1;c.fillRect(-r,-r,size,size);c.fillStyle=t.accent;c.fillRect(-r+q*2,-r+q*2,size-q*4,3);
    if(e.kind==='boss'){c.fillStyle='#2c3455';c.fillRect(-r-4,0,4,8);c.fillRect(r,0,4,8);c.fillStyle=t.accent;c.fillRect(-r/2,-r-3,r,3);}
  }else if(e.kind==='split'){
    c.fillRect(-r,-r,size,size);c.fillStyle=t.accent;c.fillRect(-r+3,-r+3,Math.max(2,size-6),Math.max(2,size-6));c.fillStyle=t.color;c.fillRect(-r/2,-r/2,r,r);
  }else{
    c.fillRect(-r,-r,size,size);c.fillStyle=t.accent;c.fillRect(-r+2,-r+3,Math.max(2,size-5),2);
  }
  c.fillStyle='#293449';c.fillRect(-4,-1,3,3);c.fillRect(3,-1,3,3);
  if(e.kind==='resist'){c.strokeStyle='#d2e4bd';c.lineWidth=1.5;c.strokeRect(-r-2,-r-2,size+4,size+4);}
  if(e.slow>0){c.strokeStyle='#c5ecfa';c.strokeRect(-r-2,-r-2,size+4,size+4);}
  c.restore();
  if(e.kind==='boss'||e.kind==='tank'||e.hp<e.maxHp*.85){
   const bw=e.kind==='boss'?42:25,oy=r+7;
   c.fillStyle='#283540';c.fillRect(x-bw/2,y-oy,bw,4);
   c.fillStyle=e.kind==='boss'?'#f0b8a6':'#a9e6c9';c.fillRect(x-bw/2+1,y-oy+1,Math.max(0,(bw-2)*e.hp/e.maxHp),2);
  }
 }
 drawEffects(c,game,time){
  for(const e of game.effects){
   const t=e.life/e.initial,x=(e.x+.5)*TILE,y=(e.y+.5)*TILE;
   c.save();c.globalAlpha=Math.max(0,Math.min(1,t));c.strokeStyle=e.color||'#e7f3e7';c.fillStyle=e.color||'#e7f3e7';
   if(e.type==='line'){
    const tx=(e.tx+.5)*TILE,ty=(e.ty+.5)*TILE;c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();c.lineWidth=1;c.strokeStyle='#fff1ce';c.stroke();
   }else if(e.type==='ring'||e.type==='merge'||e.type==='spawn'){
    const radius=e.type==='ring'?(e.radius*TILE)*(1-t*.5):(1-t)*26+4;
    c.lineWidth=e.type==='merge'?4:2;c.strokeRect(x-radius,y-radius,radius*2,radius*2);
    if(e.type==='merge'){c.fillRect(x-3,y-3,6,6);}
   }else if(e.type==='pop'||e.type==='heartHit'){
    const q=(1-t)*12+2;c.fillRect(x-q,y-2,2*q,4);c.fillRect(x-2,y-q,4,2*q);
   }else if(e.type==='heart'){
    const w=game.map.w*TILE,h=game.map.h*TILE,p=1-t;
    c.strokeStyle=e.color;c.lineWidth=e.full?6:4;
    if(e.style==='wave'||e.style==='orbit'||e.style==='rain'){
     for(let i=0;i<3;i++){const r=(.16+p*.75+i*.13)*Math.min(w,h);c.strokeRect(w/2-r/1.25,h/2-r/1.7,r*1.6,r*1.35);}
    }else if(e.style==='slash'){
     for(let i=-3;i<=3;i++){const start=(i+3)/7*w;c.beginPath();c.moveTo(start,-30);c.lineTo(start+w*.4,h+30);c.stroke();}
    }else if(e.style==='burst'||e.style==='star'){
     const n=e.style==='star'?12:16;
     for(let i=0;i<n;i++){const a=i/n*Math.PI*2+time*.2,r1=Math.min(w,h)*.1,r2=Math.min(w,h)*(.3+p*.6);c.beginPath();c.moveTo(w/2+Math.cos(a)*r1,h/2+Math.sin(a)*r1);c.lineTo(w/2+Math.cos(a)*r2,h/2+Math.sin(a)*r2);c.stroke();}
    }
   }
   c.restore();
  }
 }
 drawThumbnail(canvas,map){
  // Preview uses the exact same procedural map artwork as battle, turned to
  // landscape to fit the map picker without distorting the square tiles.
  const w=map.w*TILE,h=map.h*TILE;
  canvas.width=h;canvas.height=w;
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  c.save();c.translate(h,0);c.rotate(Math.PI/2);
  drawSekaiWorld(c,map,0);
  c.restore();
 }
 drawPortrait(canvas,unit){
  const c=canvas.getContext('2d');canvas.width=60;canvas.height=60;c.clearRect(0,0,60,60);
  c.imageSmoothingEnabled=false;c.save();c.translate(30,30);c.scale(1.7,1.7);this.drawPixelPerson(c,CHARACTER_BY_ID[unit.id],'front',unit.star);c.restore();
 }
}
