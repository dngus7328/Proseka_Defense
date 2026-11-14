// Seven compact, hand-designed loops. The individual tiles are square; the world need not be.
// Roughly half the tile footprint of v1.1. Dedicated scenery cells never overlap paths.
const SOURCE_MAPS = [
 {id:'roof',order:'01',w:11,h:12,theme:'school',names:{ko:'교실의 세카이',ja:'教室のセカイ',en:'School SEKAI'},shortNames:{ko:'교실',ja:'教室',en:'School'},
  palette:{base:'#b58f79',alt:'#c49a82',edge:'#745c6c',path:'#5d6478',pathAlt:'#696f81',line:'#d4c6b8',detail:'#e9bc9e',spawn:'#ffcf84'},
  vertices:[[2,2],[8,2],[8,4],[7,4],[7,6],[9,6],[9,9],[6,9],[6,10],[2,10],[2,7],[3,7],[3,5],[2,5]],
  landmarks:[{x:4,y:3},{x:5,y:3},{x:5,y:5},{x:6,y:5},{x:5,y:7},{x:6,y:7},{x:4,y:8}]},
 {id:'stage',order:'02',w:11,h:12,theme:'stage',names:{ko:'스테이지의 세카이',ja:'ステージのセカイ',en:'Stage SEKAI'},shortNames:{ko:'스테이지',ja:'ステージ',en:'Stage'},
  palette:{base:'#c7bbd5',alt:'#d3c8dd',edge:'#62566c',path:'#626078',pathAlt:'#726b84',line:'#d5c9c4',detail:'#efdfaa',spawn:'#fbdb94'},
  vertices:[[2,2],[5,2],[5,3],[8,3],[8,7],[7,7],[7,9],[3,9],[3,8],[2,8],[2,5],[3,5],[3,3],[2,3]],
  landmarks:[{x:4,y:4},{x:5,y:4},{x:6,y:4},{x:4,y:5},{x:5,y:5},{x:6,y:5},{x:4,y:6},{x:5,y:6},{x:6,y:6}]},
 {id:'city',order:'03',w:11,h:12,theme:'street',names:{ko:'스트리트의 세카이',ja:'ストリートのセカイ',en:'Street SEKAI'},shortNames:{ko:'스트리트',ja:'ストリート',en:'Street'},
  palette:{base:'#b3ada4',alt:'#c3b7aa',edge:'#5b4e66',path:'#434c62',pathAlt:'#51566b',line:'#e4bd94',detail:'#e4b69a',spawn:'#efc07a'},
  vertices:[[2,2],[8,2],[8,5],[6,5],[6,7],[8,7],[8,10],[2,10],[2,8],[4,8],[4,6],[2,6]],
  landmarks:[{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:5,y:4},{x:5,y:6},{x:5,y:8},{x:6,y:9}]},
 {id:'wonderland',order:'04',w:11,h:12,theme:'wonderland',names:{ko:'원더랜드의 세카이',ja:'ワンダーランドのセカイ',en:'Wonderland SEKAI'},shortNames:{ko:'원더랜드',ja:'ワンダーランド',en:'Wonderland'},
  palette:{base:'#e7c6a5',alt:'#f2d6b2',edge:'#a67796',path:'#7d7796',pathAlt:'#9087a2',line:'#f4e5cc',detail:'#f4b2a1',spawn:'#ffe085'},
  vertices:[[2,2],[7,2],[7,4],[9,4],[9,9],[6,9],[6,10],[2,10],[2,7],[4,7],[4,5],[2,5]],
  landmarks:[{x:5,y:4},{x:5,y:5},{x:6,y:5},{x:5,y:6},{x:6,y:6},{x:7,y:7},{x:7,y:8}]},
 {id:'night',order:'05',w:11,h:12,theme:'empty',names:{ko:'아무도 없는 세카이',ja:'誰もいないセカイ',en:'Empty SEKAI'},shortNames:{ko:'아무도 없는',ja:'誰もいない',en:'Empty'},
  palette:{base:'#dddee5',alt:'#eaebef',edge:'#afb4c2',path:'#838a9d',pathAlt:'#9297a7',line:'#f4f3f1',detail:'#bfc1cc',spawn:'#dec5d2'},
  vertices:[[2,2],[8,2],[8,4],[7,4],[7,7],[8,7],[8,10],[3,10],[3,8],[2,8],[2,5],[4,5],[4,3],[2,3]],
  landmarks:[{x:5,y:4},{x:6,y:4},{x:5,y:6},{x:6,y:6},{x:5,y:8},{x:6,y:9}]},
 {id:'closedwindow',order:'06',w:11,h:12,theme:'closed',names:{ko:'닫힌 창의 세카이',ja:'閉ざされた窓のセカイ',en:'Closed Window SEKAI'},shortNames:{ko:'닫힌 창',ja:'閉ざされた窓',en:'Closed Window'},
  palette:{base:'#5b586b',alt:'#666174',edge:'#373745',path:'#777380',pathAlt:'#837b87',line:'#b8a9a7',detail:'#d9aaa6',spawn:'#e7a89e'},
  vertices:[[2,2],[8,2],[8,4],[6,4],[6,6],[8,6],[8,10],[3,10],[3,8],[2,8]],
  landmarks:[{x:4,y:3},{x:5,y:3},{x:4,y:5},{x:4,y:6},{x:4,y:8},{x:5,y:8},{x:6,y:8}]},
 {id:'openwindow',order:'07',w:11,h:12,theme:'open',names:{ko:'열린 창의 세카이',ja:'開かれた窓のセカイ',en:'Open Window SEKAI'},shortNames:{ko:'열린 창',ja:'開かれた窓',en:'Open Window'},
  palette:{base:'#d5dde4',alt:'#e8e5e4',edge:'#9cb6c2',path:'#83adb6',pathAlt:'#93bac0',line:'#f3e8d5',detail:'#f6dcc5',spawn:'#f3bd85'},
  vertices:[[2,2],[7,2],[7,3],[9,3],[9,8],[7,8],[7,10],[2,10],[2,7],[4,7],[4,5],[2,5]],
  landmarks:[{x:5,y:3},{x:5,y:4},{x:6,y:4},{x:5,y:6},{x:6,y:6},{x:5,y:8}]}

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
 for(const k of blockedSet)if(pathSet.has(k))throw Error(`Scenery blocking enemy route in ${m.id}: ${k}`);
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
