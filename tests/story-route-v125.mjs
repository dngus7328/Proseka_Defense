import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MAPS} from '../src/data/maps.js';
import {DIFFICULTIES} from '../src/data/enemies.js';
import {CHARACTER_BY_ID} from '../src/data/characters.js';
import {getOpening,getMissionStory,getMissionObjective,getEndStory} from '../src/data/storyScenes.js';
import {loadSave,persistSave} from '../src/core/Save.js';

assert.equal(MAPS.length,7);
assert.equal(DIFFICULTIES.length,5);
const chapters=new Set();
const speakers=new Set();
for(const lang of ['ko','ja','en']){
 const opening=getOpening(lang);
 assert.equal(opening.length,3,'prologue needs three connected beats');
 assert(opening.every(line=>line.speaker==='miku'&&line.text.length>10));
 for(const map of MAPS){
  assert(map.sekaiMembers.length>=4);
  for(const difficulty of DIFFICULTIES){
   const id=map.id+':'+difficulty.id;
   const first=getMissionStory(map.id,difficulty.id,true,true,lang);
   const knownWorld=getMissionStory(map.id,difficulty.id,false,true,lang);
   const repeat=getMissionStory(map.id,difficulty.id,false,false,lang);
   assert.equal(first.length,3,id+' needs two world lines and one difficulty line');
   assert.equal(knownWorld.length,1,id+' newly entered difficulty needs a different first line');
   assert.equal(repeat.length,0,id+' repeat play should not force dialogue');
   assert(first.every(line=>CHARACTER_BY_ID[line.speaker]&&line.text.length>=13),
    id+' scene must have a real speaker and readable localized dialogue');
   assert(getMissionObjective(map.id,lang).length>=13);
   assert.equal(first[2].text,knownWorld[0].text);
   const win=getEndStory(map.id,true,true,lang);
   const lose=getEndStory(map.id,false,false,lang);
   assert(CHARACTER_BY_ID[win.speaker]&&CHARACTER_BY_ID[lose.speaker]);
   assert(win.text.length>=12&&lose.text.length>=12&&win.text!==lose.text);
   if(lang==='ko'){
    chapters.add(first[2].text);speakers.add(first[0].speaker);
   }
  }
 }
}
assert.equal(chapters.size,35,'35 SEKAI/difficulty first-entry lines must be unique');
assert(speakers.size>=5,'world dialogues need the actual five music-unit leaders');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../src/ui/Interface.js',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles/story-route-v125.css',import.meta.url),'utf8');
const buttons=fs.readFileSync(new URL('../styles/interface-v125.css',import.meta.url),'utf8');
for(const id of ['storyOverlay','storyPortrait','storyContinue','storySkip','missionOverlay','missionMap','missionDeploy','missionBack','missionRoster','resultStoryLine','resultStoryPortrait','resultWorldTitle'])
 assert(html.includes('id="'+id+'"'),id+' should exist as a real UI element');
assert(ui.includes('this.storyFlow.beginPrologue()')&&ui.includes('this.storyFlow.startMission('),
 'first entry and start button must respect story route');
assert(main.includes('ui.storyFlow.startMission('),'next difficulty must respect new dialogue route');
assert(ui.includes('this.storyFlow?.renderResult(result)'),'result must show location-specific epilogue');
assert(css.includes('story-stage')&&css.includes('result-story'),'story and results need layouts');
assert(buttons.includes('summon-action')&&buttons.includes('square-action')&&buttons.includes('border-radius:var(--ui-radius)'),
 'buttons must share one design language');

let cache={};
globalThis.localStorage={
 getItem:key=>cache[key]||null,
 setItem:(key,value)=>{cache[key]=value;}
};
const save=loadSave();
assert.equal(save.story.introSeen,false,'migrate old saves safely');
save.story.introSeen=true;save.story.visitedSekai.push('roof');
save.story.visitedMission.push('roof:normal');
save.story.firstClear.push('roof:normal');
save.discovered.push('duo-any');
persistSave(save);
const restored=loadSave();
assert.equal(restored.story.introSeen,true);
assert.deepEqual(restored.story.visitedSekai,['roof']);
assert.deepEqual(restored.story.visitedMission,['roof:normal']);
assert.deepEqual(restored.story.firstClear,['roof:normal']);
assert.deepEqual(restored.discovered,['duo-any'],'old Heart discoveries must remain untouched');
console.log('OK — 3-beat Miku prologue, 35 unique first-difficulty SEKAI scenes, saved story and result dialogue');
