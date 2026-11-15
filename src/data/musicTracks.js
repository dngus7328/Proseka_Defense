// Author-supplied recordings (8 separate BGM masters) prepared as gapless,
// circular-crossfaded loop assets. .ogg is preferred on compatible browsers;
// .mp3 is the fallback for Safari and other devices.
//
// Maps without a submitted dedicated track use the general stage/lobby music.
// Do not substitute generated tracks, reuse a different SEKAI song, or alter
// an existing voice/character asset.
const audio=(key)=>Object.freeze({
 ogg:'./Assets/music/'+key+'.ogg',
 mp3:'./Assets/music/'+key+'.mp3'
});
export const BGM_TRACKS=Object.freeze({
 title:audio('title'),
 lobby:audio('main'),
 main:audio('main'),
 boss:audio('boss'),
 roof:audio('roof'),              // Leo/need
 stage:audio('stage'),            // MORE MORE JUMP!
 city:audio('city'),              // Vivid BAD SQUAD
 wonderland:audio('wonderland'),  // Wonderlands x Showtime
 night:audio('night'),            // 25-ji, Nightcord de.
 closedwindow:audio('main'),      // No dedicated movie-world track supplied
 openwindow:audio('main')         // No dedicated movie-world track supplied
});
export function bgmForMap(mapId){return BGM_TRACKS[mapId]||BGM_TRACKS.main;}
export function bgmForScene(scene){return BGM_TRACKS[scene]||BGM_TRACKS.main;}
export const MUSIC_CREDITS=Object.freeze({
 title:'브금_타이틀.mp3',lobby:'브금_메인.mp3',boss:'브금_보스.mp3',
 roof:'브금_레오니(1).mp3',stage:'브금_모모점(1).mp3',city:'브금_비베스(1).mp3',
 wonderland:'브금_원더쇼(1).mp3',night:'브금_니고(1).mp3'
});
