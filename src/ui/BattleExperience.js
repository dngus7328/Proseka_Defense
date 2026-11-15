import {CHARACTER_BY_ID} from '../data/characters.js';
import {HEARTS} from '../data/hearts.js';
import {interferenceForMap} from '../data/interference.js';
import {situationalLine,pairDiscoveryLine} from '../data/battleChatter.js';
import {SKILL_DIALOGUE} from '../data/skillDialogue.js';
const el=id=>document.getElementById(id);
const HINTS={
 silence:{ko:'표시된 곳 주변의 멤버가 공격을 못 해. 대피해서 보호하자.',ja:'印の周囲のメンバーが攻撃不能に。移動して回避しよう。',en:'Nearby members will stop attacking. Move the marked member to protect them.'},
 rush:{ko:'피격 시 적이 빠르게 움직여. 표시된 멤버를 옮기자.',ja:'被弾すると敵が加速。印のメンバーを移動して。',en:'A hit speeds up enemies. Move the marked member.'},
 drain:{ko:'피격 시 크리스탈과 공격 기회를 잃어. 이동하면 보상!',ja:'被弾でクリスタルを消費。移動で報酬！',en:'A hit drains crystals and attacks. Dodge to earn rewards.'}
};
const LANG={
 ko:{danger:'전장 위험',evade:'대피',move:'초록색 빈 칸을 눌러 이동!',instruction:'대피 누르기 → 초록색 빈 칸 선택',chosen:'선택 중',dodge:'회피 성공! 크리스탈 +12 · 마음의 조각 +8',hit:'이상현상 발생! 일시적으로 전투가 방해받아.',first:'첫 멤버를 배치했어! 같은 멤버 2명을 모으면 합성할 수 있어.',wave:'도달 웨이브',avoided:'위험 회피',time:'마지막 적을 시간 내 처치하지 못했어.',overflow:'적이 60마리 쌓였어. 배치·합성·광역 공격을 점검해 봐.',win:'세카이를 지켜냈어! 다음 도전이 기다리고 있어.',times:'회'},
 ja:{danger:'ステージの危険',evade:'退避',move:'緑の空きマスをタップして移動！',instruction:'退避 → 緑の空きマスを選択',chosen:'移動中',dodge:'回避成功！クリスタル +12・かけら +8',hit:'異変発生！一時的に戦闘が妨害された。',first:'最初の仲間を配置！同じ仲間を二人集めると合成できるよ。',wave:'到達ウェーブ',avoided:'危険回避',time:'最後の敵を時間内に倒せなかった。',overflow:'敵が60体に。配置・合成・範囲攻撃を試して。',win:'セカイを守った！次の挑戦が待っている。',times:'回'},
 en:{danger:'STAGE DANGER',evade:'EVADE',move:'Tap an empty green tile to relocate!',instruction:'Evade → choose an empty green tile',chosen:'MOVING',dodge:'Dodged! +12 crystals · +8 fragments',hit:'Interference hit! Your defense is disrupted.',first:'First member placed! Merge two copies of the same member.',wave:'WAVE REACHED',avoided:'DANGERS DODGED',time:'Final enemies were not cleared in time.',overflow:'60 enemies accumulated. Try positioning, merging and area attacks.',win:'You protected the SEKAI! Your next challenge awaits.',times:''}
};
// UI-only controller. The Game system remains the authority for all effects.
export class BattleExperience {
 constructor(ui){
  this.ui=ui;this.lastLine=-Infinity;this.lineTimer=null;this.firstFour=new Set();
  el('dangerMove')?.addEventListener('click',()=>this.focusThreat());
 }
 get lang(){return LANG[this.ui.save.language]||LANG.ko;}
 get game(){return this.ui.game;}
 reset(){
  if(this.lineTimer!==null){window.clearTimeout(this.lineTimer);this.lineTimer=null;}
  const dialogue=el('battleDialogue');if(dialogue)dialogue.hidden=true;
  const warning=el('dangerBanner');if(warning)warning.hidden=true;
  this.firstFour.clear();this.lastLine=-Infinity;
  this.lastTacticsKey='';
 }
 showLine(id,line,force=false){
  const g=this.game,actor=CHARACTER_BY_ID[id]||CHARACTER_BY_ID.miku;
  if(!g||!actor||!line)return;
  if(!force&&g.realTime-this.lastLine<7)return;
  const localized=typeof line==='string'?line:(line[this.ui.save.language]||line.ko);
  if(!localized)return;
  const box=el('battleDialogue');if(!box)return;
  this.lastLine=g.realTime;
  el('battleDialoguePortrait').src=`./Assets/characters/${actor.id}/front.png`;
  el('battleDialoguePortrait').alt='';
  el('battleDialogueSpeaker').textContent=actor.names[this.ui.save.language]||actor.names.ko;
  el('battleDialogueText').textContent=localized;
  box.hidden=false;
  if(this.lineTimer!==null)window.clearTimeout(this.lineTimer);
  this.lineTimer=window.setTimeout(()=>{box.hidden=true;this.lineTimer=null;},3100);
 }
 update(){
  const threat=this.game?.interference,box=el('dangerBanner');
  if(!box)return;
  box.hidden=!threat;
  this.updateTactics();
  if(!threat)return;
  const lang=this.ui.save.language,actor=CHARACTER_BY_ID[threat.id];
  box.style.setProperty('--danger',threat.color);
  box.classList.toggle('near-expiry',threat.remaining<=2);
  el('dangerTitle').textContent=`${threat.names[lang]||threat.names.ko} · ${actor?.names[lang]||''}`;
  const pending=this.game?.moveMode&&this.game.selectedId===threat.uid;
  el('dangerInstruction').textContent=pending?this.lang.move:this.lang.instruction;
  el('dangerTimer').textContent=String(Math.ceil(threat.remaining));
  const btn=el('dangerMove');
  btn.disabled=pending;btn.textContent=pending?this.lang.chosen:this.lang.evade;
 }
 updateTactics(){
  const game=this.game;if(!game)return;
  const lang=this.ui.save.language;
  const map=game.map;
  const danger=game.interference;
  const hintKey=[lang,map.id,game.wave,game.units.length,game.threatStats.avoided,!!danger,game.moveMode].join(':');
  if(this.lastTacticsKey===hintKey)return;
  this.lastTacticsKey=hintKey;
  const icon=el('teamTacticsIcon'),name=el('teamTacticsTitle');
  const text=el('teamTacticsDescription'),hint=el('teamTacticsHint');
  if(!icon||!name||!text||!hint)return;
  icon.src=`./Assets/ui/${map.id}.png`;
  name.textContent=map.shortNames?.[lang]||map.names[lang]||map.names.ko;
  if(danger){
   text.textContent={
    ko:'표시된 멤버를 다른 배치칸으로 이동해 위험을 피하자.',
    ja:'印のあるメンバーを別の空きマスに移動して回避しよう。',
    en:'Move the marked member to another free tile to avoid interference.'
   }[lang];
   hint.textContent={
    ko:'대피 성공 시 크리스탈 +12 · 마음의 조각 +8',
    ja:'回避成功でクリスタル +12・かけら +8',
    en:'Dodge bonus: +12 crystals and +8 fragments'
   }[lang];
  }else if(game.wave<5&&game.difficulty==='normal'){
   text.textContent={
    ko:'처음에는 같은 멤버를 2명 모아 합성하는 게 중요해.',
    ja:'まず同じメンバーを二人集めて合成しよう。',
    en:'Build pairs of matching members to merge them.'
   }[lang];
   hint.textContent={
    ko:'5웨이브부터 전장 이상현상이 나타나. 배치 이동을 기억해.',
    ja:'ウェーブ5から異変が始まる。移動を覚えておこう。',
    en:'Stage hazards start at wave 5. You can relocate members.'
   }[lang];
  }else{
   const type=interferenceForMap(map.id);
   text.textContent=HINTS[type.type][lang];
   hint.textContent={
    ko:'멤버를 누르면 공격 범위와 합성·이동 버튼이 보여.',
    ja:'メンバーをタップすると攻撃範囲・合成・移動が表示される。',
    en:'Tap a member to view range, merge and move controls.'
   }[lang];
  }
 }
 focusThreat(){
  const g=this.game,t=g?.interference;
  if(!t||g.phase!=='playing')return;
  const unit=g.units.find(u=>u.uid===t.uid);if(!unit)return;
  if(g.selectedId!==unit.uid)g.selection(unit.uid);
  if(!g.moveMode)g.moveSelected();
  this.ui.update(true);
 }
 onSummon(unit,character){
  const g=this.game;if(!g)return;
  if(g.summons===1)this.showLine(character.id,{ko:LANG.ko.first,ja:LANG.ja.first,en:LANG.en.first},true);
  else if(g.summons%4===0)this.showLine(character.id,situationalLine(character.group,'summon',this.ui.save.language));
 }
 onPromotion(unit){
  if(unit.star!==4||this.firstFour.has(unit.id))return;
  this.firstFour.add(unit.id);
  this.showLine(unit.id,SKILL_DIALOGUE[unit.id],true);
 }
 onPairDiscovered(id){
  const heart=HEARTS.find(h=>h.id===id),line=pairDiscoveryLine(id,this.ui.save.language);
  if(heart&&line)this.showLine(heart.required[0],line,true);
 }
 onBossWave(){
  const actor=this.game?.selected||this.game?.units[0];
  if(!actor)return;
  this.showLine(actor.id,situationalLine(CHARACTER_BY_ID[actor.id]?.group,'boss',this.ui.save.language),true);
 }
 onThreatStart(t){
  this.showLine(t.id,situationalLine(CHARACTER_BY_ID[t.id]?.group,'danger',this.ui.save.language),true);
  this.ui.sound.beep('special');this.update();
 }
 onThreatAvoid(t){
  this.ui.toast(this.lang.dodge,true);
  this.showLine(t.id,situationalLine(CHARACTER_BY_ID[t.id]?.group,'avoid',this.ui.save.language),true);
  this.update();
 }
 onThreatHit(t){
  this.ui.toast(this.lang.hit,true);
  this.showLine(t.id,situationalLine(CHARACTER_BY_ID[t.id]?.group,'hit',this.ui.save.language),true);
  this.update();
 }
 updateMap(map){
  const parent=el('mapChoices')?.parentElement;if(!parent||!map)return;
  let note=el('mapRuleBrief');
  if(!note){note=document.createElement('p');note.id='mapRuleBrief';note.className='map-rule-brief';parent.append(note);}
  const rule=interferenceForMap(map.id),lang=this.ui.save.language;
  note.textContent=`${this.lang.danger} · ${rule.names[lang]||rule.names.ko} — ${HINTS[rule.type][lang]}`;
 }
 showResult(result){
  this.reset();
  const box=el('resultInsight');if(!box)return;
  box.replaceChildren();
  const lang=this.lang;
  const add=(title,value)=>{
   const wrapper=document.createElement('div'),label=document.createElement('small'),text=document.createElement('strong');
   label.textContent=title;text.textContent=value;
   wrapper.append(label,text);box.append(wrapper);
  };
  add(lang.wave,`${result.wave} / ${result.difficulty==='endless'?'∞':'20'}`);
  add(lang.avoided,`${result.threatStats?.avoided||0}${lang.times}`);
  const info=result.status==='win'?lang.win:result.reason==='final_timeout'?lang.time:lang.overflow;
  let extra=el('resultAdvice');
  if(!extra){extra=document.createElement('p');extra.id='resultAdvice';extra.className='result-advice';box.after(extra);}
  extra.textContent=info;
 }
}
