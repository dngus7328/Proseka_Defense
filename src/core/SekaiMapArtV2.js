// Original top-down, seven-world SEKAI arenas.  No image tilesets.
// World motifs follow the places where each unit actually performs, rehearses,
// and meets. Paths, blocked scenery and placement rules come only from maps.js.
// v1.26: the combat road is painted LAST, above background props, so scenery
// cannot visually hide the enemy route. Readable empty square tiles mark pads.
const TILE=32, TAU=Math.PI*2;
const STYLES={
 school:{floor:'#b99a91',light:'#ebc7ad',edge:'#735d75',walk:'#765e73',walkEdge:'#554459',mark:'#edd7bf',accent:'#f8df9e'},
 stage:{floor:'#a88ab1',light:'#dfc4d3',edge:'#594a76',walk:'#675b8d',walkEdge:'#433e68',mark:'#ffefc7',accent:'#fce39e'},
 street:{floor:'#b5a09e',light:'#dec7b1',edge:'#665c75',walk:'#747887',walkEdge:'#444d60',mark:'#e7c7a5',accent:'#f1b88d'},
 wonderland:{floor:'#ebc9b7',light:'#ffe8c9',edge:'#b27d98',walk:'#a59cc3',walkEdge:'#80759f',mark:'#fff5c6',accent:'#ffc778'},
 empty:{floor:'#d7d9e2',light:'#f4f3f5',edge:'#a4abbb',walk:'#b8bbc9',walkEdge:'#9398aa',mark:'#ececf3',accent:'#d5d1df'},
 closed:{floor:'#555366',light:'#8a768d',edge:'#35344d',walk:'#777184',walkEdge:'#4d4962',mark:'#bbaab7',accent:'#d6a9b2'},
 open:{floor:'#e4e7e6',light:'#fff9e9',edge:'#97b9c5',walk:'#a8cbd0',walkEdge:'#729caa',mark:'#fff7df',accent:'#f3d4ab'}
};
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function shape(c,points,color,stroke=null,lw=1){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
 c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
}
function round(c,x,y,w,h,r,color,stroke=null,lw=1){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();
 if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
}
function stroke(c,points,color,lw=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=lw;c.stroke();}
function disc(c,x,y,r,col){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=col;c.fill();}
function hoop(c,x,y,rx,ry,col,lw=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.strokeStyle=col;c.lineWidth=lw;c.stroke();}
function rays(c,x,y,r,col){
 c.save();c.strokeStyle=col;c.lineWidth=2;
 for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(x+Math.cos(a)*r*.58,y+Math.sin(a)*r*.58);c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.stroke();}
 c.restore();
}
function star(c,x,y,r,col){
 const p=[];for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2,q=i%2?r*.4:r;p.push([x+Math.cos(a)*q,y+Math.sin(a)*q]);}
 shape(c,p,col);
}
function note(c,x,y,col){
 disc(c,x,y,3,col);rect(c,x+2,y-15,2,15,col);stroke(c,[[x+4,y-15],[x+11,y-11],[x+11,y-7]],col,2);
}
function pane(c,x,y,w,h,sky,trim,open=false){
 round(c,x,y,w,h,2,trim);rect(c,x+3,y+3,w-6,h-6,sky);
 rect(c,x+w*.5-1,y+3,2,h-6,trim);rect(c,x+3,y+h*.48,w-6,2,trim);
 if(open)shape(c,[[x+w*.5,y+4],[x+w*.88,y+8],[x+w*.79,y+h-7],[x+w*.5,y+h-4]],'#fff9df80');
}
function awning(c,x,y,w,pink,cream){
 rect(c,x,y,w,13,pink);
 for(let i=0;i<Math.ceil(w/12);i++)rect(c,x+i*12,y,6,13,cream);
 for(let i=0;i<Math.ceil(w/12);i++)disc(c,x+6+i*12,y+13,3,i%2?cream:pink);
}
function flower(c,x,y,col){
 stroke(c,[[x,y+10],[x,y-2]],'#628979',2);
 for(let i=0;i<5;i++){const a=i*TAU/5;disc(c,x+Math.cos(a)*5,y+Math.sin(a)*5,4,col);}
 disc(c,x,y,3,'#ffe1a4');
}
function truss(c,x,y,w,h,col){
 rect(c,x,y,w,3,col);rect(c,x,y+h-3,w,3,col);
 rect(c,x,y,3,h,col);rect(c,x+w-3,y,3,h,col);
 for(let i=2;i<w-4;i+=12)stroke(c,[[x+i,y+3],[x+i+10,y+h-3]],col,1.4);
}
function tileLandmark(p){return {x:(p.x+.5)*TILE,y:(p.y+.5)*TILE};}
function base(c,m,p){
 const w=m.w*TILE,h=m.h*TILE;
 rect(c,0,0,w,h,p.floor);
 // Large continuous materials give each arena an identifiable place, not
 // a repeated chessboard; individual placement cells remain an overlay.
 switch(m.theme){
 case 'school':{
  for(let j=0;j<13;j++)rect(c,0,j*32,w,1,'#f9dbbd35');
  rect(c,0,0,w,52,'#956f8e');rect(c,0,51,w,6,'#6c5675');
  for(let i=0;i<5;i++){
   const x=8+i*69;
   pane(c,x,6,56,35,i%2?'#f3c49e':'#b8c8d2','#f5e9d8');
   shape(c,[[x+6,42],[x+52,42],[x+86,124],[x+36,124]],'#fff6df22');
  }
  rect(c,0,h-31,w,31,'#ad807d');rect(c,0,h-32,w,4,'#edc2a4');
  break;
 }
 case 'stage':{
  rect(c,0,0,w,48,'#624d83');rect(c,0,h-34,w,34,'#634c73');
  for(let i=0;i<8;i++){
   shape(c,[[i*48,0],[i*48+34,0],[i*48+24,45],[i*48-6,45]],i%2?'#9b6aab':'#8b6098');
   disc(c,12+i*46,43,3,i%2?'#f7dd96':'#c8d8f2');
  }
  for(let i=0;i<6;i++)rect(c,i*65+8,53,2,h-98,'#f3e6ee22');
  break;
 }
 case 'street':{
  for(let i=0;i<11;i++)rect(c,0,i*37,w,1,'#efe0d12b');
  rect(c,0,0,w,54,'#766879');rect(c,0,h-38,w,38,'#80747f');
  for(let i=0;i<7;i++)rect(c,i*52+6,h-23,25,2,'#d8c0ab');
  // Mural-painted alley walls, visible behind the walking loop.
  shape(c,[[0,74],[63,57],[63,143],[0,162]],'#dfb3a6');
  shape(c,[[w-72,126],[w,109],[w,193],[w-72,207]],'#b5a8bf');
  break;
 }
 case 'wonderland':{
  for(let i=0;i<7;i++)disc(c,15+i*54,16+(i%2)*7,18,i%2?'#ffe0c6':'#f4aec0');
  rect(c,0,0,w,48,'#f7d0af');
  rect(c,0,h-32,w,32,'#d79aab');
  for(let i=0;i<11;i++)star(c,i*35+12,h-19,4,i%2?'#fff0ce':'#aed7cc');
  // Confetti are printed into the paving, not noisy bloom particles.
  for(let i=0;i<17;i++)rect(c,(i*43+17)%w,(i*61+56)%(h-24),3,3,i%3?'#e9a5b2':'#dfdcb0');
  break;
 }
 case 'empty':{
  shape(c,[[0,54],[86,0],[202,0],[40,191]],'#efedf3');
  shape(c,[[w,109],[w,h],[203,h],[299,215]],'#c3c6d1');
  shape(c,[[21,h],[117,h],[0,h-84]],'#f1f0f4');
  stroke(c,[[0,180],[63,166],[72,203],[130,217]],'#aeb3c3',2);
  break;
 }
 case 'closed':{
  rect(c,0,0,w,44,'#38374d');rect(c,0,h-36,w,36,'#454056');
  for(let i=0;i<11;i++)rect(c,16+i*37,0,12,h,i%2?'#bfa0b010':'#e8b8ca08');
  stroke(c,[[0,169],[75,138],[91,240],[0,258]],'#c1a4bd40',2);
  stroke(c,[[w,76],[w-74,101],[w-61,199],[w,210]],'#e7b3bc30',2);
  break;
 }
 case 'open':{
  rect(c,0,0,w,h,'#e8f0ed');
  for(let i=0;i<7;i++)shape(c,[[i*65,0],[i*65+31,0],[i*65-15,h]],'#fffef052');
  rect(c,0,0,w,45,'#b9d8d8');rect(c,0,h-32,w,32,'#d1e3db');
  for(let i=0;i<5;i++)disc(c,i*76+22,h-13,7,i%2?'#f2dcb7':'#c7dacd');
 }
 }
 c.strokeStyle=p.edge;c.lineWidth=4;c.strokeRect(2,2,w-4,h-4);
}
// Subtle buildable-tile outlines: readable placement geography without
// a solid checkerboard or stickers on every square. Obstacles are excluded.
function buildPads(c,m,p){
 // A battlefield is not a level-editor grid. Indicate deployable cells with
 // four very small engraved corner ticks instead of outlining every tile.
 // Interactive movement highlights remain bright in Renderer.drawPlacement.
 c.save();c.lineWidth=1;
 for(const at of m.available){
  const x=at.x*TILE,y=at.y*TILE;
  c.strokeStyle=p.edge;c.globalAlpha=.26;
  c.beginPath();
  for(const [px,py,dx,dy] of [
   [x+5,y+5,1,1],[x+TILE-5,y+5,-1,1],
   [x+5,y+TILE-5,1,-1],[x+TILE-5,y+TILE-5,-1,-1]
  ]){
   c.moveTo(px+dx*5,py);c.lineTo(px,py);c.lineTo(px,py+dy*5);
  }
  c.stroke();
 }
 c.restore();
}
function route(c,m,p){
 const pts=m.path.map(t=>tileLandmark(t));
 const paint=(col,width)=>{c.beginPath();pts.forEach((t,i)=>i?c.lineTo(t.x,t.y):c.moveTo(t.x,t.y));
  c.closePath();c.lineJoin='round';c.lineCap='round';c.lineWidth=width;c.strokeStyle=col;c.stroke();};
 paint(p.walkEdge,32);paint(p.walk,26);
 c.setLineDash([2,18]);paint(p.mark,1.3);c.setLineDash([]);
 // Minimal directional markers. Never obscure the characters or turn the route into a grid.
 for(let i=4;i<m.path.length;i+=9){
  const a=pts[i],b=pts[(i+1)%pts.length],ang=Math.atan2(b.y-a.y,b.x-a.x);
  c.save();c.translate(a.x,a.y);c.rotate(ang);
  shape(c,[[6,0],[-3,-5],[-3,5]],p.mark);c.restore();
 }
}
function sceneProps(c,m,p){
 const w=m.w*TILE,h=m.h*TILE;
 if(m.theme==='school'){
  // LEONEED: a sunset classroom for band practice, not a generic rooftop.
  round(c,103,49,143,22,2,'#e1c7ae','#6d5371',3);
  rect(c,113,55,124,12,'#426568');
  for(let i=0;i<4;i++)note(c,125+i*27,64,'#cfe0d6');
  // Desk shapes only occupy explicitly blocked central cells.
  for(const at of m.landmarks){
   const {x,y}=tileLandmark(at);
   if(at.x===6&&at.y===5){
    round(c,x-14,y-14,28,28,3,'#4a485b','#d7ac9b',2);
    rect(c,x-11,y-3,22,13,'#f2ede0');
    for(let i=0;i<8;i++)rect(c,x-10+i*2.6,y-3,1.4,11,i%2?'#38374b':'#f9f6ec');
   }else{
    rect(c,x-12,y+7,26,7,'#745569');
    round(c,x-15,y-10,30,17,2,'#dbb19b','#8a6c79',2);
    rect(c,x-9,y-6,17,2,'#f3ddc2');
    if(at.x===5&&at.y===3)note(c,x+5,y,'#876c86');
   }
  }
  // Telescope / amplifier / guitars on the perimeter.
  stroke(c,[[304,85],[318,85],[321,102]],'#ddc9c3',2);
  stroke(c,[[311,89],[301,111]],'#5a5368',2);stroke(c,[[314,88],[324,111]],'#5a5368',2);
  round(c,7,h-67,32,27,3,'#4b4b62','#d0a79a',2);
  disc(c,23,h-48,6,'#8d7d98');rect(c,46,h-41,10,20,'#7a6076');
 }else if(m.theme==='stage'){
  // MORE MORE JUMP!: huge central raised idol podium, lighting truss and monitors.
  const cx=176,cy=176;
  round(c,112,111,129,131,10,'#645071','#ecd4d0',4);
  round(c,120,119,113,115,5,'#ab8cba','#dbc0d7',2);
  rect(c,120,219,113,12,'#705886');
  for(let i=0;i<6;i++)disc(c,132+i*18,224,3,i%2?'#f9dba2':'#b7ebe1');
  hoop(c,cx,168,51,41,'#f7e7c9',3);
  round(c,cx-3,138,6,47,2,'#e1d8d5');disc(c,cx,137,7,'#f7e8de');
  for(const [x,y] of [[116,163],[236,163]]){
   round(c,x-11,y-19,22,38,3,'#403c5d','#dfbed0',2);
   disc(c,x,y+5,7,'#9c94b6');disc(c,x,y-9,3,'#d0c7d8');
  }
  truss(c,8,46,336,9,'#625276');
  for(let i=0;i<7;i++){disc(c,18+i*51,53,6,i%2?'#e6c7e3':'#f5d5a4');}
  for(let i=0;i<6;i++){
   const x=16+i*60;
   round(c,x,h-29,17,10,2,i%2?'#b0dace':'#f9c7c9','#fff3e0',1);
  }
 }else if(m.theme==='street'){
  // VBS: small live house, cafe, graffiti and venue posters in a lived-in alley.
  round(c,65,6,183,43,2,'#e6d7c4','#6a5a6b',2);
  awning(c,68,10,178,'#ad637a','#f5ddc5');
  rect(c,97,26,28,20,'#425b67');rect(c,157,28,30,18,'#735c69');
  disc(c,183,35,6,'#f8e3c7');rect(c,180,29,3,13,'#f8e3c7');
  round(c,280,37,52,46,3,'#766578','#ebc8b0',2);
  rect(c,289,46,35,10,'#e7b5aa');note(c,306,63,'#f8e6b2');
  for(const at of m.landmarks){
   const {x,y}=tileLandmark(at);
   if(at.x===5&&at.y===6){
    round(c,x-14,y-15,29,30,2,'#526678','#334456',2);
    rect(c,x-11,y-11,23,8,'#e4c3a5');rect(c,x-11,y+2,23,5,'#d8adad');
    note(c,x,y+12,'#f2dccc');
   }else if(at.y>=8){
    disc(c,x,y+5,13,'#8c6370');disc(c,x,y+3,10,'#dfab91');disc(c,x,y+3,4,'#f3dfb4');
   }else{
    round(c,x-14,y-14,28,28,3,'#6e6077','#423e64',2);
    shape(c,[[x-10,y-6],[x+4,y-10],[x+11,y+6],[x-7,y+11]],at.x%2?'#d3b28c':'#d996aa');
    note(c,x+2,y+5,'#f2ded2');
   }
  }
  for(const [x,y] of [[4,93],[319,119],[9,267]]){
   round(c,x,y,28,39,2,'#5c536b','#e3c5b0',2);
   rect(c,x+4,y+5,20,5,'#d8a899');rect(c,x+4,y+15,20,18,'#c6bbad');
  }
 }else if(m.theme==='wonderland'){
  // WxS: performance theme park - central carousel with painted striped canopy.
  const x=181,y=185;
  disc(c,x,y,64,'#ad80a4');disc(c,x,y,58,'#fff0d4');
  for(let i=0;i<12;i++){
   const a=i*TAU/12,b=(i+1)*TAU/12;
   shape(c,[[x,y],[x+Math.cos(a)*54,y+Math.sin(a)*54],[x+Math.cos(b)*54,y+Math.sin(b)*54]],
    i%2?'#e4a7ba':'#f4d6a5');
  }
  hoop(c,x,y,55,55,'#e6bf92',3);disc(c,x,y,15,'#f9e9d3');star(c,x,y,11,'#f3b773');
  for(let i=0;i<8;i++){const a=i*TAU/8;star(c,x+Math.cos(a)*39,y+Math.sin(a)*39,5,i%2?'#fff3d3':'#9cd6c7');}
  for(let i=0;i<5;i++){
   const x=18+i*77;disc(c,x,52,10,i%2?'#b7dccc':'#efb3ba');
   stroke(c,[[x,61],[x+1,84]],'#a4869f',1.5);
  }
  for(const a of m.landmarks){
   if((a.x+a.y)%3===0){const {x,y}=tileLandmark(a);star(c,x,y,4,'#fff8df');}
  }
  // Playful singing flowers stay on the decorative perimeter.
  for(const [x,y] of [[22,120],[326,204],[18,313],[320,323]])flower(c,x,y,x%3?'#e8aabb':'#b1dacc');
  round(c,9,h-35,59,18,3,'#dfb2b7','#f5e1c6',2);
  star(c,38,h-26,6,'#fff3cf');
 }else if(m.theme==='empty'){
  // Nightcord: intentionally empty, with abstract stage trusses and broken prisms.
  truss(c,4,26,110,13,'#aeb4c0');truss(c,238,8,100,13,'#a8acba');
  for(let i=0;i<m.landmarks.length;i++){
   const at=m.landmarks[i],{x,y}=tileLandmark(at);
   const ht=12+i%3*6;
   shape(c,[[x-13,y+13],[x-1,y-ht],[x+10,y-ht+6],[x+15,y+12]],i%2?'#c0c2cf':'#ebebf1','#9da5b9',2);
   shape(c,[[x+10,y-ht+6],[x+15,y+12],[x+1,y+8]],'#a3a9bb55');
  }
  stroke(c,[[13,296],[58,277],[104,300],[140,279]],'#b4b8c5',2);
  for(let i=0;i<4;i++)rect(c,18+i*93,28+i*15,41,2,'#b7bcc9');
 }else if(m.theme==='closed'){
  // Movie's closed-window setting: shut, cracked frames in suspended darkness.
  for(const at of m.landmarks){
   const {x,y}=tileLandmark(at);
   round(c,x-13,y-17,27,34,2,'#38384b','#c29fac',2);
   rect(c,x-9,y-13,19,26,'#676178');
   stroke(c,[[x-8,y-9],[x+8,y+6],[x-2,y+8],[x+8,y+12]],'#c5a5b6',1);
   rect(c,x,y-13,2,26,'#a99bab');
  }
  for(let i=0;i<5;i++){
   const x=i%2?326:7,y=45+i*64;
   pane(c,x,y,22,43,'#666076','#9d899e');
   stroke(c,[[x+4,y+10],[x+16,y+28],[x+11,y+34]],'#cfb0b7',1.2);
  }
  // A central large closed arch makes the identity readable in thumbnails.
  round(c,109,126,31,51,15,'#36394d','#ba9aaa',3);
  rect(c,124,135,2,33,'#dfb7c1');
 }else if(m.theme==='open'){
  // Movie's open-window setting: a light void full of floating window frames.
  for(const at of m.landmarks){
   const {x,y}=tileLandmark(at);
   const col=['#b3d8e1','#f3d8ba','#d5c9e2','#d8e7c4'][(at.x+at.y)%4];
   pane(c,x-13,y-16,26,32,col,'#fff7e9',true);
  }
  for(let i=0;i<6;i++){
   const x=i%2?312:12,y=29+i*61;
   pane(c,x,y,27,42,i%3===0?'#c7e2e2':'#f6e5d1','#fff8ea',true);
  }
  stroke(c,[[116,126],[129,108],[145,120],[155,98]],'#d7c9b7',3);
  for(const [x,y] of [[17,94],[326,185],[16,326],[331,310]])flower(c,x,y,'#e8bfd0');
 }
}
/* Scene identity pass: readable architectural objects instead of decorative
   UI stickers. All objects are behind the combat route, and never modify
   blocked cells, collision geometry, enemy behavior or user images. */
