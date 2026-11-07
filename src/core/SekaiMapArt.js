// Custom orthographic pixel worlds inspired by the physical environments of SEKAI.
// Zero image assets. Maps have restrained materials, readable routes, and landmark spaces.
const T=32;
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const frame=(c,x,y,w,h,col,s=2)=>{rect(c,x,y,w,s,col);rect(c,x,y+h-s,w,s,col);rect(c,x,y,s,h,col);rect(c,x+w-s,y,s,h,col);};
const tile=(x,y)=>`${x},${y}`;
const hash=(x,y)=>((x*83771+y*41387+x*y*139+9187)>>>0);
const landmark=(m,x,y)=>m.blockedSet?.has(tile(x,y)) ?? false;
const path=(m,x,y)=>m.pathSet.has(tile(x,y));

function schoolFloor(c,m){
 const w=m.w*T,h=m.h*T;
 rect(c,0,0,w,h,'#ae8578');
 // Long, gently irregular wooden planks rather than a noisy square mosaic.
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){
  const X=x*T,Y=y*T,d=hash(x,y);
  rect(c,X,Y,T,T,(x+Math.floor(y/2))%5===0?'#b68a7b':'#ae8379');
  rect(c,X,Y+31,32,1,'#936d70');
  rect(c,X+(y%2)*15,Y+2,1,27,'#996f71');
  rect(c,X+4,Y+5,22,1,'#c29788');
  if(d%11===0)rect(c,X+9,Y+21,9,1,'#996f6d');
 }
 // Door and piano corner: architectural accents read from straight overhead.
 rect(c,0,0,w,32,'#745e72');rect(c,0,28,w,4,'#c39d8a');
 rect(c,3*T+4,3,7*T-8,22,'#d3b394');rect(c,3*T+10,5,7*T-20,17,'#436368');
 frame(c,3*T+10,5,7*T-20,17,'#9cb6a4',2);
 for(let i=0;i<7;i++){const x=3*T+20+i*25;rect(c,x,11,4,2,'#efddae');}
 rect(c,0,h-32,w,32,'#79616f');rect(c,2*T,h-26,4*T,17,'#bf9384');
 frame(c,2*T,h-26,4*T,17,'#dfba9b',2);
 // Tall left-hand windows show the permanent twilight of School SEKAI.
 for(let y=1;y<m.h-1;y++){
  const Y=y*T;rect(c,0,Y,T,T,'#76647c');
  rect(c,2,Y+2,28,28,y%4===0?'#bb90a4':'#697a9a');
  rect(c,5,Y+4,22,11,'#7b91ae');rect(c,5,Y+16,22,11,y%3===0?'#e8af98':'#ce9b9c');
  rect(c,14,Y+2,3,28,'#e7bea6');rect(c,2,Y+15,28,3,'#d8b0a4');
  // Dusk pools onto the wood floor; it doesn't obscure the lane.
  if(y%3===1){rect(c,32,Y+3,45,18,'#f5c3981a');rect(c,73,Y+3,14,18,'#f5c39812');}
 }
 // School cubbies, distinctive on the other side and fully top-down.
 for(let y=1;y<m.h-1;y++){
  const Y=y*T;rect(c,w-32,Y,32,32,'#786777');
  rect(c,w-29,Y+2,26,27,'#aa9291');rect(c,w-26,Y+5,20,20,'#796c7b');
  if(y%3===0){rect(c,w-23,Y+8,6,12,'#d9bd98');rect(c,w-14,Y+8,6,12,'#88a3a6');}
  rect(c,w-29,Y+29,26,2,'#594c67');
 }
}
function schoolProps(c,m){
 // A few groups of desks are clear, readable silhouettes and occupy blocked tiles.
 for(const [x,y] of [[5,3],[6,6],[6,11],[6,13]]){
  if(!landmark(m,x,y))continue;
  const X=x*T,Y=y*T;
  rect(c,X+6,Y+18,21,9,'#695467');rect(c,X+4,Y+6,24,15,'#5e5969');
  rect(c,X+4,Y+3,24,16,'#e1bc9d');frame(c,X+4,Y+3,24,16,'#a17d78',2);
  rect(c,X+7,Y+6,18,1,'#f6d3b0');rect(c,X+11,Y+23,10,4,'#ad9391');
  if(y%2===1){rect(c,X+20,Y+8,4,5,'#839ab1');rect(c,X+21,Y+9,2,2,'#f2ebe0');}
 }
 // Piano-like long music desk, from straight overhead.
 for(const [x,y] of [[6,3],[6,12]]){
  if(!landmark(m,x,y))continue;
  const X=x*T,Y=y*T;
  rect(c,X+3,Y+9,27,17,'#3b465a');rect(c,X+5,Y+11,23,12,'#596175');
  for(let i=0;i<8;i++)rect(c,X+6+i*3,Y+14,2,6,i%3===1?'#566477':'#f1e5d5');
 }
 // Small music stand in the lower classroom.
 const X=6*T,Y=7*T;
 if(landmark(m,6,7)){rect(c,X+13,Y+7,6,17,'#555770');rect(c,X+7,Y+5,18,9,'#e7d5b8');rect(c,X+9,Y+8,14,1,'#6c6775');}
}
function streetFloor(c,m){
 const w=m.w*T,h=m.h*T;
 rect(c,0,0,w,h,'#b9aa9e');
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){
  const X=x*T,Y=y*T;
  rect(c,X,Y,32,32,(x+Math.floor(y/3))%4===0?'#c0b0a0':'#b5a79e');
  // Long staggered block paving, with a clear quiet center.
  rect(c,X,Y+30,32,2,'#948d91');rect(c,X+(y%2)*16,Y,1,30,'#9d9696');
  if(hash(x,y)%9===0)rect(c,X+12,Y+10,7,1,'#d8c8b3');
 }
 // Storefront facades are seen as horizontal top-view strips at the bounds.
 rect(c,0,0,w,32,'#6d5d70');
 for(let x=2;x<m.w-2;x++){
  const X=x*T;
  rect(c,X,2,32,17,x%2===0?'#dbad90':'#9d7185');
  rect(c,X,19,32,8,'#4d546e');
  rect(c,X+4,23,24,4,'#c59c91');
 }
 for(let x=3;x<10;x++)rect(c,x*T,0,32,8,x%2?'#dcbd93':'#bd7785');
 // Brick walls and regularly spaced windows border the alley, not the lane.
 for(let y=1;y<m.h-1;y++)for(const x of [0,m.w-1]){
  const X=x*T,Y=y*T;
  rect(c,X,Y,32,32,(y%3===0)?'#8d6175':'#9a6876');
  for(let j=0;j<4;j++){rect(c,X,Y+j*8,32,1,'#6e5269');rect(c,X+((j%2)*12)+2,Y+j*8+1,1,7,'#ae8290');}
  if(y%4===1){rect(c,X+6,Y+6,20,18,'#47576c');frame(c,X+6,Y+6,20,18,'#dfac91',2);rect(c,X+9,Y+9,14,12,'#66828b');}
  if(y%4===3){rect(c,X+6,Y+6,20,19,'#dbb48f');rect(c,X+9,Y+9,14,13,'#946f83');rect(c,X+11,Y+12,10,2,'#e7d0aa');}
 }
 // A poster wall in one corner signals live music without copying any asset.
 rect(c,w-32,h-32,32,32,'#554e65');rect(c,w-29,h-29,26,26,'#c88b9d');
 rect(c,w-26,h-26,20,7,'#e7c9a4');rect(c,w-26,h-16,13,8,'#758e92');
}
function streetProps(c,m){
 // Central music murals, each inside a reserved square and away from the road.
 for(const [x,y,col] of [[6,4,'#8cbba5'],[7,4,'#d79aac'],[6,10,'#dcba91'],[7,11,'#94bec3']]){
  if(!landmark(m,x,y))continue;
  const X=x*T,Y=y*T;
  rect(c,X+2,Y+3,29,27,'#655d73');frame(c,X+2,Y+3,29,27,'#433f56',2);
  rect(c,X+7,Y+17,18,5,col);rect(c,X+10,Y+11,9,6,col);
  rect(c,X+21,Y+8,5,6,'#e0d5bb');rect(c,X+6,Y+23,9,2,'#e9c6b3');
 }
 // Cafe tables, square stylization from overhead with chairs clearly separated.
 for(const [x,y] of [[6,5],[7,10],[6,14]]){
  if(!landmark(m,x,y))continue;
  const X=x*T,Y=y*T;
  rect(c,X+13,Y+2,7,5,'#765668');rect(c,X+13,Y+25,7,5,'#765668');
  rect(c,X+2,Y+13,5,7,'#765668');rect(c,X+25,Y+13,5,7,'#765668');
  rect(c,X+7,Y+7,19,19,'#6c5c6d');rect(c,X+9,Y+9,15,15,'#deb997');
  rect(c,X+14,Y+14,5,5,'#9b7680');
 }
 // Vending machines are constrained to scenery tiles.
 for(const [x,y] of [[6,11],[7,5]]){
  if(!landmark(m,x,y))continue;
  const X=x*T,Y=y*T;rect(c,X+4,Y+3,24,28,'#454f66');
  rect(c,X+6,Y+5,20,23,'#bc7885');rect(c,X+8,Y+7,16,8,'#d9bec3');
  rect(c,X+9,Y+18,11,4,'#48546b');rect(c,X+22,Y+18,3,6,'#f3d9ab');
 }
}
function emptyFloor(c,m){
 const w=m.w*T,h=m.h*T;rect(c,0,0,w,h,'#e4e3e8');
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){
  const X=x*T,Y=y*T;
  rect(c,X,Y,T,T,(x+y)%8===0?'#ecebf0':'#e4e3e8');
  // Vast flat geometry: low-contrast seams rather than a tiled floor texture.
  if(x%3===0)rect(c,X,Y,1,32,'#d2d0d9');
  if(y%4===0)rect(c,X,Y,32,1,'#d6d4de');
  if(hash(x,y)%13===0)rect(c,X+10,Y+18,7,1,'#c5c1cd');
 }
 // Empty SEKAI has no surrounding walls, only fog-like stepped vignettes.
 for(let i=0;i<3;i++){
  const col=['#d6d5de','#dddae2','#e3e2e8'][i];
  rect(c,0,i*3,w,3,col);rect(c,0,h-(i+1)*3,w,3,col);
  rect(c,i*3,0,3,h,col);rect(c,w-(i+1)*3,0,3,h,col);
 }
 // Dislocated slabs behind the playable route.
 rect(c,6*T+7,3*T+8,2*T-14,38,'#d7d5de');
 rect(c,6*T+8,3*T+8,2*T-16,1,'#f7f5f8');
 rect(c,6*T+7,13*T+4,2*T-14,47,'#d9d8df');
 rect(c,6*T+8,13*T+5,2*T-16,1,'#f6f4f8');
}
function emptyProps(c,m){
 // High, empty truss casts long flat shadows seen from above.
 const truss=(x,y)=>{
  const X=x*T+7,Y=y*T+2;
  rect(c,X+2,Y+5,20,25,'#d5d3dc');
  rect(c,X,Y,4,31,'#8c90a2');rect(c,X+21,Y,4,31,'#8c90a2');
  for(let j=0;j<3;j++){
   rect(c,X+5,Y+6+j*7,16,2,'#9a9cac');
   rect(c,X+8+j*3,Y+8+j*7,3,5,'#b1b2bd');
  }
 };
 for(const [x,y] of [[6,3],[6,7],[6,14]])if(landmark(m,x,y))truss(x,y);
 // The characteristic triangular mineral shapes are restrained and isolated.
 const triangle=(x,y,n=20)=>{
  const X=x*T+16,Y=y*T+16;c.fillStyle='#aaadbd';c.beginPath();
  c.moveTo(X,Y-n/2);c.lineTo(X+n/2,Y+n/2);c.lineTo(X-n/2,Y+n/2);c.closePath();c.fill();
  c.fillStyle='#d0cdd7';c.beginPath();c.moveTo(X,Y-n/2);c.lineTo(X,Y+n/2);c.lineTo(X-n/2,Y+n/2);c.closePath();c.fill();
  rect(c,X-1,Y-2,2,4,'#f2ebef');
 };
 for(const [x,y,n] of [[6,5,21],[6,12,22],[6,15,26]])if(landmark(m,x,y))triangle(x,y,n);
}
function route(c,m){
 const P=m.palette;
 // 2px dark inset along the outer edge and broad, uninterrupted paved interiors.
 for(const {x,y} of m.path){
  const X=x*T,Y=y*T;
  rect(c,X,Y,T,T,(x+y)%5===0?P.pathAlt:P.path);
  const neighbors=[[0,-1,'top'],[1,0,'right'],[0,1,'bottom'],[-1,0,'left']];
  for(const [dx,dy,side] of neighbors){
   if(path(m,x+dx,y+dy))continue;
   if(side==='top'){rect(c,X,Y,32,3,P.line);rect(c,X,Y+3,32,1,'#31354755');}
   if(side==='right'){rect(c,X+29,Y,3,32,P.line);rect(c,X+28,Y,1,32,'#31354755');}
   if(side==='bottom'){rect(c,X,Y+29,32,3,P.line);rect(c,X,Y+28,32,1,'#31354755');}
   if(side==='left'){rect(c,X,Y,3,32,P.line);rect(c,X+3,Y,1,32,'#31354755');}
  }
  if(m.theme==='school'){
   // Muted vinyl corridor mat inset on a wooden stage, no stripes across each seam.
   if((x+y)%5===0)rect(c,X+13,Y+13,6,5,'#807a8c');
  }else if(m.theme==='street'){
   // A few painted street markings on asphalt, not a noisy repetitive grid.
   if((x*7+y*3)%11===0)rect(c,X+10,Y+15,12,2,'#a2a0a1');
  }else{
   if((x+y)%7===0)rect(c,X+11,Y+11,10,1,'#c2c4cf');
  }
 }
 // Small directional arrows show that the road is a single loop.
 for(let i=9;i<m.path.length;i+=16){
  const a=m.path[i],b=m.path[(i+1)%m.path.length];
  const X=(a.x+.5)*T,Y=(a.y+.5)*T;
  c.save();c.translate(X,Y);c.rotate(Math.atan2(b.y-a.y,b.x-a.x));
  rect(c,-5,-1,9,2,P.line);rect(c,2,-4,4,2,P.line);rect(c,2,2,4,2,P.line);c.restore();
 }
}
function spawn(c,m,time){
 const {x,y}=m.spawn,X=x*T,Y=y*T;
 // An obvious enemy-entry sigil rather than a random colored tile.
 rect(c,X+2,Y+2,28,28,'#2b3549');frame(c,X+2,Y+2,28,28,'#fff1cd',2);
 rect(c,X+6,Y+6,20,20,m.palette.spawn);
 rect(c,X+10,Y+10,12,12,'#414457');
 const q=2+Math.floor((Math.sin(time*4)+1)*2);
 rect(c,X+16-q,Y+16-q,q*2,q*2,'#ffedd4');
 for(const [dx,dy] of [[0,0],[27,0],[0,27],[27,27]])rect(c,X+dx,Y+dy,5,5,'#ffecbf');
}
export function drawSekaiWorld(c,m,time=0){
 c.save();c.imageSmoothingEnabled=false;
 if(m.theme==='school')schoolFloor(c,m);
 if(m.theme==='street')streetFloor(c,m);
 if(m.theme==='empty')emptyFloor(c,m);
 route(c,m);
 if(m.theme==='school')schoolProps(c,m);
 if(m.theme==='street')streetProps(c,m);
 if(m.theme==='empty')emptyProps(c,m);
 spawn(c,m,time);
 c.restore();
}
