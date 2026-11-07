// Five compact, top-down, procedurally drawn SEKAI locations. No map imagery is embedded.
// Scenery is drawn only on reserved tiles or in border scenery. The road is one continuous loop.
const T=32;
const cell=(x,y)=>`${x},${y}`;
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const border=(c,x,y,w,h,color,s=2)=>{rect(c,x,y,w,s,color);rect(c,x,y+h-s,w,s,color);rect(c,x,y,s,h,color);rect(c,x+w-s,y,s,h,color);};
const shadow=(c,x,y,w,h)=>rect(c,x+3,y+4,w,h,'#1a20302b');
const onPath=(m,x,y)=>m.pathSet.has(cell(x,y));
const blocked=(m,x,y)=>m.blockedSet.has(cell(x,y));
const hash=(x,y)=>((x*85717+y*43133+x*y*131+7789)>>>0);
function poly(c,pts,color){c.fillStyle=color;c.beginPath();for(let i=0;i<pts.length;i++){const [x,y]=pts[i];if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.closePath();c.fill();}
function circle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(Math.round(x),Math.round(y),r,0,2*Math.PI);c.fill();}
function dot(c,x,y,color,s=2){rect(c,x,y,s,s,color);}
function lightTile(c,x,y,color){rect(c,x*T+3,y*T+3,26,26,color);}
function floor(c,m){
 const w=m.w*T,h=m.h*T;
 const palettes={
  school:['#b88e7b','#bc947e','#a77970','#d3aa8c'],
  stage:['#b6aec6','#beb5cc','#a49ebc','#e0cfe0'],
  street:['#b3a69a','#c1b0a1','#9d998f','#e2cbb6'],
  wonderland:['#e6c3af','#efceb5','#d8b9bb','#fae3bd'],
  empty:['#e1e0e8','#e8e7ef','#d4d5de','#f5f4f7']
 };
 const p=palettes[m.theme];rect(c,0,0,w,h,p[0]);
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){
  const X=x*T,Y=y*T,q=hash(x,y),alt=(x+3*y)%7===0;
  rect(c,X,Y,T,T,alt?p[1]:p[0]);
  if(m.theme==='school'){
   rect(c,X,Y+30,32,2,'#8d706e');rect(c,X+((y%2)*16),Y+1,1,29,'#94746c');
   rect(c,X+5,Y+5,20,1,'#dbac8b');if(q%9===0)rect(c,X+6,Y+20,7,1,'#9f786b');
  }else if(m.theme==='stage'){
   rect(c,X,Y+30,32,2,'#a79ab2');rect(c,X+30,Y,2,32,'#a79ab2');
   rect(c,X+4,Y+4,24,1,'#d1c6d9');if(q%8===0)rect(c,X+17,Y+13,5,2,'#f2d7e0');
  }else if(m.theme==='street'){
   rect(c,X,Y+30,32,2,'#918986');rect(c,X+(y%2)*16,Y,1,29,'#a29a91');
   if(q%8===0){rect(c,X+6,Y+13,9,1,'#ddd0bb');}
  }else if(m.theme==='wonderland'){
   rect(c,X,Y+30,32,2,'#d9aca8');rect(c,X+30,Y,2,32,'#d9aca8');
   if((x+y)%3===0){rect(c,X+5,Y+5,22,22,'#ead1c4');rect(c,X+7,Y+7,18,18,'#f0d6c4');}
  }else{
   if(x%3===0)rect(c,X,Y,1,32,'#d0d1d9');
   if(y%3===0)rect(c,X,Y,32,1,'#caccd6');
   if(q%13===0)rect(c,X+10,Y+16,9,1,'#bcc0cb');
  }
 }
 // Spatial boundaries are miniature, readable parts of the same world.
 if(m.theme==='school'){
  rect(c,0,0,w,31,'#756076');rect(c,13,4,w-26,24,'#3d6268');border(c,13,4,w-26,24,'#d6b996',3);
  for(let i=0;i<5;i++){const x=30+i*52;rect(c,x,8,1,14,'#a4c2bb');dot(c,x+13,11,'#f2d7a1',3);}
  // Long late-afternoon windows.
  for(let y=1;y<m.h-1;y++){const Y=y*T;rect(c,0,Y,32,32,'#7a7388');rect(c,4,Y+3,24,26,'#c6a3a0');rect(c,6,Y+5,20,21,(y%3===0)?'#e7bba2':'#9aacc0');rect(c,15,Y+4,2,24,'#ead7c1');rect(c,4,Y+16,25,2,'#ead7c1');}
  rect(c,0,h-31,w,31,'#806778');rect(c,15,h-25,92,20,'#4a4d5a');
  rect(c,22,h-21,78,11,'#d0bcae');for(let i=0;i<15;i++)rect(c,24+i*5,h-20,3,9,i%2?'#eae6e0':'#685f6c');
 }else if(m.theme==='stage'){
  rect(c,0,0,w,31,'#51455f');for(let x=0;x<w;x+=29){rect(c,x,0,23,27,x%58===0?'#c080a2':'#926e9d');rect(c,x+4,0,3,27,'#e2b6c1');}
  rect(c,35,9,w-70,12,'#2c334e');for(let i=0;i<6;i++)circle(c,52+i*48,15,4,i%2?'#8be0cc':'#f0cf91');
  for(let y=1;y<m.h-1;y++)for(const x of [0,m.w-1]){const X=x*T,Y=y*T;rect(c,X,Y,32,32,'#61556d');rect(c,X+4,Y+4,24,24,'#7d7191');
   circle(c,X+16,Y+16,7,(y%3===0?'#f8c9dd':'#85d3b0'));circle(c,X+16,Y+16,4,'#ece4dc');}
  rect(c,0,h-31,w,31,'#3c3e54');for(let x=0;x<w;x+=13){rect(c,x,h-21,7,12,(x%4?'#b5d49b':'#eac2d3'));rect(c,x+2,h-26,3,7,'#e9e7c3');}
 }else if(m.theme==='street'){
  rect(c,0,0,w,31,'#634e60');for(let x=0;x<w;x+=44){rect(c,x,0,40,22,x%88===0?'#be8d95':'#bbab86');rect(c,x+5,6,27,8,'#465a70');rect(c,x+8,9,20,2,'#ecdfb4');rect(c,x,23,40,6,'#393c53');}
  for(let y=1;y<m.h-1;y++)for(const x of [0,m.w-1]){const X=x*T,Y=y*T;rect(c,X,Y,32,32,(y%3===0?'#80576a':'#a06a78'));
   for(let k=0;k<4;k++){rect(c,X,Y+k*8,32,1,'#654b5f');rect(c,X+((k%2)*14)+5,Y+k*8,1,7,'#bf8691');}
   if(y%3===1){rect(c,X+5,Y+6,23,21,'#4b5368');border(c,X+5,Y+6,23,21,'#cda397',2);rect(c,X+8,Y+9,17,14,'#83a3a4');}
   if(y%3===0){rect(c,X+5,Y+8,23,16,'#a5b6a0');rect(c,X+8,Y+12,17,5,'#da9d9e');rect(c,X+9,Y+19,13,2,'#d9b18e');}
  }
  rect(c,0,h-31,w,31,'#635469');for(let x=10;x<w;x+=65){rect(c,x,h-27,51,19,'#e1c3aa');rect(c,x+4,h-23,42,12,'#aa728b');rect(c,x+7,h-20,33,2,'#f5d6c0');}
 }else if(m.theme==='wonderland'){
  rect(c,0,0,w,31,'#886d9d');for(let x=0;x<w;x+=32){rect(c,x,0,32,25,(x/32)%2?'#f2b9b7':'#f7e2b4');poly(c,[[x,24],[x+16,30],[x+32,24]],(x/32)%2?'#f2b9b7':'#f7e2b4');}
  for(let y=1;y<m.h-1;y++)for(const x of [0,m.w-1]){const X=x*T,Y=y*T;rect(c,X,Y,32,32,'#a1bca9');rect(c,X+4,Y+4,24,24,'#d5d5b7');
   if(y%2){circle(c,X+16,Y+15,9,'#f6c3a3');circle(c,X+14,Y+12,6,'#eed7ac');dot(c,X+22,Y+5,'#e887a6',5);}
   else{rect(c,X+9,Y+17,14,8,'#6d9c9b');circle(c,X+16,Y+13,9,'#f9ddaf');circle(c,X+16,Y+13,4,'#e88eaa');}
  }
  rect(c,0,h-31,w,31,'#dca9ab');for(let x=10;x<w;x+=45){rect(c,x,h-16,28,6,'#7cb9ad');circle(c,x+14,h-19,8,'#f5d4a9');circle(c,x+14,h-19,4,'#dc87ac');}
 }else{
  rect(c,0,0,w,31,'#d0d1dd');rect(c,24,6,w-48,1,'#f8f6f9');
  for(let y=1;y<m.h-1;y++)for(const x of [0,m.w-1]){const X=x*T,Y=y*T;rect(c,X,Y,32,32,y%3===0?'#c5c7d1':'#d3d4dd');
   poly(c,[[X+4,Y+26],[X+15,Y+4],[X+26,Y+26]],'#afb2c1');poly(c,[[X+15,Y+4],[X+26,Y+26],[X+15,Y+26]],'#9197a9');}
  rect(c,0,h-31,w,31,'#cdd0d9');for(let x=0;x<w;x+=52){rect(c,x+5,h-28,33,2,'#9ca2b1');rect(c,x+10,h-21,21,1,'#f4f4f6');}
 }
}
function scenery(c,m){
 const R=(x,y,X=0,Y=0)=>[x*T+X,y*T+Y];
 if(m.theme==='school'){
  // Back-of-class desk groups and a central upright piano, all on non-deployable cells.
  for(const {x,y} of m.landmarks){const [X,Y]=R(x,y);shadow(c,X+3,Y+4,25,23);
   if(x===6&&y===5){rect(c,X+3,Y+7,26,19,'#414356');rect(c,X+6,Y+9,20,14,'#ddd2bf');for(let i=0;i<6;i++)rect(c,X+7+i*3,Y+12,2,8,i%2?'#4c4d5c':'#f5ece0');}
   else{rect(c,X+5,Y+3,23,17,'#e6bc94');border(c,X+5,Y+3,23,17,'#977867',2);rect(c,X+8,Y+6,17,1,'#f6d7ae');rect(c,X+11,Y+23,13,6,'#746378');rect(c,X+7,Y+25,5,3,'#c5a88b');}
  }
  rect(c,6,32,19,8,'#e2c7b7');rect(c,6,42,18,3,'#c2aa98');
 }else if(m.theme==='stage'){
  // Nine reserved tiles form one coherent raised live stage (not nine random props).
  const X=4*T,Y=4*T;shadow(c,X+1,Y+3,3*T-2,3*T-2);
  rect(c,X,Y,3*T,3*T,'#4a556f');border(c,X,Y,3*T,3*T,'#d8c1d7',3);
  rect(c,X+7,Y+7,3*T-14,3*T-14,'#766d94');border(c,X+7,Y+7,3*T-14,3*T-14,'#a2abd0',2);
  for(let x=0;x<3;x++)for(let y=0;y<3;y++){rect(c,X+12+x*24,Y+12+y*24,19,18,(x+y)%2?'#9183b0':'#8677a2');rect(c,X+16+x*24,Y+17+y*24,12,2,'#c0b1cd');}
  for(const [px,py] of [[X+16,Y+18],[X+77,Y+18]]){rect(c,px-5,py-7,10,11,'#343c58');rect(c,px-3,py-5,6,4,'#c6bac6');}
  rect(c,X+45,Y+42,5,24,'#d8cbd0');circle(c,X+47,Y+41,5,'#d2d5d9');rect(c,X+38,Y+65,19,4,'#494c67');
  for(let i=0;i<7;i++){circle(c,X+9+i*13,Y+89,3,i%2?'#dbbea9':'#7ed4b2');}
 }else if(m.theme==='street'){
  // Street music placards, café seating, compact vending machine.
  for(const {x,y} of m.landmarks){const [X,Y]=R(x,y);
   if(x===5&&y===6){shadow(c,X+2,Y+3,25,25);rect(c,X+5,Y+3,23,26,'#52647a');rect(c,X+8,Y+6,17,10,'#c1d5cb');rect(c,X+8,Y+20,11,4,'#e8a6a6');rect(c,X+22,Y+19,3,5,'#e6d1a6');}
   else if(y>=8){circle(c,X+16,Y+17,13,'#70566b');circle(c,X+16,Y+14,10,'#cbb18e');rect(c,X+2,Y+10,5,10,'#564c62');rect(c,X+26,Y+10,5,10,'#564c62');}
   else{shadow(c,X+2,Y+3,26,25);rect(c,X+4,Y+3,25,25,(x+y)%2?'#735c77':'#69637b');border(c,X+4,Y+3,25,25,'#3b455c',2);rect(c,X+7,Y+7,18,5,(x%2?'#e8aa98':'#91c5b0'));rect(c,X+11,Y+16,11,4,'#efc99b');rect(c,X+9,Y+23,15,2,'#a4afa1');}
  }
 }else if(m.theme==='wonderland'){
  // Center of the miniature fairground: striped carousel footprint.
  const X=5*T+13,Y=5*T+16;
  circle(c,X+2,Y+5,34,'#8c7497');circle(c,X,Y,32,'#f3ddba');circle(c,X,Y,28,'#dd91ad');
  for(let k=0;k<8;k++){const a=k*Math.PI/4;const xx=X+Math.cos(a)*24, yy=Y+Math.sin(a)*24;
   circle(c,xx,yy,6,k%2?'#f3d8a4':'#a9d5bb');rect(c,xx-2,yy-1,4,7,'#6b6a82');}
  circle(c,X,Y,10,'#f9eacb');circle(c,X,Y,6,'#b8d9c5');dot(c,X-2,Y-2,'#fbf6d4',4);
  for(const [x,y] of [[7,7],[7,8]]){const [xx,yy]=R(x,y);rect(c,xx+10,yy+17,13,5,'#7ba7ac');circle(c,xx+16,yy+12,9,'#e3a1b0');circle(c,xx+16,yy+12,5,'#f7d89d');}
  for(let i=0;i<6;i++){const xx=24+i*49;circle(c,xx,35,4,i%2?'#e4a9a5':'#a4c7ac');}
 }else{
  // Still, monochrome geometry with a low truss and scattered angular shards.
  for(const {x,y} of m.landmarks){const [X,Y]=R(x,y);shadow(c,X+4,Y+7,24,19);
   if(x===6&&y===4||x===5&&y===8){rect(c,X+3,Y+4,25,5,'#888e9e');rect(c,X+3,Y+21,25,5,'#9fa5b4');for(let i=0;i<4;i++){rect(c,X+4+i*6,Y+9,2,11,'#a5acb9');rect(c,X+6+i*6,Y+8,2,3,'#c7c9d3');}}
   else{poly(c,[[X+4,Y+26],[X+17,Y+4],[X+29,Y+26]],'#9ea3b3');poly(c,[[X+17,Y+4],[X+29,Y+26],[X+17,Y+26]],'#7f899d');rect(c,X+16,Y+9,1,16,'#cfd0dc');}
  }
 }
}
function route(c,m){
 const p=m.palette;
 // A lane is legible at a glance, without a thick maze-like frame.
 for(const {x,y} of m.path){
  const X=x*T,Y=y*T;
  rect(c,X,Y,32,32,(x+y)%5===0?p.pathAlt:p.path);
  if(!onPath(m,x,y-1)){rect(c,X,Y,32,3,p.line);rect(c,X,Y+3,32,1,'#2a344377');}
  if(!onPath(m,x+1,y)){rect(c,X+29,Y,3,32,p.line);rect(c,X+28,Y,1,32,'#2a344377');}
  if(!onPath(m,x,y+1)){rect(c,X,Y+29,32,3,p.line);rect(c,X,Y+28,32,1,'#2a344377');}
  if(!onPath(m,x-1,y)){rect(c,X,Y,3,32,p.line);rect(c,X+3,Y,1,32,'#2a344377');}
  if(m.theme==='stage'){if((x+y)%4===0)rect(c,X+12,Y+14,8,4,'#e2c6d5');}
  else if(m.theme==='street'){if((x*3+y)%7===0)rect(c,X+11,Y+15,10,2,'#b7b0a6');}
  else if(m.theme==='wonderland'){if((x+y)%4===0){dot(c,X+13,Y+13,'#ebc1c9',3);dot(c,X+18,Y+18,'#f2ddaa',3);}}
  else if(m.theme==='empty'){if((x+y)%5===0)rect(c,X+12,Y+15,8,2,'#bdc1cf');}
  else if((x+y)%5===0)rect(c,X+13,Y+13,7,5,'#7b8493');
 }
 // Use arrows, but sparingly. No text cluttering the board.
 for(let i=6;i<m.path.length;i+=11){const a=m.path[i],b=m.path[(i+1)%m.path.length];
  c.save();c.translate((a.x+.5)*T,(a.y+.5)*T);c.rotate(Math.atan2(b.y-a.y,b.x-a.x));
  rect(c,-6,-1,9,2,p.line);rect(c,2,-4,4,2,p.line);rect(c,2,2,4,2,p.line);c.restore();
 }
}
function spawn(c,m,time){
 const X=m.spawn.x*T,Y=m.spawn.y*T;
 rect(c,X+2,Y+2,28,28,'#283649');border(c,X+2,Y+2,28,28,'#f5e7b8',2);
 rect(c,X+6,Y+6,20,20,m.palette.spawn);rect(c,X+11,Y+11,10,10,'#3b445e');
 const s=2+Math.floor((Math.sin(time*4)+1)*1.5);
 rect(c,X+16-s,Y+16-s,s*2,s*2,'#fff3da');
 for(const [dx,dy] of [[4,4],[24,4],[4,24],[24,24]])rect(c,X+dx,Y+dy,4,4,'#fff2cf');
}
export function drawSekaiWorld(c,m,time=0){
 c.save();c.imageSmoothingEnabled=false;
 floor(c,m);route(c,m);scenery(c,m);spawn(c,m,time);c.restore();
}
