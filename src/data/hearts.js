// The full 331-entry Heart collection is retained. Availability and visual
// density are independently controlled per SEKAI. Generated pairings are
// noncanonical fan-game cooperative combinations, not official romances.
// A heart is discovered when its roster condition is met; after discovery it can fire periodically.
// It is not just a percentage buff: each heart launches a rendered area attack.
export const FEATURED_HEARTS=[
 {id:'leo-chorus',type:'group',group:'leo',required:['ichika','saki','honami','shiho'],names:{ko:'별을 잇는 선율',ja:'星をつなぐ旋律',en:'Starline Chorus'},style:'star',cooldown:19},
 {id:'mmj-stage',type:'group',group:'mmj',required:['minori','haruka','airi','shizuku'],names:{ko:'희망의 무대',ja:'希望のステージ',en:'Stage of Hope'},style:'rain',cooldown:20},
 {id:'vbs-beat',type:'group',group:'vbs',required:['kohane','an','akito','toya'],names:{ko:'비트 오버드라이브',ja:'ビート・オーバードライブ',en:'Beat Overdrive'},style:'slash',cooldown:17},
 {id:'wxs-final',type:'group',group:'wxs',required:['tsukasa','emu','nene','rui'],names:{ko:'원더풀 피날레',ja:'ワンダフル・フィナーレ',en:'Wonder Finale'},style:'burst',cooldown:18},
 {id:'n25-dawn',type:'group',group:'n25',required:['kanade','mafuyu','ena','mizuki'],names:{ko:'새벽을 밝히는 노래',ja:'夜明けを照らす歌',en:'Song at Dawn'},style:'wave',cooldown:20},
 {id:'vs-signal',type:'group',group:'vs',required:['miku','rin','len','luka','meiko','kaito'],names:{ko:'여섯 빛의 공명',ja:'六つの光の共鳴',en:'Sixfold Resonance'},style:'orbit',cooldown:19},
 {id:'star-siblings',type:'pair',required:['saki','tsukasa'],names:{ko:'별이 빛나는 무대',ja:'星が輝くステージ',en:'Starlit Stage'},style:'star',cooldown:16},
 {id:'sisters',type:'pair',required:['shiho','shizuku'],names:{ko:'자매의 화음',ja:'姉妹のハーモニー',en:'Sisters’ Harmony'},style:'wave',cooldown:16},
 {id:'colors',type:'pair',required:['akito','ena'],names:{ko:'충돌하는 색채',ja:'交差する色彩',en:'Crossing Colors'},style:'burst',cooldown:17},
 {id:'rooftop',type:'pair',required:['rui','mizuki'],names:{ko:'옥상의 가능성',ja:'屋上の可能性',en:'Rooftop Possibilities'},style:'orbit',cooldown:16},
 {id:'twins',type:'pair',required:['rin','len'],names:{ko:'거울의 선율',ja:'鏡の旋律',en:'Mirror Melody'},style:'slash',cooldown:15},
 {id:'miku-ichika',type:'pair',required:['miku','ichika'],names:{ko:'처음 울린 노래',ja:'始まりの歌',en:'The First Song'},style:'wave',cooldown:17},
 {id:'miku-kanade',type:'pair',required:['miku','kanade'],names:{ko:'이어지는 마음',ja:'つながる想い',en:'Connected Feelings'},style:'rain',cooldown:17},
 {id:'an-kohane',type:'pair',required:['an','kohane'],names:{ko:'비비드 하모니',ja:'ビビッド・ハーモニー',en:'Vivid Harmony'},style:'slash',cooldown:15},
 {id:'emu-nene',type:'pair',required:['emu','nene'],names:{ko:'깜짝 공연',ja:'びっくり公演',en:'Surprise Show'},style:'burst',cooldown:17},
 {id:'mafuyu-kanade',type:'pair',required:['mafuyu','kanade'],names:{ko:'침묵의 악보',ja:'沈黙の楽譜',en:'Silent Score'},style:'wave',cooldown:16},
];

