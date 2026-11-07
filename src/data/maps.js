// Every tile is square. The map rectangle is NOT required to be square.
// Vertices form one simple closed orthogonal loop, not a path from entrance to exit.
const SOURCE_MAPS=[
 {id:'roof',order:'01',w:18,h:14,names:{ko:'빛의 정원',ja:'光の庭',en:'Garden of Light'},palette:{base:'#648c84',alt:'#709b91',edge:'#3e6968',path:'#b7b7a2',pathAlt:'#c6c6ad',line:'#899b94',detail:'#e8ddaa',spawn:'#e5ad70'},vertices:[[2,2],[15,2],[15,4],[13,4],[13,9],[15,9],[15,11],[2,11],[2,9],[4,9],[4,4],[2,4]]},
 {id:'city',order:'02',w:20,h:14,names:{ko:'어긋난 거리',ja:'ずれた街',en:'Broken Avenue'},palette:{base:'#718391',alt:'#798d9a',edge:'#4d6877',path:'#bcb29d',pathAlt:'#c9bea5',line:'#a0a798',detail:'#e0c6a4',spawn:'#efad81'},vertices:[[2,2],[17,2],[17,5],[14,5],[14,8],[17,8],[17,11],[2,11],[2,8],[5,8],[5,5],[2,5]]},
 {id:'night',order:'03',w:18,h:15,names:{ko:'고요한 심야',ja:'静かな深夜',en:'Quiet Midnight'},palette:{base:'#686d88',alt:'#737996',edge:'#4e5578',path:'#aea9b2',pathAlt:'#bbb5be',line:'#908fa9',detail:'#d3c0ca',spawn:'#db9da2'},vertices:[[2,2],[14,2],[14,4],[10,4],[10,6],[15,6],[15,12],[2,12],[2,10],[7,10],[7,8],[3,8],[3,6],[5,6],[5,4],[2,4]]}
];
const key=(x,y)=>`${x},${y}`;
function expand(vertices){
  const result=[];
  for(let j=0;j<vertices.length;j++){
    let [x,y]=vertices[j], [tx,ty]=vertices[(j+1)%vertices.length];
    let dx=Math.sign(tx-x),dy=Math.sign(ty-y);
    let len=Math.abs(tx-x)+Math.abs(ty-y);
    for(let i=0;i<len;i++) result.push({x:x+i*dx,y:y+i*dy});
  }
  return result;
}
export const MAPS=SOURCE_MAPS.map((m)=>{
 const path=expand(m.vertices), pathSet=new Set(path.map(p=>key(p.x,p.y)));
 const available=[];
 for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++){
   if(pathSet.has(key(x,y)))continue;
   const proximity=Math.min(...path.map(p=>Math.hypot(p.x-x,p.y-y)));
   if(proximity<=3.4)available.push({x,y});
 }
 const availableSet=new Set(available.map(p=>key(p.x,p.y)));
 return {...m,path,pathSet,available,availableSet,spawn:path[0],spawnIndex:0};
});
export const MAP_BY_ID=Object.fromEntries(MAPS.map(m=>[m.id,m]));
export const tileKey=key;
