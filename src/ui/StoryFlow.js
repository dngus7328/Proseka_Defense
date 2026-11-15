import {CHARACTER_BY_ID} from '../data/characters.js';
import {MAP_BY_ID} from '../data/maps.js';
import {getOpening,getMissionStory,getMissionObjective,getEndStory} from '../data/storyScenes.js';
import {persistSave} from '../core/Save.js';

const el=id=>document.getElementById(id);
const text=(obj,lang)=>obj?.[lang]||obj?.ko||'';
const LANG={
 ko:{narrative:'이야기',next:'계속',skip:'이야기 건너뛰기',
  dispatch:'출격하기',back:'다시 선택',mission:'출격 준비',object:'이번 전투',
  goal:'적의 순환 경로를 방어하며 마지막 웨이브까지 버텨야 합니다.',
  hint:'같은 멤버 두 명을 합성할 수 있습니다. 세카이의 마음은 조건을 충족하면 자동으로 발동합니다.',
  roster:'활동 멤버',resultWin:'세카이를 지켜냈습니다.',resultLose:'방어에 실패했습니다. 다시 도전할 수 있습니다.',
  first:'첫 클리어 · 이야기 기록',repeat:'방어 기록',unsaved:'임무 기록',
  missionIndex:'미션'},
 ja:{narrative:'ストーリー',next:'次へ',skip:'会話をスキップ',
  dispatch:'出撃',back:'選び直す',mission:'出撃準備',object:'今回の任務',
  goal:'敵の巡回ルートを防衛し、最終ウェーブまで耐えてください。',
  hint:'同じメンバー2人を合成できます。セカイの想いは条件達成時に自動発動します。',
  roster:'活動メンバー',resultWin:'セカイを守り抜いた',resultLose:'もう一度挑戦できる',
  first:'初クリア · ストーリー記録',repeat:'防衛記録',unsaved:'任務記録',
  missionIndex:'ミッション'},
 en:{narrative:'STORY',next:'Continue',skip:'Skip dialogue',
  dispatch:'Deploy',back:'Change selection',mission:'Deployment',object:'Mission objective',
  goal:'Defend the enemy loop and hold through the final wave.',
  hint:'Merge matching members to grow stronger. SEKAI Hearts can turn the tide.',
  roster:'SEKAI members',resultWin:'SEKAI protected',resultLose:'You can try again',
  first:'FIRST CLEAR · STORY RECORD',repeat:'DEFENSE RECORD',unsaved:'MISSION RECORD',
  missionIndex:'MISSION'}
};
const getL=lang=>LANG[lang]||LANG.ko;
export class StoryFlow {
 constructor(ui){
  this.ui=ui;this.save=ui.save;
  if(!this.save.story)this.save.story={introSeen:false,visitedSekai:[],visitedMission:[],firstClear:[]};
  this.mode='';this.queue=[];this.cursor=0;this.currentMission=null;this.started=false;
  el('storyContinue')?.addEventListener('click',()=>this.next());
  el('storySkip')?.addEventListener('click',()=>this.complete());
  el('missionDeploy')?.addEventListener('click',()=>this.deploy());
  el('missionBack')?.addEventListener('click',()=>this.cancel());
 }
 reset(){
  this.mode='';this.queue=[];this.cursor=0;this.currentMission=null;this.started=false;
 }
 beginPrologue(){
  if(this.save.story.introSeen){this.ui.showLobby();return;}
  this.ui.titleIntro?.skip();
  this.mode='intro';this.queue=getOpening(this.save.language);this.cursor=0;
  this.currentMission=null;this.renderDialogue();
 }
 startMission(config,onDeploy=null){
  const map=MAP_BY_ID[config?.mapId];if(!map)return;
  const copy={...config};
  const key=map.id+':'+copy.difficulty;
  const firstWorld=!this.save.story.visitedSekai.includes(map.id);
  const firstDifficulty=!this.save.story.visitedMission.includes(key);
  this.mode='mission';this.currentMission={config:copy,map,key,firstWorld,firstDifficulty,onDeploy};
  this.queue=getMissionStory(map.id,copy.difficulty,firstWorld,firstDifficulty,this.save.language);
  this.cursor=0;this.started=false;
  if(this.queue.length)this.renderDialogue();else this.showBrief();
 }
 renderDialogue(){
  const item=this.queue[this.cursor];
  if(!item){this.complete();return;}
  const l=getL(this.save.language),who=CHARACTER_BY_ID[item.speaker];
  el('storyKicker').textContent=item.tag==='PROLOGUE'?l.narrative:item.tag;
  el('storySpeaker').textContent=who?.names[this.save.language]||who?.names.ko||'';
  el('storyPortrait').src='./Assets/characters/'+encodeURIComponent(item.speaker)+'/front.png';
  el('storyPortrait').alt=el('storySpeaker').textContent;
  el('storyLine').textContent=item.text;
  // Keep the opening in one consistent neutral scene. A selected mission uses
  // its own exact world; changing backdrops every prologue line felt arbitrary.
  const sceneMap=this.currentMission?.map||MAP_BY_ID.night;
  const sceneCanvas=el('storyWorldBackdrop');
  if(sceneCanvas&&sceneMap)this.ui.renderer.drawThumbnail(sceneCanvas,sceneMap);
  el('storyOverlay').dataset.sekai=sceneMap?.id||'night';
  el('storyIndex').textContent=String(this.cursor+1).padStart(2,'0')+' / '+String(this.queue.length).padStart(2,'0');
  el('storyProgress').style.width=(100*(this.cursor+1)/this.queue.length).toFixed(2)+'%';
  el('storyContinue').textContent=this.cursor===this.queue.length-1?l.next:l.next;
  el('storySkip').textContent=l.skip;
  el('storyOverlay').dataset.chapter=this.mode;
  this.ui.showOverlay('storyOverlay');
 }
 next(){
  if(this.mode!=='intro'&&this.mode!=='mission')return;
  this.ui.sound.beep('select');
  this.cursor++;
  if(this.cursor>=this.queue.length)this.complete();
  else this.renderDialogue();
 }
 complete(){
  if(this.mode==='intro'){
   this.save.story.introSeen=true;persistSave(this.save);
   this.reset();this.ui.showLobby();return;
  }
  if(this.mode==='mission'){this.showBrief();return;}
 }
 showBrief(){
  if(!this.currentMission)return;
  const {map,config}=this.currentMission,lang=this.save.language,l=getL(lang);
  el('missionKicker').textContent=l.mission+' · '+map.order+' / 07';
  el('missionWorldName').textContent=text(map.names,lang);
  el('missionDifficulty').textContent=this.ui.t(config.difficulty);
  el('missionObjectiveLabel').textContent=l.object;
  el('missionObjective').textContent=getMissionObjective(map.id,lang);
  el('missionGoal').textContent=l.goal;
  el('missionHint').textContent=l.hint;
  el('missionRosterLabel').textContent=l.roster;
  el('missionDeploy').textContent=l.dispatch;
  el('missionBack').textContent=l.back;
  const crest=el('missionWorldCrest');
  crest.src='./Assets/ui/'+map.id+'.png';
  // Game uses names different from filenames for roof/city/night, but the
  // icon file names match the map IDs (roof, city, night etc).
  crest.alt='';
  const roster=el('missionRoster');roster.replaceChildren();
  for(const id of map.sekaiMembers){
   const who=CHARACTER_BY_ID[id];if(!who)continue;
   const box=document.createElement('div');box.className='mission-member';
   const img=document.createElement('img');img.src='./Assets/characters/'+id+'/front.png';
   img.alt=who.names[lang]||who.names.ko;img.loading='lazy';
   const label=document.createElement('span');label.textContent=img.alt;
   box.append(img,label);roster.append(box);
  }
  this.ui.renderer.drawThumbnail(el('missionMap'),map);
  this.mode='brief';this.ui.showOverlay('missionOverlay');
 }
 deploy(){
  if(!this.currentMission||this.started)return;
  this.started=true;
  const {map,key,config,onDeploy}=this.currentMission;
  if(!this.save.story.visitedSekai.includes(map.id))this.save.story.visitedSekai.push(map.id);
  if(!this.save.story.visitedMission.includes(key))this.save.story.visitedMission.push(key);
  persistSave(this.save);
  this.reset();
  if(onDeploy)onDeploy();else this.ui.handlers.onStart?.(config);
 }
 cancel(){
  if(this.mode==='intro'){this.reset();this.ui.showTitle();return;}
  this.reset();
  this.ui.showLobby();
 }
 renderResult(result){
  const map=MAP_BY_ID[this.ui.game?.map.id]||MAP_BY_ID.roof;
  const lang=this.save.language,l=getL(lang);
  const key=map.id+':'+result.difficulty;
  const won=result.status==='win';
  const firstClear=won&&!this.save.story.firstClear.includes(key);
  const ending=getEndStory(map.id,won,firstClear,lang);
  const speaker=CHARACTER_BY_ID[ending.speaker];
  el('resultChapter').textContent=map.order+' / 07  ·  '+l.missionIndex+' '+this.ui.t(result.difficulty);
  el('resultWorldTitle').textContent=text(map.names,lang);
  el('resultStatusText').textContent=won?l.resultWin:l.resultLose;
  el('resultStoryLabel').textContent=won?(firstClear?l.first:l.repeat):l.unsaved;
  el('resultStorySpeaker').textContent=speaker?.names[lang]||speaker?.names.ko||'';
  el('resultStoryLine').textContent=ending.text;
  const backdrop=el('resultWorldBackdrop');
  if(backdrop)this.ui.renderer.drawThumbnail(backdrop,map);
  const portrait=el('resultStoryPortrait');
  portrait.src='./Assets/characters/'+encodeURIComponent(ending.speaker)+'/front.png';
  portrait.alt=el('resultStorySpeaker').textContent;
  if(firstClear){this.save.story.firstClear.push(key);persistSave(this.save);}
 }
}
