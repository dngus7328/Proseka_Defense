// Title art intro: exact creator-provided artwork is composited with CSS only.
// If assets have not been uploaded yet, the original procedural title remains.
export class TitleIntro {
 constructor() {
  this.overlay=document.getElementById('titleOverlay');
  this.backdrop=document.getElementById('titleBackdrop');
  this.layers=[...document.querySelectorAll('#titleBackdrop .title-layer')];
  this.shownOnce=false;
  this.ready=false;
  this.timer=null;
  document.getElementById('titleSkipIntro')?.addEventListener('click',()=>this.skip());
  this.loadLayers();
 }
 async loadLayers(){
  const status=await Promise.all(this.layers.map(img=>{
   if(img.complete)return Promise.resolve(img.naturalWidth>0);
   return new Promise(resolve=>{
    img.addEventListener('load',()=>resolve(true),{once:true});
    img.addEventListener('error',()=>resolve(false),{once:true});
   });
  }));
  if(!status.every(Boolean))return; // Missing assets: keep existing title canvas.
  this.ready=true;
  if(this.overlay?.classList.contains('visible'))this.play();
  this.backdrop?.classList.add('art-ready');
 }
 show(){
  this.clearTimer();
  this.overlay?.classList.remove('title-play-intro');
  if(this.ready)this.play();
 }
 play(){
  if(!this.ready||!this.overlay?.classList.contains('visible'))return;
  if(this.shownOnce||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){
   this.shownOnce=true;
   this.overlay.classList.remove('title-play-intro');
   return;
  }
  this.shownOnce=true;
  this.overlay.classList.add('title-play-intro');
  this.timer=window.setTimeout(()=>this.skip(),3350);
 }
 clearTimer(){
  if(this.timer!==null){window.clearTimeout(this.timer);this.timer=null;}
 }
 skip(){
  this.shownOnce=true;
  this.clearTimer();
  this.overlay?.classList.remove('title-play-intro');
 }
}
