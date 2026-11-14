// Self-generated short SFX: no external music/voice/sound samples.
// Distinct attack hits are rate-limited so dense defenses remain comfortable.
export class SoundEngine {
 constructor(){this.context=null;this.volume=.35;this.lastImpact=-Infinity;this.lastSpecial=-Infinity;}
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));}
 beep(kind='select'){
  if(this.volume<=0)return;
  try{
   const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
   if(!this.context)this.context=new A();
   const ctx=this.context;
   if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   const time=ctx.currentTime;
   if(kind==='hit'||kind==='heavy'){
    if(time-this.lastImpact<(kind==='heavy'?.105:.085))return;
    this.lastImpact=time;
   }
   if(kind==='special'&&time-this.lastSpecial<.25)return;
   if(kind==='special')this.lastSpecial=time;
   const tones={
    select:[515,.045,'sine',.75],
    summon:[610,.16,'triangle',1.1],
    merge:[830,.20,'triangle',1.0],
    heart:[430,.27,'triangle',1.25],
    lose:[245,.29,'triangle',.85],
    win:[720,.27,'triangle',1.15],
    upgrade:[750,.13,'sine',.8],
    hit:[350,.050,'triangle',.60],
    heavy:[165,.13,'sawtooth',1.05],
    special:[550,.18,'triangle',1.1]
   };
   const [frequency,duration,wave,mul]=tones[kind]||tones.select;
   const osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type=wave;
   osc.frequency.setValueAtTime(frequency,time);
   const endFreq=kind==='heavy'?105:kind==='hit'?230:kind==='lose'?160:kind==='summon'?860:frequency*1.13;
   osc.frequency.exponentialRampToValueAtTime(Math.max(40,endFreq),time+duration);
   const power=Math.max(.0004,Math.min(.13,this.volume*.043*mul));
   gain.gain.setValueAtTime(.0001,time);
   gain.gain.exponentialRampToValueAtTime(power,time+.009);
   gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(time);osc.stop(time+duration+.02);
   if(kind==='heavy'||kind==='merge'||kind==='heart'){
    const accent=ctx.createOscillator(),env=ctx.createGain();
    accent.type='sine';accent.frequency.setValueAtTime(kind==='heart'?640:kind==='merge'?940:83,time);
    accent.frequency.exponentialRampToValueAtTime(kind==='heavy'?57:1100,time+duration*.8);
    env.gain.setValueAtTime(.0001,time);
    env.gain.exponentialRampToValueAtTime(power*.56,time+.012);
    env.gain.exponentialRampToValueAtTime(.0001,time+duration*.87);
    accent.connect(env);env.connect(ctx.destination);accent.start(time);accent.stop(time+duration);
   }
  }catch{ /* Audio is optional when device/browser does not support it. */ }
 }
}
