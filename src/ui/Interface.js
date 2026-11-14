import {GROUPS,CHARACTER_BY_ID,SIGNATURES,attackValue,attackRange} from '../data/characters.js';
import {MAPS} from '../data/maps.js';
import {HEARTS} from '../data/hearts.js';
import {DIFFICULTIES,UPGRADE_DATA,upgradeCost} from '../data/enemies.js';
import {getText,LANGUAGES} from '../data/locales.js';
import {TITLE_LOGOS} from '../data/branding.js';
import {persistSave} from '../core/Save.js';
const el=(id)=>document.getElementById(id);
const format=(n)=>Math.round(n).toLocaleString();
const timeText=(sec)=>`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
const AREA_ICONS={roof:'roof',stage:'stage',city:'city',wonderland:'wonderland',night:'night',closedwindow:'closedwindow',openwindow:'openwindow'};
const AREA_TYPES={roof:'SCHOOL SEKAI',stage:'STAGE SEKAI',city:'STREET SEKAI',wonderland:'WONDERLAND SEKAI',night:'EMPTY SEKAI',closedwindow:'CLOSED WINDOW',openwindow:'OPEN WINDOW'};
const SKILL_LINES={
 "leo-chorus": {
  "ko": "이 소리를, 모두에게 닿게 할 거야!",
  "ja": "この音を、みんなに届けるよ！",
  "en": "Let our sound reach everyone!"
 },
 "mmj-stage": {
  "ko": "모두에게 희망을 전할게!",
  "ja": "みんなに希望を届けるよ！",
  "en": "We'll bring hope to everyone!"
 },
 "vbs-beat": {
  "ko": "우리의 비트, 끝까지 울려 퍼져라!",
  "ja": "私たちのビート、響かせよう！",
  "en": "Feel our beat!"
 },
 "wxs-final": {
  "ko": "자, 최고의 쇼를 시작하자!",
  "ja": "さあ、最高のショーを始めよう！",
  "en": "Let the greatest show begin!"
 },
 "n25-dawn": {
  "ko": "이 마음이, 누군가에게 닿기를…",
  "ja": "この想いが、誰かに届きますように…",
  "en": "May these feelings reach someone…"
 },
 "vs-signal": {
  "ko": "다 함께, 노래를 이어 가자!",
  "ja": "みんなで、歌をつなごう！",
  "en": "Let's carry the song together!"
 },
 "star-siblings": {
  "ko": "반짝이는 순간을 만들어 보자!",
  "ja": "きらめく瞬間を作ろう！",
  "en": "Let's make this moment shine!"
 },
 "sisters": {
  "ko": "우리의 호흡을 맞춰 보자!",
  "ja": "ふたりの息を合わせよう！",
  "en": "Let's find our harmony!"
 },
 "colors": {
  "ko": "우리만의 색으로 승부하자!",
  "ja": "自分たちの色で勝負しよう！",
  "en": "Let's show our true colors!"
 },
 "rooftop": {
  "ko": "상상 밖의 무대를 보여줄게.",
  "ja": "想像を超えた舞台を見せよう。",
  "en": "Let's go beyond imagination."
 },
 "twins": {
  "ko": "둘이 함께라면 문제없어!",
  "ja": "ふたり一緒なら大丈夫！",
  "en": "Together, we've got this!"
 },
 "miku-ichika": {
  "ko": "시작의 멜로디를 울리자!",
  "ja": "始まりのメロディーを響かせよう！",
  "en": "Let the first melody ring out!"
 },
 "miku-kanade": {
  "ko": "너의 마음을, 노래로 전할게.",
  "ja": "その想いを、歌にするよ。",
  "en": "I'll give those feelings a song."
 },
 "an-kohane": {
  "ko": "우리의 힘을 보여줄 차례야!",
  "ja": "私たちの力を見せる番だよ！",
  "en": "Time to show what we can do!"
 },
 "emu-nene": {
  "ko": "모두가 웃는 공연을 만들자!",
  "ja": "みんなが笑顔になるショーを！",
  "en": "A show that makes everyone smile!"
 },
 "mafuyu-kanade": {
  "ko": "이 노래가 너를 지켜 줄 수 있기를.",
  "ja": "この歌が、あなたを守れますように。",
  "en": "I hope this song can protect you."
 }
};
const escapeHTML=(s)=>String(s).replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
export class Interface {
 constructor(save,renderer,sound){
  this.save=save;this.renderer=renderer;this.sound=sound;this.game=null;
  this.config={difficulty:'normal',mapId:'roof'};
  this.overlayOrigin='title';this.settingsOrigin='title';this.noticeTimer=null;this.lastUpgrades='';this.lastHero='';
  this.handlers={};this.renderLanguages();this.registerActions();this.sound.setVolume(save.volume/100);
  this.skillCutin=document.createElement('section');this.skillCutin.id='skillCutin';this.skillCutin.className='skill-cutin';this.skillCutin.setAttribute('aria-live','polite');this.skillCutin.setAttribute('aria-atomic','true');document.body.append(this.skillCutin);
 }
 t(key){return getText(this.save.language,key);}
 bindGameHandlers(handlers){this.handlers=handlers;}
 setGame(game){this.clearHeartCutin();this.game=game;this.syncMapArtwork(game.map);el('app').dataset.theme=game.map.theme;document.body.classList.remove('menu-mode');this.lastUpgrades='';this.lastHero='';this.closeUpgrades();this.hideOverlays();this.update(true);this.setStatus('READY');}
 status(text){el('statusLine').textContent=text;}
 setStatus(text){this.status(text);}
 notice(){
  this.showOverlay('noticeOverlay');
  // Entry notice is automatic. Tapping skip is optional; no confirmation modal.
  this.noticeTimer=window.setTimeout(()=>{this.noticeTimer=null;this.showTitle();},4600);
 }
 showTitle(){
  this.clearHeartCutin();
  el('app').dataset.theme=(MAPS.find(m=>m.id===this.config.mapId)||MAPS[0]).theme;
  if(this.noticeTimer!==null){window.clearTimeout(this.noticeTimer);this.noticeTimer=null;}
  this.game=null;this.closeUpgrades();this.showOverlay('titleOverlay');
  const map=MAPS.find(m=>m.id===this.config.mapId)||MAPS[0];this.syncMapArtwork(map);
  this.renderer.drawTitleScene(el('titlePreview'),map);
 }
 hideOverlays(){for(const o of document.querySelectorAll('.overlay'))o.classList.remove('visible');}
 showOverlay(id){this.closeUpgrades();this.hideOverlays();el(id)?.classList.add('visible');document.body.classList.toggle('menu-mode',!this.game);}
 overlayVisible(id){return !!el(id)?.classList.contains('visible');}
 renderLanguages(){
  document.documentElement.lang=this.save.language;
  // Keep the title artwork synchronized with the selected UI language.
  const titleLogo=el('titleLanguageLogo');
  if(titleLogo){
   const logo=TITLE_LOGOS[this.save.language]||TITLE_LOGOS.ko;
   if(titleLogo.getAttribute('src')!==logo.src)titleLogo.setAttribute('src',logo.src);
   titleLogo.alt=logo.alt;
  }
  for(const e of document.querySelectorAll('[data-i18n]'))e.textContent=this.t(e.dataset.i18n);
  for(const e of document.querySelectorAll('[data-lang]'))e.classList.toggle('active',e.dataset.lang===this.save.language);
  el('languageSelect').value=this.save.language;
  el('volumeRange').value=this.save.volume;
  el('effectsSelect').value=this.save.effects;
  this.renderer.effectsLite=this.save.effects==='lite';
  el('touchToggle').checked=this.save.touch;
  this.renderLobby();this.renderHearts();this.update(true);
 }
 setLanguage(lang){if(!LANGUAGES.includes(lang))return;this.save.language=lang;persistSave(this.save);this.renderLanguages();}
 registerActions(){
  const click=(id,fn)=>el(id).addEventListener('click',fn);
  click('acceptNotice',()=>this.showTitle());
  click('titleEnter',()=>{this.sound.beep('select');this.showLobby();});
  click('lobbyBack',()=>this.showTitle());
  click('titleSettings',()=>this.openSettings());
  click('titleHearts',()=>this.openHearts());
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>this.setLanguage(b.dataset.lang)));
  click('startButton',()=>this.handlers.onStart?.({...this.config}));
  click('openSettings',()=>this.openSettings());click('lobbySettings',()=>this.openSettings());click('pauseSettings',()=>this.openSettings());
  click('openCollection',()=>this.openHearts());click('heartButton',()=>this.openHearts());
  click('pauseButton',()=>this.togglePause());click('resumeButton',()=>this.resume());
  click('quitButton',()=>this.handlers.onExit?.());
  click('speedButton',()=>{if(this.game?.phase==='playing'){this.game.speed=this.game.speed===1?2:1;this.sound.beep('select');this.update(true);}});
  click('summonButton',()=>this.game?.summon());
  click('upgradeToggle',()=>this.toggleUpgrades());
  click('upgradeScrim',()=>this.closeUpgrades());
  click('autoMergeButton',()=>this.game?.autoMerge());
  click('moveButton',()=>{this.game?.moveSelected();if(this.game)this.setStatus(this.game.moveMode?this.t('moveHint'):'READY');});
  click('mergeButton',()=>this.game?.mergeSelected());click('clearSelection',()=>this.game?.selection(null));
  click('resultExit',()=>this.handlers.onExit?.());click('resultRetry',()=>this.handlers.onRetry?.());click('resultNext',()=>this.handlers.onNext?.());
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>this.closeOverlay(button.dataset.close)));
  el('languageSelect').addEventListener('change',e=>this.setLanguage(e.target.value));
  el('volumeRange').addEventListener('input',e=>{this.save.volume=Number(e.target.value);this.sound.setVolume(this.save.volume/100);persistSave(this.save);});
  el('effectsSelect').addEventListener('change',e=>{this.save.effects=e.target.value;this.renderer.effectsLite=e.target.value==='lite';persistSave(this.save);});
  el('touchToggle').addEventListener('change',e=>{this.save.touch=e.target.checked;persistSave(this.save);});
  el('gameCanvas').addEventListener('pointerdown',e=>{
    if(!this.game||this.game.phase!=='playing')return;
    const p=this.renderer.mapClick(e);this.game.clickTile(p.x,p.y);
    if(this.save.touch&&p.x>=0&&p.y>=0&&p.x<this.game.map.w&&p.y<this.game.map.h)this.game.addEffect('ring',p.x,p.y,{radius:.45,color:'#e4f8ec',life:.2});
    this.update(true);
  });
  document.addEventListener('keydown',e=>{
   if(e.key==='Escape'){
    if(this.overlayVisible('noticeOverlay')||this.overlayVisible('titleOverlay')||this.overlayVisible('lobbyOverlay'))return;
    if(this.overlayVisible('settingsOverlay'))this.closeOverlay('settingsOverlay');
    else if(this.overlayVisible('heartsOverlay'))this.closeOverlay('heartsOverlay');
    else this.togglePause();
   }
   if(e.code==='Space'&&this.game?.phase==='playing'&&!this.isModalOpen()){e.preventDefault();this.game.speed=this.game.speed===1?2:1;this.update(true);}
  });
 }
 isModalOpen(){return [...document.querySelectorAll('.overlay')].some(e=>e.classList.contains('visible'));}
 showLobby(){this.game=null;this.closeUpgrades();this.config.difficulty='normal';this.renderLobby();this.showOverlay('lobbyOverlay');}
 renderLobby(){
  const diff=el('difficultyChoices');if(!diff)return;
  const cleared=this.save.cleared;
  const available=DIFFICULTIES.map((d,i)=>i===0||cleared.includes(DIFFICULTIES[i-1].id));
  if(!available[DIFFICULTIES.findIndex(x=>x.id===this.config.difficulty)])this.config.difficulty='normal';
  diff.innerHTML='';DIFFICULTIES.forEach((d,i)=>{
   const button=document.createElement('button');button.className=`choice-button${this.config.difficulty===d.id?' active':''}`;
   button.textContent=this.t(d.id);button.disabled=!available[i];
   if(!available[i])button.innerHTML=`${escapeHTML(this.t(d.id))}<span class="lock">⌑</span>`;
   button.addEventListener('click',()=>{this.config.difficulty=d.id;this.renderLobby();});diff.append(button);
  });
  const maps=el('mapChoices');const mapScrollLeft=maps.scrollLeft;maps.innerHTML='';MAPS.forEach(map=>{
   const button=document.createElement('button');button.className=`map-choice${this.config.mapId===map.id?' active':''}`;
   const canvas=document.createElement('canvas');canvas.className='map-thumb';
   const icon=document.createElement('img');icon.className='map-icon';icon.src=`./Assets/ui/${AREA_ICONS[map.id]||'roof'}.png`;icon.alt='';
   const name=document.createElement('strong');name.textContent=`${map.order} · ${map.shortNames?.[this.save.language]||map.names[this.save.language]}`;
   button.append(canvas,icon,name);this.renderer.drawThumbnail(canvas,map);
   button.addEventListener('click',()=>{this.config.mapId=map.id;this.renderLobby();});maps.append(button);
  });
  maps.scrollLeft=mapScrollLeft;
  const selected=MAPS.find(m=>m.id===this.config.mapId);
  if(selected){
   el('app').dataset.theme=selected.theme;this.syncMapArtwork(selected);
   const host=document.querySelector('.lobby-art-copy');
   if(host){
    let badge=el('mapAffinity');if(!badge){badge=document.createElement('div');badge.id='mapAffinity';badge.className='map-affinity';host.append(badge);}
    const group=GROUPS.find(g=>g.id===selected.affinityGroup);
    const title=group?.short||'VIRTUAL SINGER';
    const rate=Math.round(selected.affinityRate*100);
    badge.textContent=this.save.language==='ja'?`セカイ優先抽選 ${rate}% · ${title}`:
     this.save.language==='en'?`SEKAI PRIORITY ${rate}% · ${title}`:
     `세카이 소환 우선 ${rate}% · ${title}`;
   }
  }
  if(selected&&el('lobbyPreview'))this.renderer.drawThumbnail(el('lobbyPreview'),selected);
 }
 syncMapArtwork(map){
  if(!map)return;
  const url=`./Assets/ui/${AREA_ICONS[map.id]||'roof'}.png`;
  for(const id of ['battleCrest','worldCrest','lobbyCrest','statusWorldIcon'])if(el(id))el(id).src=url;
  if(el('worldTypeText'))el('worldTypeText').textContent=AREA_TYPES[map.id]||'SEKAI';
  if(el('lobbyWorldName'))el('lobbyWorldName').textContent=map.names[this.save.language]||map.names.ko;
  if(el('lobbyWorldIndex'))el('lobbyWorldIndex').textContent=`${map.order} / ${String(MAPS.length).padStart(2,'0')}`;
 }
 openSettings(){
  if(this.overlayVisible('settingsOverlay'))return;
  this.settingsOrigin=this.overlayVisible('pauseOverlay')?'pause':this.game?.phase==='playing'?'playing':this.overlayVisible('titleOverlay')?'title':'lobby';
  if(this.game?.phase==='playing')this.game.togglePause();
  this.showOverlay('settingsOverlay');
 }
 openHearts(){
  this.overlayOrigin=this.overlayVisible('pauseOverlay')?'pause':this.game?.phase==='playing'?'playing':this.overlayVisible('titleOverlay')?'title':'lobby';
  if(this.game?.phase==='playing')this.game.togglePause();
  this.renderHearts();this.showOverlay('heartsOverlay');
 }
 closeOverlay(id){
  if(id==='settingsOverlay'){
   if(this.settingsOrigin==='playing'&&this.game?.phase==='paused')this.game.togglePause();
   if(this.settingsOrigin==='pause'){this.showOverlay('pauseOverlay');return;}
   if(this.settingsOrigin==='lobby'){this.showOverlay('lobbyOverlay');return;}
   if(this.settingsOrigin==='title'){this.showTitle();return;}
  }else if(id==='heartsOverlay'){
   if(this.overlayOrigin==='playing'&&this.game?.phase==='paused')this.game.togglePause();
   if(this.overlayOrigin==='pause'){this.showOverlay('pauseOverlay');return;}
   if(this.overlayOrigin==='lobby'){this.showOverlay('lobbyOverlay');return;}
   if(this.overlayOrigin==='title'){this.showTitle();return;}
  }
  this.hideOverlays();
 }
 toggleUpgrades(){
  if(!this.game||this.game.phase!=='playing')return;
  const open=!el('app').classList.contains('upgrade-open');
  el('app').classList.toggle('upgrade-open',open);
  el('upgradeToggle').setAttribute('aria-expanded',String(open));
 }
 closeUpgrades(){
  el('app').classList.remove('upgrade-open');
  el('upgradeToggle').setAttribute('aria-expanded','false');
 }
 togglePause(){
  if(!this.game||!['playing','paused'].includes(this.game.phase))return;
  const paused=this.game.togglePause();
  if(paused)this.showOverlay('pauseOverlay');else this.hideOverlays();
 }
 resume(){if(this.game?.phase==='paused')this.game.togglePause();this.hideOverlays();}
 renderHearts(){
  const list=el('heartList');if(!list)return;
  el('collectionCount').textContent=`${this.save.discovered.length} / ${HEARTS.length}`;
  list.innerHTML='';HEARTS.forEach(h=>{
   const known=this.save.discovered.includes(h.id);
   const row=document.createElement('div');row.className='heart-item'+(known?'':' locked');
   const icon=document.createElement('div');icon.className='heart-mark';icon.textContent=known?'♡':'?';
   const title=document.createElement('div');const name=document.createElement('strong');name.textContent=known?h.names[this.save.language]:'???';
   const info=document.createElement('small');info.textContent=known?h.required.map(id=>CHARACTER_BY_ID[id].names[this.save.language]).join(' + '):'· · ·';
   title.append(name,info);row.append(icon,title);list.append(row);
  });
  el('heartCount').textContent=String(this.save.discovered.length);
 }
 toast(message,raw=false){
  const content=raw?message:this.t(message);
  const outer=document.createElement('div');outer.className='toast';outer.textContent=content;
  const stack=el('toastStack');stack.append(outer);
  if(stack.children.length>3)stack.firstChild.remove();
  window.setTimeout(()=>outer.remove(),2200);
 }
 onSummon({unit,character,source}){
  const name=character.names[this.save.language];
  const bonus=source==='affinity'?(this.save.language==='ja'?'セカイボーナス':this.save.language==='en'?'SEKAI BONUS':'세카이 보정'):'';
  this.setStatus(`${name}${bonus?' · '+bonus:''}`);
 }
 onPromotion({unit}){
  const name=CHARACTER_BY_ID[unit.id]?.names[this.save.language]||unit.id;
  this.setStatus(`${name}  ${'★'.repeat(unit.star)}`);
 }
  onHeartSeen(id){
  if(this.save.discovered.includes(id))return;
  this.save.discovered.push(id);persistSave(this.save);this.renderHearts();
  this.toast(this.t('discovered'),true);
 }
 onHeartStart({heart,participants,strength}){
  const actor=CHARACTER_BY_ID[participants[0]?.id];
  if(!actor||!this.skillCutin)return;
  const lang=this.save.language;
  const name=heart.names[lang]||heart.names.ko;
  const words=SKILL_LINES[heart.id]?.[lang]||SKILL_LINES[heart.id]?.ko||'';
  const actorName=actor.names[lang]||actor.names.ko;
  const group=GROUPS.find(g=>g.id===actor.group);
  const accent=group?.color||'#b3d9db';
  const teammates=participants.slice(1,4).map(unit=>'<img src="./Assets/characters/'+encodeURIComponent(unit.id)+'/front.png" alt="" draggable="false">').join('');
  const type=heart.type==='group'?(lang==='ja'?'ユニットスキル':lang==='en'?'UNIT SKILL':'유닛 스킬'):(lang==='ja'?'リンクスキル':lang==='en'?'LINK SKILL':'연계 스킬');
  const activated=lang==='ja'?'スキル発動':lang==='en'?'SKILL ACTIVATED':'스킬 발동';
  this.skillCutin.style.setProperty('--skill-accent',accent);
  this.skillCutin.dataset.heart=heart.id;
  this.skillCutin.classList.toggle('simple',this.save.effects==='lite');
  this.skillCutin.innerHTML=`
   <div class="skill-cutin-backdrop" aria-hidden="true"></div>
   <div class="skill-cutin-panel">
    <div class="skill-cutin-head"><span>${escapeHTML(activated)}</span><span>${escapeHTML(type)}</span></div>
    <div class="skill-cutin-body">
      <div class="skill-cutin-art"><img class="skill-cutin-lead" src="./Assets/characters/${encodeURIComponent(actor.id)}/front.png" alt="" draggable="false"/><div class="skill-cutin-team" aria-hidden="true">${teammates}</div></div>
      <div class="skill-cutin-dialogue"><span class="skill-cutin-speaker">${escapeHTML(actorName)}</span><p>${escapeHTML(words)}</p><strong>${escapeHTML(name)}</strong><span class="skill-cutin-stars" aria-hidden="true">${'★'.repeat(Math.max(1,Math.min(4,Math.round(strength.average))))}</span></div>
    </div>
    <div class="skill-cutin-progress" aria-hidden="true"></div>
   </div>`;
  this.skillCutin.classList.remove('visible','impact');
  // Restart entrance animation even when a new combination activates immediately.
  void this.skillCutin.offsetWidth;
  this.skillCutin.classList.add('visible');
  this.setStatus(`${this.t('heartActive')} / ${name}`);
 }
 onHeartFire({heart}){
  const name=heart.names[this.save.language];
  if(this.skillCutin?.dataset.heart===heart.id)this.skillCutin.classList.add('impact');
  this.setStatus(`${this.t('heartActive')} / ${name}`);
  const node=el('boardFloat');node.textContent=name;
  window.setTimeout(()=>{if(node.textContent===name)node.textContent='';},1000);
 }
 onHeartEnd(){
  this.clearHeartCutin();
 }
 clearHeartCutin(){
  if(!this.skillCutin)return;
  this.skillCutin.classList.remove('visible','impact');
  this.skillCutin.removeAttribute('data-heart');
 }

 update(force=false){
  const g=this.game;if(!g){el('headerMode').textContent='STANDBY';return;}
  el('headerMode').textContent=g.difficulty.toUpperCase();
  el('mapTitle').textContent=`${g.map.order} / ${g.map.names[this.save.language]}`;
  el('modeTitle').textContent=this.t(g.difficulty).toUpperCase();
  el('timerText').textContent=timeText(g.realTime);
  el('speedText').textContent=`${g.speed}×`;
  el('waveText').innerHTML=`${String(g.wave).padStart(2,'0')} <span class="tiny-fraction">/ ${g.isEndless?'∞':20}</span>`;
  el('enemyCount').innerHTML=`${g.enemies.length} <span class="tiny-fraction">/ ${g.capacity}</span>`;
  el('waveFill').style.width=`${Math.min(100,g.waveTime/30*100)}%`;
  const enemyPressure=g.enemies.length/g.capacity;
  el('enemyCount').closest('.enemy-count')?.classList.toggle('danger',enemyPressure>=.72);
  el('enemyCount').closest('.enemy-count')?.classList.toggle('critical',enemyPressure>=.9);
  el('waveText').classList.toggle('boss-wave',g.wave%5===0);
  el('crystalText').textContent=format(g.crystals);el('fragmentText').textContent=format(g.fragments);
  el('unitCount').textContent=String(g.units.length);el('unitCapacity').textContent=`/ ${g.map.available.length}`;el('maxStarCount').textContent=String(g.units.filter(u=>u.star===4).length);
  el('summonCost').textContent=String(g.cost);
  el('summonButton').disabled=g.crystals<g.cost||g.phase!=='playing';
  el('autoMergeButton').disabled=g.phase!=='playing'||!g.units.some(u=>u.star<4&&g.units.some(v=>u.uid!==v.uid&&v.id===u.id&&v.star===u.star));

  this.updateSelection(force);
  this.updateUpgrades(force);
 }
 updateSelection(force){
  const g=this.game,u=g?.selected;
  el('selectionEmpty').hidden=!!u;el('selectionContent').hidden=!u;el('selectionPanel').classList.toggle('has-selection',!!u);
  if(!u)return;
  const def=CHARACTER_BY_ID[u.id];
  const key=[u.uid,u.star,u.id,this.save.language].join('-');
  if(key!==this.lastHero||force){
   el('heroName').textContent=def.names[this.save.language];
   el('heroMeta').textContent=`${'★'.repeat(u.star)} · ${GROUPS.find(x=>x.id===def.group).short}`;
   let badge=el('heroSignature');
   if(!badge){
    badge=document.createElement('span');badge.id='heroSignature';badge.className='hero-signature';
    el('heroMeta').insertAdjacentElement('afterend',badge);
   }
   const sig=SIGNATURES[u.id];
   badge.textContent=sig?`${sig.names[this.save.language]} · ${sig.every}${this.save.language==='en'?' shots':this.save.language==='ja'?'回ごと':'회 공격마다'}`:'';
   badge.title=badge.textContent;
   const container=el('heroPortrait');container.innerHTML='';const canvas=document.createElement('canvas');this.renderer.drawPortrait(canvas,u);container.append(canvas);
   this.lastHero=key;
  }
  el('heroAttack').textContent=format(attackValue(u,g.upgrades));
  el('heroRange').textContent=attackRange(u).toFixed(1);
  el('heroDamage').textContent=format(g.damageByMember[u.id]||0);
  el('mergeButton').disabled=u.star===4||!g.units.some(v=>v.uid!==u.uid&&v.id===u.id&&v.star===u.star);
  el('moveButton').textContent=g.moveMode?this.t('cancel'):this.t('move');
 }
 updateUpgrades(force){
  const g=this.game;if(!g)return;
  const token=JSON.stringify([g.upgrades,Math.floor(g.fragments),this.save.language]);
  if(!force&&this.lastUpgrades===token)return;
  this.lastUpgrades=token;
  const total=Object.values(g.upgrades).reduce((a,b)=>a+b,0);el('upgradeStatus').textContent=`${total} / 24`;
  const parent=el('upgradeGrid');parent.innerHTML='';
  for(const d of UPGRADE_DATA){
   const level=g.upgrades[d.id],price=upgradeCost(d.id,level);
   const button=document.createElement('button');button.className='upgrade-card';button.disabled=price>g.fragments||g.phase!=='playing';
   const top=document.createElement('div');top.className='upgrade-card-top';
   const icon=document.createElement('span');icon.textContent=d.icon;
   const lv=document.createElement('small');lv.textContent=`Lv ${level}/${d.max}`;top.append(icon,lv);
   const name=document.createElement('strong');name.className='upgrade-card-name';name.textContent=this.t(d.id);
   const bottom=document.createElement('div');bottom.className='upgrade-card-footer';
   const pips=document.createElement('span');pips.className='level-pips';for(let i=0;i<d.max;i++){const p=document.createElement('i');if(i<level)p.className='filled';pips.append(p);}
   const cost=document.createElement('span');cost.className='upgrade-cost';if(level===d.max){cost.textContent=this.t('max');}else{cost.innerHTML=`${price}<img class="cost-piece" src="./Assets/currency/wish-piece.png" alt="" aria-hidden="true"/>`;cost.setAttribute('aria-label',`${price} ${this.t('fragments')}`);}
   bottom.append(pips,cost);button.append(top,name,bottom);
   button.addEventListener('click',()=>g.upgrade(d.id));parent.append(button);
  }
 }
 showResult(result){
  this.clearHeartCutin();
  el('resultTitle').textContent=result.status==='win'?this.t('win'):this.t('lose');
  el('resultTime').textContent=timeText(result.elapsed);
  el('resultSymbol').textContent=result.status==='win'?'✦':'×';
  const next=el('resultNext');next.disabled=result.status!=='win'||result.difficulty==='endless';
  const list=el('damageList');list.innerHTML='';
  const entries=Object.entries(result.damageByMember).sort((a,b)=>b[1]-a[1]);
  const max=entries[0]?.[1]||1;
  if(!entries.length){const empty=document.createElement('div');empty.className='empty-damage';empty.textContent=this.t('noDamage');list.append(empty);}
  for(const [i,[id,damage]] of entries.entries()){
   const def=CHARACTER_BY_ID[id];if(!def)continue;
   const row=document.createElement('div');row.className='damage-row';
   row.innerHTML=`<span class="damage-rank">${String(i+1).padStart(2,'0')}</span><span class="damage-name">${escapeHTML(def.names[this.save.language])}<small>${escapeHTML(GROUPS.find(g=>g.id===def.group)?.short||'')}</small></span><strong class="damage-number">${format(damage)}</strong><div class="damage-bar"><span style="width:${Math.max(1,damage/max*100)}%"></span></div>`;
   list.append(row);
  }
  el('toastStack').replaceChildren();el('boardFloat').textContent='';this.sound.beep(result.status==='win'?'win':'lose');this.showOverlay('resultOverlay');
 }
}