function worldArchitecture(c,m){
 const w=m.w*TILE,h=m.h*TILE;
 c.save();
 const line=(a,b,ink,thickness=1)=>stroke(c,[a,b],ink,thickness);
 const picture=(x,y,w,h,frame,paper)=>{
  rect(c,x,y,w,h,frame);rect(c,x+3,y+3,w-6,h-6,paper);
 };
 if(m.theme==='school'){
  // Classroom: timber planks, north wall, blackboard, coat hooks and books.
  for(let y=59;y<h-32;y+=21)rect(c,0,y,w,1,'#b9807452');
  rect(c,0,0,w,59,'#c99f93');
  rect(c,0,52,w,7,'#846879');
  rect(c,0,0,w,6,'#f0d6be');
  pane(c,13,9,83,37,'#d5dfe2','#fff0d7');
  pane(c,256,9,83,37,'#d5dfe2','#fff0d7');
  rect(c,112,10,128,35,'#76576b');
  rect(c,116,14,120,27,'#496e69');
  rect(c,119,38,113,2,'#d2bcaf');
  for(let i=0;i<4;i++)note(c,136+i*26,31,'#c1d9cd');
  // Teacher's desk, a music stand, wall shelves and boxed instruments.
  round(c,16,101,37,27,2,'#87576a','#f0c6a8',2);
  rect(c,20,106,28,17,'#d2a890');rect(c,25,109,12,3,'#f4e9d4');
  round(c,15,226,36,52,2,'#9a7783','#ebc8a8',2);
  for(let i=0;i<3;i++){
   rect(c,19,230+i*15,28,2,'#f5d8b8');
   rect(c,22,235+i*15,7,9,i%2?'#5b6d83':'#b77c89');
   rect(c,31,233+i*15,6,11,'#e8d2b2');
  }
  rect(c,0,h-34,w,34,'#ae847f');
  rect(c,0,h-35,w,3,'#e4c6a9');
  for(let i=0;i<11;i++)line([i*34,h-31],[i*34,h-2],'#815d6870',1);
  picture(w-47,h-82,30,36,'#866779','#f1dcc0');
  note(c,w-30,h-55,'#76617b');
  // Small recognisable classroom entrance in the lower corner.
  rect(c,w-64,h-32,48,30,'#74576c');
  rect(c,w-59,h-28,39,26,'#c49b8f');
  disc(c,w-24,h-16,2,'#fcdf9e');
 }
 if(m.theme==='stage'){
  // Idol rehearsal stage: curtain folds, footlights, monitor towers, podium.
  rect(c,0,0,w,59,'#806383');
  for(let i=0;i<10;i++){
   const px=i*39;
   shape(c,[[px,0],[px+35,0],[px+28,56],[px+5,56]],i%2?'#a780aa':'#906c9a');
  }
  rect(c,0,57,w,4,'#e9ccb8');
  for(let i=0;i<9;i++)disc(c,18+i*39,61,4,i%2?'#f7e2b0':'#d0e5d6');
  rect(c,0,h-35,w,35,'#735b83');
  rect(c,0,h-39,w,4,'#eac2cf');
  for(let i=0;i<8;i++)rect(c,i*47+12,h-30,23,4,'#f7d9a9');
  for(const x of [7,w-34]){
   round(c,x,95,27,49,3,'#51465e','#d0a9bf',2);
   disc(c,x+14,109,8,'#a488b7');disc(c,x+14,132,5,'#b0c3c6');
  }
  truss(c,28,85,w-56,9,'#7b6389');
  for(let i=0;i<7;i++)disc(c,40+i*46,92,3,'#f2dab9');
 }
 if(m.theme==='street'){
  // Street: a real shopfront and patched tarmac, not a room with stickers.
  rect(c,0,0,w,56,'#a98d87');
  rect(c,0,54,w,5,'#66576b');
  for(let i=0;i<9;i++){
   rect(c,i*42,2,40,2,'#edcfb850');
   rect(c,i*42+19,27,2,24,'#edcfb850');
  }
  rect(c,15,7,139,44,'#70576a');
  awning(c,17,8,135,'#be7b80','#f3d7bd');
  picture(40,28,33,19,'#6f5e66','#bfc4bb');
  picture(79,28,56,19,'#6f5e66','#dbb6a4');
  rect(c,209,7,120,43,'#76687c');
  for(let i=0;i<7;i++)rect(c,214,15+i*5,110,2,'#a89a9a');
  rect(c,0,h-39,w,39,'#766c70');
  rect(c,0,h-42,w,3,'#e4bd9d');
  for(let i=0;i<8;i++)rect(c,18+i*44,h-21,22,2,'#ecdbbf');
  // A visible wall poster and instrument shop sign.
  picture(7,114,40,48,'#5c586f','#c5aa9f');
  note(c,28,146,'#645570');
  round(c,292,219,41,48,2,'#d5b5aa','#655c74',2);
  rect(c,301,228,23,32,'#756b7d');
  for(let y=231;y<259;y+=6)rect(c,302,y,21,1,'#c7b7b4');
 }
 if(m.theme==='wonderland'){
  // Performance park: boardwalk, tickets, scalloped awnings and star arches.
  rect(c,0,0,w,53,'#e3b5aa');rect(c,0,51,w,4,'#fff0d1');
  for(let i=0;i<8;i++){
   const px=i*47;
   shape(c,[[px,0],[px+30,0],[px+41,48],[px+11,48]],i%2?'#f6d4b8':'#e9a0b9');
   star(c,px+24,34,7,'#fff1c9');
  }
  round(c,11,77,54,54,4,'#cb90aa','#fff0dc',3);
  awning(c,13,80,50,'#e4a0b1','#f7ddbd');
  rect(c,21,102,33,21,'#ffebd6');star(c,39,112,8,'#cf8ba2');
  round(c,w-60,74,49,57,4,'#9fcabd','#fff1dd',3);
  awning(c,w-58,78,45,'#d8a8bb','#f6e3b7');
  star(c,w-37,113,10,'#f7d79b');
  rect(c,0,h-29,w,29,'#c994aa');
  for(let i=0;i<12;i++)star(c,i*32+10,h-15,4,i%2?'#fff4d5':'#b0d8c7');
 }
 if(m.theme==='empty'){
  // Empty SEKAI: no festive props; quiet suspended architecture and void.
  rect(c,0,0,w,57,'#c0c3d0');rect(c,0,55,w,2,'#f5f3f3');
  rect(c,0,h-43,w,43,'#bec1ce');
  rect(c,0,h-44,w,2,'#f8f6f5');
  for(const x of [22,110,226,312]){
   rect(c,x,0,2,48,'#e6e7ed');
   rect(c,x+5,10,18,1,'#e6e7ed');
  }
  for(const [x,y] of [[10,112],[299,118],[15,264],[302,277]]){
   rect(c,x,y,29,2,'#9fa5b8');rect(c,x,y+2,2,33,'#9fa5b8');
   rect(c,x+27,y+2,2,33,'#e2e4ec');
  }
 }
 if(m.theme==='closed'){
  // The sealed room: repeating heavy frames, muted cracks, dense shadow.
  rect(c,0,0,w,59,'#454052');rect(c,0,57,w,3,'#ac8ba2');
  for(const x of [11,101,211,302]){
   pane(c,x,8,37,40,'#696076','#b99cad');
   rect(c,x+2,8,33,4,'#524c68');
   for(let i=0;i<4;i++)rect(c,x+4,18+i*8,29,3,'#464052');
  }
  rect(c,0,h-42,w,42,'#49435c');
  rect(c,0,h-43,w,3,'#a4869e');
  for(const x of [22,148,278]){
   rect(c,x,h-36,38,30,'#625b76');
   rect(c,x+9,h-33,3,25,'#8d778e');
   rect(c,x+20,h-33,3,25,'#8d778e');
  }
 }
 if(m.theme==='open'){
  // The open room: airy sunny windows and cutout curtains at the edges.
  rect(c,0,0,w,58,'#b9d3d4');rect(c,0,56,w,3,'#f7f0e2');
  for(const x of [14,124,234]){
   pane(c,x,8,91,39,'#d5e7e6','#fff9e6',true);
   shape(c,[[x+1,5],[x+18,5],[x+14,46],[x+1,47]],'#f7f0debd');
   shape(c,[[x+90,5],[x+72,5],[x+76,46],[x+90,47]],'#f7f0debd');
  }
  rect(c,0,h-34,w,34,'#c2d9d4');
  rect(c,0,h-35,w,3,'#fff8eb');
  for(const x of [22,148,274]){
   disc(c,x,h-13,8,'#f6d9c3');disc(c,x+16,h-9,5,'#e3eacb');
  }
 }
 c.restore();
}

