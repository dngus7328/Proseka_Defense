// A heart is discovered when its roster condition is met; after discovery it can fire periodically.
// It is not just a percentage buff: each heart launches a rendered area attack.
export const HEARTS=[
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
export const HEART_BY_ID=Object.fromEntries(HEARTS.map(h=>[h.id,h]));
export function getHeartParticipants(game,heart){
 const found=[];
 for(const id of heart.required){const candidates=game.units.filter(u=>u.id===id);if(!candidates.length)return null;found.push(candidates.reduce((a,b)=>b.star>a.star?b:a));}
 return found;
}
export function heartStrength(participants){const total=participants.reduce((a,u)=>a+u.star,0);const avg=total/participants.length;return {average:avg,scale:1+(avg-1)*.48,full:participants.every(u=>u.star===4)};}