// All combinations among the game's 26 roster members can be discovered.
// These are fan-game cooperative pair skills; the pairing does NOT imply an
// official romantic relationship or an endorsed fandom ship.
import {CHARACTERS} from './characters.js';
const PAIR_STYLES=['star','rain','slash','burst','wave','orbit'];
const featuredPairs=new Set(FEATURED_HEARTS.filter(h=>h.type==='pair')
 .map(h=>[...h.required].sort().join('+')));
const AUTO_PAIRS=[];
for(let i=0;i<CHARACTERS.length;i++){
 for(let j=i+1;j<CHARACTERS.length;j++){
  const first=CHARACTERS[i],second=CHARACTERS[j];
  const key=[first.id,second.id].sort().join('+');
  if(featuredPairs.has(key))continue;
  const sameGroup=first.group===second.group;
  const style=PAIR_STYLES[(i*7+j*11+(sameGroup?2:0))%PAIR_STYLES.length];
  AUTO_PAIRS.push({
   id:`duo-${first.id}-${second.id}`,
   type:'pair',isGenerated:true,
   required:[first.id,second.id],
   names:{
    ko:`${first.names.ko} × ${second.names.ko} · 공명`,
    ja:`${first.names.ja} × ${second.names.ja} · 共鳴`,
    en:`${first.names.en} × ${second.names.en} · Resonance`
   },
   style,cooldown:sameGroup?24:28
  });
 }
}
// Keep all 325 pair combinations plus six unit finales in the game.
export const HEARTS=[...FEATURED_HEARTS,...AUTO_PAIRS];
export const MAX_HEART_CHOICES_PER_SEKAI=10;
export const MAX_HEART_CASTS_PER_MATCH=10;
export const MIN_HEART_INTERVAL_SECONDS=16;
// A heart belongs to a SEKAI if its group is that SEKAI or if at least one
// of its cooperating members is from that SEKAI. This lets cross-unit bonds
// exist in either member's world without claiming a canonical romantic pair.
export function heartMatchesSekai(heart,map){
 const group=typeof map==='string'?map:map?.affinityGroup;
 if(!group)return false;
 if(heart.type==='group')return heart.group===group;
 return heart.required.some(id=>CHARACTERS.some(ch=>ch.id===id&&ch.group===group));
}
export function heartsAvailableInSekai(map){
 return HEARTS.filter(h=>heartMatchesSekai(h,map));
}
// At most ten plausible, actually-deployed combinations are candidates for
// casting on this map. The pool adjusts when the team composition changes,
// so the other 321 collection entries are never deleted or made impossible.
export function activeHeartsForGame(game,max=MAX_HEART_CHOICES_PER_SEKAI){
 const group=game.map?.affinityGroup;
 const candidates=[];
 for(const heart of heartsAvailableInSekai(game.map)){
  const actors=getHeartParticipants(game,heart);
  if(!actors)continue;
  const sameSekai=heart.required.every(id=>
   CHARACTERS.some(c=>c.id===id&&c.group===group));
  const score=(heart.type==='group'?100000:!heart.isGenerated?10000:100)
   +(sameSekai?120:0)
   +heartStrength(actors).average*5;
  candidates.push({heart,actors,score});
 }
 candidates.sort((a,b)=>b.score-a.score||a.heart.id.localeCompare(b.heart.id));
 return candidates.slice(0,max);
}
export const HEART_BY_ID=Object.fromEntries(HEARTS.map(h=>[h.id,h]));
export function getHeartParticipants(game,heart){
 const found=[];
 for(const id of heart.required){const candidates=game.units.filter(u=>u.id===id);if(!candidates.length)return null;found.push(candidates.reduce((a,b)=>b.star>a.star?b:a));}
 return found;
}
export function heartStrength(participants){const total=participants.reduce((a,u)=>a+u.star,0);const avg=total/participants.length;return {average:avg,scale:1+(avg-1)*.48,full:participants.every(u=>u.star===4)};}
