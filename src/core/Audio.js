// Original short synthesized UI sounds only. No third-party music or audio assets.
export class SoundEngine {
 constructor(){this.context=null;this.volume=.35;}
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));}
 beep(kind='select'){
   if(this.volume===0)return;
   try{
     const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
     if(!this.context)this.context=new A();
     if(this.context.state==='suspended')this.context.resume().catch(()=>{});
     const ctx=this.context,t=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
     const notes={select:[520,.035,'sine'],summon:[660,.095,'triangle'],merge:[820,.15,'triangle'],heart:[470,.23,'triangle'],lose:[260,.25,'triangle'],win:[740,.21,'triangle'],upgrade:[720,.09,'sine']};
     const [hz,duration,wave]=notes[kind]||notes.select;
     osc.type=wave;osc.frequency.setValueAtTime(hz,t);osc.frequency.exponentialRampToValueAtTime(kind==='lose'?170:hz*1.14,t+duration);
     gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.001,this.volume*.035),t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
     osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+duration+.02);
   }catch{ /* audio context unavailable */ }
 }
}
