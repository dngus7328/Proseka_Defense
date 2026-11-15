// Suno tracks are supplied by the project author. No synthesized backing
// score is shipped with the game. Leave entries null until approved audio
// has been exported and added to Assets/music/.
export const BGM_TRACKS=Object.freeze({
 roof:null,
 stage:null,
 city:null,
 wonderland:null,
 night:null,
 closedwindow:null,
 openwindow:null
});
export function bgmForMap(mapId){return BGM_TRACKS[mapId]||null;}

// Suggested approved-file layout when Suno masters are ready:
// roof: './Assets/music/roof.mp3',
// stage: './Assets/music/stage.mp3',
// city: './Assets/music/city.mp3',
// wonderland: './Assets/music/wonderland.mp3',
// night: './Assets/music/night.mp3',
// closedwindow: './Assets/music/closedwindow.mp3',
// openwindow: './Assets/music/openwindow.mp3'
