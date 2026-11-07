import {GROUPS,CHARACTER_BY_ID,attackValue,attackRange} from '../data/characters.js';
import {MAPS} from '../data/maps.js';
import {HEARTS} from '../data/hearts.js';
import {DIFFICULTIES,UPGRADE_DATA,upgradeCost} from '../data/enemies.js';
import {getText,LANGUAGES} from '../data/locales.js';
import {persistSave} from '../core/Save.js';
const el=(id)=>document.getElementById(id);
const format=(n)=>Math.round(n).toLocaleString();
const timeText=(sec)=>`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
const escapeHTML=(s)=>String(s).replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
export class Interface {
 constructor(save,renderer,sound){
  this.save=save;this.renderer=renderer;this.sound=sound;this.game=null;
  this.config={difficulty:'normal',mapId:'roof',focus:'leo'};
  this.overlayOrigin='lobby';this.settingsOrigin='lobby';this.lastUpgrades='';this.lastHero='';
  this.handlers={};this.renderLanguages();this.registerActions();this.sound.setVolume(save.volume/100);
 }
 t(key){return getText(this.save.language,key);}
 bindGameHandlers(handlers){this.handlers=handlers;}
 setGame(game){this.game=game;this.lastUpgrades='';this.lastHero='';this.hideOverlays();this.update(true);this.setStatus('READY');}
 status(text){el('statusLine').textContent=text;}
 setStatus(text){this.status(text);}
 notice(){this.showOverlay('noticeOverlay');}
 hideOverlays(){for(const o of document.querySelectorAll('.overlay'))o.classList.remove('visible');}
 showOverlay(id){this.hideOverlays();el(id)?.classList.add('visible');}
 overlayVisible(id){return !!el(id)?.classList.contains('visible');}
 renderLanguages(){
  document.documentElement.lang=this.save.language;
  for(const e of document.querySelectorAll('[data-i18n]'))e.textContent=this.t(e.dataset.i18n);
  for(const e of document.querySelectorAll('[data-lang]'))e.classList.toggle('active',e.dataset.lang===this.save.language);
  el('languageSelect').value=this.save.language;
  el('volumeRange').value=this.save.volume;
  el('effectsSelect').value=this.save.effects;
  el('touchToggle').checked=this.save.touch;
  this.renderLobby();this.renderHearts();this.update(true);
 }
 setLanguage(lang){if(!LANGUAGES.includes(lang))return;this.save.language=lang;persistSave(this.save);this.renderLanguages();}
 registerActions(){
  const click=(id,fn)=>el(id).addEventListener('click',fn);
  click('acceptNotice',()=>{this.sound.beep('select');this.showLobby();});
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>this.setLanguage(b.dataset.lang)));
  click('startButton',()=>this.handlers.onStart?.({...this.config}));
  click('openSettings',()=>this.openSettings());click('lobbySettings',()=>this.openSettings());click('pauseSettings',()=>this.openSettings());
  click('openCollection',()=>this.openHearts());click('heartButton',()=>this.openHearts());
  click('pauseButton',()=>this.togglePause());click('resumeButton',()=>this.resume());
  click('quitButton',()=>this.handlers.onExit?.());
  click('speedButton',()=>{if(this.game?.phase==='playing'){this.game.speed=this.game.speed===1?2:1;this.sound.beep('select');this.update(true);}});
  click('summonButton',()=>this.game?.summon());
  click('autoMergeButton',()=>this.game?.autoMerge());
  click('moveButton',()=>{this.game?.moveSelected();if(this.game)this.setStatus(this.game.moveMode?this.t('moveHint'):'READY');});
  click('mergeButton',()=>this.game?.mergeSelected());click('clearSelection',()=>this.game?.selection(null));
  click('resultExit',()=>this.handlers.onExit?.());click('resultRetry',()=>this.handlers.onRetry?.());click('resultNext',()=>this.handlers.onNext?.());
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>this.closeOverlay(button.dataset.close)));
  el('languageSelect').addEventListener('change',e=>this.setLanguage(e.target.value));
  el('volumeRange').addEventListener('input',e=>{this.save.volume=Number(e.target.value);this.sound.setVolume(this.save.volume/100);persistSave(this.save);});
  el('effectsSelect').addEventListener('change',e=>{this.save.effects=e.target.value;persistSave(this.save);});
  el('touchToggle').addEventListener('change',e=>{this.save.touch=e.target.checked;persistSave(this.save);});
  el('gameCanvas').addEventListener('pointerdown',e=>{
    if(!this.game||this.game.phase!=='playing')return;
    const p=this.renderer.mapClick(e);this.game.clickTile(p.x,p.y);
    if(this.save.touch&&p.x>=0&&p.y>=0&&p.x<this.game.map.w&&p.y<this.game.map.h)this.game.addEffect('ring',p.x,p.y,{radius:.45,color:'#e4f8ec',life:.2});
    this.update(true);
  });
  document.addEventListener('keydown',e=>{
   if(e.key==='Escape'){
    if(this.overlayVisible('noticeOverlay'))return;
    if(this.overlayVisible('settingsOverlay'))this.closeOverlay('settingsOverlay');
    else if(this.overlayVisible('heartsOverlay'))this.closeOverlay('heartsOverlay');
    else this.togglePause();
   }
   if(e.code==='Space'&&this.game?.phase==='playing'&&!this.isModalOpen()){e.preventDefault();this.game.speed=this.game.speed===1?2:1;this.update(true);}
  });
 }
 isModalOpen(){return [...document.querySelectorAll('.overlay')].some(e=>e.classList.contains('visible'));}
 showLobby(){this.game=null;this.config.difficulty='normal';this.renderLobby();this.showOverlay('lobbyOverlay');}
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
  const maps=el('mapChoices');maps.innerHTML='';MAPS.forEach(map=>{
   const button=document.createElement('button');button.className=`map-choice${this.config.mapId===map.id?' active':''}`;
   const canvas=document.createElement('canvas');canvas.className='map-thumb';
   const name=document.createElement('strong');name.textContent=`${map.order} · ${map.names[this.save.language]}`;
   button.append(canvas,name);this.renderer.drawThumbnail(canvas,map);
   button.addEventListener('click',()=>{this.config.mapId=map.id;this.renderLobby();});maps.append(button);
  });
  const groups=el('focusChoices');groups.innerHTML='';GROUPS.forEach(group=>{
   const button=document.createElement('button');button.className=`focus-chip${this.config.focus===group.id?' active':''}`;
   const mark=document.createElement('span');mark.style.background=group.color;
   const name=document.createElement('strong');name.textContent=group.short;button.append(mark,name);
   button.addEventListener('click',()=>{this.config.focus=group.id;this.renderLobby();});groups.append(button);
  });
 }
 openSettings(){
  if(this.overlayVisible('settingsOverlay'))return;
  this.settingsOrigin=this.overlayVisible('pauseOverlay')?'pause':this.game?.phase==='playing'?'playing':'lobby';
  if(this.game?.phase==='playing')this.game.togglePause();
  this.showOverlay('settingsOverlay');
 }
 openHearts(){
  this.overlayOrigin=this.overlayVisible('pauseOverlay')?'pause':this.game?.phase==='playing'?'playing':'lobby';
  if(this.game?.phase==='playing')this.game.togglePause();
  this.renderHearts();this.showOverlay('heartsOverlay');
 }
 closeOverlay(id){
  if(id==='settingsOverlay'){
   if(this.settingsOrigin==='playing'&&this.game?.phase==='paused')this.game.togglePause();
   if(this.settingsOrigin==='pause'){this.showOverlay('pauseOverlay');return;}
   if(this.settingsOrigin==='lobby'){this.showOverlay('lobbyOverlay');return;}
  }else if(id==='heartsOverlay'){
   if(this.overlayOrigin==='playing'&&this.game?.phase==='paused')this.game.togglePause();
   if(this.overlayOrigin==='pause'){this.showOverlay('pauseOverlay');return;}
   if(this.overlayOrigin==='lobby'){this.showOverlay('lobbyOverlay');return;}
  }
  this.hideOverlays();
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
 onHeartSeen(id){
  if(this.save.discovered.includes(id))return;
  this.save.discovered.push(id);persistSave(this.save);this.renderHearts();
  this.toast(this.t('discovered'),true);
 }
 onHeartFire({heart}){
  const name=heart.names[this.save.language];this.setStatus(`${this.t('heartActive')} / ${name}`);
  const node=el('boardFloat');node.textContent=name;
  window.setTimeout(()=>{if(node.textContent===name)node.textContent='';},1500);
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
  el('goldText').textContent=format(g.gold);el('powerText').textContent=format(g.power);
  el('summonCost').textContent=String(g.cost);
  el('summonButton').disabled=g.gold<g.cost||g.phase!=='playing';
  el('autoMergeButton').disabled=g.phase!=='playing'||!g.units.some(u=>u.star<4&&g.units.some(v=>u.uid!==v.uid&&v.id===u.id&&v.star===u.star));
  el('focusHint').textContent=GROUPS.find(gr=>gr.id===g.focus)?.names[this.save.language]||'—';
  this.updateSelection(force);
  this.updateUpgrades(force);
 }
 updateSelection(force){
  const g=this.game,u=g?.selected;
  el('selectionEmpty').hidden=!!u;el('selectionContent').hidden=!u;
  if(!u)return;
  const def=CHARACTER_BY_ID[u.id];
  const key=[u.uid,u.star,u.id,this.save.language].join('-');
  if(key!==this.lastHero||force){
   el('heroName').textContent=def.names[this.save.language];
   el('heroMeta').textContent=`${'★'.repeat(u.star)} · ${GROUPS.find(x=>x.id===def.group).short}`;
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
  const token=JSON.stringify([g.upgrades,Math.floor(g.gold),this.save.language]);
  if(!force&&this.lastUpgrades===token)return;
  this.lastUpgrades=token;
  const total=Object.values(g.upgrades).reduce((a,b)=>a+b,0);el('upgradeStatus').textContent=`${total} / 24`;
  const parent=el('upgradeGrid');parent.innerHTML='';
  for(const d of UPGRADE_DATA){
   const level=g.upgrades[d.id],price=upgradeCost(d.id,level);
   const button=document.createElement('button');button.className='upgrade-card';button.disabled=price>g.gold||g.phase!=='playing';
   const top=document.createElement('div');top.className='upgrade-card-top';
   const icon=document.createElement('span');icon.textContent=d.icon;
   const lv=document.createElement('small');lv.textContent=`Lv ${level}/${d.max}`;top.append(icon,lv);
   const name=document.createElement('strong');name.className='upgrade-card-name';name.textContent=this.t(d.id);
   const bottom=document.createElement('div');bottom.className='upgrade-card-footer';
   const pips=document.createElement('span');pips.className='level-pips';for(let i=0;i<d.max;i++){const p=document.createElement('i');if(i<level)p.className='filled';pips.append(p);}
   const cost=document.createElement('span');cost.className='upgrade-cost';cost.textContent=level===d.max?this.t('max'):`${price} ◆`;
   bottom.append(pips,cost);button.append(top,name,bottom);
   button.addEventListener('click',()=>g.upgrade(d.id));parent.append(button);
  }
 }
 showResult(result){
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
