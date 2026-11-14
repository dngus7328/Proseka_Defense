// Game-only combat profiles. Character names are used as identifiers for this noncommercial fan prototype.
export const GROUPS = [
  { id:'leo', short:'Leo/need', color:'#77a8e9', names:{ko:'Leo/need',ja:'Leo/need',en:'Leo/need'} },
  { id:'mmj', short:'MORE MORE JUMP!', color:'#93d1a3', names:{ko:'MORE MORE JUMP!',ja:'MORE MORE JUMP!',en:'MORE MORE JUMP!'} },
  { id:'vbs', short:'Vivid BAD SQUAD', color:'#ef9980', names:{ko:'Vivid BAD SQUAD',ja:'Vivid BAD SQUAD',en:'Vivid BAD SQUAD'} },
  { id:'wxs', short:'Wonderlands × Showtime', color:'#edc17d', names:{ko:'원더랜즈×쇼타임',ja:'ワンダーランズ×ショウタイム',en:'Wonderlands × Showtime'} },
  { id:'n25', short:'Nightcord', color:'#b29edb', names:{ko:'25시, 나이트코드에서.',ja:'25時、ナイトコードで。',en:'Nightcord at 25:00'} },
  { id:'vs', short:'VIRTUAL SINGER', color:'#7dd5cd', names:{ko:'버츄얼 싱어',ja:'バーチャル・シンガー',en:'VIRTUAL SINGER'} }
];
const row=(id,group,ko,ja,en,hair,cloth,attack,atk,rate,range,style)=>({id,group,names:{ko,ja,en},hair,cloth,attack,atk,rate,range,style});
export const CHARACTERS=[
 row('ichika','leo','이치카','一歌','Ichika','#333d5d','#6c91a8','pierce',14,1.2,3.1,1),
 row('saki','leo','사키','咲希','Saki','#e1c486','#839fc1','burst',12,1.5,2.8,2),
 row('honami','leo','호나미','穂波','Honami','#9b6e69','#8aa5be','splash',12,1.6,2.9,3),
 row('shiho','leo','시호','志歩','Shiho','#9b9a95','#78949f','rapid',9,0.85,2.7,4),
 row('minori','mmj','미노리','みのり','Minori','#bb855f','#e2a4a8','bounce',11,1.25,2.7,2),
 row('haruka','mmj','하루카','遥','Haruka','#49577f','#87aec7','pierce',12,1.3,3.2,1),
 row('airi','mmj','아이리','愛莉','Airi','#e29aa9','#d78896','burst',14,1.5,2.3,3),
 row('shizuku','mmj','시즈쿠','雫','Shizuku','#b8afc5','#87baa6','slow',10,1.55,3.4,4),
 row('kohane','vbs','코하네','こはね','Kohane','#c6b0a3','#b8a1cb','rapid',10,0.95,2.6,2),
 row('an','vbs','안','杏','An','#2c5370','#99b0c9','chain',12,1.2,2.9,1),
 row('akito','vbs','아키토','彰人','Akito','#b57651','#c99b68','burst',16,1.5,2.45,3),
 row('toya','vbs','토우야','冬弥','Toya','#526a9b','#7598b8','pierce',14,1.45,3.55,4),
 row('tsukasa','wxs','츠카사','司','Tsukasa','#cba860','#e0a27c','splash',17,1.6,2.75,2),
 row('emu','wxs','에무','えむ','Emu','#ec9da8','#d6b68c','burst',12,1.45,2.8,3),
 row('nene','wxs','네네','寧々','Nene','#9fbc9d','#b5c6bb','slow',11,1.35,3.05,4),
 row('rui','wxs','루이','類','Rui','#986fba','#ae9ac0','chain',12,1.4,3.15,1),
 row('kanade','n25','카나데','奏','Kanade','#d6d4de','#afb3c6','splash',12,1.6,3.25,4),
 row('mafuyu','n25','마후유','まふゆ','Mafuyu','#4c4f82','#9ba2b7','slow',11,1.45,2.9,1),
 row('ena','n25','에나','絵名','Ena','#634e52','#c0a39f','burst',14,1.4,2.8,3),
 row('mizuki','n25','미즈키','瑞希','Mizuki','#dba3ba','#b6a4c8','bounce',11,1.15,2.85,2),
 row('miku','vs','미쿠','ミク','Miku','#62b6ad','#8ac7c1','chain',13,1.25,3.25,1),
 row('rin','vs','린','リン','Rin','#e9c772','#dfc48c','rapid',10,0.85,2.55,2),
 row('len','vs','렌','レン','Len','#dabb64','#c8ab7d','pierce',13,1.3,3.3,2),
 row('luka','vs','루카','ルカ','Luka','#dfa4b5','#b9a5bc','bounce',12,1.35,3.0,3),
 row('meiko','vs','MEIKO','MEIKO','MEIKO','#8c4b4e','#c07d73','burst',18,1.75,2.45,4),
 row('kaito','vs','KAITO','KAITO','KAITO','#48699e','#8aa5c1','slow',12,1.5,3.1,1)
];
export const CHARACTER_BY_ID=Object.fromEntries(CHARACTERS.map(c=>[c.id,c]));
export const GROUP_BY_ID=Object.fromEntries(GROUPS.map(g=>[g.id,g]));
// Each character's recognizable attack motif and periodic combat signature.
// Assets stay untouched: the differentiation is procedural effects and actual attack behavior.
export const SIGNATURES={
 "ichika":{motif:"string",kind:"sweep",every:4,power:1,names:{ko:"직선 공명",ja:"まっすぐな共鳴",en:"Straight Resonance"}},
 "saki":{motif:"spark",kind:"blast",every:4,power:0.83,names:{ko:"별빛 폭발",ja:"星のきらめき",en:"Starburst"}},
 "honami":{motif:"drum",kind:"ripple",every:5,power:0.74,names:{ko:"잔향 파동",ja:"余韻の波",en:"Resonant Wave"}},
 "shiho":{motif:"bass",kind:"repeat",every:5,power:0.9,names:{ko:"박자 연타",ja:"ビート連打",en:"Bass Drive"}},
 "minori":{motif:"cheer",kind:"chain",every:5,power:0.83,names:{ko:"점프 스텝",ja:"ジャンプステップ",en:"Jump Step"}},
 "haruka":{motif:"crystal",kind:"sweep",every:5,power:1.22,names:{ko:"푸른 화음",ja:"青のハーモニー",en:"Blue Harmony"}},
 "airi":{motif:"pom",kind:"blast",every:4,power:1.04,names:{ko:"반짝 피날레",ja:"きらめくフィナーレ",en:"Bright Finale"}},
 "shizuku":{motif:"rain",kind:"chill",every:4,power:0.74,names:{ko:"물결의 숨",ja:"静かな波紋",en:"Quiet Ripple"}},
 "kohane":{motif:"microphone",kind:"repeat",every:4,power:0.75,names:{ko:"작은 비트",ja:"小さなビート",en:"Tiny Beat"}},
 "an":{motif:"graffiti",kind:"chain",every:4,power:1,names:{ko:"도약하는 소리",ja:"跳ねる音",en:"Rising Beat"}},
 "akito":{motif:"flame",kind:"smash",every:4,power:1.28,names:{ko:"뜨거운 비트",ja:"熱いビート",en:"Burning Beat"}},
 "toya":{motif:"keyboard",kind:"chill",every:5,power:1.12,names:{ko:"차가운 코드",ja:"冷たいコード",en:"Cold Chord"}},
 "tsukasa":{motif:"spotlight",kind:"smash",every:4,power:1.55,names:{ko:"스타 피니시",ja:"スター・フィニッシュ",en:"Star Finish"}},
 "emu":{motif:"confetti",kind:"blast",every:4,power:0.96,names:{ko:"원더 팡!",ja:"ワンダーポップ！",en:"Wonder Pop!"}},
 "nene":{motif:"robot",kind:"chill",every:5,power:0.8,names:{ko:"스톱 비트",ja:"ストップビート",en:"Stop Beat"}},
 "rui":{motif:"gear",kind:"chain",every:4,power:1.18,names:{ko:"기묘한 장치",ja:"不思議な仕掛け",en:"Odd Contraption"}},
 "kanade":{motif:"sheet",kind:"ripple",every:4,power:1,names:{ko:"새벽의 선율",ja:"夜明けの旋律",en:"Dawn Melody"}},
 "mafuyu":{motif:"frost",kind:"chill",every:4,power:1,names:{ko:"고요한 울림",ja:"静かな響き",en:"Quiet Echo"}},
 "ena":{motif:"paint",kind:"blast",every:4,power:0.95,names:{ko:"컬러 스트로크",ja:"カラーストローク",en:"Color Stroke"}},
 "mizuki":{motif:"ribbon",kind:"chain",every:5,power:0.9,names:{ko:"리본 리듬",ja:"リボンのリズム",en:"Ribbon Rhythm"}},
 "miku":{motif:"note",kind:"chain",every:4,power:1.05,names:{ko:"미래의 노래",ja:"未来の歌",en:"Tomorrow's Song"}},
 "rin":{motif:"bell",kind:"repeat",every:4,power:0.78,names:{ko:"벨 스텝",ja:"ベルステップ",en:"Bell Step"}},
 "len":{motif:"slash",kind:"sweep",every:4,power:1.16,names:{ko:"날카로운 음",ja:"鋭い音",en:"Sharp Note"}},
 "luka":{motif:"echo",kind:"ripple",every:4,power:0.88,names:{ko:"부드러운 잔향",ja:"優しい余韻",en:"Soft Echo"}},
 "meiko":{motif:"rose",kind:"smash",every:5,power:1.62,names:{ko:"강렬한 후렴",ja:"力強いサビ",en:"Power Chorus"}},
 "kaito":{motif:"snow",kind:"chill",every:4,power:0.95,names:{ko:"눈빛 포옹",ja:"雪のコーラス",en:"Snow Chorus"}}
};
export const STAR_SCALE=[1,1.10,1.20,1.30];
export function attackValue(hero,upgrades){let c=CHARACTER_BY_ID[hero.id];return Math.round(c.atk*(1+1.05*(hero.star-1)+.29*(upgrades.attack||0)));}
export function attackInterval(hero,upgrades){let c=CHARACTER_BY_ID[hero.id];return Math.max(.25,c.rate/(1+.13*(upgrades.speed||0)+.085*(hero.star-1)));}
export function attackRange(hero){return CHARACTER_BY_ID[hero.id].range+.11*(hero.star-1);}
