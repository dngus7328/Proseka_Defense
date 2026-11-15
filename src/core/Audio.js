import {MusicDirector} from './MusicDirector.js?v=1.29.0';

// No music is synthesized here. All SFX are short, unpitched physical-style
// noises: soft taps, brushes, hits and low impact thumps, not ascending bleeps.
export class SoundEngine {
 constructor(){
  this.context=null;this.volume=.35;this.musicVolume=.55;
  this.lastImpact=-Infinity;this.lastSpecial=-Infinity;this.noise=null;
  this.music=new MusicDirector(()=>this.getContext(),()=>this.volume,()=>this.musicVolume);
 }
 setMusicVolume(value){
  this.musicVolume=Math.max(0,Math.min(1,value));
  this.music.updateVolume();
 }
 playScene(scene){this.music.playScene(scene);}
 setBossActive(value){this.music.setBossActive(value);}
 retryMusic(){this.music.retryPlayback();}
 setVolume(value){
  this.volume=Math.max(0,Math.min(1,value));
  this.music.updateVolume();
 }
 getContext(){
  try{
   const C=window.AudioContext||window.webkitAudioContext;
   if(!C)return null;
   if(!this.context)this.context=new C();
   if(this.context.state==='suspended')this.context.resume().catch(()=>{});
   return this.context;
  }catch{return null;}
 }
 startMusic(mapId){this.music.start(mapId);}
 pauseMusic(value){this.music.pause(value);}
 stopMusic(){this.music.stop();}
 heartAnticipation(style){if(this.volume>0)this.music.heartAnticipation(style);}
 endMusic(won){this.music.stop();if(this.volume>0)this.music.finish(won);}
 noiseBuffer(ctx){
  if(this.noise)return this.noise;
  const length=Math.round(ctx.sampleRate*.31);
  const b=ctx.createBuffer(1,length,ctx.sampleRate),a=b.getChannelData(0);
  let seed=618219;
  for(let i=0;i<length;i++){
   seed=(1664525*seed+1013904223)>>>0;
   a[i]=seed/2147483648-1;
  }
  this.noise=b;return b;
 }
 brush(ctx,when,frequency=1250,power=.16,duration=.08,type='bandpass'){
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter();
  const gain=ctx.createGain();
  source.buffer=this.noiseBuffer(ctx);
  filter.type=type;filter.Q.value=.53;
  filter.frequency.setValueAtTime(Math.max(120,frequency),when);
  if(duration>.05)filter.frequency.exponentialRampToValueAtTime(Math.max(140,frequency*.66),when+duration);
  const amplitude=Math.max(.0001,Math.min(.12,this.volume*.06*power));
  gain.gain.setValueAtTime(.00001,when);
  gain.gain.linearRampToValueAtTime(amplitude,when+.003);
  gain.gain.exponentialRampToValueAtTime(.00001,when+duration);
  source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
  source.start(when);source.stop(when+Math.min(.3,duration)+.015);
 }
 thump(ctx,when,power=.20){
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  const amp=Math.min(.055,this.volume*.065*power);
  osc.type='sine';osc.frequency.setValueAtTime(130,when);
  osc.frequency.exponentialRampToValueAtTime(52,when+.145);
  gain.gain.setValueAtTime(.00001,when);
  gain.gain.linearRampToValueAtTime(Math.max(.0001,amp),when+.005);
  gain.gain.exponentialRampToValueAtTime(.00001,when+.17);
  osc.connect(gain);gain.connect(ctx.destination);
  osc.start(when);osc.stop(when+.18);
 }
 beep(kind='select'){
  if(this.volume<=0)return;
  if(kind.startsWith('heart-')){
   // One clear percussive strike per activation. No melody or ringing arpeggio.
   this.music.heartCue(kind.slice(6));return;
  }
  const ctx=this.getContext();if(!ctx)return;
  const t=ctx.currentTime;
  if(kind==='hit'||kind==='heavy'){
   if(t-this.lastImpact<(kind==='heavy'?.12:.095))return;
   this.lastImpact=t;
  }
  if(kind==='special'){
   if(t-this.lastSpecial<.30)return;
   this.lastSpecial=t;
  }
  try{
   switch(kind){
    case 'select':this.brush(ctx,t,2400,.12,.025,'highpass');break;
    case 'summon':
     this.brush(ctx,t,760,.24,.095);
     this.thump(ctx,t+.065,.20);break;
    case 'merge':
     this.brush(ctx,t,1070,.30,.11);
     this.thump(ctx,t+.03,.25);break;
    case 'upgrade':
     this.brush(ctx,t,1600,.14,.055,'highpass');
     this.thump(ctx,t+.015,.12);break;
    case 'heavy':
     this.thump(ctx,t,.43);this.brush(ctx,t,750,.27,.115);break;
    case 'hit':this.brush(ctx,t,1100,.11,.043);break;
    case 'special':
     this.brush(ctx,t,550,.18,.10);
     this.thump(ctx,t+.03,.26);break;
    case 'win':
     this.thump(ctx,t,.20);
     this.brush(ctx,t+.10,1150,.16,.13);break;
    case 'lose':this.thump(ctx,t,.17);break;
    default:this.brush(ctx,t,1800,.1,.028,'highpass');break;
   }
  }catch{/* Device audio is optional; gameplay is never blocked. */}
 }
}
