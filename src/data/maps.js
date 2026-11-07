// Each map is a rectangular grid of square tiles; only the enemy path is a closed loop.
// Landmarks explicitly reserve tiles so heroes never appear on top of furniture/structures.
const SOURCE_MAPS = [
 {id:'roof',order:'01',w:13,h:19,theme:'school',names:{ko:'교실의 세카이',ja:'教室のセカイ',en:'School SEKAI'},
  palette:{base:'#aa8178',alt:'#b58a7d',edge:'#6b596d',path:'#636077',pathAlt:'#6d687f',line:'#ddd0ba',detail:'#e9be96',spawn:'#f0d08a'},
  vertices:[[2,2],[10,2],[10,5],[8,5],[8,8],[10,8],[10,15],[2,15],[2,12],[4,12],[4,10],[2,10],[2,7],[4,7],[4,5],[2,5]],
  landmarks:[{x:5,y:3},{x:6,y:3},{x:6,y:6},{x:6,y:7},{x:6,y:11},{x:6,y:12},{x:6,y:13},{x:5,y:17},{x:6,y:17},{x:7,y:17}]},
 {id:'city',order:'02',w:14,h:19,theme:'street',names:{ko:'스트리트의 세카이',ja:'ストリートのセカイ',en:'Street SEKAI'},
  palette:{base:'#aca39b',alt:'#bdb0a0',edge:'#58546b',path:'#464d61',pathAlt:'#50566b',line:'#e1c49d',detail:'#d6b98d',spawn:'#e6b477'},
  vertices:[[2,2],[11,2],[11,6],[9,6],[9,9],[11,9],[11,16],[2,16],[2,13],[5,13],[5,11],[2,11],[2,8],[4,8],[4,5],[2,5]],
  landmarks:[{x:6,y:4},{x:7,y:4},{x:6,y:5},{x:7,y:5},{x:6,y:10},{x:7,y:10},{x:6,y:11},{x:7,y:11},{x:6,y:14}]},
 {id:'night',order:'03',w:13,h:19,theme:'empty',names:{ko:'아무도 없는 세카이',ja:'誰もいないセカイ',en:'Empty SEKAI'},
  palette:{base:'#dddce3',alt:'#e6e5eb',edge:'#bdbdc7',path:'#858b9d',pathAlt:'#9296a6',line:'#f4f1e9',detail:'#c0bdce',spawn:'#ddbdcd'},
  vertices:[[3,2],[10,2],[10,6],[8,6],[8,9],[10,9],[10,16],[3,16],[3,13],[5,13],[5,11],[2,11],[2,8],[4,8],[4,5],[3,5]],
  landmarks:[{x:6,y:3},{x:6,y:4},{x:6,y:5},{x:6,y:7},{x:6,y:8},{x:6,y:12},{x:6,y:14},{x:6,y:15},{x:7,y:17}]}
];
const key=(x,y)=>`${x},${y}`;
function expand(vertices){
 const out=[];
 for(let j=0;j<vertices.length;j++){
  const [x,y]=vertices[j], [tx,ty]=vertices[(j+1)%vertices.length];
  if(x!==tx&&y!==ty)throw Error('Path segments must be orthogonal');
  const dx=Math.sign(tx-x),dy=Math.sign(ty-y),len=Math.abs(tx-x)+Math.abs(ty-y);
  for(let i=0;i<len;i++)out.push({x:x+i*dx,y:y+i*dy});
 }
 return out;
}
export const MAPS=SOURCE_MAPS.map(m=>{
 const path=expand(m.vertices),pathSet=new Set(path.map(p=>key(p.x,p.y)));
 if(pathSet.size!==path.length)throw Error(`Invalid path self-intersection: ${m.id}`);
 const blockedSet=new Set(m.landmarks.map(p=>key(p.x,p.y)));
 const available=[];
 for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++){
  if(pathSet.has(key(x,y))||blockedSet.has(key(x,y)))continue;
  let proximity=Infinity;
  for(const p of path)proximity=Math.min(proximity,Math.hypot(p.x-x,p.y-y));
  if(proximity<=3.2)available.push({x,y});
 }
 return {...m,path,pathSet,blockedSet,available,availableSet:new Set(available.map(p=>key(p.x,p.y))),spawn:path[0],spawnIndex:0};
});
export const MAP_BY_ID=Object.fromEntries(MAPS.map(m=>[m.id,m]));
export const tileKey=key;
