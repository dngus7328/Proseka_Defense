import fs from 'node:fs';
import assert from 'node:assert/strict';
const sourceFiles=[
 'arcade.css','mobile-v16.css','skill-cutin.css','gameplay-v21.css',
 'title-intro.css','title-stage-v3.css','battle-experience-v1.css',
 'gameplay-v118.css','skill-cinema-v118.css','skill-topbar-v119.css',
 'heart-clarity-v120.css','map-tap-v119.css',
 'heart-skills-v121.css','sekai-rosters-v122.css','title-game-v121.css',
 'heart-world-v123.css','heart-collection-v124.css','interface-v125.css',
 'story-route-v125.css','presentation-v126.css','system-copy-v127.css',
 'game-polish-v128.css','settings-fix-v129.css','play-first-v132.css'
];
assert.equal(sourceFiles.length,24);
const read=(path)=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const assemble=(files)=>'/* BUNDLED CSS — ORDER PRESERVED from index.html, v1.34 — DO NOT HAND EDIT. */\n'+files.map(name=>{
 const file='styles/'+name;
 return '\n/* ===== SOURCE '+file+' ===== */\n'+read(file)+'\n/* ===== END '+file+' ===== */\n';
}).join('');
assert.equal(read('styles/bundle-core-v134.css'),assemble(sourceFiles.slice(0,12)));
assert.equal(read('styles/bundle-overrides-v134.css'),assemble(sourceFiles.slice(12)));
const html=read('index.html');
assert.equal([...html.matchAll(/<link\s+rel="stylesheet"\s+href="\.\/styles\//g)].length,2);
assert(html.indexOf('bundle-core-v134.css')<html.indexOf('bundle-overrides-v134.css'));
assert(!html.includes('styles/arcade.css'));
assert(!html.includes('styles/play-first-v132.css'));
console.log('OK — all 24 CSS sources are concatenated unchanged in original order, with exactly 2 stylesheet requests');
