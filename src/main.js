import {Renderer} from './core/Renderer.js';
import {Game} from './core/Game.js';
import {loadSave,persistSave} from './core/Save.js';
import {SoundEngine} from './core/Audio.js';
import {Interface} from './ui/Interface.js';
import {DIFFICULTIES} from './data/enemies.js';

const save=loadSave();
const renderer=new Renderer(document.getElementById('gameCanvas'));
const sound=new SoundEngine();
const ui=new Interface(save,renderer,sound);
let game=null;
let currentConfig=null;
let previous=performance.now(),uiAccum=0;

function startGame(config){
 currentConfig={...config};
 game=new Game(config,{
   onChange:()=>{}, // UI is throttled in the rendering loop.
   onSelection:()=>ui.update(true),
   onToast:(key)=>ui.toast(key),
   onWave:({wave})=>{ui.status(`WAVE ${String(wave).padStart(2,'0')}`);},
   onBossWave:()=>{ui.toast('checkpoint');},
   onHeartSeen:id=>ui.onHeartSeen(id),
   onHeartFire:entry=>ui.onHeartFire(entry),
   onSound:type=>sound.beep(type),
   onEndStart:()=>{ui.status('FINISH');},
   onResult:result=>finishRun(result)
 });
 renderer.setMap(game.map);ui.setGame(game);
}
function finishRun(result){
 if(result.status==='win'&&!save.cleared.includes(result.difficulty))save.cleared.push(result.difficulty);
 if(result.difficulty==='extreme'&&result.status==='win'&&!save.cleared.includes('extreme'))save.cleared.push('extreme');
 const key=result.difficulty;
 if(!save.best[key]||result.wave>save.best[key].wave||(result.wave===save.best[key].wave&&result.elapsed<save.best[key].time))save.best[key]={wave:result.wave,time:result.elapsed};
 persistSave(save);ui.renderLobby();ui.showResult(result);
}
function exitGame(){game=null;ui.showLobby();}
function retry(){if(!currentConfig)return;startGame(currentConfig);}
function next(){
 if(!game||game.result?.status!=='win')return;
 if(game.difficulty==='extreme'){
   currentConfig={...currentConfig,difficulty:'endless'};
   game.continueEndless();ui.hideOverlays();ui.update(true);
   return;
 }
 const i=DIFFICULTIES.findIndex(d=>d.id===game.difficulty);if(i<0||i>=DIFFICULTIES.length-2)return;
 startGame({...currentConfig,difficulty:DIFFICULTIES[i+1].id});
}
ui.bindGameHandlers({onStart:startGame,onExit:exitGame,onRetry:retry,onNext:next});
ui.notice();
function frame(now){
 const dt=Math.min(.09,Math.max(0,(now-previous)/1000));previous=now;
 if(game){
  game.update(dt);renderer.draw(game);
  uiAccum+=dt;
  if(uiAccum>.17){ui.update();uiAccum=0;}
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
