import {bgmForScene} from '../data/musicTracks.js';

// The author supplies all eight BGM masters; no backing music is synthesized.
// Circular-crossfaded assets use native HTMLAudio looping and a quick
// volume crossfade when switching menu, SEKAI, and boss scenes.
const midi=n=>440*2**((n-69)/12);
function envelope(g,time,power,attack,hold,release){
 g.gain.setValueAtTime(.00001,time);
 g.gain.linearRampToValueAtTime(Math.max(.0001,power),time+attack);
 g.gain.setValueAtTime(Math.max(.0001,power),time+attack+hold);
 g.gain.exponentialRampToValueAtTime(.00001,time+attack+hold+release);
}
export class MusicDirector {
 constructor(getContext,getEffectVolume,getMusicVolume=()=>.5){
  this.getContext=getContext;
  this.getVolume=getEffectVolume;
  this.getMusicVolume=getMusicVolume;
  this.mapId=null;
  this.baseScene=null;
  this.currentScene=null;
  this.bossActive=false;
  this.audio=null;
  this.players=new Map();
  this.fadeFrame=null;
  this.fxBus=null;
  this.context=null;
  this.noise=null;
  this.duckTimer=null;
  this.ducked=false;
  this.paused=false;
 }
 setup(){
  const ctx=this.getContext();if(!ctx)return null;
  if(this.context!==ctx){
   this.context=ctx;
   const compressor=ctx.createDynamicsCompressor();
   compressor.threshold.value=-16;
   compressor.ratio.value=2.4;
   this.fxBus=ctx.createGain();
   this.fxBus.connect(compressor);
   compressor.connect(ctx.destination);
   this.noise=null;
  }
  this.updateVolume();
  return ctx;
 }
 musicGain(){
  const v=Math.max(0,Math.min(1,this.getMusicVolume()));
  return v*(this.ducked?.20:.72);
 }
 updateVolume(){
  const fx=Math.max(0,Math.min(1,this.getVolume()));
  if(this.context&&this.fxBus)
   this.fxBus.gain.setTargetAtTime(fx*.57,this.context.currentTime,.05);
  const level=this.musicGain();
  if(this.audio)this.audio.volume=level;
 }
 makePlayer(key){
  const files=bgmForScene(key);
  if(!files||typeof Audio==='undefined')return null;
  const available=typeof document!=='undefined'?
   document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis"'):'';
  const audio=new Audio();
  audio.loop=true;
  audio.preload='auto';
  audio.playsInline=true;
  audio.dataset.track=key;
  const primary=available?files.ogg:files.mp3;
  audio.src=primary;
  // Use MP3 if the device advertises Vorbis but fails to load it.
  let fallbackUsed=!available;
  audio.addEventListener('error',()=>{
   if(!fallbackUsed){
    fallbackUsed=true;
    audio.src=files.mp3;
    if(!this.paused&&this.audio===audio)audio.play().catch(()=>{});
   }else{
    this.players.delete(key);
    if(this.audio===audio)this.audio=null;
   }
  });
  this.players.set(key,audio);
  return audio;
 }
 activate(key){
  if(this.currentScene===key){
   this.retryPlayback();
   return;
  }
  if(this.fadeFrame!==null&&typeof cancelAnimationFrame==='function'){
   cancelAnimationFrame(this.fadeFrame);
   this.fadeFrame=null;
  }
  const previous=this.audio;
  this.currentScene=key;
  const next=this.players.get(key)||this.makePlayer(key);
  this.audio=next;
  if(!next){
   if(previous)previous.pause();
   return;
  }
  next.volume=0;
  if(!this.paused)next.play().catch(()=>{});
  if(previous===next){this.updateVolume();return;}
  // Smooth transitions on stage entry, boss spawn, and return to normal wave.
  // Inactive loops remain paused at their original position, not restarted.
  const start=typeof performance!=='undefined'?performance.now():0;
  const from=previous?.volume||0;
  const step=(now)=>{
   if(this.paused)return;
   const t=Math.min(1,Math.max(0,(now-start)/360));
   const eased=t*t*(3-2*t);
   const target=this.musicGain();
   if(next)this.audio===next&&(next.volume=target*eased);
   if(previous)previous.volume=from*(1-eased);
   if(t<1&&typeof requestAnimationFrame==='function')this.fadeFrame=requestAnimationFrame(step);
   else{
    this.fadeFrame=null;
    if(previous){previous.pause();previous.volume=0;}
    if(next&&this.audio===next)next.volume=target;
   }
  };
  if(typeof requestAnimationFrame==='function')this.fadeFrame=requestAnimationFrame(step);
  else{
   if(previous)previous.pause();
   this.updateVolume();
  }
 }
 // Title/mission setup use the submitted title and general menu tracks.
 playScene(scene){
  this.mapId=null;
  this.baseScene=scene==='title'?'title':'lobby';
  this.bossActive=false;
  this.activate(this.baseScene);
 }
 start(mapId){
  this.mapId=mapId;
  this.baseScene=mapId;
  this.bossActive=false;
  this.activate(mapId);
 }
 setBossActive(active){
  if(!this.mapId)return;
  const value=!!active;
  if(this.bossActive===value)return;
  this.bossActive=value;
  this.activate(value?'boss':this.mapId);
 }
 retryPlayback(){
  if(this.audio&&!this.paused&&this.audio.paused)this.audio.play().catch(()=>{});
 }
 pause(value){
  const paused=!!value;
  if(this.paused===paused)return;
  this.paused=paused;
  if(paused){
   if(this.fadeFrame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(this.fadeFrame);
   this.fadeFrame=null;
   for(const audio of this.players.values())audio.pause();
  }else{
   this.updateVolume();
   this.retryPlayback();
  }
 }
 stop(){
  if(this.duckTimer!==null){clearTimeout(this.duckTimer);this.duckTimer=null;}
  if(this.fadeFrame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(this.fadeFrame);
  this.fadeFrame=null;
  for(const audio of this.players.values()){
   audio.pause();
   audio.removeAttribute('src');
   audio.load();
  }
  this.players.clear();
  this.audio=null;
  this.mapId=null;
  this.baseScene=null;
  this.currentScene=null;
  this.paused=false;
  this.bossActive=false;
  this.ducked=false;
 }
 tone(note,time,length,power=.22,type='piano'){
  const ctx=this.context;if(!ctx||!this.fxBus)return;
  const gain=ctx.createGain();
  gain.connect(this.fxBus);
  const pad=type==='pad';
  envelope(gain,time,power*(pad?.22:.42),pad?.13:.006,pad?Math.max(.05,length-.35):.018,pad?.43:Math.max(.09,length));
  const ratios=pad?[1,2]:type==='pluck'?[1,2,3,5]:[1,2,3,4];
  ratios.forEach((r,i)=>{
   const osc=ctx.createOscillator(),amp=ctx.createGain();
   osc.type=pad?(i?'sine':'triangle'):'sine';
   osc.frequency.setValueAtTime(midi(note)*r,time);
   amp.gain.value=[1,.38,.15,.065][i]||.05;
   osc.connect(amp);amp.connect(gain);
   osc.start(time);osc.stop(time+length+.47);
  });
 }
 noiseBuffer(){
  if(this.noise)return this.noise;
  const ctx=this.context,n=Math.round(ctx.sampleRate*.22);
  const buffer=ctx.createBuffer(1,n,ctx.sampleRate),data=buffer.getChannelData(0);
  let seed=112233;
  for(let i=0;i<n;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=seed/2147483648-1;}
  this.noise=buffer;
  return buffer;
 }
 beat(kind,time,power=.20){
  const ctx=this.context;if(!ctx||!this.fxBus)return;
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  source.buffer=this.noiseBuffer();
  filter.type=kind==='kick'?'lowpass':kind==='snare'?'bandpass':'highpass';
  filter.frequency.value=kind==='kick'?190:kind==='snare'?1300:4100;
  filter.Q.value=.7;
  envelope(gain,time,power,.004,.008,kind==='snare'?.13:.09);
  source.connect(filter);filter.connect(gain);gain.connect(this.fxBus);
  source.start(time);source.stop(time+.19);
  if(kind==='kick'){
   const osc=ctx.createOscillator(),bass=ctx.createGain();
   osc.type='sine';osc.frequency.setValueAtTime(116,time);
   osc.frequency.exponentialRampToValueAtTime(47,time+.16);
   envelope(bass,time,power*.85,.003,.008,.14);
   osc.connect(bass);bass.connect(this.fxBus);
   osc.start(time);osc.stop(time+.17);
  }
 }
 duck(seconds=1.25){
  if(!this.audio)return;
  this.ducked=true;this.updateVolume();
  if(this.duckTimer!==null)clearTimeout(this.duckTimer);
  this.duckTimer=setTimeout(()=>{this.duckTimer=null;this.ducked=false;this.updateVolume();},seconds*1000);
 }
 // Broadband noise + low percussion: intentionally no ascending
 // electronic melody or fake instrumental music during special attacks.
 whoosh(time,power=.10,rising=true){
  const ctx=this.context;if(!ctx||!this.fxBus)return;
  const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  src.buffer=this.noiseBuffer();
  filter.type='bandpass';filter.Q.value=.46;
  filter.frequency.setValueAtTime(rising?360:2400,time);
  filter.frequency.exponentialRampToValueAtTime(rising?2600:320,time+.18);
  envelope(gain,time,power,.012,.02,.15);
  src.connect(filter);filter.connect(gain);gain.connect(this.fxBus);
  src.start(time);src.stop(time+.20);
 }
 heartAnticipation(style='star'){
  const ctx=this.setup();if(!ctx)return;
  const t=ctx.currentTime+.01;
  this.whoosh(t,.075,style!=='wave');
  this.duck(1.5);
 }
 heartCue(style='star'){
  const ctx=this.setup();if(!ctx)return;
  const t=ctx.currentTime+.01;
  const signatures={
   star:[['snare',.05,.16],['kick',.17,.19]],
   rain:[['hat',.01,.08],['hat',.11,.07],['snare',.21,.13]],
   slash:[['kick',.03,.27],['snare',.16,.18]],
   burst:[['kick',.04,.30],['snare',.13,.21],['kick',.27,.14]],
   wave:[['hat',.06,.08],['kick',.25,.18]],
   orbit:[['snare',.04,.12],['kick',.13,.22],['hat',.26,.08]]
  };
  this.whoosh(t,style==='burst'?.16:.11,style==='rain'||style==='wave');
  for(const [type,delay,power] of signatures[style]||signatures.star)
   this.beat(type,t+delay,power);
  this.duck(1.25);
 }
 finish(won){
  const ctx=this.setup();if(!ctx)return;
  const t=ctx.currentTime+.02;
  this.whoosh(t,.07,won);
  this.beat('kick',t+.14,won?.17:.10);
  if(won)this.beat('snare',t+.3,.14);
 }

}