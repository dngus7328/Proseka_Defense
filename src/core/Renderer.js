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
export class Renderer {
 constructor(canvas){
  this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.currentMap=null;this.tileSize=TILE;this.ctx.imageSmoothingEnabled=false;
  this.spriteImages=Object.create(null);
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
 drawSprite(c,id,direction,x,y,width,flip=false){
  const image=this.getSprite(id,direction);
  if(!image)return false;
  c.save();c.translate(x,y);if(flip)c.scale(-1,1);
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  // 192px source sheets have a shared center and foot baseline.
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
  for(const e of game.effects){
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
