// Persistent 2D stage effects for Heart skills. All vector effects are
// drawn on top of square-tile worlds, leaving the original character sprites
// unchanged and the board geometry intact.
const pi=Math.PI,TAU=pi*2;
const lerp=(a,b,t)=>a+(b-a)*t;
function line(c,a,b,col,width=2){
 c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
}
function star(c,x,y,r){
 c.beginPath();
 for(let i=0;i<8;i++){
  const a=-pi/2+i*pi/4,q=i%2?r*.42:r;
  i?c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):c.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q);
 }
 c.closePath();c.fill();
}
const xy=(p,TILE)=>({x:(p.x+.5)*TILE,y:(p.y+.5)*TILE});
function tag(c,label,x,y,color){
 c.save();c.font='bold 11px Arial,sans-serif';
 const len=Math.min(86,Math.max(48,c.measureText(label).width+14));
 c.fillStyle='#263b51df';c.fillRect(x-len/2,y-9,len,17);
 c.fillStyle='#fff4de';c.textAlign='center';c.textBaseline='middle';
 c.fillText(label,x,y,len-7);c.strokeStyle=color;c.lineWidth=1;
 c.strokeRect(x-len/2+.5,y-8.5,len-1,16);
 c.restore();
}
function barrier(c,x,y,col,pulse,time){
 c.save();c.translate(x,y);
 c.globalAlpha=.92;
 c.strokeStyle=col;c.fillStyle='#43526bdc';c.lineWidth=3;
 c.fillRect(-18,-15,36,29);c.strokeRect(-18,-15,36,29);
 for(let i=-1;i<2;i++){
  c.beginPath();c.moveTo(i*10-5,-13);c.lineTo(i*10+4,11);c.stroke();
 }
 c.fillStyle='#ffe3ac';c.fillRect(-15,-15,30,5);
 const sway=1+Math.sin(time*3)*.07;
 c.beginPath();c.moveTo(0,-26);c.lineTo(7,-17);c.lineTo(0,-11);c.lineTo(-7,-17);c.closePath();c.fill();
 tag(c,'STOP',0,-38,col);
 c.restore();
}
function spotlight(c,p,t,col,range=1.65){
 c.save();c.translate(p.x,p.y);
 const r=range*t; // range is in tile units
 const beam=range*30;
 c.globalAlpha=.13;c.fillStyle=col;c.beginPath();
 c.moveTo(-beam*.58,-beam*1.6);c.lineTo(beam*.58,-beam*1.6);
 c.lineTo(beam*.97,0);c.lineTo(-beam*.97,0);c.closePath();c.fill();
 c.globalAlpha=.46;c.strokeStyle=col;c.lineWidth=2.4;
 c.beginPath();c.ellipse(0,0,beam*.82,beam*.36,0,0,TAU);c.stroke();
 c.globalAlpha=.9;c.fillStyle='#fff0ce';
 c.fillRect(-17,-4,34,6);c.fillRect(-3,-9,6,16);
 tag(c,'SLOW',0,-21,col);
 c.restore();
}
function portal(c,x,y,col,time,size=32){
 const spin=time*.75;
 c.save();c.translate(x,y);
 c.lineWidth=3;c.strokeStyle=col;c.fillStyle='#f0e6f4aa';
 c.beginPath();c.ellipse(0,0,size,size*.38,0,0,TAU);c.stroke();
 c.beginPath();c.arc(0,-13,size*.49,spin,spin+pi*1.47);c.stroke();
 for(let k=0;k<6;k++){
  const angle=k*TAU/6+spin;
  c.fillRect(Math.cos(angle)*size*.8-3,Math.sin(angle)*size*.44-3,6,6);
 }
 c.font='bold 19px Arial';c.textAlign='center';c.fillText('↶',0,-5);
 c.restore();
}
export function drawHeartStates(c,g,time,TILE=32){
 if(!g.heartStates?.length)return;
 const reduced=!!g.reduceMotion;
 for(const s of g.heartStates){
  const p=1-s.remaining/s.total,alpha=Math.min(1,s.remaining*.85);
  c.save();c.globalAlpha=alpha;
  const col=s.color||'#cddaca',actors=g.units.filter(u=>s.unitIds.includes(u.uid));
  if(s.type==='ensemble'||s.type==='mirror'||s.type==='rescue'){
   const members=actors.map(u=>xy(u,TILE));
   c.lineWidth=3.2;c.strokeStyle=col;
   if(members.length>1){
    for(let i=0;i<members.length-1;i++){
     const a=members[i],b=members[i+1],phase=(time*.75+i*.24)%1;
     line(c,a,b,col,3);
     c.fillStyle='#fff8d8';
     star(c,lerp(a.x,b.x,phase),lerp(a.y,b.y,phase),6.2);
    }
    if(s.type==='ensemble'&&members.length>2)
     line(c,members[members.length-1],members[0],col,2);
   }
   for(const a of members){
    c.strokeStyle=col;c.lineWidth=2.4;c.beginPath();
    c.ellipse(a.x,a.y+10,19,8,0,0,TAU);c.stroke();
    c.fillStyle='#fff5cb';c.font='bold 12px Arial';c.textAlign='center';
    c.fillText(s.type==='rescue'?'✓':s.type==='mirror'?'♪':'♬',a.x,a.y-30);
   }
  }
  if(s.type==='spotlight'||s.type==='stage')
   for(const z of s.zones||[])spotlight(c,xy(z,TILE),TILE,col,s.type==='spotlight'?1.65:1.35);
  if(s.gates)
   for(const z of s.gates)barrier(c,(z.x+.5)*TILE,(z.y+.5)*TILE,col,p,time);
  if(s.type==='quiet'){
   c.fillStyle='#e0e9ee20';c.fillRect(0,0,g.map.w*TILE,g.map.h*TILE);
   c.strokeStyle='#a6b7d4bc';c.lineWidth=2;
   for(let j=0;j<4;j++){
    const y=(j+.75)*g.map.h*TILE/5;
    c.beginPath();c.moveTo(8,y);c.lineTo(g.map.w*TILE-8,y);c.stroke();
   }
   const main=actors[0];
   if(main)tag(c,'SILENCE',(main.x+.5)*TILE,(main.y+.5)*TILE-34,col);
  }
  if(s.type==='portal'){
   const zones=s.portals||[];
   for(const z of zones)portal(c,(z.x+.5)*TILE,(z.y+.5)*TILE,col,time,27);
   if(zones.length>1){
    const a=xy(zones[0],TILE),b=xy(zones[zones.length-1],TILE);
    c.setLineDash([6,8]);line(c,a,b,col,2);c.setLineDash([]);
   }
  }
  if(s.type==='beat'){
   const center=actors.length?xy(actors[0],TILE):{x:g.map.w*TILE/2,y:g.map.h*TILE/2};
   const rad=(.65+((time*.65)%1.0)*3.2)*TILE;
   c.strokeStyle=col;c.lineWidth=3;c.beginPath();
   c.ellipse(center.x,center.y,rad,rad*.58,0,0,TAU);c.stroke();
   for(let i=0;i<6;i++){
    const y=12+i*24;
    c.fillStyle=i%2?'#e2d8c47e':'#dcbf947d';
    c.fillRect(6,y,g.map.w*TILE-12,4);
   }
   tag(c,'BEAT',center.x,center.y-33,col);
  }
  if(s.type==='armor'||s.type==='tether'){
   const targeted=g.enemies.filter(e=>s.targets?.includes(e.uid));
   for(const e of targeted){
    const pos=xy(g.enemyPos(e),TILE);
    c.strokeStyle=col;c.lineWidth=2.5;c.beginPath();
    c.ellipse(pos.x,pos.y+7,18,13,0,0,TAU);c.stroke();
    if(s.type==='armor'){
     c.fillStyle='#f1dcb1';c.font='bold 15px Arial';
     c.textAlign='center';c.fillText('✧',pos.x,pos.y-27);
    }else if(actors.length){
     const origin=xy(actors[0],TILE);c.setLineDash([5,5]);
     line(c,origin,pos,col,1.8);c.setLineDash([]);
     tag(c,'BIND',pos.x,pos.y-29,col);
    }
   }
  }
  c.restore();
 }
 // Status icons physically follow the slowed/frozen/exposed enemies, so a
 // player can verify which targets were affected after the initial flash.
 for(const e of g.enemies){
  if(e.hp<=0||(!(e.stun>0)&&!(e.exposed>0)))continue;
  const p=xy(g.enemyPos(e),TILE);
  c.save();c.globalAlpha=.88;
  c.textAlign='center';c.font='bold 12px Arial';
  if(e.stun>0){c.fillStyle='#f9ebcb';c.fillText('Ⅱ',p.x,p.y-24);}
  if(e.exposed>0){c.fillStyle='#f1cf9d';c.fillText('◇',p.x+13,p.y-24);}
  c.restore();
 }
}
