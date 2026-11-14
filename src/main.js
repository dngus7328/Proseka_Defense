import {Renderer} from './core/Renderer.js?v=1.14.0';
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
// Game time uses a fixed simulation step. Drawing can be throttled without
// causing wave timing, enemy travel or 2x speed to run slower.
const SIM_STEP=1/60,MAX_SIM_STEPS=7;
let previous=performance.now(),simAccum=0,uiAccum=0,renderCredit=0;
let lastRender=0,averageDraw=0,averageRaf=16.7,renderLimit=60;
let renderedThisSecond=0,lastSampleTime=previous;
const showPerf=typeof location!=='undefined'&&new URLSearchParams(location.search).has('fps');
let fpsPanel=null;
if(showPerf){
 fpsPanel=document.createElement('output');
 fpsPanel.id='fpsDebug';
 fpsPanel.setAttribute('aria-label','실시간 화면 성능');
 fpsPanel.style.cssText='position:fixed;right:7px;top:65px;z-index:9999;pointer-events:none;background:#1b2b3ddd;color:#f7f7df;border:1px solid #a9c8bf;padding:5px 7px;font:700 11px monospace;border-radius:4px';
 fpsPanel.textContent='FPS --';document.body.append(fpsPanel);
}

function startGame(config){
 currentConfig={...config};
 game=new Game(config,{
   onChange:()=>{}, // UI is throttled in the rendering loop.
   onSelection:()=>ui.update(true),
   onToast:(key)=>ui.toast(key),
   onWave:({wave})=>{ui.status(`WAVE ${String(wave).padStart(2,'0')}`);},
   onBossWave:()=>{ui.toast('checkpoint');},
   onHeartSeen:id=>ui.onHeartSeen(id),
   onHeartStart:entry=>ui.onHeartStart(entry),
   onHeartFire:entry=>ui.onHeartFire(entry),
   onHeartEnd:entry=>ui.onHeartEnd(entry),
   onSummon:entry=>ui.onSummon(entry),
   onPromotion:entry=>ui.onPromotion(entry),
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
function exitGame(){game=null;ui.showTitle();}
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
 const rawDt=Math.max(0,(now-previous)/1000);
 previous=now;
 if(document.visibilityState==='hidden'){
  // Never spend CPU/GPU while the tab is hidden, and never fast-forward a
  // whole hidden interval after the user returns.
  simAccum=0;renderCredit=0;lastRender=0;requestAnimationFrame(frame);return;
 }
 const dt=Math.min(.16,rawDt);
 averageRaf=averageRaf*.965+Math.max(0,rawDt*1000)*.035;
 if(game){
  const active=game.phase==='playing'||game.phase==='ending';
  if(active){
   simAccum=Math.min(.14,simAccum+dt);
   let steps=0;
   while(simAccum>=SIM_STEP&&steps<MAX_SIM_STEPS){
    game.update(SIM_STEP);
    simAccum-=SIM_STEP;
    steps++;
   }
   if(steps===MAX_SIM_STEPS&&simAccum>=SIM_STEP){
    // A slow machine should recover rather than enter a permanent catch-up spiral.
    simAccum=0;
   }
  }else{
   simAccum=0;
  }
  // Keep the fast path at 60 FPS. Fall back to 45 or 30 only if the
  // browser reports sustained expensive painting or missed refreshes.
  const newLimit=averageRaf>27||averageDraw>17?30:
   averageRaf>20||averageDraw>11?45:60;
  renderLimit=newLimit;
  const idle=game.phase==='paused'||game.phase==='ended';
  // Token cadence yields ~45 actual draws/sec on a 60Hz monitor; simply
  // waiting 22ms between RAF callbacks would incorrectly drop to 30 FPS.
  renderCredit=Math.min(2,renderCredit+Math.min(.08,rawDt)*(idle?8:renderLimit));
  if(!lastRender||renderCredit>=1){
   renderCredit=Math.max(0,renderCredit-1);
   lastRender=now;
   const start=performance.now();
   renderer.draw(game);
   const paintMs=performance.now()-start;
   averageDraw=averageDraw?averageDraw*.93+paintMs*.07:paintMs;
   renderedThisSecond++;
  }
  uiAccum+=dt;
  if(uiAccum>=.2){ui.update();uiAccum%=.2;}
 }
 if(showPerf&&fpsPanel&&now-lastSampleTime>=1000){
  fpsPanel.textContent=`FPS ${renderedThisSecond} | Draw ${averageDraw.toFixed(1)}ms | Target ${renderLimit}`;
  lastSampleTime=now;renderedThisSecond=0;
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
