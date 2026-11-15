// Mechanic-specific battlefield and cast effects. The shapes reflect the
// actual HeartAbilities state; this never invents damage or resources.
import {CHARACTER_BY_ID} from '../data/characters.js';
import {heartAbilityName,mechanicForHeart} from './HeartAbilities.js';
const TAU=Math.PI*2;
const COLORS={ensemble:'#f9d891',spotlight:'#f4c777',beat:'#efad84',barrier:'#ffdf92',quiet:'#c8d4eb',portal:'#a5e3de',tether:'#e2c4ed',armor:'#f6b99d',rescue:'#b1e2d1',mirror:'#d4c7f2',stage:'#f1bed6'};
const NAMES={
 ensemble:['연속 공격','連続攻撃','RAPID FIRE'],spotlight:['적 감속','敵減速','SLOW FIELD'],
 beat:['박자 경직','拍子拘束','STAGGER'],barrier:['진로 봉쇄','進路封鎖','PATH BLOCK'],
 quiet:['적 정지','敵停止','HALT'],portal:['적 후퇴','敵後退','RECALL'],
 tether:['적 속박','敵拘束','BIND'],armor:['방어 약화','防御低下','ARMOR BREAK'],
 rescue:['방해 해제','妨害解除','CLEANSE'],mirror:['동시 공격','同時攻撃','SYNC'],
 stage:['감속 무대','減速舞台','SLOW STAGE']
};
const P=(p,T)=>({x:(p.x+.5)*T,y:(p.y+.5)*T});
const langIndex=(l)=>l==='ja'?1:l==='en'?2:0;
const name=(type,l)=>NAMES[type]?.[langIndex(l)]||'HEART';
function line(c,a,b,col,w=2){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=col;c.lineWidth=w;c.stroke();}
function disc(c,x,y,r,col){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=col;c.fill();}
function oval(c,x,y,rx,ry,col,w=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.strokeStyle=col;c.lineWidth=w;c.stroke();}
function panel(c,x,y,w,h,col,outline=null){
 c.beginPath();c.roundRect(x,y,w,h,4);c.fillStyle=col;c.fill();
 if(outline){c.strokeStyle=outline;c.lineWidth=2;c.stroke();}
}
function star(c,x,y,r,col){
 c.beginPath();for(let i=0;i<10;i++){
  const a=i*TAU/10-TAU/4,q=i%2?r*.4:r;
  i?c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):c.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q);
 }c.closePath();c.fillStyle=col;c.fill();
}
function tag(c,str,x,y,col){
 c.save();c.font='900 12px system-ui,sans-serif';c.textBaseline='middle';c.textAlign='center';
 const w=Math.max(52,Math.min(108,c.measureText(str).width+14));
 panel(c,x-w/2,y-12,w,24,'#263b50ee','#fff5df');
 c.fillStyle=col;c.fillRect(x-w/2+2,y-10,4,20);
 c.fillStyle='#fff6e9';c.fillText(str,x+2,y,w-14);c.restore();
}
function gauge(c,x,y,w,s,col){
 c.fillStyle='#283e51d9';c.fillRect(x,y,w,5);
 c.fillStyle=col;c.fillRect(x+1,y+1,(w-2)*Math.max(0,s.remaining/s.total),3);
}
function marker(c,x,y,col){
 c.save();c.fillStyle=col;c.globalAlpha=.22;c.beginPath();c.ellipse(x,y+7,24,12,0,0,TAU);c.fill();
 c.globalAlpha=1;oval(c,x,y+7,24,12,col,3);c.restore();
}
function linked(c,g,s,T,t,col,reduced){
 const members=g.units.filter(u=>s.unitIds.includes(u.uid)).map(u=>P(u,T));
 for(let i=0;i<members.length-1;i++){
  const a=members[i],b=members[i+1];
  line(c,a,b,'#2b4055',7);line(c,a,b,col,4);
  const phase=reduced?.5:(t*.7+i*.27)%1;
  star(c,a.x+(b.x-a.x)*phase,a.y+(b.y-a.y)*phase,8,'#fff8dc');
 }
 if(s.type==='ensemble'&&members.length>2)
  line(c,members[0],members[members.length-1],col,3);
 for(const p of members){marker(c,p.x,p.y,col);star(c,p.x,p.y-27,8,'#fff0cd');}
 if(members.length)tag(c,name(s.type,g.language),members[0].x,members[0].y-49,col);
}
function spot(c,x,y,s,col,type,t,lang,primary=true){
 const r=type==='spotlight'?47:38;
 c.save();c.globalAlpha=.24;c.fillStyle=col;
 c.beginPath();c.moveTo(x-18,0);c.lineTo(x+18,0);c.lineTo(x+r,y+5);c.lineTo(x-r,y+5);c.closePath();c.fill();
 c.beginPath();c.ellipse(x,y+5,r,r*.5,0,0,TAU);c.fill();
 c.restore();
 oval(c,x,y+5,r,r*.5,col,3.5);
 panel(c,x-17,y-7,34,13,'#344b60',col);
 c.fillStyle='#fff3cf';c.fillRect(x-12,y-3,24,5);
 if(primary)tag(c,name(type,lang),x,y-39,col);
 gauge(c,x-21,y+27,42,s,col);
}
function gate(c,x,y,s,col,t,lang,primary=true){
 panel(c,x-23,y-21,46,43,'#2b4156ef',col);
 for(let i=-1;i<=1;i++)line(c,{x:x+i*13-6,y:y-18},{x:x+i*13+5,y:y+17},'#fff4d7',3);
 panel(c,x-24,y-26,48,8,col,'#fff5df');
 star(c,x,y-37+Math.sin(t*3)*1.8,9,'#fff0be');
 if(primary)tag(c,name('barrier',lang),x,y-56,col);
 gauge(c,x-20,y+24,40,s,col);
}
function portal(c,x,y,col,t,reduced){
 c.save();c.fillStyle='#2a4257e6';
 c.beginPath();c.ellipse(x,y,34,23,0,0,TAU);c.fill();
 oval(c,x,y,33,23,col,4);
 c.beginPath();c.ellipse(x,y,21,14,0,reduced?0:t,reduced?5:t+TAU*.75);
 c.strokeStyle='#fff7e2';c.lineWidth=3;c.stroke();
 c.fillStyle='#fff3d8';c.font='bold 25px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('↶',x,y);
 c.restore();
}
function enemyLocks(c,g,s,T,col){
 const targets=g.enemies.filter(e=>e.hp>0&&s.targets?.includes(e.uid));
 for(const e of targets){
  const p=P(g.enemyPos(e),T);
  c.strokeStyle=col;c.lineWidth=3;c.strokeRect(p.x-17,p.y-16,34,30);
  if(s.type==='armor'){
   line(c,{x:p.x-9,y:p.y-10},{x:p.x+3,y:p.y+3},'#fff8e3',3);
   line(c,{x:p.x+3,y:p.y+3},{x:p.x-1,y:p.y+12},'#fff8e3',3);
   line(c,{x:p.x+3,y:p.y+3},{x:p.x+12,y:p.y-9},'#fff8e3',3);
  }else{
   const caster=g.units.find(u=>s.unitIds.includes(u.uid));
   if(caster){c.save();c.setLineDash([6,5]);line(c,P(caster,T),p,col,3);c.restore();}
   star(c,p.x,p.y-22,9,'#fff2d8');
  }
 }
 if(targets.length) {
  const p=P(g.enemyPos(targets[0]),T);
  tag(c,name(s.type,g.language),p.x,p.y-42,col);
 }
}
export function drawHeartStates(c,g,time,T=32,foreground=false,reduced=false){
 const states=(g.heartStates||[]).filter(s=>s.remaining>0);
 if(!states.length)return;
 const s=states[states.length-1],col=COLORS[s.type]||'#ffe5aa',lang=g.language||'ko';
 if(foreground){
  if(s.type==='quiet'||s.type==='beat'){
   for(const e of g.enemies.filter(e=>e.hp>0&&(e.stun>0||e.exposed>0)).slice(0,16)){
    const p=P(g.enemyPos(e),T);panel(c,p.x-11,p.y-34,22,18,'#2b4054',col);
    c.fillStyle='#fff4d8';c.font='bold 14px sans-serif';c.textAlign='center';
    c.fillText(e.stun>0?'Ⅱ':'◇',p.x,p.y-21);
   }
  }
  return;
 }
 c.save();
 c.globalAlpha=Math.min(1,s.remaining*.7,(s.total-s.remaining)*7+.4);
 const actors=g.units.filter(u=>s.unitIds.includes(u.uid));
 if(['ensemble','rescue','mirror'].includes(s.type))linked(c,g,s,T,time,col,reduced);
 if(s.zones)for(const [i,z] of s.zones.entries()){const p=P(z,T);spot(c,p.x,p.y,s,col,s.type,time,lang,i===0);}
 if(s.gates)for(const [i,z] of s.gates.entries()){const p=P(z,T);gate(c,p.x,p.y,s,col,time,lang,i===0);}
 if(s.type==='beat'){
  const phase=reduced?.4:(time/.69)%1;
  for(let i=0;i<g.map.path.length;i+=4){
   const p=P(g.map.path[i],T);
   oval(c,p.x,p.y,8+phase*19,8+phase*19,col,3);
   c.fillStyle='#fff3da';c.fillRect(p.x-3,p.y-3,6,6);
  }
  const a=actors[0];
  if(a){const p=P(a,T);tag(c,name(s.type,lang),p.x,p.y-48,col);}
 }
 if(s.type==='quiet'){
  c.fillStyle='#d7e1ef2d';c.fillRect(0,0,g.map.w*T,g.map.h*T);
  for(let i=0;i<4;i++){
   const y=(i+.7)*g.map.h*T/5;
   line(c,{x:9,y},{x:g.map.w*T-9,y},col,3);
  }
  for(const e of g.enemies.filter(e=>e.hp>0).slice(0,16)){
   const p=P(g.enemyPos(e),T);c.strokeStyle='#f1f6ff';c.lineWidth=2.5;
   c.strokeRect(p.x-17,p.y-17,34,34);
  }
  tag(c,name('quiet',lang),g.map.w*T/2,28,col);
 }
 if(s.type==='portal'&&s.portals?.length){
  for(const z of s.portals){const p=P(z,T);portal(c,p.x,p.y,col,time,reduced);}
  if(s.portals.length>1){
   c.save();c.setLineDash([7,6]);
   line(c,P(s.portals[0],T),P(s.portals[s.portals.length-1],T),col,3);c.restore();
  }
  const p=P(s.portals[s.portals.length-1],T);
  tag(c,name('portal',lang),p.x,p.y-47,col);
 }
 if(['armor','tether'].includes(s.type))enemyLocks(c,g,s,T,col);
 c.restore();
}
export function drawHeartCinematic(c,g,time,T=32,reduced=false){
 const scene=g.heartScene;if(!scene)return;
 const k=Math.max(0,Math.min(1,scene.elapsed/1.62)),fade=Math.min(1,k*8,(1-k)*7);
 if(fade<=0)return;
 const s=g.heartStates?.find(state=>state.heartId===scene.heart.id);
 const type=s?.type||mechanicForHeart(scene.heart),col=COLORS[type],lang=g.language||'ko';
 const w=g.map.w*T,h=g.map.h*T,actor=g.units.find(u=>u.uid===scene.actorUid);
 const p=actor?P(actor,T):{x:w/2,y:h/2};
 c.save();c.globalAlpha=fade;
 if(k<.56){c.fillStyle='#202b3d44';c.fillRect(0,0,w,h);}
 oval(c,p.x,p.y,14+k*124,8+k*80,col,4);
 oval(c,p.x,p.y,8+k*68,5+k*44,'#fff7dd',2);
 for(let i=0;i<8;i++){
  const a=i*TAU/8+(reduced?0:k*.7),r=20+k*(38+i%3*12);
  star(c,p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,5,i%2?col:'#fff4d3');
 }
 // Opening motif communicates the exact effect before it persists.
 if(['ensemble','mirror','rescue'].includes(type)){
  for(const u of g.units.filter(u=>scene.heart.required?.includes(u.id))){
   const to=P(u,T);line(c,p,to,'#28394d',7);line(c,p,to,col,3.5);
   star(c,to.x,to.y-25,10,'#fff0cd');
  }
 }else if(type==='spotlight'||type==='stage'){
  for(const z of s?.zones||[]){const to=P(z,T);oval(c,to.x,to.y,15+k*35,9+k*20,col,5);}
 }else if(type==='barrier'){
  for(const z of s?.gates||[]){const to=P(z,T);c.strokeStyle=col;c.lineWidth=5;c.strokeRect(to.x-22,to.y-23,44,47);}
 }else if(type==='portal'){
  for(const z of s?.portals||[]){const to=P(z,T);oval(c,to.x,to.y,13+k*38,8+k*20,col,4);}
 }else if(type==='quiet'||type==='beat'){
  for(let i=0;i<4;i++)line(c,{x:7,y:(i+.5)*h/4},{x:w-7,y:(i+.5)*h/4},col,4);
 }else{
  for(const e of g.enemies.filter(e=>e.hp>0).slice(0,5)){
   const to=P(g.enemyPos(e),T);line(c,p,to,col,2.5);
  }
 }
 // Clearly readable but non-modal, 1.6-second caster/mechanic cue. Avoid top HUD.
 panel(c,14,h-63,w-28,47,'#263b51e8',col);
 const char=CHARACTER_BY_ID[scene.actorId];
 c.fillStyle='#fff5dd';c.textAlign='center';c.textBaseline='middle';
 c.font='900 14px system-ui,sans-serif';
 c.fillText((char?.names?.[lang]||scene.actorId)+'  ·  '+name(type,lang),w/2,h-43,w-47);
 c.font='bold 11px system-ui,sans-serif';c.fillStyle=col;
 c.fillText(heartAbilityName(scene.heart,lang),w/2,h-27,w-55);
 c.restore();
}
