import {CHARACTERS,CHARACTER_BY_ID,GROUPS,attackValue,attackInterval,attackRange} from '../data/characters.js';
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
  this.gold=100;this.summons=0;this.units=[];this.enemies=[];this.effects=[];
  this.upgrades={attack:0,speed:0,ability:0,income:0};this.damageByMember={};this.nextUnitId=1;this.nextEnemyId=1;
  this.selectedId=null;this.moveMode=false;this.heartTimers={};this.heartPulse=0;this.spawnCursor=0;
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
  const u={uid:this.nextEnemyId++,kind:type,hp,maxHp:hp,progress:at,speed:kind.speed*this.difficultyData.speed,slow:0,flash:0,radius:kind.radius};
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
  // Existing members have a moderate weight to make same-character merging practical.
  // All 26 characters remain available; the player does not choose a focus group.
  const existing=[...new Set(this.units.map(u=>u.id))];
  if(existing.length&&Math.random()<.62)return CHARACTER_BY_ID[existing[rnd(existing.length)]];
  return CHARACTERS[rnd(CHARACTERS.length)];
 }
 summon(){
  if(this.phase!=='playing')return false;
  if(this.gold<this.cost){this.emit('onToast','needGold');return false;}
  const occupied=new Set(this.units.map(u=>tileKey(u.x,u.y)));
  const open=this.map.available.filter(p=>!occupied.has(tileKey(p.x,p.y)));
  if(!open.length){this.emit('onToast','boardFull');return false;}
  const character=this.chooseCharacter();
  const center={x:this.map.w/2,y:this.map.h/2};
  const near=nearest(open,center).slice(0,Math.min(open.length,23));
  const cell=near[rnd(near.length)];
  this.gold-=this.cost;
  const unit={uid:this.nextUnitId++,id:character.id,star:1,x:cell.x,y:cell.y,cooldown:Math.random()*.8,motion:0,pose:0,damage:0};
  this.units.push(unit);this.summons++;this.addEffect('spawn',cell.x,cell.y,{color:character.hair});
  this.emit('onSound','summon');this.emit('onChange');this.detectHearts();return true;
 }
 mergeUnits(a,b){
  if(!a||!b||a.uid===b.uid||a.id!==b.id||a.star!==b.star||a.star>=4)return false;
  const oldDamage=b.damage;a.star++;a.damage+=oldDamage;a.cooldown=.1;
  this.units=this.units.filter(u=>u.uid!==b.uid);
  if(this.selectedId===b.uid)this.selectedId=a.uid;
  this.addEffect('merge',a.x,a.y,{color:CHARACTER_BY_ID[a.id].hair});
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
  if(cost>this.gold){this.emit('onToast','needGold');return;}
  this.gold-=cost;this.upgrades[id]++;this.emit('onSound','upgrade');this.emit('onChange');
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
  this.gold+=Math.max(1,Math.floor(base+this.upgrades.income*3.25));
  const p=this.enemyPos(enemy);this.addEffect('pop',p.x,p.y,{color:kind.accent,life:.3});
  if(enemy.kind==='split'&&this.enemies.length<this.capacity-3){this.spawnEnemy('shard',enemy.progress);this.spawnEnemy('shard',enemy.progress+.1);}
  this.emit('onChange');
 }
 damageCircle(center,radius,damage,source,limit=Infinity){
  const eligible=this.enemies.filter(e=>e.hp>0&&dist(this.enemyPos(e),center)<=radius).slice(0,limit);
  eligible.forEach(e=>this.dealDamage(e,damage,source));return eligible.length;
 }
 attack(unit){
  const p={x:unit.x,y:unit.y};const range=attackRange(unit);
  const candidates=this.enemies.filter(e=>e.hp>0&&dist(this.enemyPos(e),p)<=range);
  if(!candidates.length)return false;
  const targets=nearest(candidates,p), target=targets[0],tp=this.enemyPos(target);
  const c=CHARACTER_BY_ID[unit.id];const atk=attackValue(unit,this.upgrades),style=c.attack;
  unit.motion=.2;unit.pose=tp.x>p.x?1:-1;unit.facing=tp.y>=p.y?'front':'back';
  if(style==='pierce'){
   const dx=tp.x-p.x,dy=tp.y-p.y,d=Math.max(.01,Math.hypot(dx,dy));
   const hits=candidates.filter(e=>{const ep=this.enemyPos(e),ex=ep.x-p.x,ey=ep.y-p.y,proj=(ex*dx+ey*dy)/d;return proj>0&&proj<range&&Math.abs(ex*dy-ey*dx)/d<.42;});
   hits.slice(0,1+Math.floor(unit.star/1.2)).forEach(e=>this.dealDamage(e,atk,unit.id));
   this.addEffect('line',p.x,p.y,{tx:p.x+dx/d*range,ty:p.y+dy/d*range,color:c.hair,life:.16});
  }else if(style==='burst'||style==='splash'){
   const rad=(style==='burst'?.56:.77)+(unit.star-1)*.13;
   this.damageCircle(tp,rad,atk*(style==='burst'?1:.85),unit.id,unit.star+2);
   this.addEffect('ring',tp.x,tp.y,{color:c.hair,radius:rad,life:.29});
  }else if(style==='chain'||style==='bounce'){
   const num=style==='chain'?1+unit.star:1+Math.floor(unit.star/2);
   let prev=p;const chain=nearest(candidates,tp).slice(0,num);
   for(const [i,e] of chain.entries()){const pt=this.enemyPos(e);this.dealDamage(e,atk*Math.pow(.8,i),unit.id);this.addEffect('line',prev.x,prev.y,{tx:pt.x,ty:pt.y,color:c.hair,life:.19});prev=pt;}
  }else if(style==='slow'){
   this.dealDamage(target,atk,unit.id);
   if(target.kind!=='resist')target.slow=Math.max(target.slow,1.6+.2*unit.star);
   this.addEffect('ring',tp.x,tp.y,{radius:.5,color:'#c4d6ef',life:.3});
  }else{
   this.dealDamage(target,atk,unit.id);
   if(unit.star>=3&&targets[1])this.dealDamage(targets[1],atk*.6,unit.id);
   this.addEffect('line',p.x,p.y,{tx:tp.x,ty:tp.y,color:c.hair,life:.15});
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
 heartUpdate(dt){
  if(!this.enemies.length)return;
  this.heartPulse+=dt;
  if(this.heartPulse<.18)return;
  const delta=this.heartPulse;this.heartPulse=0;
  for(const heart of HEARTS){
   const participants=getHeartParticipants(this,heart);
   if(!participants)continue;
   this.heartTimers[heart.id]=(this.heartTimers[heart.id]??3)-delta;
   if(this.heartTimers[heart.id]<=0){
    this.fireHeart(heart,participants);
    this.heartTimers[heart.id]=Math.max(7,heart.cooldown/(1+this.upgrades.ability*.14));
   }
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
  while(this.spawnCursor<this.waveRoster.length&&this.waveTime>=(.8+this.spawnCursor*this.spawnStep)){
   this.spawnEnemy(this.waveRoster[this.spawnCursor]);this.spawnCursor++;
  }
  for(const enemy of this.enemies){
   enemy.slow=Math.max(0,enemy.slow-dt);enemy.flash=Math.max(0,enemy.flash-dt);
   enemy.progress+=dt*enemy.speed*(enemy.slow>0?.52:1);
  }
  for(const hero of this.units){
   hero.cooldown-=dt;
   if(hero.cooldown<=0){
    const fired=this.attack(hero);
    hero.cooldown=fired?attackInterval(hero,this.upgrades):.15;
   }
  }
  this.heartUpdate(dt);
  this.enemies=this.enemies.filter(e=>e.hp>0);
  if(this.enemies.length>=this.capacity){this.end('lose');return;}
  if(this.waveTime>=30){
   if(this.wave===20&&!this.isEndless){
    if(this.enemies.length===0&&this.spawnCursor>=this.waveRoster.length)this.end('win');
   }else{this.startWave(this.wave+1);this.gold+=26+this.wave*7;this.emit('onChange');}
  }
 }
 updateVisuals(dt){
  this.visualTime+=dt;
  this.effects.forEach(e=>e.life-=dt);
  this.effects=this.effects.filter(e=>e.life>0);
  this.units.forEach(u=>u.motion=Math.max(0,u.motion-dt));
 }
 end(status){
  if(this.phase!=='playing')return;
  this.phase='ending';this.result={status,difficulty:this.difficulty,elapsed:this.realTime,virtualTime:this.virtualTime,wave:this.wave,damageByMember:{...this.damageByMember}};
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
