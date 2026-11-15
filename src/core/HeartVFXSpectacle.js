// v1.24 — short, readable stage-wide impact motifs attached to the actual
// Heart combat state. Never writes damage, resources or fake status indicators.
// The persistent obstacles/slow zones are drawn by HeartVFXV2.
import {mechanicForHeart} from './HeartAbilities.js';

const TAU=Math.PI*2;
const PALETTE={
 ensemble:['#f2d68b','#fff0c1','#6e7794'],
 mirror:['#c9b9ee','#f6edff','#6c6094'],
 rescue:['#a6dcca','#e2fff0','#557d79'],
 spotlight:['#fbd181','#fff0b8','#8d6c85'],
 stage:['#efb9ce','#ffe3ee','#93728a'],
 beat:['#efad85','#ffe7bf','#88617d'],
 barrier:['#ffcc87','#fff0b0','#80648a'],
 quiet:['#c7d4f0','#f0f4ff','#8d96ba'],
 portal:['#8bd9d3','#e1fbf2','#5f92a1'],
 tether:['#dbc2ec','#f9e9ff','#746794'],
 armor:['#f3ab90','#ffead1','#aa6e7b']
};
const pick=(p,T)=>({x:(p.x+.5)*T,y:(p.y+.5)*T});
const clamp=(v)=>Math.max(0,Math.min(1,v));
function stroke(c,p,col,width=2){
 c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
 c.strokeStyle=col;c.lineWidth=width;c.stroke();
}
function ellipse(c,x,y,rx,ry,col,width=2){
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);
 c.strokeStyle=col;c.lineWidth=width;c.stroke();
}
function block(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);}
function polygon(c,points,fill,edge=null,width=2){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
 c.fillStyle=fill;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=width;c.stroke();}
}
function spiked(c,x,y,r,primary){
 const p=[];for(let j=0;j<12;j++){
  const a=j*Math.PI/6-Math.PI/2,d=j%2?r*.46:r;
  p.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);
 }polygon(c,p,primary);
}
function note(c,x,y,size,col){
 c.save();c.translate(x,y);c.scale(size,size);
 c.fillStyle=col;c.beginPath();c.ellipse(0,0,4,3,-.3,0,TAU);c.fill();
 block(c,3,-17,2,18,col);
 polygon(c,[[4,-17],[13,-14],[13,-10],[4,-12]],col);
 c.restore();
}
function doubleArrow(c,a,b,color,phase=0){
 const dx=b.x-a.x,dy=b.y-a.y;
 const L=Math.hypot(dx,dy)||1,vx=dx/L,vy=dy/L;
 stroke(c,[[a.x,a.y],[b.x,b.y]],'#25394d',7);
 stroke(c,[[a.x,a.y],[b.x,b.y]],color,3);
 for(let i=0;i<3;i++){
  const k=(i+.3+phase)/3%1,px=a.x+dx*k,py=a.y+dy*k;
  polygon(c,[[px+vx*8,py+vy*8],[px-vx*5-vy*5,py-vy*5+vx*5],[px-vx*5+vy*5,py-vy*5-vx*5]],'#fff6d5');
 }
}
function risingNote(c,x,y,a,t,col){
 const s=t*22;
 note(c,x+Math.sin(a*2)*5,y-9-s,.7,col);
}
function sparks(c,x,y,r,t,col,alt,count=12){
 for(let i=0;i<count;i++){
  const a=i*TAU/count+(.15*i),d=r*(.35+.65*t),px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.69;
  const q=2+(i%3)*1.2;
  block(c,px-q/2,py-q/2,q,q,i%2?alt:col);
 }
}
function focus(c,p,amp,col,alt){
 ellipse(c,p.x,p.y,amp,amp*.52,'#283c51',8);
 ellipse(c,p.x,p.y,amp,amp*.52,col,4);
 ellipse(c,p.x,p.y,amp*.52,amp*.28,alt,2);
}
function targets(g,max=12){return(g.enemies||[]).filter(e=>e.hp>0).slice(0,max);}
function enemyMark(c,g,e,T,col,time,kind){
 const p=pick(g.enemyPos(e),T);
 if(kind==='beat'){
  const r=17+Math.sin(time*9)*3;
  ellipse(c,p.x,p.y,r,r*.68,col,3);
  for(let i=0;i<3;i++)stroke(c,[[p.x-12+i*9,p.y-20],[p.x-7+i*9,p.y-29]],'#fff2ce',2.6);
 }else if(kind==='quiet'){
  polygon(c,[[p.x-19,p.y-13],[p.x+20,p.y-13],[p.x+15,p.y+16],[p.x-15,p.y+16]],'#f0f4ff21','#fff8e5',2);
  block(c,p.x-5,p.y-9,3,17,'#f3f8fd');block(c,p.x+3,p.y-9,3,17,'#f3f8fd');
 }else if(kind==='tether'){
  for(let i=0;i<4;i++){
   const theta=i*TAU/4;
   stroke(c,[[p.x+Math.cos(theta)*21,p.y+Math.sin(theta)*16],[p.x-Math.cos(theta)*10,p.y-Math.sin(theta)*8]],col,3);
  }
  focus(c,p,18,col,'#fff4d6');
 }else if(kind==='armor'){
  polygon(c,[[p.x-18,p.y-16],[p.x+18,p.y-16],[p.x+22,p.y+10],[p.x,p.y+20],[p.x-22,p.y+10]],'#f5a79344',col,2);
  stroke(c,[[p.x-7,p.y-16],[p.x+2,p.y-4],[p.x-4,p.y+7],[p.x+12,p.y+17]],'#fff4ce',3);
 }else if(kind==='portal'){
  ellipse(c,p.x,p.y+5,24,13,col,3);
  block(c,p.x-5,p.y-21,10,5,'#fff6de');
 }
}
function castBackdrop(c,w,h,col,alt,progress){
 // High contrast, brief banded composition; never cover the field entirely.
 const spread=progress*60;
 c.save();c.globalAlpha=.32*(1-progress*.55);
 polygon(c,[[0,0],[w*.56+spread,0],[w*.29,h*.55],[0,h*.48]],col);
 polygon(c,[[w,h],[w*.43-spread,h],[w*.77,h*.45],[w,h*.52]],alt);
 c.restore();
}
// Foreground animation while a skill is winding up and for the first ~1s
// after actual activation. It remains useful in reduced-motion mode.
export function drawHeartSpectacle(c,g,time,T=32,reduced=false){
 const scene=g.heartScene;
 const state=(g.heartStates||[]).find(s=>s.remaining>0);
 if(!scene&&!state)return;
 const type=state?.type||(scene&&mechanicForHeart(scene.heart));
 if(!type)return;
 const [col,alt,shadow]=PALETTE[type]||PALETTE.ensemble;
 const start=state?state.total-state.remaining:0;
 const pulse=scene?clamp(scene.elapsed/1.62):1;
 const age=scene?scene.elapsed-.62:start;
 const intro=!!scene&&scene.elapsed<.62;
 const amp=intro?clamp(scene.elapsed/.62):Math.max(0,1-clamp(Math.max(age,0)/1.15));
 // The sustained effect is rendered elsewhere; leave enemies readable as it fades.
 if(amp<=.01)return;
 const p=scene&&g.units.find(u=>u.uid===scene.actorUid)||
  (state&&g.units.find(u=>u.uid===state.unitIds[0]));
 const at=p?pick(p,T):{x:g.map.w*T/2,y:g.map.h*T/2};
 const w=g.map.w*T,h=g.map.h*T,phase=reduced?.72:clamp(pulse);
 const actors=(state?g.units.filter(u=>state.unitIds.includes(u.uid)):
  g.units.filter(u=>scene.heart.required.includes(u.id))).slice(0,6);
 const live=targets(g);
 c.save();c.globalAlpha=clamp(amp*.84+.13);
 if(intro)castBackdrop(c,w,h,col,alt,phase);
 // All spells rise from the character who ACTUALLY casts them.
 focus(c,at,23+phase*55,col,alt);
 sparks(c,at.x,at.y,35+phase*55,phase,col,alt,16);
 switch(type){
  case 'ensemble':
  case 'mirror':
  case 'rescue':{
   for(const u of actors){
    const point=pick(u,T);
    doubleArrow(c,at,point,col,phase);
    focus(c,point,20+Math.sin(phase*Math.PI)*9,col,alt);
    for(let i=0;i<3;i++)risingNote(c,point.x+(i-1)*12,point.y,phase+i,time,col);
    if(type==='rescue'){
     polygon(c,[[point.x,point.y-30],[point.x+19,point.y-16],[point.x+15,point.y+13],[point.x,point.y+23],[point.x-15,point.y+13],[point.x-19,point.y-16]],
      '#a6e0cb66',alt,3);
     block(c,point.x-3,point.y-13,6,23,'#fffbe9');
     block(c,point.x-11,point.y-5,22,6,'#fffbe9');
    }
   }
   if(type==='mirror')for(const enemy of live.slice(0,5)){
    doubleArrow(c,at,pick(g.enemyPos(enemy),T),alt,phase);
   }
   break;
  }
  case 'spotlight':
  case 'stage':{
   for(const [i,z] of (state?.zones||[]).entries()){
    const t=pick(z,T),r=38+phase*30;
    polygon(c,[[t.x-23,4],[t.x+23,4],[t.x+r,t.y],[t.x-r,t.y]],'#fff0bb4a',col,2);
    ellipse(c,t.x,t.y,r,r*.55,col,4.5);
    ellipse(c,t.x,t.y,r*.55,r*.32,alt,2);
    if(type==='stage')for(let k=0;k<4;k++){
     const x=t.x-25+k*16;
     block(c,x,t.y-20,12,38,k%2?'#dca6c8ad':'#fbe0a5ad');
    }
    sparks(c,t.x,t.y,r,phase,col,alt,10);
   }
   break;
  }
  case 'barrier':{
   for(const z of state?.gates||[]){
    const t=pick(z,T);
    for(let k=0;k<5;k++){
     const x=t.x-27+k*13;
     polygon(c,[[x,t.y-47],[x+11,t.y-47],[x+11,t.y+21],[x,t.y+21]],k%2?'#f9d89e':'#8e6078',alt,1.5);
    }
    stroke(c,[[t.x-37,t.y-48],[t.x+37,t.y-48]],alt,5);
    stroke(c,[[t.x-37,t.y+22],[t.x+37,t.y+22]],col,5);
    sparks(c,t.x,t.y-21,45,phase,col,alt,9);
   }
   break;
  }
  case 'beat':{
   const amount=reduced?.66:(time*2.6)%1;
   for(let i=0;i<5;i++){
    let y=(i+.5)*h/5,yy=y+Math.sin(time*4+i)*4;
    block(c,5,yy,w-10,5,i%2?col:alt);
    for(let k=0;k<12;k++){
     let height=8+((i*7+k*11)%5)*8*amount;
     block(c,12+k*(w-24)/12,yy-height,8,height,k%2?col:'#fff4d4');
    }
   }
   for(const e of live.slice(0,10))enemyMark(c,g,e,T,col,time,'beat');
   break;
  }
  case 'quiet':{
   c.globalAlpha=Math.min(.8,amp*.7);
   block(c,0,0,w,h,'#dee4f2a0');
   for(let i=0;i<6;i++){
    const yy=(i+.5)*h/6;
    stroke(c,[[0,yy],[w,yy]],i%2?col:shadow,4);
   }
   c.globalAlpha=amp;
   for(const e of live.slice(0,13))enemyMark(c,g,e,T,col,time,'quiet');
   break;
  }
  case 'portal':{
   const ps=state?.portals||[];
   if(ps.length>1){
    const a=pick(ps[0],T),b=pick(ps[1],T);
    doubleArrow(c,b,a,col,phase);
    for(const pt of [a,b]){
     for(let i=0;i<4;i++)ellipse(c,pt.x,pt.y,20+phase*15+i*8,11+phase*7+i*4,i%2?col:alt,2.6);
     sparks(c,pt.x,pt.y,44,phase,col,alt,12);
    }
   }
   for(const e of live.slice(0,6))enemyMark(c,g,e,T,col,time,'portal');
   break;
  }
  case 'tether':
  case 'armor':{
   const found=live.filter(e=>state?.targets?.includes(e.uid));
   for(const e of found){
    const pt=pick(g.enemyPos(e),T);
    if(type==='tether')doubleArrow(c,at,pt,col,phase);
    enemyMark(c,g,e,T,col,time,type);
    sparks(c,pt.x,pt.y,35,phase,col,alt,9);
   }
   break;
  }
 }
 c.restore();
}
