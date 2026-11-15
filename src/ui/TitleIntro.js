// Loads the creator's four aligned title images, then plays an optional entrance.
// Transient 404s (before GitHub Pages finishes publishing) can be retried when
// returning to the title. If loading fails, the existing Canvas remains visible.
const TITLE_ASSET_REV='20261115-uploaded';
export class TitleIntro {
 constructor(){
  this.overlay=document.getElementById('titleOverlay');
  this.backdrop=document.getElementById('titleBackdrop');
  this.layers=[...document.querySelectorAll('#titleBackdrop .title-layer')];
  this.portraitCanvas=document.getElementById('titlePortraitCrowd');
  this.sourceCrowd=this.backdrop?.querySelector('.title-characters');
  this.onResize=()=>{if(this.ready)this.paintPortraitCrowd();};
  window.addEventListener('resize',this.onResize);
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
     this.paintPortraitCrowd();
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
 // Original source composite is cut into five distinct character crowds,
 // preserving every outline, costume and face. Tall screens receive a real
 // portrait composition rather than shrinking a 16:9 crowd into one thin row.
 paintPortraitCrowd(){
  const canvas=this.portraitCanvas,src=this.sourceCrowd;
  if(!canvas||!src||!src.naturalWidth||!src.naturalHeight)return;
  const w=Math.max(240,window.innerWidth),h=Math.max(300,window.innerHeight);
  if(w>=h)return;
  const dpr=Math.min(window.devicePixelRatio||1,1.6);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  const c=canvas.getContext('2d');if(!c)return;
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  c.imageSmoothingEnabled=true;
  const parts=[
   // Musicians, idols, center stage, night ensemble, virtual singers.
   {x:0,y:0,w:.52,h:.34,top:.17,size:.18,shift:-.04},
   {x:0,y:.22,w:.56,h:.32,top:.32,size:.18,shift:.03},
   {x:.34,y:.31,w:.65,h:.38,top:.47,size:.19,shift:-.015},
   {x:0,y:.57,w:.54,h:.43,top:.64,size:.19,shift:-.04},
   {x:.43,y:.57,w:.57,h:.43,top:.79,size:.19,shift:.04}
  ];
  for(const part of parts){
   const sx=Math.floor(part.x*src.naturalWidth);
   const sy=Math.floor(part.y*src.naturalHeight);
   const sw=Math.min(src.naturalWidth-sx,Math.floor(part.w*src.naturalWidth));
   const sh=Math.min(src.naturalHeight-sy,Math.floor(part.h*src.naturalHeight));
   if(sw<=0||sh<=0)continue;
   const dy=Math.round(h*part.top),bandHeight=Math.round(h*part.size);
   const drawHeight=bandHeight*1.1;
   const drawWidth=drawHeight*sw/sh;
   const dx=(w-drawWidth)/2+w*part.shift;
   c.save();c.beginPath();c.rect(0,dy,w,bandHeight);c.clip();
   c.drawImage(src,sx,sy,sw,sh,dx,dy-1,drawWidth,drawHeight);
   c.restore();
  }
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
