import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BGM_TRACKS,bgmForMap,bgmForScene,MUSIC_CREDITS} from '../src/data/musicTracks.js';
import {MusicDirector} from '../src/core/MusicDirector.js';
const eight=['title','lobby','boss','roof','stage','city','wonderland','night','closedwindow','openwindow'];
for(const key of eight){
 const info=BGM_TRACKS[key];
 assert(info?.ogg.endsWith('/'+(key==='lobby'?'main':key)+'.ogg'));
 assert(info?.mp3.endsWith('/'+(key==='lobby'?'main':key)+'.mp3'));
}
assert.equal(Object.keys(MUSIC_CREDITS).length,10);
assert.notDeepEqual(bgmForMap('closedwindow'),bgmForScene('lobby'));
assert(bgmForMap('closedwindow').ogg.endsWith('closedwindow.ogg'));
assert.notDeepEqual(bgmForMap('openwindow'),bgmForScene('lobby'));
assert(bgmForMap('openwindow').ogg.endsWith('openwindow.ogg'));
let instances=[];
class FakeAudio{
 constructor(){this.paused=true;this.volume=1;this.currentTime=0;this.listeners={};this.dataset={};instances.push(this);}
 addEventListener(type,fn){this.listeners[type]=fn;}
 play(){this.paused=false;return Promise.resolve();}
 pause(){this.paused=true;}
 load(){}
 removeAttribute(){}
}
globalThis.Audio=FakeAudio;
globalThis.document={createElement:()=>({canPlayType:()=>''})};
const music=new MusicDirector(()=>null,()=>.35,()=>.55);
music.playScene('title');
assert.equal(music.currentScene,'title');
assert.equal(music.audio.loop,true);
assert(music.audio.src.endsWith('/title.mp3'));
music.playScene('lobby');
assert.equal(music.currentScene,'lobby');
assert.equal(music.mapId,null);
music.start('roof');
assert.equal(music.mapId,'roof');
assert.equal(music.currentScene,'roof');
const regular=music.audio;
regular.currentTime=37.8;
music.setBossActive(true);
assert.equal(music.currentScene,'boss');
assert.equal(regular.paused,true);
music.setBossActive(true);
assert.equal(music.currentScene,'boss');
music.setBossActive(false);
assert.equal(music.currentScene,'roof');
assert.equal(music.audio,regular);
assert.equal(regular.currentTime,37.8,'normal SEKAI music should resume from where it left off');
music.pause(true);
assert.equal(music.audio.paused,true);
music.pause(false);
assert.equal(music.audio.paused,false);
music.stop();
assert.equal(music.audio,null);
assert.equal(music.players.size,0);
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../src/ui/Interface.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert(main.includes('sound.setBossActive(game.enemies.some'));
assert(ui.includes("this.sound.playScene('title')"));
assert(ui.includes("this.sound.playScene('lobby')"));
assert(html.includes('id="musicVolumeRange"'));
assert(html.includes('id="musicVolumeValue"'));
assert(html.includes('id="effectVolumeValue"'));
assert(html.includes('game-polish-v128.css'));
console.log('OK — 10 submitted tracks mapped; gapless sources, title/lobby/SEKAI/boss switching and volume control wired');
