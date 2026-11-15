// Loads the creator's four aligned title images, then plays an optional entrance.
// Transient 404s (before GitHub Pages finishes publishing) can be retried when
// returning to the title. If loading fails, the existing Canvas remains visible.
const TITLE_ASSET_REV='20261115-uploaded';
export class TitleIntro {
 constructor(){
  this.overlay=document.getElementById('titleOverlay');
  this.backdrop=document.getElementById('titleBackdrop');
  this.layers=[...document.querySelectorAll('#titleBackdrop .title-layer')];
  this.shownOnce=false;
  this.ready=false;
  this.loading=null;
  this.retryCount=0;
  this.timer=null;
  document.getElementById('titleSkipIntro')?.addEventListener('click',()=>this.skip());
  this.loadLayers();
 }
 loadLayers(retry=false){
  if(this.ready)return Promise.resolve(true);
  if(this.loading)return this.loading;
  if(retry)this.retryCount++;
  this.loading=Promise.all(this.layers.map(img=>this.loadImage(img,retry)))
   .then(status=>{
    const ok=this.layers.length===4&&status.every(Boolean);
    if(ok){
     this.ready=true;
     this.backdrop?.classList.add('art-ready');
     if(this.overlay?.classList.contains('visible'))this.play();
    }else{
     this.backdrop?.classList.remove('art-ready');
     console.warn('[TitleIntro] Title art is not available yet. Keeping the fallback title scene.');
    }
    return ok;
   })
   .catch(error=>{
    console.warn('[TitleIntro] Failed to load title art:',error);
    return false;
   })
   .finally(()=>{this.loading=null;});
  return this.loading;
 }
 loadImage(img,retry){
  if(!retry&&img.complete&&img.naturalWidth>0)return Promise.resolve(true);
  if(retry&&img.complete&&img.naturalWidth>0)return Promise.resolve(true);
  return new Promise(resolve=>{
   let settled=false;
   const finish=ok=>{
    if(settled)return;
    settled=true;
    window.clearTimeout(timeout);
    img.removeEventListener('load',onLoad);
    img.removeEventListener('error',onError);
    resolve(ok);
   };
   const onLoad=()=>finish(img.naturalWidth>0);
   const onError=()=>finish(false);
   const timeout=window.setTimeout(()=>finish(false),12000);
   img.addEventListener('load',onLoad);
   img.addEventListener('error',onError);
   if(retry||img.complete){
    // Force a genuinely new URL after an old, possibly cached 404 response.
    const base=img.dataset.titleAsset||img.getAttribute('src')?.split('?')[0];
    if(!base){finish(false);return;}
    img.dataset.titleAsset=base;
    img.src=`${base}?rev=${TITLE_ASSET_REV}-retry${this.retryCount}`;
   }
  });
 }
 show(){
  this.clearTimer();
  this.overlay?.classList.remove('title-play-intro');
  if(this.ready){this.play();return;}
  this.loadLayers().then(ok=>{
   if(!ok&&this.overlay?.classList.contains('visible')&&this.retryCount<2){
    this.loadLayers(true);
   }
  });
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
  this.clearTimer();
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
