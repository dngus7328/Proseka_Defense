// Original, flat 2-D environment paintings for seven SEKAI arenas.
// All scenery is drawn once to a cached canvas by Renderer, no image tilesets.
// Grid/tile mechanics are unchanged; the view no longer looks like repeated blocks.
const T=32;
const PI=Math.PI;
const THEMES={
 school:{ground:'#d8bfab',band:'#b98c81',border:'#9c767e',road:'#66768e',roadEdge:'#34465e',roadMark:'#c5d8d9',accent:'#f6e1a6',detail:'#9c7880'},
 stage:{ground:'#c5b5c9',band:'#715777',border:'#55465e',road:'#605c83',roadEdge:'#3c3d60',roadMark:'#d7b8e0',accent:'#f1c86d',detail:'#a477b8'},
 street:{ground:'#d3c4b7',band:'#8e7a76',border:'#675c65',road:'#646d76',roadEdge:'#455162',roadMark:'#efdfba',accent:'#f6c686',detail:'#ab737d'},
 wonderland:{ground:'#f4dfc2',band:'#d6a1a7',border:'#ad819c',road:'#b5a4c8',roadEdge:'#857b9f',roadMark:'#f9ede0',accent:'#f3c886',detail:'#e7acaa'},
 empty:{ground:'#e8e7ec',band:'#b9becb',border:'#a0a8ba',road:'#aaaebf',roadEdge:'#83899f',roadMark:'#ecedf5',accent:'#d5d2df',detail:'#c1bed0'},
 closed:{ground:'#726b7a',band:'#454354',border:'#373749',road:'#807989',roadEdge:'#555266',roadMark:'#bcb3bd',accent:'#c7a6b3',detail:'#555262'},
 open:{ground:'#e6eae8',band:'#a8cbd1',border:'#8faebd',road:'#b1cbd0',roadEdge:'#739fa9',roadMark:'#eff9ef',accent:'#e8cfb2',detail:'#a9c4cc'}
};
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function rounded(c,x,y,w,h,r,fill,outline=null,line=1){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(outline){c.strokeStyle=outline;c.lineWidth=line;c.stroke();}
}
function ring(c,x,y,r,color,line=2){c.beginPath();c.arc(x,y,r,0,PI*2);c.strokeStyle=color;c.lineWidth=line;c.stroke();}
function disc(c,x,y,r,fill){c.beginPath();c.arc(x,y,r,0,PI*2);c.fillStyle=fill;c.fill();}
function poly(c,p,fill,outline=null,lw=1){c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath();c.fillStyle=fill;c.fill();if(outline){c.strokeStyle=outline;c.lineWidth=lw;c.stroke();}}
function line(c,p,color,width=2){c.beginPath();c.moveTo(...p[0]);for(let i=1;i<p.length;i++)c.lineTo(...p[i]);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function window(c,x,y,w,h,sky='#9bbacc',frame='#f4e7d5'){
 rounded(c,x,y,w,h,3,'#6c758a');rounded(c,x+3,y+3,w-6,h-6,1,sky);
 rect(c,x+w*.48,y+3,3,h-6,frame);rect(c,x+3,y+h*.53,w-6,3,frame);
 rect(c,x+5,y+5,w*.3,2,'#f4ecdf77');
}
function star(c,x,y,r,color){poly(c,[[x,y-r],[x+r*.28,y-r*.28],[x+r,y],[x+r*.28,y+r*.28],[x,y+r],[x-r*.28,y+r*.28],[x-r,y],[x-r*.28,y-r*.28]],color);}
function post(c,x,y,h,color='#837689'){rect(c,x,y,2,h,color);disc(c,x+1,y,4,'#f0ddd3')}
function ground(c,m,p){
 const w=m.w*T,h=m.h*T;
 rect(c,0,0,w,h,p.ground);
 // Large surfaces imply real rooms and locations, rather than repeated tiles.
 if(m.theme==='school'){
  for(let j=0;j<11;j++){
   const y=32+j*34;
   rect(c,0,y,w,1,'#b9978b30');
   if(j%2===0)rect(c,27,y+1,w-54,1,'#eed7ba55');
  }
  rounded(c,3,4,w-6,27,3,'#98727f','#6b616d',2);
  for(let i=0;i<5;i++)window(c,13+i*(w-26)/5,7,(w-30)/5,19,i%2?'#f6c5a5':'#a9c0ca');
  rect(c,0,h-23,w,23,'#b48783');rect(c,0,h-23,w,3,'#e6c6a9');
 }else if(m.theme==='stage'){
  rect(c,0,0,w,31,'#6d547a');rect(c,0,h-29,w,29,'#5f526e');
  for(let i=0;i<7;i++){const x=13+i*(w-26)/7;disc(c,x,13,6,i%2?'#f1c1b1':'#b8ddd0');}
  for(let x=12;x<w-10;x+=34){rect(c,x,25,1,h-57,'#fbecf412');}
 }else if(m.theme==='street'){
  for(let j=1;j<12;j++){rect(c,0,j*32,w,1,'#8e8c8b19');}
  rect(c,0,0,w,23,'#877985');rect(c,0,h-25,w,25,'#7b7777');
  for(let i=0;i<6;i++)rect(c,18+i*58,h-16,24,2,'#dfd5b8');
 }else if(m.theme==='wonderland'){
  for(let j=0;j<7;j++){disc(c,25+j*55,20+(j%2)*8,14,j%2?'#f5eacb':'#f0d1cb');}
  rect(c,0,h-21,w,21,'#cfa4ad');
  for(let j=0;j<8;j++)star(c,22+j*44,h-12,3,j%2?'#fbe9bd':'#fae7dc');
 }else if(m.theme==='empty'){
  poly(c,[[0,55],[93,0],[200,0],[88,129],[0,138]],'#f2f1f3');
  poly(c,[[w,198],[w,h],[220,h],[300,276]],'#dcdce3');
  line(c,[[0,180],[68,171],[70,234]],'#c6c8d0',2);
 }else if(m.theme==='closed'){
  rect(c,0,0,w,28,'#3f3f50');rect(c,0,h-25,w,25,'#4b4759');
  for(let i=0;i<8;i++)rect(c,i*49,0,16,h,'#c6aab50b');
 }else if(m.theme==='open'){
  for(let i=0;i<7;i++)poly(c,[[i*61,0],[i*61+32,0],[i*61-8,h]],'#ffffff1d');
  rect(c,0,0,w,27,'#a5c7cd');rect(c,0,h-25,w,25,'#d1d7cf');
 }
 // Continuous edge material, very thin so the board remains compact.
 c.strokeStyle=p.border;c.lineWidth=5;c.strokeRect(2.5,2.5,w-5,h-5);
}
function drawPath(c,m,p){
 const points=m.path.map(v=>[(v.x+.5)*T,(v.y+.5)*T]);
 if(!points.length)return;
 const draw=(color,width)=>{c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.closePath();c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();};
 draw(p.roadEdge,32);
 draw(p.road,27);
 // A subtle center rhythm line instead of a maze of square tile borders.
 c.setLineDash([3,16]);draw(p.roadMark,1.1);c.setLineDash([]);
 // Special curb colors at the junctions follow the actual loop and never hide units.
 c.fillStyle=p.roadMark;
 for(let i=5;i<m.path.length;i+=10){
  const a=m.path[i],b=m.path[(i+1)%m.path.length];
  const ang=Math.atan2(b.y-a.y,b.x-a.x),x=(a.x+.5)*T,y=(a.y+.5)*T;
  c.save();c.translate(x,y);c.rotate(ang);
  poly(c,[[4,0],[-4,-4],[-4,4]],p.roadMark);c.restore();
 }
}
function desk(c,x,y,variant=0){
 c.save();c.translate(x,y);
 rounded(c,-13,-4,29,18,3,'#8d7085','#795c71',1);
 rounded(c,-13,-8,29,14,2,variant?'#dca996':'#e9c6a6','#b98988',1);
 rect(c,-9,-5,20,2,'#f4d8b7');rect(c,-7,8,3,8,'#725e75');rect(c,9,8,3,8,'#725e75');
 c.restore();
}
function mark(c,x,y,content,fg,bg){rounded(c,x-12,y-11,24,22,6,bg,'#ffffff77',1);c.fillStyle=fg;c.font='bold 13px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(content,x,y+1);}
function locationProps(c,m,p){
 const w=m.w*T,h=m.h*T;
 if(m.theme==='school'){
  // A classroom with a chalkboard, student desks, and upright piano.
  rounded(c,105,9,w-210,14,2,'#355d60','#d6cab5',2);
  for(let i=0;i<4;i++){rect(c,112+i*28,16,18,1,'#d2ddc7');}
  for(const pos of m.landmarks){const x=(pos.x+.5)*T,y=(pos.y+.5)*T;
   if(pos.x===6&&pos.y===5){rounded(c,x-14,y-12,28,25,2,'#48475e','#a88989',2);rect(c,x-11,y-4,22,10,'#ebe4d7');for(let i=0;i<6;i++)rect(c,x-9+i*3,y-4,1,9,i%2?'#2f354b':'#d1d9df');}
   else desk(c,x,y,(pos.x+pos.y)%2);
  }
  for(let i=0;i<4;i++){window(c,8,39+i*79,18,53,i%2?'#f0c4aa':'#a2bbcd');}
 }else if(m.theme==='stage'){
  const x=5*T+16,y=5*T+16;
  rounded(c,x-51,y-51,102,102,10,'#544969','#ebd4c7',4);
  rounded(c,x-43,y-43,86,86,5,'#86739e','#b3a4c7',2);
  for(let i=0;i<7;i++){disc(c,x-36+i*12,y+39,2.5,i%2?'#f7d4a2':'#a4dacd');}
  rounded(c,x-3,y-25,7,46,3,'#d2cbd3');disc(c,x,y-27,7,'#d0d6d8');
  for(const px of [x-44,x+44]){rounded(c,px-10,y-20,20,35,3,'#35354f','#b7a1bf',2);disc(c,px,y+3,6,'#9493ad');}
  for(let i=0;i<5;i++){const xx=18+i*76;post(c,xx,h-25,17,i%2?'#a7d6d0':'#ebbdc7');}
 }else if(m.theme==='street'){
  for(const pos of m.landmarks){const x=(pos.x+.5)*T,y=(pos.y+.5)*T;
   if(pos.x===5&&pos.y===6){rounded(c,x-13,y-14,26,29,3,'#537887','#293d54',2);rect(c,x-10,y-10,20,10,'#b9d1c5');rect(c,x-7,y+6,14,4,'#f0c8ae');}
   else if(pos.y>=8){disc(c,x,y+5,12,'#9e7c70');disc(c,x,y+2,9,'#e7cdad');rect(c,x-2,y-8,4,6,'#f1ead9');}
   else{rounded(c,x-13,y-13,26,27,3,'#816178','#4e5269',2);rounded(c,x-10,y-10,20,10,2,pos.x%2?'#dba894':'#acd2c0');rect(c,x-8,y+5,16,3,'#dcd4b9');}
  }
  for(let i=0;i<3;i++){const y=44+i*100;rounded(c,4,y,22,34,3,'#d7a7aa','#675c69',2);rect(c,8,y+5,14,3,'#f3e0bd');}
 }else if(m.theme==='wonderland'){
  const x=5*T+18,y=5*T+18;
  disc(c,x,y+6,49,'#a682a0');disc(c,x,y,44,'#f1d2bb');
  for(let k=0;k<10;k++){const a=k*PI/5;const fill=k%2?'#e2aac2':'#f5e6be';poly(c,[[x,y-2],[x+Math.cos(a)*43,y+Math.sin(a)*43],[x+Math.cos(a+.3)*43,y+Math.sin(a+.3)*43]],fill);}
  disc(c,x,y,11,'#faf0da');star(c,x,y,9,'#f4c16d');
  for(let i=0;i<5;i++){const xx=15+i*81;disc(c,xx,16+i%2*4,9,i%2?'#e8a7bc':'#a9d7c7');line(c,[[xx,23],[xx,36]],'#9c8a9e');}
  for(const pos of m.landmarks){if((pos.x+pos.y)%3===0){const px=(pos.x+.5)*T,py=(pos.y+.5)*T;star(c,px,py,5,'#f9dfab');}}
 }else if(m.theme==='empty'){
  for(const pos of m.landmarks){const x=(pos.x+.5)*T,y=(pos.y+.5)*T;poly(c,[[x-11,y+10],[x-4,y-12],[x+9,y-4],[x+13,y+12]],'#c8c8d3','#a0a5b7',2);}
  for(let i=0;i<4;i++){const x=13+i*85;rect(c,x,9,40,2,'#c6cad2');rect(c,x,9,2,34,'#c6cad2');}
 }else if(m.theme==='closed'||m.theme==='open'){
  const dark=m.theme==='closed';
  for(let i=0;i<5;i++)for(const x of [5,w-30]){
   const y=40+i*64;
   rounded(c,x,y,25,44,2,dark?'#3d3a4b':'#f1ecdf',dark?'#a58b9f':'#8baeb8',2);
   rect(c,x+3,y+3,19,38,dark?'#555165':'#b1d8e0');rect(c,x+12,y+3,2,38,dark?'#8b8191':'#fff9e6');
   rect(c,x+3,y+22,19,2,dark?'#8b8191':'#fff9e6');
   if(dark)line(c,[[x+4,y+31],[x+14,y+25],[x+18,y+35]],'#b6a0ae',1);
  }
  for(const pos of m.landmarks){const x=(pos.x+.5)*T,y=(pos.y+.5)*T;
   if(dark){rounded(c,x-10,y-10,22,22,2,'#504a61','#918595',2);rect(c,x-3,y-4,7,10,'#6b657d');}
   else{disc(c,x,y,12,'#d0e0df');disc(c,x,y,7,'#f5edda');star(c,x,y,4,'#e8bf9f');}
  }
 }
}
function gate(c,m,p,time=0){
 const a=m.path[0],x=(a.x+.5)*T,y=(a.y+.5)*T;
 const pulse=.7+.3*Math.sin(time*2);
 c.save();c.translate(x,y);
 disc(c,0,0,13,p.border);disc(c,0,0,10,p.accent);ring(c,0,0,10,'#fff1db',1.5);
 star(c,0,0,7,p.border);disc(c,0,0,2.5,'#fff8e9');
 c.globalAlpha=pulse;ring(c,0,0,15,p.accent,1.5);
 c.restore();
}
function ambience(c,m,p,time=0,reduceMotion=false){
 if(reduceMotion)return;
 const w=m.w*T,h=m.h*T;
 if(m.theme==='stage'){
  for(let i=0;i<3;i++){
   const x=20+i*155,phase=time*.7+i*1.7;
   c.save();c.globalAlpha=.12;c.fillStyle=i%2?'#f3dba2':'#b3e6da';
   poly(c,[[x,30],[x+8,30],[x+54+Math.sin(phase)*21,151],[x+13+Math.sin(phase)*21,151]],c.fillStyle);c.restore();
  }
 }else if(m.theme==='wonderland'||m.theme==='open'||m.theme==='empty'){
  const fill=m.theme==='empty'?'#bec2cd':m.theme==='open'?'#f9e0cf':'#f1ccd7';
  c.save();c.globalAlpha=.67;
  for(let i=0;i<6;i++){
   const x=14+i*60+Math.sin(time*.67+i)*7;
   const y=(17+i*59+time*(i%2?2:4))%(h-19);
   if(m.theme==='empty')rect(c,x,y,2,3,fill);else star(c,x,y,2.5,fill);
  }
  c.restore();
 }else if(m.theme==='school'||m.theme==='street'){
  for(let i=0;i<4;i++){const x=10+i*100+Math.sin(time*.3+i)*4;const y=30+i*78;disc(c,x,y,1.2,'#f7e5cb');}
 }
}
const LAYERS=new WeakMap();
function cached(m){
 if(LAYERS.has(m))return LAYERS.get(m);
 let canvas=null;
 try{
  if(typeof OffscreenCanvas==='function')canvas=new OffscreenCanvas(m.w*T,m.h*T);
  else if(typeof document!=='undefined'){canvas=document.createElement('canvas');canvas.width=m.w*T;canvas.height=m.h*T;}
  const c=canvas?.getContext('2d');
  if(c){c.imageSmoothingEnabled=true;const p=THEMES[m.theme]||THEMES.school;ground(c,m,p);drawPath(c,m,p);locationProps(c,m,p);LAYERS.set(m,canvas);}
 }catch{canvas=null}
 return canvas;
}
export function drawSekaiWorld(c,m,time=0,reduceMotion=false){
 c.save();const p=THEMES[m.theme]||THEMES.school;
 const layer=cached(m);if(layer)c.drawImage(layer,0,0);else{ground(c,m,p);drawPath(c,m,p);locationProps(c,m,p);}
 ambience(c,m,p,time,reduceMotion);gate(c,m,p,time);
 c.restore();
}