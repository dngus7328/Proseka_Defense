/* Original instrumental soundtrack assembled entirely in Web Audio.
   No external copyrighted music or samples; piano harmonics, plucked strings,
   warm chord pads, brushed percussion and a distinct cinematic skill motif.
   Explicitly scheduled on the audio clock, with a small look-ahead. */
const midi=n=>440*2**((n-69)/12);
const instruments={
 roof:{bpm:104,root:60,mode:[0,2,4,5,7,9,11],chords:[[0,4,7],[9,0,4],[5,9,0],[7,11,2]],melody:[0,null,2,4,7,4,2,null,5,4,2,null,0,2,4,null],kit:'brush'},
 stage:{bpm:126,root:62,mode:[0,2,4,5,7,9,11],chords:[[0,4,7],[5,9,0],[9,0,4],[7,11,2]],melody:[0,2,4,7,null,9,7,4,5,7,9,7,4,null,2,0],kit:'pop'},
 city:{bpm:132,root:57,mode:[0,2,3,5,7,8,10],chords:[[0,3,7],[5,8,0],[8,0,3],[7,10,2]],melody:[0,null,3,5,null,7,8,7,5,null,3,5,7,3,0,null],kit:'break'},
 wonderland:{bpm:124,root:60,mode:[0,2,4,5,7,9,11],chords:[[0,4,7],[7,11,2],[9,0,4],[5,9,0]],melody:[0,4,7,9,7,4,2,7,5,9,7,5,4,2,0,null],kit:'parade'},
 night:{bpm:90,root:57,mode:[0,2,3,5,7,8,10],chords:[[0,3,7],[8,0,3],[5,8,0],[7,10,2]],melody:[0,null,null,3,5,null,7,null,8,null,7,5,3,null,2,null],kit:'brush'},
 closedwindow:{bpm:94,root:55,mode:[0,2,3,5,7,8,10],chords:[[0,3,7],[8,0,3],[5,8,0],[7,10,2]],melody:[0,null,3,null,5,null,null,7,3,null,2,0,null,3,null,5],kit:'brush'},
 openwindow:{bpm:112,root:60,mode:[0,2,4,5,7,9,11],chords:[[0,4,7],[5,9,0],[2,5,9],[7,11,2]],melody:[0,2,null,4,7,null,9,7,5,4,2,null,4,7,9,null],kit:'brush'}
};
function env(g,start,peak,attack,hold,release){
 g.gain.setValueAtTime(.00001,start);
 g.gain.linearRampToValueAtTime(peak,start+attack);
 g.gain.setValueAtTime(peak,start+attack+hold);
 g.gain.exponentialRampToValueAtTime(.00001,start+attack+hold+release);
}
export class MusicDirector {
 constructor(getContext,getVolume){
  this.getContext=getContext;this.getVolume=getVolume;
  this.bus=null;this.master=null;this.timer=null;this.mapId=null;
  this.step=0;this.next=0;this.paused=false;this.duckUntil=0;
  this.noise=null;this.lastCtx=null;
 }
 setup(){
  const ctx=this.getContext();if(!ctx)return null;
  if(this.lastCtx!==ctx){
   this.lastCtx=ctx;
   const compressor=ctx.createDynamicsCompressor();
   compressor.threshold.value=-19;compressor.ratio.value=2.5;
   compressor.attack.value=.006;compressor.release.value=.21;
   this.bus=ctx.createGain();this.bus.gain.value=.12;
   this.bus.connect(compressor);compressor.connect(ctx.destination);
   this.noise=null;
  }
  return ctx;
 }
 updateVolume(){
  const ctx=this.lastCtx;if(!ctx||!this.bus)return;
  const v=Math.max(0,Math.min(1,this.getVolume()));
  this.bus.gain.setTargetAtTime(v*.31,ctx.currentTime,.06);
 }
 start(mapId){
  if(this.mapId===mapId&&this.timer)return;
  this.stop(false);this.mapId=instruments[mapId]?mapId:'roof';
  const ctx=this.setup();if(!ctx)return;
  this.paused=false;this.step=0;this.next=ctx.currentTime+.08;
  this.updateVolume();
  this.timer=setInterval(()=>this.schedule(),85);
  this.schedule();
 }
 pause(value){
  if(!this.timer)return;
  this.paused=!!value;
  if(!this.paused&&this.lastCtx)this.next=this.lastCtx.currentTime+.06;
  if(this.bus&&this.lastCtx)
   this.bus.gain.setTargetAtTime(this.paused?.0001:this.getVolume()*.31,this.lastCtx.currentTime,.06);
 }
 stop(reset=true){
  if(this.timer){clearInterval(this.timer);this.timer=null;}
  if(this.bus&&this.lastCtx){
   const t=this.lastCtx.currentTime;
   this.bus.gain.setTargetAtTime(.0001,t,.09);
  }
  if(reset){this.mapId=null;this.step=0;this.paused=false;}
 }
 schedule(){
  const ctx=this.lastCtx;if(!ctx||!this.mapId||this.paused)return;
  if(ctx.state==='suspended')return;
  const cfg=instruments[this.mapId],stepSec=60/cfg.bpm/2;
  if(this.next<ctx.currentTime-.4)this.next=ctx.currentTime+.04;
  let budget=0;
  while(this.next<ctx.currentTime+.23&&budget++<8){
   const s=this.step,step=s%16,bar=Math.floor(s/16)%4;
   this.stepMusic(ctx,cfg,bar,step,this.next,s);
   this.step++;this.next+=stepSec;
  }
  const target=ctx.currentTime<this.duckUntil?.14:1;
  this.bus?.gain.setTargetAtTime(Math.max(.0001,this.getVolume()*.31*target),ctx.currentTime,.15);
 }
 pitch(cfg,degree,oct=0){
  const n=Math.floor(degree/7),d=((degree%7)+7)%7;
  return midi(cfg.root+cfg.mode[d]+n*12+oct*12);
 }
 tone(freq,start,length,velocity=.5,kind='piano',bus=this.bus){
  const ctx=this.lastCtx;if(!ctx||!bus)return;
  const group=ctx.createGain();group.connect(bus);
  if(kind==='pad'){
   env(group,start,velocity*.25,.23,Math.max(.06,length-.48),.52);
   for(let i=0;i<2;i++){
    const o=ctx.createOscillator();o.type=i?'sine':'triangle';
    o.frequency.setValueAtTime(freq*(i?2:1),start);
    o.detune.value=i?4:-4;
    o.connect(group);o.start(start);o.stop(start+length+.44);
   }
  }else{
   const v=kind==='pluck'?velocity*.63:velocity*.36;
   env(group,start,v,.004,.015,Math.max(.07,length));
   const partials=kind==='pluck'?[1,2,3,5]:[1,2,3,4];
   partials.forEach((ratio,i)=>{
    const o=ctx.createOscillator(),a=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(freq*ratio,start);
    if(kind==='pluck')o.frequency.exponentialRampToValueAtTime(freq*ratio*.998,start+length*.6);
    a.gain.value=kind==='pluck'?[1,.41,.18,.06][i]:[1,.36,.15,.07][i];
    o.connect(a);a.connect(group);o.start(start);o.stop(start+length+.12);
   });
   if(kind==='pluck')this.percussion('pluckNoise',start,velocity*.18);
  }
 }
 noiseBuffer(){
  const ctx=this.lastCtx;if(this.noise)return this.noise;
  const len=Math.round(ctx.sampleRate*.45);
  const b=ctx.createBuffer(1,len,ctx.sampleRate);
  const data=b.getChannelData(0);
  let seed=821763;
  for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/2147483648-1);}
  this.noise=b;return b;
 }
 percussion(kind,start,power=.15){
  const ctx=this.lastCtx;if(!ctx||!this.bus)return;
  const src=ctx.createBufferSource();src.buffer=this.noiseBuffer();
  const filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  filter.type=kind==='kick'?'lowpass':kind==='snare'?'bandpass':'highpass';
  filter.frequency.value=kind==='kick'?190:kind==='snare'?1450:kind==='pluckNoise'?2600:4800;
  filter.Q.value=.58;
  const dur=kind==='kick'?.12:kind==='snare'?.16:kind==='pluckNoise'?.035:.055;
  env(gain,start,Math.max(.0002,power),.002,.001,dur);
  src.connect(filter);filter.connect(gain);gain.connect(this.bus);
  src.start(start);src.stop(start+dur+.02);
  if(kind==='kick'){
   const osc=ctx.createOscillator(),bass=ctx.createGain();
   osc.type='sine';osc.frequency.setValueAtTime(105,start);
   osc.frequency.exponentialRampToValueAtTime(48,start+.14);
   env(bass,start,power*.9,.002,.001,.16);
   osc.connect(bass);bass.connect(this.bus);osc.start(start);osc.stop(start+.17);
  }
 }
 stepMusic(ctx,cfg,bar,step,at,whole){
  const beat=step%2===0,quarter=step/2;
  const root=cfg.root,notes=cfg.chords[bar];
  if(step===0){
   notes.forEach((n,i)=>this.tone(this.pitch(cfg,n,i===0?-1:0),at,2.0,.24,'pad'));
  }
  if(beat){
   const chordNote=notes[(whole/2|0)%notes.length];
   this.tone(this.pitch(cfg,chordNote,-1),at,.28,.18,'pluck');
  }
  const melody=cfg.melody[(step+bar*3)%16];
  if(melody!==null&&(cfg.kit!=='brush'||step%2===0||step%4===1)){
   const base=this.pitch(cfg,melody,1);
   this.tone(base,at,step%4===0?.46:.25,.14+(step%4===0?.05:0),
    cfg.kit==='break'?'pluck':'piano');
  }
  const busy=cfg.kit==='pop'||cfg.kit==='break'||cfg.kit==='parade';
  if(beat&&step%8===0)this.percussion('kick',at,busy?.21:.08);
  if(beat&&step%8===4)this.percussion('snare',at,busy?.10:.045);
  if((busy&&step%2===0)||(!busy&&step%4===2))this.percussion('hat',at,busy?.025:.009);
  if(cfg.kit==='parade'&&step%4===3)this.percussion('hat',at,.017);
 }
 // Multilayer fanfare is original, orchestrated to match each heart visual grammar.
 heartCue(style='star'){
  const ctx=this.setup();if(!ctx)return;
  const now=ctx.currentTime+.015;this.duckUntil=now+1.35;
  const config={
   star:{notes:[72,79,84,88],kind:'piano',drum:'snare'},
   rain:{notes:[76,79,83,88,91],kind:'piano',drum:'hat'},
   slash:{notes:[60,67,72,79],kind:'pluck',drum:'kick'},
   burst:{notes:[72,76,79,84,88],kind:'piano',drum:'snare'},
   wave:{notes:[69,72,76,81],kind:'pad',drum:'hat'},
   orbit:{notes:[72,79,76,84,88,91],kind:'piano',drum:'snare'}
  }[style]||{notes:[72,79,84],kind:'piano',drum:'snare'};
  config.notes.forEach((m,i)=>this.tone(midi(m),now+i*.082,config.kind==='pad'?.67:.32,.25+(i===config.notes.length-1?.12:0),config.kind));
  this.percussion(config.drum,now+.19,.21);
  this.percussion('kick',now+.38,.25);
  this.tone(midi(config.notes.at(-1)-12),now+.4,.67,.31,'pad');
 }
 heartAnticipation(style='star'){
  const ctx=this.setup();if(!ctx)return;
  const n=style==='slash'?57:style==='wave'?64:60,t=ctx.currentTime+.01;
  for(let i=0;i<3;i++)this.tone(midi(n+7*i),t+i*.13,.22,.13,'piano');
 }
 finish(won){
  const ctx=this.setup();if(!ctx)return;
  const now=ctx.currentTime+.02;
  const notes=won?[72,76,79,84,88]:[72,70,67,64];
  notes.forEach((n,i)=>this.tone(midi(n),now+i*.155,.45,.34,'piano'));
  if(won){this.percussion('snare',now+.35,.13);this.tone(midi(60),now+.52,1,.22,'pad');}
 }
}
