import {bgmForMap} from '../data/musicTracks.js';

// The author supplies BGM separately (Suno exports). This module never
// synthesizes or automatically composes a backing soundtrack.
// Web Audio is used only for short special-attack and result sound effects.
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
  this.audio=null;
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
 updateVolume(){
  const fx=Math.max(0,Math.min(1,this.getVolume()));
  const music=Math.max(0,Math.min(1,this.getMusicVolume()));
  if(this.context&&this.fxBus)
   this.fxBus.gain.setTargetAtTime(fx*.57,this.context.currentTime,.05);
  if(this.audio)this.audio.volume=this.ducked?music*.20:music*.72;
 }
 start(mapId){
  if(this.mapId===mapId)return;
  this.stop();
  this.mapId=mapId;
  const src=bgmForMap(mapId);
  if(!src||typeof Audio==='undefined')return; // No BGM until Suno files are supplied.
  const audio=new Audio(src);
  audio.loop=true;
  audio.preload='auto';
  this.audio=audio;
  this.paused=false;
  this.updateVolume();
  audio.play().catch(()=>{}); // Browsers may require a tap before playback.
 }
 pause(value){
  const paused=!!value;
  if(this.paused===paused)return;
  this.paused=paused;
  if(!this.audio)return;
  if(paused)this.audio.pause();
  else this.audio.play().catch(()=>{});
 }
 stop(){
  if(this.duckTimer!==null){clearTimeout(this.duckTimer);this.duckTimer=null;}
  if(this.audio){
   this.audio.pause();
   this.audio.removeAttribute('src');
   this.audio.load();
   this.audio=null;
  }
  this.mapId=null;
  this.paused=false;
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
 heartAnticipation(style='star'){
  const ctx=this.setup();if(!ctx)return;
  const note=style==='slash'?57:style==='wave'?64:60;
  const at=ctx.currentTime+.01;
  for(let i=0;i<3;i++)this.tone(note+7*i,at+i*.13,.24,.14);
  this.duck(1.5);
 }
 heartCue(style='star'){
  const ctx=this.setup();if(!ctx)return;
  const presets={
   star:{notes:[72,79,84,88],kind:'piano',drum:'snare'},
   rain:{notes:[76,79,83,88,91],kind:'piano',drum:'hat'},
   slash:{notes:[60,67,72,79],kind:'pluck',drum:'kick'},
   burst:{notes:[72,76,79,84,88],kind:'piano',drum:'snare'},
   wave:{notes:[69,72,76,81],kind:'pad',drum:'hat'},
   orbit:{notes:[72,79,76,84,88,91],kind:'piano',drum:'snare'}
  };
  const cue=presets[style]||presets.star,t=ctx.currentTime+.015;
  cue.notes.forEach((note,i)=>this.tone(note,t+i*.088,cue.kind==='pad'?.68:.34,.28+(i===cue.notes.length-1?.12:0),cue.kind));
  this.beat(cue.drum,t+.20,.24);
  this.beat('kick',t+.39,.29);
  this.tone(cue.notes.at(-1)-12,t+.41,.72,.34,'pad');
  this.duck(1.25);
 }
 finish(won){
  const ctx=this.setup();if(!ctx)return;
  const t=ctx.currentTime+.02;
  const notes=won?[72,76,79,84,88]:[72,70,67,64];
  notes.forEach((n,i)=>this.tone(n,t+i*.15,.4,.27));
  if(won){this.beat('snare',t+.35,.18);this.tone(60,t+.52,.88,.23,'pad');}
 }
}