function entrance(c,m,p,time){
 const {x,y}=tileLandmark(m.path[0]);
 c.save();c.translate(x,y);
 disc(c,0,0,16,p.edge);disc(c,0,0,11,p.accent);
 hoop(c,0,0,12,12,'#fff9e9',2);
 shape(c,[[6,0],[-5,-6],[-5,6]],p.edge);
 c.globalAlpha=.65+Math.sin(time*3)*.25;hoop(c,0,0,18,18,p.accent,2);
 c.restore();
}
function ambient(c,m,time,reduced){
 if(reduced)return;
 const w=m.w*TILE,h=m.h*TILE;
 c.save();
 if(m.theme==='stage'){
  c.globalAlpha=.15;
  for(let i=0;i<3;i++){
   const x=35+i*139,dx=Math.sin(time*.6+i)*18;
   shape(c,[[x,55],[x+13,55],[x+63+dx,183],[x+23+dx,183]],i%2?'#fff6d4':'#dcf1ed');
  }
 }else if(m.theme==='wonderland'||m.theme==='open'){
  c.globalAlpha=.8;
  for(let i=0;i<6;i++)star(c,17+i*60+Math.sin(time*.6+i)*6,35+(i*53+time*2)%(h-47),2.5,m.theme==='open'?'#f6dfc5':'#fffbde');
 }else if(m.theme==='closed'||m.theme==='empty'){
  c.globalAlpha=.3;
  for(let i=0;i<4;i++)rect(c,19+i*83,12+((i*89+time*1.6)%(h-22)),2,4,m.theme==='closed'?'#ddb8c6':'#bcbfcf');
 }
 c.restore();
}
const STATIC=new WeakMap();
function cached(m){
 if(STATIC.has(m))return STATIC.get(m);
 let cv=null;
 try{
  if(typeof OffscreenCanvas==='function')cv=new OffscreenCanvas(m.w*TILE,m.h*TILE);
  else if(typeof document!=='undefined'){cv=document.createElement('canvas');cv.width=m.w*TILE;cv.height=m.h*TILE;}
  if(cv){
   const c=cv.getContext('2d');
   const p=STYLES[m.theme]||STYLES.school;
   base(c,m,p);worldArchitecture(c,m);buildPads(c,m,p);sceneProps(c,m,p);route(c,m,p);STATIC.set(m,cv);
  }
 }catch{cv=null;}
 return cv;
}
export function drawSekaiWorld(c,m,time=0,reduced=false){
 c.save();
 const p=STYLES[m.theme]||STYLES.school,layer=cached(m);
 if(layer)c.drawImage(layer,0,0);
 else{base(c,m,p);worldArchitecture(c,m);buildPads(c,m,p);sceneProps(c,m,p);route(c,m,p);}
 ambient(c,m,time,reduced);entrance(c,m,p,time);
 c.restore();
}
