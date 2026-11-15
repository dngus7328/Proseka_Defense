// Gameplay-changing SEKAI Heart effects. Fan-made combat mechanics, not
// canonical character powers. Group ultimates and duo synergies are distinct.
// Keep status durations in REAL seconds so 2x speed cannot halve the warning.
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const point=(e,g)=>g.enemyPos(e);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const living=g=>g.enemies.filter(e=>e.hp>0);
const advanceToIndex=(progress,n)=>((progress%n)+n)%n;
const COLOR={ensemble:'#b0c7e5',spotlight:'#f4d6a2',beat:'#eac08e',barrier:'#edd39e',
 quiet:'#bbc5e0',portal:'#b2dfdf',tether:'#d4c9e8',rescue:'#c2d9e4',mirror:'#d7c3f2',
 stage:'#eec1dd',armor:'#f1cbaa'};
const LABELS={
 ensemble:{ko:'합주 연결 · 멤버 연사',ja:'演奏リンク・連射',en:'Ensemble Link · Rapid Attacks'},
 spotlight:{ko:'스포트라이트 · 적 감속',ja:'スポットライト・減速',en:'Spotlight Zones · Snare'},
 beat:{ko:'비트 브레이크 · 연속 경직',ja:'ビートブレイク・連続拘束',en:'Beat Break · Rhythmic Stagger'},
 barrier:{ko:'공연 장벽 · 경로 봉쇄',ja:'ショーの壁・ルート封鎖',en:'Showtime Gates · Route Block'},
 quiet:{ko:'정적 · 전체 정지와 위협 해제',ja:'静寂・敵停止と妨害解除',en:'Silence · Halt Enemies & Cancel Hazard'},
 portal:{ko:'세카이 전송 · 적 후퇴',ja:'セカイ転送・敵後退',en:'SEKAI Portals · Enemy Recall'},
 tether:{ko:'별의 속박 · 위험 적 묶기',ja:'星の束縛・危険敵を拘束',en:'Star Tether · Bind Threats'},
 stage:{ko:'무대 장치 · 적 감속',ja:'舞台装置・敵の減速',en:'Stage Prop · Slow Zone'},
 armor:{ko:'비트 파괴 · 취약 상태',ja:'ビート破壊・弱体化',en:'Beat Break · Expose Armor'},
 rescue:{ko:'마음의 보호 · 방해 해제',ja:'想いの守護・妨害解除',en:'Rescue · Cleanse Disruption'},
 mirror:{ko:'연계 호흡 · 두 멤버 연사',ja:'連携・二人連射',en:'Mirrored Attack · Duo Tempo'}
};
const GROUP_MECHANIC={leo:'ensemble',mmj:'spotlight',vbs:'beat',wxs:'barrier',n25:'quiet',vs:'portal'};
const DUO_MECHANIC={star:'tether',rain:'stage',slash:'armor',burst:'barrier',wave:'rescue',orbit:'mirror'};
const FEATURE_MECHANIC={
 'star-siblings':'tether','sisters':'rescue','colors':'armor','rooftop':'portal',
 'twins':'mirror','miku-ichika':'ensemble','miku-kanade':'quiet',
 'an-kohane':'beat','emu-nene':'barrier','mafuyu-kanade':'quiet'
};
export function mechanicForHeart(heart){
 return heart.type==='group'?(GROUP_MECHANIC[heart.group]||GROUP_MECHANIC.leo):
 (FEATURE_MECHANIC[heart.id]||DUO_MECHANIC[heart.style]||'tether');
}
export function heartAbilityName(heart,lang='ko'){
 const type=mechanicForHeart(heart);
 return (LABELS[type]||LABELS.tether)[lang]||(LABELS[type]||LABELS.tether).ko;
}
export function heartAbilityDescription(heart,strength={average:1},lang='ko'){
 const type=mechanicForHeart(heart),group=heart.type==='group';
 const dur=(base)=>Number((base*(group?1:.68)).toFixed(1));
 const seconds=dur(type==='ensemble'?7:type==='spotlight'?7:type==='beat'?5.2:type==='barrier'?6:
  type==='quiet'?3.5:type==='portal'?5.5:type==='tether'?2.6:type==='armor'?5:type==='rescue'?4:6);
 const sentence={
 ensemble:{ko:`참여 멤버들의 공격 간격이 ${seconds}초 동안 짧아져 연속 공격해.`,ja:`${seconds}秒間、参加メンバーの攻撃間隔が短縮。`,en:`Linked members attack more often for ${seconds}s.`},
 spotlight:{ko:`${seconds}초 동안 적 경로에 조명 구역을 설치해 지나가는 적의 속도를 크게 낮춰.`,ja:`${seconds}秒間、経路に減速スポットライトを設置。`,en:`Spotlights along the path slow crossing enemies for ${seconds}s.`},
 beat:{ko:`${seconds}초 동안 박자마다 적을 경직시키고 방어를 약화시켜.`,ja:`${seconds}秒間、ビートごとに敵を怯ませ防御を弱化。`,en:`Repeated beats stagger and expose enemies for ${seconds}s.`},
 barrier:{ko:`${seconds}초 동안 적 경로에 공연 장벽을 세워 통과하는 적을 멈춰.`,ja:`${seconds}秒間、道を塞ぐ舞台ゲートを設置。`,en:`Stage gates interrupt enemies trying to cross for ${seconds}s.`},
 quiet:{ko:`${seconds}초 동안 적의 움직임을 멈추고, 발동 중인 이상현상과 아군 행동 불능을 해제해.`,ja:`${seconds}秒間、敵を静止させ異変と味方の妨害を解除。`,en:`Halts enemies for ${seconds}s, clears disruption and cancels warnings.`},
 portal:{ko:`앞서 나간 적들을 출발점 방향으로 돌려보내고 ${seconds}초 동안 전송문을 유지해.`,ja:`進んだ敵を入口へ戻し、${seconds}秒間転送門を維持。`,en:`Recalls front enemies toward spawn and keeps a portal for ${seconds}s.`},
 tether:{ko:`${seconds}초 동안 가장 위험한 적들의 움직임을 묶어.`,ja:`${seconds}秒間、先頭の敵を束縛。`,en:`Binds the leading enemies for ${seconds}s.`},
 stage:{ko:`${seconds}초 동안 적이 지나는 길목에 작은 조명 구역을 설치해.`,ja:`${seconds}秒間、敵の通り道に減速舞台を設置。`,en:`Places a slowing mini-stage for ${seconds}s.`},
 armor:{ko:`${seconds}초 동안 앞쪽 적들의 방어를 약화시켜 집중 공격을 유도해.`,ja:`${seconds}秒間、先頭の敵を弱体化させ集中攻撃。`,en:`Exposes leading enemies to stronger attacks for ${seconds}s.`},
 rescue:{ko:`두 멤버의 행동 불능을 해제하고 ${seconds}초간 공격 간격을 줄여.`,ja:`2人の妨害を解除し、${seconds}秒間攻撃速度上昇。`,en:`Cleanses both members and increases their attack speed for ${seconds}s.`},
 mirror:{ko:`${seconds}초 동안 두 멤버의 공격을 빠르게 연결해.`,ja:`${seconds}秒間、2人の攻撃を素早く連携。`,en:`Both members synchronize faster attacks for ${seconds}s.`}
 };
 return {mechanic:type,label:heartAbilityName(heart,lang),
  description:(sentence[type]||sentence.tether)[lang]||(sentence[type]||sentence.tether).ko,
  duration:seconds};
}
function queueState(g,type,heart,participants,duration,extra={}){
 const state={id:heart.id+'#'+g.realTime.toFixed(3),heartId:heart.id,type,
  style:heart.style,remaining:duration,total:duration,
  actorIds:participants.map(u=>u.id),unitIds:participants.map(u=>u.uid),
  color:COLOR[type]||'#d8d8c9',pulse:0,...extra};
 g.heartStates.push(state);
 if(g.heartStates.length>8)g.heartStates.splice(0,g.heartStates.length-8);
 return state;
}
function pathSpot(g,ratio){
 const p=g.map.path,index=Math.floor(p.length*ratio)%p.length;
 return {...p[index],index};
}
function mark(g,enemies,kind,remaining,limit){
 let count=0;
 for(const e of enemies.slice(0,limit)){
  if(e.hp<=0)continue;
  if(kind==='stun')e.stun=Math.max(e.stun||0,e.kind==='boss'?remaining*.52:remaining);
  if(kind==='exposed')e.exposed=Math.max(e.exposed||0,remaining);
  count++;
  const p=point(e,g);g.addEffect('heartHit',p.x,p.y,{life:.54,color:COLOR.armor,style:'star'});
 }
 return count;
}
function cancelInterference(g){
 if(!g.interference)return 0;
 const threat=g.interference;
 g.addEffect('threatAvoid',threat.x,threat.y,{life:.72,color:'#d5e7e6'});
 g.interference=null;
 g.threatCooldown=Math.max(12,g.threatInterval*.5);
 g.emit('onThreatEnd',{reason:'heart-shield',cancelled:true});
 return 1;
}
export function activateHeartAbility(g,heart,participants,strength){
 const group=heart.type==='group',type=mechanicForHeart(heart);
 const duration=heartAbilityDescription(heart,strength,'ko').duration;
 const danger=living(g).sort((a,b)=>b.progress-a.progress);
 const state=queueState(g,type,heart,participants,duration);
 const mapLength=g.map.path.length;
 let affected=0;
 switch(type){
  case 'ensemble':
  case 'mirror':
  case 'rescue':{
   // Speed links are powerful because they strengthen the *deployed* characters,
   // not a generic full-map explosion. Rescue also removes interruption.
   for(const hero of g.units){
    if(type!=='ensemble'&&!state.unitIds.includes(hero.uid))continue;
    if(type==='ensemble'&&!state.unitIds.includes(hero.uid))continue;
    hero.cooldown=Math.min(hero.cooldown||.4,.18);
    if(type==='rescue')hero.jamTime=0;
    affected++;
   }
   if(type==='rescue'){
    affected+=cancelInterference(g);
    if(group)for(const hero of g.units)hero.jamTime=0;
   }
   break;
  }
  case 'spotlight':
  case 'stage':{
   state.zones=(group?[.22,.54,.81]:[Math.max(.12,Math.min(.88,((danger[0]?.progress||5)+1)/mapLength))])
    .map(ratio=>pathSpot(g,ratio));
   affected=state.zones.length;
   break;
  }
  case 'barrier':{
   state.gates=(group?[.28,.55,.83]:[.63]).map(ratio=>pathSpot(g,ratio));
   affected=state.gates.length;
   break;
  }
  case 'beat':{
   state.pulse=.08;
   affected=danger.length;
   break;
  }
  case 'quiet':{
   for(const e of danger)e.stun=Math.max(e.stun||0,e.kind==='boss'?duration*.54:duration);
   for(const hero of g.units)hero.jamTime=0;
   affected=danger.length+cancelInterference(g);
   break;
  }
  case 'portal':{
   const count=group?Math.min(8,danger.length):Math.min(2,danger.length);
   const jump=group?Math.max(4,mapLength*.21):Math.max(2,mapLength*.11);
   for(const e of danger.slice(0,count)){
    const old=point(e,g);e.progress=Math.max(0,e.progress-jump);
    const target=point(e,g);
    g.addEffect('line',old.x,old.y,{tx:target.x,ty:target.y,color:COLOR.portal,life:.6,star:4});
    e.stun=Math.max(e.stun||0,.35);
   }
   state.portals=[pathSpot(g,.07),pathSpot(g,.7)];
   affected=count;
   break;
  }
  case 'tether':{
   affected=mark(g,danger,'stun',duration,group?5:2);
   state.targets=danger.slice(0,affected).map(e=>e.uid);
   break;
  }
  case 'armor':{
   affected=mark(g,danger,'exposed',duration,group?7:3);
   state.targets=danger.slice(0,affected).map(e=>e.uid);
   break;
  }
  default:break;
 }
 // Hand-designed pairs have one extra interpersonal payoff, instead of being
 // identical to their 315 automatically-discovered pair names.
 if(heart.id==='star-siblings')state.gates=[pathSpot(g,.5)];
 if(heart.id==='sisters')for(const u of g.units)if(u.id==='shiho'||u.id==='shizuku')u.jamTime=0;
 if(heart.id==='colors')affected+=mark(g,danger,'exposed',duration,4);
 if(heart.id==='rooftop')state.portals=[pathSpot(g,.2),pathSpot(g,.8)];
 if(heart.id==='twins')for(const u of participants)u.cooldown=.05;
 if(heart.id==='miku-ichika')state.unitIds=[...new Set([...state.unitIds,...g.units.filter(u=>u.id==='ichika'||u.id==='miku').map(u=>u.uid)])];
 if(heart.id==='miku-kanade'||heart.id==='mafuyu-kanade')affected+=cancelInterference(g);
 if(heart.id==='an-kohane')state.pulse=.01;
 if(heart.id==='emu-nene')state.gates=[pathSpot(g,.25),pathSpot(g,.7)];
 return {mechanic:type,duration,affected,actorId:participants[0]?.id,kind:heart.type};
}
// Status and moving enemies react to the same persistent world effects drawn
// by Renderer. Paused games never tick this function.
export function advanceHeartAbilities(g,realDt){
 for(const state of g.heartStates){
  state.remaining=Math.max(0,state.remaining-realDt);
  if(state.type==='beat'){
   state.pulse-=realDt;
   if(state.pulse<=0){
    state.pulse+=.69;
    for(const e of living(g)){
     e.stun=Math.max(e.stun||0,e.kind==='boss'?.13:.31);
     e.exposed=Math.max(e.exposed||0,1.15);
     e.progress=Math.max(0,e.progress-(e.kind==='boss'?.08:.2));
    }
    const p=pathSpot(g,(1-state.remaining/state.total)*.82+.06);
    g.addEffect('ring',p.x,p.y,{color:state.color,radius:2.4,life:.38});
   }
  }
  if(state.type==='quiet'){
   for(const e of living(g))if(e.kind!=='boss')
    e.stun=Math.max(e.stun||0,.14);
  }
 }
 g.heartStates=g.heartStates.filter(s=>s.remaining>0);
}
export function heartMoveFactor(g,e){
 let factor=1;
 for(const state of g.heartStates){
  if(state.type==='quiet'&&e.kind==='boss')factor=Math.min(factor,.32);
  if(state.type==='spotlight'||state.type==='stage'){
   const pos=point(e,g);
   if(state.zones?.some(z=>distance(pos,z)<(state.type==='spotlight'?1.65:1.35))){
    factor=Math.min(factor,e.kind==='boss'?.62:.34);
    e.exposed=Math.max(e.exposed||0,.24);
   }
  }
 }
 return factor;
}
export function heartAfterMovement(g,e,before){
 if(e.hp<=0)return;
 const len=g.map.path.length;
 for(const s of g.heartStates){
  if(!s.gates)continue;
  for(const gate of s.gates){
   const index=gate.index;
   const crossAt=Math.floor(before/len)*len+index;
   // Obstacles block once per enemy per gate per activation, even if
   // the enemy has completed a loop around the cyclic path.
   if(before<crossAt&&e.progress>=crossAt &&
    !(e.heartGateHits?.[s.id]?.includes(index))){
    e.progress=crossAt-.01;
    e.stun=Math.max(e.stun||0,e.kind==='boss'?.72:1.35);
    if(!e.heartGateHits)e.heartGateHits={};
    if(!e.heartGateHits[s.id])e.heartGateHits[s.id]=[];
    e.heartGateHits[s.id].push(index);
    g.addEffect('impact',gate.x,gate.y,{color:s.color,life:.52,star:4,motif:'confetti'});
   }
  }
 }
}
export function heartHeroIntervalFactor(g,unit){
 let factor=1;
 for(const state of g.heartStates){
  if((state.type==='ensemble'||state.type==='mirror'||state.type==='rescue')
   &&state.unitIds.includes(unit.uid))
   factor=Math.min(factor,state.type==='ensemble'?.53:state.type==='mirror'?.47:.68);
 }
 return factor;
}
export function heartDamageFactor(g,e){
 return (e.exposed||0)>0?1.25:1;
}
