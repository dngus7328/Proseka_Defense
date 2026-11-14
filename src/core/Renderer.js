import {CHARACTER_BY_ID,CHARACTERS,SIGNATURES,STAR_SCALE} from '../data/characters.js';
import {ENEMIES} from '../data/enemies.js';
import {tileKey} from '../data/maps.js';
import {drawSekaiWorld} from './SekaiMapArt.js';
import {drawEnemyArt} from './EnemyArt.js';
const TILE=32;
const DIRECTIONS=['front','front-left','back-left','back'];
const hash=(x,y,n=0)=>((x*374761393+y*668265263+n*1442695041)>>>0)%100000;
const lerp=(a,b,t)=>a+(b-a)*t;
const point=(x,y)=>({x,y});
// SEKAI heart attacks have six distinct visual grammars. All are bounded
// around the center or the enemies actually hit, rather than masking the map.
function heartStar(c,x,y,r,spin=0){
 c.beginPath();
 for(let i=0;i<10;i++){
  const a=-Math.PI/2+spin+i*Math.PI/5,q=i%2===0?r:r*.4;
  const px=x+Math.cos(a)*q,py=y+Math.sin(a)*q;
  if(i===0)c.moveTo(px,py);else c.lineTo(px,py);
 }
 c.closePath();c.stroke();
}
function heartTarget(c,e,t,x,y){
 const p=1-t,style=e.style||'star',seed=(e.impactIndex||0)*.55;
 c.save();c.translate(x,y);
 c.lineWidth=e.full?2.8:1.8;
 c.strokeStyle=e.color||'#e7dfbe';
 c.fillStyle='#fff4d6';
 if(style==='star'){
  // Leo/need: a precise stellar strike with its own trailing chord.
  heartStar(c,0,0,7+p*8,p*1.8+seed);
  c.beginPath();c.moveTo(-14-p*8,9);c.lineTo(14+p*8,-9);c.stroke();
 }else if(style==='rain'){
  // MORE MORE JUMP!: four stage-light drops, not a generic circle.
  for(let i=0;i<4;i++){
   const xx=(i-1.5)*7,yy=-16+p*23-i*4;
   c.fillRect(xx,yy,3,8);
   c.beginPath();c.moveTo(xx+2,yy+11);c.lineTo(xx+2,yy+16);c.stroke();
  }
 }else if(style==='slash'){
  // Vivid BAD SQUAD: hard diagonal alternating cuts.
  for(let i=0;i<3;i++){
   const k=(i-1)*9;
   c.beginPath();c.moveTo(-13+k-p*7,13);c.lineTo(13+k+p*7,-13);c.stroke();
  }
  c.fillRect(2+p*7,-13,7,3);
 }else if(style==='burst'){
  // Wonderlands x Showtime: chunky colored stage-confetti blast.
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4+seed,rad=7+p*17;
   const px=Math.cos(a)*rad,py=Math.sin(a)*rad;
   c.fillRect(px-2,py-2,i%2?3:5,i%2?6:3);
  }
  c.strokeRect(-6-p*2,-6-p*2,12+p*4,12+p*4);
 }else if(style==='wave'){
  // Nightcord: quiet expanding score lines and a tiny suspended note.
  for(let i=0;i<3;i++){
   c.beginPath();c.ellipse(0,0,6+p*13+i*4,4+p*9+i*3,0,0,Math.PI*2);c.stroke();
  }
  c.fillRect(-2,-13-p*6,4,4);
 }else if(style==='orbit'){
  // Virtual Singers: a small six-point echo ring.
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3+p*2,rad=12+p*10;
   const px=Math.cos(a)*rad,py=Math.sin(a)*rad;
   c.fillRect(px-2,py-2,4,4);
   c.beginPath();c.moveTo(px,py);c.lineTo(px-Math.cos(a)*6,py-Math.sin(a)*6);c.stroke();
  }
  c.beginPath();c.arc(0,0,5+p*8,0,Math.PI*2);c.stroke();
 }
 c.restore();
}
function heartField(c,game,e,t,time,x,y){
 const p=1-t,style=e.style||'star';
 const halfW=Math.min(120,game.map.w*TILE*.28),halfH=Math.min(140,game.map.h*TILE*.34);
 c.save();c.translate(x,y);
 c.lineWidth=e.full?3.2:2.2;
 c.strokeStyle=e.color||'#b4d4d9';c.fillStyle=e.color||'#b4d4d9';
 if(e.type==='heartCrest'){
  const radius=12+p*48;
  for(let i=0;i<4;i++){
   const a=Math.PI/4+i*Math.PI/2+time*.08;
   c.save();c.translate(Math.cos(a)*radius,Math.sin(a)*radius);
   c.rotate(a);c.strokeRect(-5,-5,10,10);c.restore();
  }
  c.beginPath();c.ellipse(0,0,20+p*50,13+p*35,0,0,Math.PI*2);c.stroke();
 }else if(style==='star'){
  // Four star nodes connect into a single musical constellation.
  const nodes=[[-.7,-.6],[.55,-.72],[.85,.52],[-.64,.63]];
  c.beginPath();
  nodes.forEach(([nx,ny],i)=>{const px=nx*halfW*(.5+p*.5),py=ny*halfH*(.5+p*.5);
   if(i===0)c.moveTo(px,py);else c.lineTo(px,py);});c.closePath();c.stroke();
  nodes.forEach(([nx,ny],i)=>{
   heartStar(c,nx*halfW*(.5+p*.5),ny*halfH*(.5+p*.5),7+3*p,i*.18+p);
  });
  heartStar(c,0,0,14+p*10,p*.22);
 }else if(style==='rain'){
  // Stage lighting and a curtain of confetti fall in staggered bands.
  for(let i=0;i<10;i++){
   const xx=(i-4.5)*halfW/5,yy=-halfH*.9+((p*1.35+i*.13)%1.5)*halfH*1.2;
   c.fillRect(xx,yy,(i%3?3:5),7+(i%4)*2);
   c.beginPath();c.moveTo(xx+1,yy-19);c.lineTo(xx+1,yy-5);c.stroke();
  }
  for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*45,-halfH);
   c.lineTo(i*55+Math.sin(time*2+i)*9,halfH*.5);c.stroke();}
 }else if(style==='slash'){
  for(let i=-2;i<=2;i++){
   const offset=i*27+Math.sin(time*9+i)*4;
   c.beginPath();c.moveTo(-halfW+offset,halfH*.7-p*23);
   c.lineTo(halfW+offset,-halfH*.7+p*18);c.stroke();
   c.fillRect(offset+14,0,7,3);
  }
 }else if(style==='burst'){
  for(let i=0;i<14;i++){
   const a=i*Math.PI*2/14+(i%3)*.11,rad=12+p*(35+(i%4)*13);
   const px=Math.cos(a)*rad,py=Math.sin(a)*rad;
   c.save();c.translate(px,py);c.rotate(a+p);
   c.fillRect(-3,-2,(i%2?4:8),(i%3?4:7));c.restore();
  }
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;
   c.beginPath();c.moveTo(Math.cos(a)*13,Math.sin(a)*13);
   c.lineTo(Math.cos(a)*(45+p*42),Math.sin(a)*(45+p*42));c.stroke();
  }
 }else if(style==='wave'){
  for(let i=0;i<4;i++){
   const rx=10+Math.max(0,p-i*.15)*halfW,ry=7+Math.max(0,p-i*.15)*halfH*.65;
   c.beginPath();c.ellipse(0,0,rx,ry,0,0,Math.PI*2);c.stroke();
  }
  for(let i=0;i<7;i++){
   const xx=(i-3)*23,yy=-halfH*.5+Math.sin(time*1.9+i)*5;
   c.fillRect(xx,yy+p*halfH*.52,2,4);
  }
 }else if(style==='orbit'){
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3+p*3.1,rx=halfW*(.43+p*.38),ry=halfH*(.3+p*.28);
   const px=Math.cos(a)*rx,py=Math.sin(a)*ry;
   c.beginPath();c.moveTo(px,py);c.lineTo(px-Math.cos(a)*11,py-Math.sin(a)*11);c.stroke();
   c.save();c.translate(px,py);c.rotate(a);c.fillRect(-5,-4,10,8);c.restore();
  }
  c.beginPath();c.ellipse(0,0,halfW*(.38+p*.4),halfH*(.26+p*.32),0,0,Math.PI*2);c.stroke();
 }
 c.restore();
}
export class Renderer {
 constructor(canvas){
  this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.currentMap=null;this.tileSize=TILE;this.ctx.imageSmoothingEnabled=false;
  this.spriteImages=Object.create(null);
  this.spriteRenders=new Map();
  this.currentTitleMap=null;
  this.reduceMotion=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  this.effectsLite=false;
  this.loadCharacterSprites();
 }
 loadCharacterSprites(){
  const titleCharacters=new Set(['miku','ichika','emu','kanade']);
  for(const hero of CHARACTERS){
   const directions=Object.create(null);
   this.spriteImages[hero.id]=directions;
   for(const angle of DIRECTIONS){
    const img=new Image();
    directions[angle]=img;
    img.addEventListener('load',()=>{
     // Title artwork is drawn only on demand, so refresh it when one of its sprites arrives.
     if(angle==='front'&&titleCharacters.has(hero.id)&&this.currentTitleMap&&document.getElementById('titleOverlay')?.classList.contains('visible')){
      this.drawTitleScene(document.getElementById('titlePreview'),this.currentTitleMap);
     }
    });
    img.src=`./Assets/characters/${hero.id}/${angle}.png`;
   }
  }
 }
 getSprite(characterId,direction='front'){
  const img=this.spriteImages[characterId]?.[direction];
  return img?.complete&&img.naturalWidth>0?img:null;
 }
 getPreparedSprite(id,direction,width){
  const raw=this.getSprite(id,direction);
  if(!raw)return null;
  // Draw each character/direction/rank combination at high quality only once.
  // Runtime sprite motion then moves an already small transparent bitmap.
  const pixels=Math.max(8,Math.round(width));
  const key=id+'/'+direction+'/'+pixels;
  const ready=this.spriteRenders.get(key);
  if(ready)return ready;
  let canvas=null;
  try{
   if(typeof OffscreenCanvas!=='undefined')canvas=new OffscreenCanvas(pixels,pixels);
   else if(typeof document!=='undefined'){
    canvas=document.createElement('canvas');canvas.width=pixels;canvas.height=pixels;
   }
   const ctx=canvas?.getContext('2d',{alpha:true});
   if(!ctx)return raw;
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(raw,0,0,pixels,pixels);
   if(this.spriteRenders.size>=600)this.spriteRenders.clear();
   this.spriteRenders.set(key,canvas);
   return canvas;
  }catch{return raw;}
 }
 drawSprite(c,id,direction,x,y,width,flip=false){
  const image=this.getPreparedSprite(id,direction,width);
  if(!image)return false;
  c.save();c.translate(x,y);if(flip)c.scale(-1,1);
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='low';
  c.drawImage(image,-width/2,-width,width,width);
  c.restore();return true;
 }
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
  if(game.cameraShake>0&&!this.reduceMotion&&!this.effectsLite){const q=game.cameraShake;const j=Math.sin(time*129)*q;c.translate(j,Math.cos(time*151)*q*.65);}
  drawSekaiWorld(c,m,time,this.reduceMotion||this.effectsLite);
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
    c.fillStyle=m.theme==='empty'?'#728d9a77':m.theme==='wonderland'?'#f3e4b6a5':m.theme==='stage'?'#f2d4dca5':'#c3eee384';
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
  const x=(u.x+.5)*TILE,y=(u.y+.5)*TILE;
  const profile=CHARACTER_BY_ID[u.id],accent=profile.hair;
  const calm=this.reduceMotion||this.effectsLite;
  const signature=SIGNATURES[u.id];
  const beat=signature?.kind==='repeat'?4.4:signature?.kind==='smash'?2.4:3.15;
  // The four supplied directional sprites remain untouched: the feeling of
  // animation comes from controlled body motion, recoil and pose changes.
  const idleBob=calm?0:Math.sin(time*beat+u.uid*1.9)*1.15;
  const breathe=calm?0:Math.sin(time*1.55+u.uid*.87)*.018;
  const attackPhase=u.motion>0?Math.max(0,1-u.motion/.23):0;
  const impact=attackPhase>0&&attackPhase<1?Math.sin(attackPhase*Math.PI):0;
  const recoil=impact*(u.star>=3?4.1:2.8);
  const sway=(calm?0:Math.sin(time*1.8+u.uid)*1.25);
  const swing=impact*u.pose*(u.star>=3?10:7.2)+sway;
  const inAmount=Math.max(0,(u.entrance||0)/.55);
  const promotionAmount=Math.max(0,(u.promotion||0)/.85);
  const rise=promotionAmount?Math.sin(Math.PI*(1-promotionAmount))*6.5:0;
  const lean=(u.aimX||u.pose||0)>=0?1:-1;
  const rush=lean*impact*(signature?.kind==='smash'?3.8:2.2);
  const size=42+(u.star-1)*2.5;
  let facing=u.facing||'front',mirrored=!!u.mirrored;
  if(this.rotated&&Number.isFinite(u.aimX)&&Number.isFinite(u.aimY)){
   const dx=-u.aimY,dy=u.aimX;
   if(Math.abs(dx)>.38&&Math.abs(dx)>Math.abs(dy)*.5){facing=dy>=0?'front-left':'back-left';mirrored=dx>0;}
   else{facing=dy>=0?'front':'back';mirrored=false;}
  }
  c.save();c.translate(Math.round(x),Math.round(y));
  if(this.rotated)c.rotate(-Math.PI/2);
  // Rank is visible from the ground ornament and badge without recoloring the sprite.
  c.save();c.translate(0,10);
  c.fillStyle='#20323c85';c.beginPath();c.ellipse(0,8,14+u.star*1.5,5.5,0,0,Math.PI*2);c.fill();
  if(u.star>=2){
   const radius=13+u.star*2.2;
   c.strokeStyle=u.star===2?'#d1dfd5':u.star===3?'#e7cfa0':'#f9dc85';
   c.lineWidth=u.star===4?2.6:1.5;c.beginPath();c.ellipse(0,7,radius,8+u.star*.3,0,0,Math.PI*2);c.stroke();
   if(u.star>=3){
    for(let i=0;i<4;i++){
     const a=Math.PI*.25+i*Math.PI*.5;
     const px=Math.cos(a)*(radius+2),py=7+Math.sin(a)*10;
     c.fillStyle=u.star===4?'#f5d07d':'#b7d7d9';
     c.fillRect(Math.round(px)-2,Math.round(py)-2,4,4);
    }
   }
   if(u.star===4){
    const pulse=.6+Math.sin(time*2.1+u.uid)*.24;
    c.globalAlpha=pulse;c.fillStyle='#fee6a1';
    for(let i=0;i<4;i++){
     const a=(time*.38+i*.25)*Math.PI*2;
     const px=Math.cos(a)*21,py=6+Math.sin(a)*11;
     c.fillRect(Math.round(px),Math.round(py),2,3);
    }
    c.globalAlpha=1;
   }
  }
  c.restore();
  c.translate(rush,idleBob-recoil+10-inAmount*9-rise);
  c.rotate(swing*Math.PI/180);
  const bounce=promotionAmount?Math.sin(Math.PI*(1-promotionAmount))*.12:0;
  const squash=impact*(signature?.kind==='smash'?.08:.045);
  // Slight stretch at a strike, squeeze while landing; no image restyling.
  c.scale(1+bounce+breathe+squash,1+bounce-breathe-squash*.6);
  if(inAmount>.001){
   c.globalAlpha=Math.max(.08,1-inAmount*.28);
  }
  if(u.star>=3){
   c.fillStyle=u.star===4?'#f4d38c':'#d1dce7';
   c.fillRect(-15,-size+10,4,4);
   c.fillRect(12,-size+6,4,4);
   if(u.star===4){c.fillRect(-9,-size+1,18,2);c.fillRect(-9,-size+3,3,4);c.fillRect(6,-size+3,3,4);}
  }
  this.drawSprite(c,u.id,facing,0,6+size*6/192,size,mirrored);
  c.restore();
  if(impact>.12&&!calm){
   c.save();c.translate(Math.round(x),Math.round(y+12));
   // A short, low ground pulse to emphasize contact instead of bright bloom.
   c.fillStyle=signature?.kind==='smash'?'#f1d6a2':'#d3e4d2';
   c.globalAlpha=impact*.55;
   c.fillRect(-9-impact*6,9,5,2);
   c.fillRect(5+impact*6,9,5,2);
   c.restore();
  }
  // Stacked stars make the exact rank identifiable at gameplay zoom.
  c.save();c.translate(Math.round(x),Math.round(y+15));
  if(this.rotated)c.rotate(-Math.PI/2);
  const badgeW=8+u.star*9;
  c.fillStyle=u.star===4?'#544931':u.star===3?'#485367':'#304e5b';
  c.fillRect(-badgeW/2,-1,badgeW,10);
  c.fillStyle=u.star===4?'#eec979':u.star===3?'#e6c5a0':u.star===2?'#c9d8de':'#d4e6de';
  c.font='bold 9px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('★'.repeat(u.star),0,4);
  if(game.selectedId===u.uid){
   c.strokeStyle='#faf0c9';c.lineWidth=1.5;c.strokeRect(-16,-33,32,45);
  }
  c.restore();
 }
 drawEnemy(c,game,e,time){
  drawEnemyArt(c,game,e,time,this.rotated,this.reduceMotion||this.effectsLite);
 }
 drawEffects(c,game,time){
  // At high density, prioritize recent attacks and impactful effects.
  // This bounds the canvas work without changing damage or cooldown logic.
  const maxDraw=this.effectsLite?48:game.enemies.length>=35?72:110;
  const start=Math.max(0,game.effects.length-maxDraw);
  for(let index=start;index<game.effects.length;index++){
   const e=game.effects[index];
   const t=e.initial?e.life/e.initial:0;
   const x=(e.x+.5)*TILE,y=(e.y+.5)*TILE,age=1-t;
   c.save();c.globalAlpha=Math.max(0,Math.min(1,t));c.strokeStyle=e.color||'#e7f3e7';c.fillStyle=e.color||'#e7f3e7';
   if(e.type==='projectile'){
    const endX=(e.tx+.5)*TILE,endY=(e.ty+.5)*TILE;
    const travel=Math.max(0,Math.min(1,age));
    const px=lerp(x,endX,travel),py=lerp(y,endY,travel);
    const star=Math.max(1,e.star||1);
    c.globalAlpha=1;
    // Compact, flat projectile shapes: not a blanket neon/glow effect.
    c.strokeStyle=e.color||'#e8e6cb';c.lineWidth=star>=3?3:2;
    c.beginPath();c.moveTo(lerp(x,px,.68),lerp(y,py,.68));c.lineTo(px,py);c.stroke();
    c.fillStyle=star>=4?'#fff0bf':e.color||'#e8eadb';
    const r=star>=4?5:star>=2?4:3;
    if(['spark','star','bell','pom','cheer','confetti','spotlight','note'].includes(e.motif)){
     c.fillRect(px-r/2,py-r*1.5,r,r*3);c.fillRect(px-r*1.5,py-r/2,r*3,r);
    }else if(['frost','snow','crystal','rain','echo','sheet'].includes(e.motif)){
     c.beginPath();c.moveTo(px,py-r*1.6);c.lineTo(px+r,py);c.lineTo(px,py+r*1.6);c.lineTo(px-r,py);c.closePath();c.fill();
    }else{c.fillRect(Math.round(px-r),Math.round(py-r),r*2,r*2);}
   }else if(e.type==='impact'||e.type==='signature'){
    const motif=e.motif||'note',radius=(e.size||1)*(9+age*16+(e.star||1)*1.4);
    const points=e.type==='signature'?8:6;
    c.lineWidth=e.type==='signature'?3:2;
    for(let i=0;i<points;i++){
     const a=i*2*Math.PI/points+((motif.length%7)*.18);
     const inner=radius*.38,outer=radius*(.65+age*.4);
     c.beginPath();c.moveTo(x+Math.cos(a)*inner,y+Math.sin(a)*inner);
     c.lineTo(x+Math.cos(a)*outer,y+Math.sin(a)*outer);c.stroke();
     const q=e.type==='signature'?3:2;
     c.fillRect(Math.round(x+Math.cos(a)*outer)-q/2,Math.round(y+Math.sin(a)*outer)-q/2,q,q);
    }
    if(e.type==='signature'){
     const marks={
      string:'♪',spark:'✦',drum:'◎',bass:'≡',cheer:'★',crystal:'◇',pom:'✺',
      rain:'≋',microphone:'♩',graffiti:'×',flame:'♨',keyboard:'♯',
      spotlight:'▲',confetti:'▥',robot:'⊞',gear:'⚙',sheet:'♫',
      frost:'❄',paint:'◈',ribbon:'∞',note:'♪',bell:'♬',slash:'╱',
      echo:'◉',rose:'✿',snow:'❅'
     };
     c.globalAlpha=t>.3?1:t*2.9;
     c.font='bold 19px Arial';c.textAlign='center';c.textBaseline='middle';
     c.fillStyle='#203c4b';c.fillText(marks[motif]||'✦',x+2,y-5+2);
     c.fillStyle='#fff6df';c.fillText(marks[motif]||'✦',x,y-5);
     c.lineWidth=2;c.strokeStyle=e.color||'#e7f3e7';
     c.strokeRect(x-radius*.36,y-radius*.36,radius*.72,radius*.72);
     c.fillStyle='#fff8e6';c.fillRect(x-3,y-3,6,6);
    }else if(e.style==='splash'||e.style==='burst'){
     c.lineWidth=2;c.beginPath();c.ellipse(x,y,radius*.8,radius*.6,0,0,2*Math.PI);c.stroke();
    }
   }else if(e.type==='damage'){
    c.globalAlpha=t>.45?1:t*2.2;
    c.fillStyle='#263747';c.font=`bold ${e.star>=4?15:12}px Arial`;
    c.textAlign='center';c.textBaseline='middle';
    const label=String(e.value||0),yy=y-17-age*18;
    c.fillText(label,x+1,yy+2);
    c.fillStyle=e.color||'#fff6da';c.fillText(label,x,yy);
   }else if(e.type==='promotion'){
    const r=5+age*34,corners=Math.max(2,e.star||2);
    c.lineWidth=3;c.strokeRect(x-r,y-r,r*2,r*2);
    c.textAlign='center';c.font='bold 14px Arial';
    c.fillText('★'.repeat(corners),x,y-r-5);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;c.fillRect(x+Math.cos(a)*r-2,y+Math.sin(a)*r-2,4,4);}
   }else if(e.type==='line'){
    const tx=(e.tx+.5)*TILE,ty=(e.ty+.5)*TILE;
    c.lineWidth=e.star>=3?4:3;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();
    c.lineWidth=1;c.strokeStyle='#fff1ce';c.stroke();
   }else if(e.type==='ring'||e.type==='merge'||e.type==='spawn'){
    const radius=e.type==='ring'?(e.radius*TILE)*(1-t*.5):(1-t)*26+4;
    c.lineWidth=e.type==='merge'?4:2;c.strokeRect(x-radius,y-radius,radius*2,radius*2);
    if(e.type==='merge'){c.fillRect(x-3,y-3,6,6);}
    if(e.type==='spawn'){
     for(let i=0;i<4;i++){const a=i*Math.PI/2;c.fillRect(x+Math.cos(a)*radius-2,y+Math.sin(a)*radius-2,4,4);}
    }
    }else if(e.type==='heartHit'){
    heartTarget(c,e,t,x,y);
   }else if(e.type==='pop'){
    const q=(1-t)*12+2;c.fillRect(x-q,y-2,2*q,4);c.fillRect(x-2,y-q,4,2*q);
   }else if(e.type==='heart'||e.type==='heartCrest'){
    heartField(c,game,e,t,time,x,y);
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
 drawTitleScene(canvas,map){
  this.currentTitleMap=map;
  this.drawThumbnail(canvas,map);
  const c=canvas.getContext('2d');
  const w=canvas.width,h=canvas.height;
  const roster=['miku','ichika','emu','kanade'];
  const positions=[[.40,.72],[.465,.68],[.535,.72],[.60,.68]];
  c.save();
  for(let i=0;i<roster.length;i++){
   const x=Math.round(w*positions[i][0]),y=Math.round(h*positions[i][1]);
   c.fillStyle='#071a2b77';c.fillRect(x-16,y+15,32,5);
   c.fillStyle='#f9df8366';c.fillRect(x-16,y+11,32,2);
   this.drawSprite(c,roster[i],'front',x,y+16,45);
  }
  c.restore();
 }
 drawPortrait(canvas,unit){
  const c=canvas.getContext('2d');canvas.width=80;canvas.height=80;
  c.clearRect(0,0,80,80);
  this.drawSprite(c,unit.id,'front',40,75,76);
 }
}
