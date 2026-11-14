import {CHARACTERS,CHARACTER_BY_ID,GROUPS,SIGNATURES,attackValue,attackInterval,attackRange} from '../data/characters.js';
import {MAP_BY_ID,tileKey} from '../data/maps.js';
import {HEARTS,getHeartParticipants,heartStrength} from '../data/hearts.js';
import {ENEMIES,DIFFICULTIES,UPGRADE_DATA,upgradeCost,waveEnemies} from '../data/enemies.js';
const rnd=(max)=>Math.floor(Math.random()*max);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const nearest=(array,target)=>array.slice().sort((a,b)=>dist(a,target)-dist(b,target));
export class Game {
 constructor(config,callbacks={}){
  this.callbacks=callbacks;this.map=MAP_BY_ID[config.mapId]||MAP_BY_ID.roof;
  this.difficulty=config.difficulty;
  this.difficultyData=DIFFICULTIES.find(d=>d.id===this.difficulty)||DIFFICULTIES[0];
  this.phase='playing';this.speed=1;this.virtualTime=0;this.visualTime=0;this.realTime=0;this.wave=1;this.waveTime=0;
  this.crystals=100;this.fragments=60;this.summons=0;this.units=[];this.enemies=[];this.effects=[];this.pendingHits=[];this.cameraShake=0;this.lastShakeTime=-Infinity;
  this.upgrades={attack:0,speed:0,ability:0,income:0};this.damageByMember={};this.nextUnitId=1;this.nextEnemyId=1;
  this.selectedId=null;this.moveMode=false;this.heartTimers={};this.heartPulse=0;this.spawnCursor=0;
  this.heartQueue=[];this.heartScene=null;
  this.waveRoster=[];this.spawnStep=1;this.result=null;this.endReal=0;this.endFromSpeed=1;
  this.startWave(1);
 }
 get currentMap(){return this.map;}
 get selected(){return this.units.find(u=>u.uid===this.selectedId)||null;}
 get cost(){return 28;}
 get capacity(){return 60;}
 get isEndless(){return this.difficulty==='endless';}
 get maxWave(){return this.isEndless?Infinity:20;}
 get power(){return Math.round(this.units.reduce((n,u)=>n+attackValue(u,this.upgrades)/attackInterval(u,this.upgrades),0));}
 get discoveredActive(){return HEARTS.filter(h=>!!getHeartParticipants(this,h));}
 emit(type,payload){this.callbacks[type]?.(payload);}
 startWave(number){
  this.wave=number;this.waveTime=0;this.spawnCursor=0;
  this.waveRoster=waveEnemies(number,this.difficulty);
  if(this.isEndless&&number>20){const extra=Math.min(18,Math.floor((number-20)*.35));for(let i=0;i<extra;i++)this.waveRoster.push(i%3?'pulse':'tank');}
  this.spawnStep=Math.max(.42,26/Math.max(1,this.waveRoster.length));
  if(number%5===0)this.emit('onBossWave',{wave:number});
  this.emit('onWave',{wave:number});
 }
 spawnEnemy(type,at=0){
  const kind=ENEMIES[type];if(!kind)return;
  const multiplier=this.isEndless&&this.wave>20?Math.pow(1.088,this.wave-20):1;
  let hp=(17+Math.pow(this.wave,1.55)*4.5)*kind.hp*this.difficultyData.hp*multiplier;
  if(type==='boss')hp*=this.difficultyData.boss;
  const u={uid:this.nextEnemyId++,kind:type,hp,maxHp:hp,progress:at,speed:kind.speed*this.difficultyData.speed,slow:0,flash:0,hitPulse:0,radius:kind.radius,age:0,visualSeed:Math.random()*Math.PI*2,tempo:0,beatCooldown:type==='boss'?3.7:0,emerge:type==='boss'?.65:.32};
  this.enemies.push(u);return u;
 }
 enemyPos(enemy){const p=this.map.path,n=p.length,index=((Math.floor(enemy.progress)%n)+n)%n,next=(index+1)%n,t=enemy.progress-Math.floor(enemy.progress);return{x:p[index].x*(1-t)+p[next].x*t,y:p[index].y*(1-t)+p[next].y*t};}
 get unitsByCell(){return new Map(this.units.map(u=>[tileKey(u.x,u.y),u]));}
 atTile(x,y){return this.units.find(u=>u.x===x&&u.y===y)||null;}
 canPlace(x,y){return this.map.availableSet.has(tileKey(x,y))&&!this.atTile(x,y);}
 selection(uid){this.selectedId=uid;this.moveMode=false;this.emit('onSelection',this.selected);}
 clickTile(x,y){
  if(this.phase!=='playing')return;
  const target=this.atTile(x,y);
  if(this.moveMode){
   if(this.canPlace(x,y)&&this.selected){this.selected.x=x;this.selected.y=y;this.moveMode=false;this.addEffect('pop',x,y,{color:'#acecde'});this.emit('onToast','moved');this.emit('onChange');}
   else{this.moveMode=false;this.emit('onToast','cancel');}
   return;
  }
  if(target){this.selection(target.uid);this.emit('onSound','select');}
  else if(this.selected){this.selection(null);}
 }
 moveSelected(){if(!this.selected)return;this.moveMode=!this.moveMode;this.emit('onMoveMode',this.moveMode);}
 chooseCharacter(){
  // All 26 are always in the pool. The selected SEKAI has an explicit 55%
  // priority roll, owned characters have a separate 25% merge-assistance
  // roll, and the remaining roll uses the entire roster uniformly.
  const affinity=CHARACTERS.filter(c=>c.group===this.map.affinityGroup);
  const ownedIds=[...new Set(this.units.map(u=>u.id))];
  const owned=ownedIds.map(id=>CHARACTER_BY_ID[id]).filter(Boolean);
  const roll=Math.random();
  let pool=CHARACTERS,source='all';
  if(affinity.length&&roll<(this.map.affinityRate||0)){pool=affinity;source='affinity';}
  else if(owned.length&&roll<(this.map.affinityRate||0)+.25){pool=owned;source='owned';}
  const character=pool[rnd(pool.length)];
  this.lastSummonSource=source;
  return character;
 }
 summon(){
  if(this.phase!=='playing')return false;
  if(this.crystals<this.cost){this.emit('onToast','needCrystals');return false;}
  const occupied=new Set(this.units.map(u=>tileKey(u.x,u.y)));
  const open=this.map.available.filter(p=>!occupied.has(tileKey(p.x,p.y)));
  if(!open.length){this.emit('onToast','boardFull');return false;}
  const character=this.chooseCharacter();
  const center={x:this.map.w/2,y:this.map.h/2};
  const near=nearest(open,center).slice(0,Math.min(open.length,23));
  const cell=near[rnd(near.length)];
  this.crystals-=this.cost;
  const unit={uid:this.nextUnitId++,id:character.id,star:1,x:cell.x,y:cell.y,cooldown:Math.random()*.8,motion:0,pose:0,damage:0,facing:'front',mirrored:false,shots:0,entrance:.55,promotion:0};
  this.units.push(unit);this.summons++;this.addEffect('spawn',cell.x,cell.y,{color:character.hair,life:.48,star:1});
  this.emit('onSummon',{unit,character,source:this.lastSummonSource,affinity:this.map.affinityGroup});
  this.emit('onSound','summon');this.emit('onChange');this.detectHearts();return true;
 }
 mergeUnits(a,b){
  if(!a||!b||a.uid===b.uid||a.id!==b.id||a.star!==b.star||a.star>=4)return false;
  const oldDamage=b.damage;a.star++;a.damage+=oldDamage;a.cooldown=.1;a.promotion=.85;
  this.units=this.units.filter(u=>u.uid!==b.uid);
  if(this.selectedId===b.uid)this.selectedId=a.uid;
  this.addEffect('promotion',a.x,a.y,{color:CHARACTER_BY_ID[a.id].hair,star:a.star,life:.75});
  this.emit('onPromotion',{unit:a});
  this.emit('onSound','merge');this.detectHearts();return true;
 }
 mergeSelected(){
  const a=this.selected;if(!a)return false;
  if(a.star>=4){this.emit('onToast','mergeMax');return false;}
  const b=this.units.find(u=>u.uid!==a.uid&&u.star===a.star&&u.id===a.id);
  if(!b){this.emit('onToast','mergeUnavailable');return false;}
  this.mergeUnits(a,b);this.emit('onToast','merged');this.emit('onSelection',this.selected);this.emit('onChange');return true;
 }
 autoMerge(){
  let number=0,changed=true;
  while(changed){
   changed=false;
   for(const a of [...this.units]){
    if(a.star===4)continue;
    const b=this.units.find(u=>u.uid!==a.uid&&u.id===a.id&&u.star===a.star);
    if(b){this.mergeUnits(a,b);number++;changed=true;break;}
   }
  }
  if(!number)this.emit('onToast','mergeUnavailable');else this.emit('onToast',`${number}×`);
  this.emit('onSelection',this.selected);this.emit('onChange');return number;
 }
 upgrade(id){
  const level=this.upgrades[id];if(level==null)return;
  const cost=upgradeCost(id,level);
  if(cost===Infinity)return;
  if(cost>this.fragments){this.emit('onToast','needFragments');return;}
  this.fragments-=cost;this.upgrades[id]++;this.emit('onSound','upgrade');this.emit('onChange');
 }
 addEffect(type,x,y,props={}){this.effects.push({type,x,y,life:props.life??.35,initial:props.life??.35,...props});if(this.effects.length>150)this.effects.splice(0,this.effects.length-150);}
 dealDamage(enemy,amount,sourceId){
  if(enemy.hp<=0)return;
  const dealt=Math.min(enemy.hp,Math.max(0,amount));enemy.hp-=dealt;enemy.flash=.13;
  if(sourceId)this.damageByMember[sourceId]=(this.damageByMember[sourceId]||0)+dealt;
  if(enemy.hp<=0)this.killEnemy(enemy);
 }
 killEnemy(enemy){
  const kind=ENEMIES[enemy.kind];
  const base=kind.reward*this.difficultyData.reward;
  this.crystals+=Math.max(1,Math.floor(base+this.upgrades.income*3.25));
  this.fragments+=Math.max(1,Math.floor(base*.72+this.upgrades.income*2.3));
  const p=this.enemyPos(enemy);
  this.addEffect('pop',p.x,p.y,{color:kind.accent,life:.3});
  if(enemy.kind==='boss'){
   this.addEffect('signature',p.x,p.y,{color:'#e4c4ad',life:.62,star:4,motif:'echo',size:1.7});
   this.addEffect('ring',p.x,p.y,{color:'#b6cfbf',life:.65,radius:2.5});
   this.emit('onSound','heavy');
  }else if(enemy.kind==='tank'||enemy.kind==='split'){
   this.addEffect('impact',p.x,p.y,{color:kind.accent,life:.36,star:2,size:1.1,motif:'crystal'});
  }
  if(enemy.kind==='split'&&this.enemies.length<this.capacity-3){this.spawnEnemy('shard',enemy.progress);this.spawnEnemy('shard',enemy.progress+.1);}
  this.emit('onChange');
 }
 damageCircle(center,radius,damage,source,limit=Infinity){
  const eligible=this.enemies.filter(e=>e.hp>0&&dist(this.enemyPos(e),center)<=radius).slice(0,limit);
  eligible.forEach(e=>this.dealDamage(e,damage,source));return eligible.length;
 }
 // Resolve damage when its projectile arrives rather than at launch.
 // This gives the attack an audible/visible hit moment and makes every
 // combat style feel less like a constant line effect.
 queueStrike(unit,enemy,amount,delay,props={}){
  if(!enemy||enemy.hp<=0||this.pendingHits.length>=280)return;
  const from={x:unit.x,y:unit.y},to=this.enemyPos(enemy),def=CHARACTER_BY_ID[unit.id],signature=SIGNATURES[unit.id];
  const travel=Math.max(.025,Math.min(.35,delay));
  const color=props.color||def.hair;
  this.pendingHits.push({enemyId:enemy.uid,amount,source:unit.id,remain:travel,
   color,style:props.style||def.attack,motif:signature?.motif||'note',star:unit.star,
   slow:props.slow||0,strong:!!props.strong,signature:!!props.signature,
   splashRadius:props.splashRadius||0});
  if(props.trail!==false){
   this.addEffect('projectile',from.x,from.y,{tx:to.x,ty:to.y,color,
     motif:signature?.motif||'note',life:travel,star:unit.star,style:props.style||def.attack});
  }
 }
 updateStrikes(dt){
  const remaining=[];
  for(const hit of this.pendingHits){
   hit.remain-=dt;
   if(hit.remain>0){remaining.push(hit);continue;}
   const enemy=this.enemies.find(e=>e.uid===hit.enemyId&&e.hp>0);
   if(!enemy)continue;
   const at=this.enemyPos(enemy);
   if(hit.slow>0&&enemy.kind!=='resist')enemy.slow=Math.max(enemy.slow,hit.slow);
   enemy.hitPulse=Math.max(enemy.hitPulse,hit.strong?.24:.13);
   this.dealDamage(enemy,hit.amount,hit.source);
   if(hit.strong&&this.realTime-this.lastShakeTime>.27){
    this.cameraShake=Math.max(this.cameraShake,Math.min(2.15,.6+hit.star*.27));
    this.lastShakeTime=this.realTime;
   }
   const size=hit.strong?1.23:hit.style==='burst'||hit.style==='splash'?.95:.62;
   this.addEffect('impact',at.x,at.y,{life:hit.strong?.36:.23,color:hit.color,
    motif:hit.motif,star:hit.star,size,style:hit.style});
   if(hit.splashRadius)this.addEffect('ring',at.x,at.y,{life:.25,color:hit.color,radius:hit.splashRadius});
   if(hit.strong||hit.star>=4){
    this.addEffect('damage',at.x,at.y,{life:.48,color:hit.strong?'#ffe0aa':'#f8f2e1',value:Math.ceil(hit.amount),star:hit.star});
    this.emit('onSound',hit.strong?'heavy':'hit');
   }
  }
  this.pendingHits=remaining;
 }
 attack(unit){
  const p={x:unit.x,y:unit.y},range=attackRange(unit);
  const candidates=this.enemies.filter(e=>e.hp>0&&dist(this.enemyPos(e),p)<=range);
  if(!candidates.length)return false;
  const targets=nearest(candidates,p),target=targets[0],tp=this.enemyPos(target);
  const c=CHARACTER_BY_ID[unit.id],atk=attackValue(unit,this.upgrades),style=c.attack,signature=SIGNATURES[unit.id];
  unit.shots=(unit.shots||0)+1;
  unit.motion=.23;unit.pose=tp.x>p.x?1:-1;
  const dirX=tp.x-p.x,dirY=tp.y-p.y;
  unit.aimX=dirX;unit.aimY=dirY;
  if(Math.abs(dirX)>.38&&Math.abs(dirX)>Math.abs(dirY)*.5){
   unit.facing=dirY>=0?'front-left':'back-left';unit.mirrored=dirX>0;
  }else{
   unit.facing=dirY>=0?'front':'back';unit.mirrored=false;
  }
  if(style==='pierce'){
   const dx=dirX,dy=dirY,d=Math.max(.01,Math.hypot(dx,dy));
   const hits=candidates.filter(e=>{const ep=this.enemyPos(e),ex=ep.x-p.x,ey=ep.y-p.y,proj=(ex*dx+ey*dy)/d;return proj>0&&proj<range&&Math.abs(ex*dy-ey*dx)/d<.42;});
   hits.slice(0,1+Math.floor(unit.star/1.2)).forEach((e,i)=>this.queueStrike(unit,e,atk,.045+i*.018,{trail:i===0,style:'pierce'}));
   this.addEffect('line',p.x,p.y,{tx:p.x+dx/d*range,ty:p.y+dy/d*range,color:c.hair,life:.13,star:unit.star});
  }else if(style==='burst'||style==='splash'){
   const rad=(style==='burst'?.56:.77)+(unit.star-1)*.13;
   const victims=nearest(candidates,tp).filter(e=>dist(this.enemyPos(e),tp)<=rad).slice(0,unit.star+2);
   victims.forEach((e,i)=>this.queueStrike(unit,e,atk*(style==='burst'?1:.85),.12,{trail:i===0,style,splashRadius:i===0?rad:0}));
  }else if(style==='chain'||style==='bounce'){
   const num=style==='chain'?1+unit.star:1+Math.floor(unit.star/2);
   const chain=nearest(candidates,tp).slice(0,num);
   for(const [i,e] of chain.entries()){
    this.queueStrike(unit,e,atk*Math.pow(.8,i),.055+i*.055,{style:style==='bounce'?'bounce':'chain'});
   }
  }else if(style==='slow'){
   this.queueStrike(unit,target,atk,.12,{slow:1.6+.2*unit.star,style:'slow'});
  }else{
   this.queueStrike(unit,target,atk,.07,{style:'rapid'});
   if(unit.star>=3&&targets[1])this.queueStrike(unit,targets[1],atk*.6,.11,{style:'rapid'});
  }
  if(signature&&unit.shots%signature.every===0){
   const power=atk*signature.power*(.65+.12*unit.star);
   const at=tp;
   const strike=(e,mul,delay,props={})=>this.queueStrike(unit,e,power*mul,delay,{...props,signature:true,strong:true});
   if(signature.kind==='sweep'){
    const dx=dirX,dy=dirY,d=Math.max(.01,Math.hypot(dx,dy));
    candidates.filter(e=>{const ep=this.enemyPos(e),ex=ep.x-p.x,ey=ep.y-p.y;return (ex*dx+ey*dy)>0&&Math.abs(ex*dy-ey*dx)/d<.7;})
     .slice(0,2+unit.star).forEach((e,i)=>strike(e,.72,.09+i*.018,{trail:i===0,style:'pierce'}));
   }else if(signature.kind==='blast'){
    nearest(candidates,at).filter(e=>dist(this.enemyPos(e),at)<.9+.12*unit.star)
     .slice(0,3+unit.star).forEach((e,i)=>strike(e,.68,.13,{trail:i===0,style:'burst',splashRadius:i===0?.9:0}));
   }else if(signature.kind==='ripple'){
    nearest(candidates,at).filter(e=>dist(this.enemyPos(e),at)<1.2)
     .slice(0,3+unit.star).forEach((e,i)=>strike(e,.54,.11,{trail:i===0,slow:.75+.2*unit.star,style:'splash'}));
   }else if(signature.kind==='repeat'){
    strike(target,.66,.07,{style:'rapid'});
    strike(target,.55,.18,{style:'rapid'});
   }else if(signature.kind==='chain'){
    nearest(candidates,at).slice(0,Math.min(4,1+unit.star))
     .forEach((e,i)=>strike(e,Math.pow(.7,i),.08+i*.06,{style:'chain'}));
   }else if(signature.kind==='chill'){
    nearest(candidates,at).filter(e=>dist(this.enemyPos(e),at)<1.05)
     .slice(0,2+unit.star).forEach((e,i)=>strike(e,.55,.14,{trail:i===0,slow:2.1+.3*unit.star,style:'slow'}));
   }else if(signature.kind==='smash'){
    strike(target,1.35,.17,{style:'splash',splashRadius:.62});
    if(unit.star>=3)nearest(candidates,at).slice(1,3).forEach(e=>strike(e,.52,.17,{trail:false,style:'splash'}));
   }
   this.addEffect('signature',at.x,at.y,{motif:signature.motif,color:c.hair,life:.55,star:unit.star});
  }
  return true;
 }
 detectHearts(){
  for(const heart of HEARTS){
   const participants=getHeartParticipants(this,heart);
   if(!participants)continue;
   if(this.heartTimers[heart.id]==null)this.heartTimers[heart.id]=Math.max(.25,4-Math.random()*2);
   this.emit('onHeartSeen',heart.id);
  }
 }
 fireHeart(heart,participants){
  const strength=heartStrength(participants);const boost=(1+this.upgrades.ability*.2)*strength.scale;
  const sourceNames=participants.map(p=>p.id);
  const count=participants.length;
  const damage=(42+this.wave*8.2)*boost*(heart.type==='group'?1.25:1.03);
  const chosen=nearest(this.enemies.filter(e=>e.hp>0),{x:this.map.w/2,y:this.map.h/2});
  const maxTargets=heart.type==='group'?Math.min(chosen.length,10+Math.floor(strength.average*3)):Math.min(chosen.length,5+Math.floor(strength.average*2));
  for(const [index,e] of chosen.slice(0,maxTargets).entries()){
   const ep=this.enemyPos(e);
   // Shared damage is credited exactly once, in fair equal shares across participants.
   const dealt=Math.min(e.hp,damage*(index>5?.82:1));
   e.hp-=dealt;e.flash=.24;
   for(const member of sourceNames)this.damageByMember[member]=(this.damageByMember[member]||0)+dealt/count;
   if(e.hp<=0)this.killEnemy(e);
   if(index<13)this.addEffect('heartHit',ep.x,ep.y,{color:GROUPS.find(g=>g.id===CHARACTER_BY_ID[participants[0].id]?.group)?.color||'#d7c8ef',life:.4});
  }
  this.addEffect('heart',this.map.w/2-.5,this.map.h/2-.5,{life:1.1,color:heart.type==='group'?'#d7f2e8':'#f6d7c6',style:heart.style,full:strength.full});
  if(strength.full){this.addEffect('heart',this.map.w/2-.5,this.map.h/2-.5,{life:1.45,color:'#efdbab',style:'star',full:true});}
  this.emit('onHeartFire',{heart,strength});this.emit('onSound','heart');this.emit('onChange');
 }
 heartUpdate(dt,realDt){
  // Cinematic skill activation: introduce the caster, then apply the actual attack.
  // Scene timing is based on real time so 2x battle speed never makes the dialogue unreadable.
  if(this.heartScene){
   const scene=this.heartScene;
   scene.elapsed+=realDt;
   if(!scene.fired&&scene.elapsed>=.62){
    scene.fired=true;
    this.fireHeart(scene.heart,scene.participants);
   }
   if(scene.elapsed>=1.62){
    this.emit('onHeartEnd',{heart:scene.heart});
    this.heartScene=null;
   }
  }
  if(!this.enemies.some(e=>e.hp>0))return;
  this.heartPulse+=dt;
  if(this.heartPulse<.18)return;
  const delta=this.heartPulse;this.heartPulse=0;
  for(const heart of HEARTS){
   const participants=getHeartParticipants(this,heart);
   if(!participants)continue;
   this.heartTimers[heart.id]=(this.heartTimers[heart.id]??3)-delta;
   if(this.heartTimers[heart.id]<=0){
    // Keep the real battle moving even when many combinations activate together.
    if(this.heartQueue.length<3)this.heartQueue.push({heart,participants:[...participants]});
    else this.fireHeart(heart,participants);
    this.heartTimers[heart.id]=Math.max(7,heart.cooldown/(1+this.upgrades.ability*.14));
   }
  }
  if(!this.heartScene&&this.heartQueue.length){
   const pending=this.heartQueue.shift();
   this.heartScene={...pending,elapsed:0,fired:false};
   this.emit('onHeartStart',{...pending,strength:heartStrength(pending.participants)});
  }
 }
 update(realDt){
  if(this.phase==='ending'){
   this.endReal+=realDt;let t=clamp(this.endReal/1.5,0,1);
   this.endAnimSpeed=this.endFromSpeed*Math.pow(1-t,2.4);
   const endDelta=realDt*this.endAnimSpeed;this.updateVisuals(endDelta);for(const enemy of this.enemies){enemy.progress+=endDelta*enemy.speed*(enemy.slow>0?.52:1);}
   if(t>=1){this.phase='ended';this.emit('onResult',this.result);}return;
  }
  if(this.phase!=='playing')return;
  const dt=Math.min(.06,realDt)*this.speed;
  this.realTime+=Math.max(0,realDt);this.virtualTime+=dt;this.waveTime+=dt;
  this.updateVisuals(dt);
  this.updateStrikes(dt);
  while(this.spawnCursor<this.waveRoster.length&&this.waveTime>=(.8+this.spawnCursor*this.spawnStep)){
   this.spawnEnemy(this.waveRoster[this.spawnCursor]);this.spawnCursor++;
  }
  for(const enemy of this.enemies){
   enemy.slow=Math.max(0,enemy.slow-dt);
   enemy.emerge=Math.max(0,(enemy.emerge||0)-dt);
   enemy.tempo=Math.max(0,(enemy.tempo||0)-dt);
   enemy.flash=Math.max(0,enemy.flash-dt);enemy.hitPulse=Math.max(0,(enemy.hitPulse||0)-dt);
   // Dash types surge between small recovery beats; heavy enemies stomp.
   // Each enemy has its own phase so a crowd never moves in lockstep.
   const pace=enemy.kind==='dash'?(1+.22*Math.max(0,Math.sin(enemy.age*8+enemy.visualSeed))):
    enemy.kind==='tank'?(0.94+.06*Math.sin(enemy.age*4+enemy.visualSeed)):
    enemy.kind==='split'?(1+.055*Math.sin(enemy.age*5+enemy.visualSeed)):
    enemy.kind==='boss'?(0.96+.04*Math.cos(enemy.age*2)) :1;
   enemy.age=(enemy.age||0)+dt;
   enemy.progress+=dt*enemy.speed*pace*(enemy.slow>0?.52:1)*(enemy.tempo>0?1.22:1);
  }
  // The Conductor boss leads nearby interference into a short faster beat.
  // This is a readable enemy mechanic, not a random whole-screen speed-up.
  for(const boss of this.enemies){
   if(boss.kind!=='boss'||boss.hp<=0)continue;
   boss.beatCooldown-=dt;
   if(boss.beatCooldown>0)continue;
   boss.beatCooldown+=4.8;
   const center=this.enemyPos(boss);
   for(const follower of this.enemies){
    if(follower===boss||follower.hp<=0)continue;
    if(dist(this.enemyPos(follower),center)<3.1){
     follower.tempo=Math.max(follower.tempo||0,1.35);
    }
   }
   this.addEffect('ring',center.x,center.y,{color:'#e4ba9f',radius:2.7,life:.44});
   this.emit('onSound','special');
  }
  for(const hero of this.units){
   hero.cooldown-=dt;
   if(hero.cooldown<=0){
    const fired=this.attack(hero);
    hero.cooldown=fired?attackInterval(hero,this.upgrades):.15;
   }
  }
  this.heartUpdate(dt,realDt);
  this.enemies=this.enemies.filter(e=>e.hp>0);
  if(this.enemies.length>=this.capacity){this.end('lose');return;}
  if(this.waveTime>=30){
   if(this.wave===20&&!this.isEndless){
    if(this.enemies.length===0&&this.spawnCursor>=this.waveRoster.length)this.end('win');
   }else{this.startWave(this.wave+1);this.crystals+=26+this.wave*7;this.fragments+=12+this.wave*4;this.emit('onChange');}
  }
 }
 updateVisuals(dt){
  this.visualTime+=dt;
  this.cameraShake=Math.max(0,this.cameraShake-dt*18);
  this.effects.forEach(e=>e.life-=dt);
  this.effects=this.effects.filter(e=>e.life>0);
  this.units.forEach(u=>{u.motion=Math.max(0,u.motion-dt);u.entrance=Math.max(0,(u.entrance||0)-dt);u.promotion=Math.max(0,(u.promotion||0)-dt);});
 }
 end(status){
  if(this.phase!=='playing')return;
  this.phase='ending';
  this.heartQueue=[];this.heartScene=null;this.pendingHits=[];this.emit('onHeartEnd',{});
  this.result={status,difficulty:this.difficulty,elapsed:this.realTime,virtualTime:this.virtualTime,wave:this.wave,damageByMember:{...this.damageByMember}};
  this.endReal=0;this.endFromSpeed=this.speed;this.endAnimSpeed=this.speed;
  this.emit('onEndStart',this.result);
 }
 continueEndless(){
  if(this.result?.status!=='win'||this.difficulty!=='extreme')return false;
  this.difficulty='endless';this.difficultyData=DIFFICULTIES.find(x=>x.id==='endless');
  this.phase='playing';this.result=null;this.endReal=0;this.speed=1;
  this.startWave(21);this.emit('onChange');return true;
 }
 togglePause(){if(this.phase==='playing'){this.phase='paused';return true;}if(this.phase==='paused'){this.phase='playing';return false;}return null;}
}
