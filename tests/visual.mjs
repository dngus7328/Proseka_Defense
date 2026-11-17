// Real browser smoke walkthrough, intentionally separate from pure logic tests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:4173';
fs.mkdirSync('artifacts',{recursive:true});
const views=[
 {name:'portrait-small',width:320,height:568},
 {name:'portrait',width:390,height:844},
 {name:'landscape-small',width:667,height:375},
 {name:'landscape',width:844,height:390},
 {name:'desktop',width:1366,height:768}
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const summary=[];
try{
 for(const vp of views){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1,hasTouch:true});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await page.goto(origin+'/?ci=1&visual=1',{waitUntil:'networkidle',timeout:60000});
  await page.locator('#acceptNotice').click({timeout:12000});
  const artReady=()=>{const b=document.getElementById('titleBackdrop');
   return b?.classList.contains('art-ready')
    &&[...b.querySelectorAll('.title-layer')].every(i=>i.complete&&i.naturalWidth>0)
    &&document.getElementById('titleLanguageLogo')?.naturalWidth>0;};
  try{await page.waitForFunction(artReady,null,{timeout:17000});}
  catch(error){
   const status=await page.evaluate(()=>({
    backdrop:document.getElementById('titleBackdrop')?.className,
    titleClass:document.getElementById('titleOverlay')?.className,
    images:[...document.querySelectorAll('#titleBackdrop .title-layer')].map(i=>({src:i.src,complete:i.complete,width:i.naturalWidth})),
    logo:{src:document.getElementById('titleLanguageLogo')?.src,width:document.getElementById('titleLanguageLogo')?.naturalWidth}
   }));
   throw new Error(vp.name+' title art failed to load: '+JSON.stringify(status)+'; '+error);
  }
  await page.locator('#titleSkipIntro').evaluate(e=>e.click());
  await page.waitForTimeout(100);
  // Preserve the artist's character group exactly once. The experimental
  // portrait collage must not return, on mobile or landscape.
  const titleArt=await page.evaluate(()=>{
   const chars=document.querySelectorAll('#titleBackdrop .title-characters');
   const el=chars[0];
   return {count:chars.length,extraCanvas:!!document.getElementById('titlePortraitCrowd'),
    display:el&&getComputedStyle(el).display,ready:!!el?.naturalWidth};
  });
  assert(titleArt.count===1&&!titleArt.extraCanvas&&titleArt.display!=='none'&&titleArt.ready,
   vp.name+' duplicate title art detected: '+JSON.stringify(titleArt));
  const titleBounds=await page.evaluate(()=>{
   const ids=['titleLanguageLogo','titleEnter','titleHearts','titleSettings'];
   return Object.fromEntries(ids.map(id=>{
    const el=document.getElementById(id),r=el.getBoundingClientRect();
    return [id,{x:r.x,y:r.y,w:r.width,h:r.height}];
   }));
  });
  for(const [id,r] of Object.entries(titleBounds))
   assert(r.w>30&&r.h>20&&r.x>=-2&&r.y>=-2&&r.x+r.w<=vp.width+2&&r.y+r.h<=vp.height+2,
    vp.name+' title has clipped '+id+': '+JSON.stringify(r));
  await page.screenshot({path:path.join('artifacts',vp.name+'-title.png')});

  assert((await page.locator('#titleOverlay .title-copy p').textContent()).length>=20,
   vp.name+' new title action panel copy is missing');


  // Opening settings from the title MUST retain the title artwork behind
  // the settings scrim; the hidden battle app must not become its background.
  await page.locator('#titleSettings').click({timeout:12000});
  const titleSettings=await page.evaluate(()=>{
   const title=document.getElementById('titleOverlay'),
    settings=document.getElementById('settingsOverlay'),
    slider=document.getElementById('musicVolumeRange'),
    value=document.getElementById('musicVolumeValue'),
    label=document.querySelector('label[for="musicVolumeRange"]'),
    r=slider.getBoundingClientRect();
   return {titleVisible:title.classList.contains('visible'),
    settingsVisible:settings.classList.contains('visible'),
    label:label.textContent.trim(),value:value.textContent.trim(),
    rect:{x:r.x,y:r.y,w:r.width,h:r.height},
    settingsZ:getComputedStyle(settings).zIndex,titleZ:getComputedStyle(title).zIndex};
  });
  assert(titleSettings.titleVisible&&titleSettings.settingsVisible,
   vp.name+' settings expose the gameplay backdrop instead of title: '+JSON.stringify(titleSettings));
  assert(titleSettings.label==='BGM 음량'&&titleSettings.value==='55%',
   vp.name+' localized BGM setting not displayed: '+JSON.stringify(titleSettings));
  const sr=titleSettings.rect;
  assert(sr.w>=55&&sr.h>=15&&sr.x>=0&&sr.y>=0&&sr.x+sr.w<=vp.width+1&&sr.y+sr.h<=vp.height+1,
   vp.name+' BGM slider is outside the settings window: '+JSON.stringify(titleSettings));
  await page.locator('#musicVolumeRange').evaluate(e=>{
   e.value='73';e.dispatchEvent(new Event('input',{bubbles:true}));
  });
  assert.equal((await page.locator('#musicVolumeValue').textContent()).trim(),'73%',
   vp.name+' music slider output failed to update');
  assert.equal(await page.evaluate(()=>window.__sekaiTest.getUI().save.musicVolume),73,
   vp.name+' BGM volume was not saved');
  await page.screenshot({path:path.join('artifacts',vp.name+'-title-settings.png')});
  await page.locator('#settingsOverlay .close-dialog').click({timeout:12000});
  assert(await page.locator('#titleOverlay').evaluate(e=>e.classList.contains('visible')),
   vp.name+' did not return to title after settings');
  assert(!await page.locator('#settingsOverlay').evaluate(e=>e.classList.contains('visible')),
   vp.name+' settings did not close');

  await page.locator('#titleEnter').click({timeout:12000});
  assert(await page.locator('#storyOverlay').evaluate(e=>e.classList.contains('visible')),
   vp.name+' first-time Miku story never opened');
  assert((await page.locator('#storyLine').textContent()).length>=15,
   vp.name+' story opening was empty');
  await page.screenshot({path:path.join('artifacts',vp.name+'-story-opening.png')});
  await page.locator('#storyContinue').click({timeout:12000});
  assert((await page.locator('#storyIndex').textContent()).startsWith('02'),
   vp.name+' story cannot advance');
  await page.locator('#storySkip').click({timeout:12000});
  assert(await page.locator('#lobbyOverlay').evaluate(e=>e.classList.contains('visible')),
   vp.name+' did not reach SEKAI selection after story');
  await page.waitForFunction(()=>{
   const list=[...document.querySelectorAll('#lobbyTeamPreview img')];
   return list.length===4&&list.every(img=>img.complete&&img.naturalWidth>0);
  },null,{timeout:12000});
  await page.waitForTimeout(520);
  await page.screenshot({path:path.join('artifacts',vp.name+'-lobby.png')});

  const selectionLayout=await page.evaluate(()=>{
   const list=document.getElementById('mapChoices');
   const first=list.querySelector('.map-choice'),r=first.getBoundingClientRect(),
    art=document.querySelector('.lobby-art').getBoundingClientRect(),
    title=document.querySelector('.lobby-content-heading').getBoundingClientRect();
   return {columns:getComputedStyle(list).gridTemplateColumns,
    first:{x:r.x,y:r.y,w:r.width,h:r.height},
    art:{x:art.x,y:art.y,w:art.width,h:art.height},
    heading:{x:title.x,y:title.y,w:title.width,h:title.height},
    screen:{scrollWidth:document.documentElement.scrollWidth,width:innerWidth}};
  });
  assert(await page.locator('#lobbyOverlay').evaluate(e=>e.dataset.theme==='school'),
   vp.name+' lobby scene palette did not match the selected SEKAI');
  assert(selectionLayout.columns.includes('px')&&selectionLayout.columns.trim().split(/\s+/).length>=2,
   vp.name+' world selection is not a card grid: '+JSON.stringify(selectionLayout));
  assert(selectionLayout.first.w>70&&selectionLayout.first.h>=40,
   vp.name+' new SEKAI cards are too small: '+JSON.stringify(selectionLayout));
  assert(selectionLayout.heading.w>140&&selectionLayout.art.h>=100,
   vp.name+' stage preparation screen lost the world preview: '+JSON.stringify(selectionLayout));


  await page.locator('#lobbySettings').click({timeout:12000});
  assert(await page.locator('#lobbyOverlay').evaluate(e=>e.classList.contains('visible')),
   vp.name+' lobby settings lost the lobby background');
  assert((await page.locator('#musicVolumeValue').textContent()).trim()==='73%',
   vp.name+' saved BGM volume not restored in lobby settings');
  await page.locator('#settingsOverlay .close-dialog').click({timeout:12000});
  assert(await page.locator('#lobbyOverlay').evaluate(e=>e.classList.contains('visible')),
   vp.name+' closing lobby settings did not restore the lobby');

  for(const area of ['closedwindow','openwindow','stage','wonderland','city','roof']){
   await page.locator(`#mapChoices .map-choice[data-map-id="${area}"]`).click({timeout:9000});
   const preview=await page.evaluate(()=>{
    const el=document.getElementById('lobbyPreview');
    const data=el.getContext('2d').getImageData(0,0,el.width,el.height).data;
    const colors=new Set();
    for(let i=0;i<data.length;i+=16*4)colors.add([data[i]>>5,data[i+1]>>5,data[i+2]>>5].join(':'));
    return {width:el.width,height:el.height,colors:colors.size,
     theme:document.getElementById('app').dataset.theme,
     overlay:document.getElementById('lobbyOverlay').classList.contains('visible')};
   });
   const paletteMinimum=(area==='closedwindow'||area==='openwindow')?11:16;
   assert(preview.overlay&&preview.width>100&&preview.height>100&&preview.colors>=paletteMinimum,
    vp.name+' map '+area+' blank / solid-blue lobby preview: '+JSON.stringify(preview));
   if(area==='closedwindow'||area==='openwindow'){
    await page.waitForFunction(()=>{
     const faces=[...document.querySelectorAll('#lobbyTeamPreview img')];
     return faces.length===6&&faces.every(img=>img.complete&&img.naturalWidth>0);
    },null,{timeout:12000});
    const roster=await page.locator('#lobbyTeamPreview img').evaluateAll(els=>els.map(e=>({
     x:e.getBoundingClientRect().x,w:e.getBoundingClientRect().width,alt:e.alt
    })));
    assert(roster.length===6&&roster.every(r=>r.w>18&&r.x>=-2&&r.x+r.w<=vp.width+2),
     vp.name+' '+area+' has cropped/missing singers: '+JSON.stringify(roster));
    await page.screenshot({path:path.join('artifacts',vp.name+'-'+area+'-six-singers.png')});
   }
  }
  await page.screenshot({path:path.join('artifacts',vp.name+'-lobby-switched.png')});
  await page.locator('#startButton').click({timeout:12000});
  assert(await page.locator('#storyOverlay').evaluate(e=>e.classList.contains('visible')),
   vp.name+' first SEKAI/difficulty dialogue did not play');
  assert((await page.locator('#storySpeaker').textContent()).length>=2,
   vp.name+' SEKAI speaker is missing');
  await page.screenshot({path:path.join('artifacts',vp.name+'-sekai-first-entry.png')});
  await page.locator('#storySkip').click({timeout:12000});
  assert(await page.locator('#missionOverlay').evaluate(e=>e.classList.contains('visible')),
   vp.name+' mission briefing was skipped');
  const briefing=await page.evaluate(()=>({
    name:document.getElementById('missionWorldName').textContent,
    roster:document.querySelectorAll('#missionRoster .mission-member').length,
    objective:document.getElementById('missionObjective').textContent,
    mapPixels:document.getElementById('missionMap').width
  }));
  assert(briefing.roster===4&&briefing.objective.length>12&&briefing.mapPixels>100,
   vp.name+' mission briefing incomplete: '+JSON.stringify(briefing));
  await page.screenshot({path:path.join('artifacts',vp.name+'-mission-briefing.png')});
  await page.locator('#missionDeploy').click({timeout:12000});
  await page.waitForFunction(()=>window.__sekaiTest?.getGame()?.phase==='playing',{timeout:10000});
  await page.locator('#summonButton').click({timeout:12000});
  await page.waitForFunction(()=>window.__sekaiTest.getGame().units.length>=1,{timeout:10000});
  await page.screenshot({path:path.join('artifacts',vp.name+'-battle.png')});

  // SEKAI-first display should have a real character lineup rather than the
  // previous empty admin panel. Standby is supplied by existing sprite assets.
  if(vp.name==='desktop'){
   const roster=await page.locator('#reservePreview .reserve-member').count();
   assert.equal(roster,4,vp.name+' missing real SEKAI standby portraits');
   const images=await page.locator('#reservePreview img').evaluateAll(nodes=>nodes.map(e=>e.naturalWidth));
   assert(images.every(w=>w>0),vp.name+' member images failed to load');
   const palette=await page.locator('.app').evaluate(el=>getComputedStyle(el).getPropertyValue('--ui-accent').trim());
   assert(/^#/.test(palette),vp.name+' SEKAI accent palette was not applied');
  }
  const structuralBattle=await page.evaluate(()=>{
   const box=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
   return {
    command:box('.command-deck-head'),
    leftRoster:box('.team-strip'),
    rightInfo:box('.selection-panel'),
    rightActions:box('.main-actions'),
    board:box('.board-frame'),
    chapter:document.getElementById('commandWorldName').textContent,
    situation:document.getElementById('deckSituation').textContent,
    view:{w:innerWidth,h:innerHeight}
   };
  });
  if(vp.name==='desktop'){
   const {command,leftRoster,rightInfo,rightActions,board}=structuralBattle;
   assert(command.w>=200&&rightInfo.w>=200&&rightActions.w>=200,
    'Compact game HUD pieces missing: '+JSON.stringify(structuralBattle));
   assert(command.x+command.w<board.x-8&&leftRoster.x+leftRoster.w<board.x-8,
    'Left game information obscures the play field: '+JSON.stringify(structuralBattle));
   assert(rightInfo.x>board.x+board.w+8&&rightActions.x>board.x+board.w+8,
    'Right contextual actions obscure the play field: '+JSON.stringify(structuralBattle));
   assert(board.w>450,
    'Game board is not visually dominant: '+JSON.stringify(structuralBattle));
   assert(structuralBattle.chapter.includes('세카이')&&structuralBattle.situation.length>15,
    'World-specific gameplay data missing: '+JSON.stringify(structuralBattle));
  }

  // The separate map sign is retired. The compact left world header
  // command header now carries the world crest and localized world name.
  if(vp.name==='desktop'){
   const command=await page.evaluate(()=>({
    crest:document.getElementById('commandWorldCrest').naturalWidth,
    name:document.getElementById('commandWorldName').textContent,
    panel:getComputedStyle(document.querySelector('.command-deck-head')).display
   }));
   assert(command.crest>0&&command.name.includes('세카이')&&command.panel!=='none',
    'Desktop command header must replace the obsolete floating plaque: '+JSON.stringify(command));
  }

  // The upgrade sheet must explain the mechanics, not just show labels and prices.
  await page.locator('#upgradeToggle').click({timeout:12000});
  await page.waitForFunction(()=>document.getElementById('app').classList.contains('upgrade-open'));
  const upgradedCopy=await page.locator('#upgradeGrid .upgrade-card').evaluateAll(cards=>cards.map(card=>({
   name:card.querySelector('.upgrade-card-name')?.textContent,
   details:card.querySelector('.upgrade-card-description')?.textContent,
   progress:card.querySelector('.upgrade-card-progress')?.textContent
  })));
  assert.equal(upgradedCopy.length,4,vp.name+' four upgrade options must be visible');
  assert(upgradedCopy.every(item=>item.details?.length>28&&item.progress?.includes('→')),
   vp.name+' upgrade details or next-level comparisons missing: '+JSON.stringify(upgradedCopy));
  assert(upgradedCopy.some(item=>item.details.includes('공격 간격')),
   vp.name+' speed enhancement does not explain the attack interval');
  assert(upgradedCopy.some(item=>item.details.includes('세카이의 마음')),
   vp.name+' ability enhancement does not explain what gets faster');
  assert((await page.locator('#upgradeIntro').textContent()).includes('크리스탈'),
   vp.name+' upgrade cost guidance is missing');
  await page.screenshot({path:path.join('artifacts',vp.name+'-upgrades.png')});
  await page.evaluate(()=>window.__sekaiTest.getUI().closeUpgrades());
  assert((await page.locator('.heart-guide').textContent()).includes('자동으로 발동합니다'),
   vp.name+' Hearts catalog did not receive formal gameplay instructions');

  // Desktop now has a dedicated command panel. Compact landscape keeps the
  // existing roster/tactics strip where there is no room for a sidebar.
  if(vp.name==='desktop'){
   const tactical=await page.locator('.command-deck-alert').boundingBox();
   assert(tactical&&tactical.width>220&&tactical.height>45,
    vp.name+' new command status area missing');
   assert((await page.locator('#deckSituation').textContent()).trim().length>13);
   assert(await page.locator('#commandWorldCrest').evaluate(e=>e.naturalWidth>0));
  }else if(vp.width>vp.height){
   const tactics=await page.locator('#teamTactics').boundingBox();
   assert(tactics&&tactics.width>120&&tactics.height>55,vp.name+' tactics panel missing');
   assert((await page.locator('#teamTacticsDescription').textContent()).trim().length>10);
   assert(await page.locator('#teamHeartProgress .team-heart-member').count()>=4,
    vp.name+' combination target portraits are missing');
  }
  const layout=await page.evaluate(()=>{
   const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
   const g=window.__sekaiTest.getGame();
   return {board:box('#gameCanvas'),controls:box('.main-actions'),resources:box('.resource-row'),map:[g.map.w,g.map.h],overflowX:document.documentElement.scrollWidth>innerWidth+2};
  });
  // The first-summon dialogue cannot cover the wave counter / progress bar.
  const overlap=await page.evaluate(()=>{
   const dialogue=document.getElementById('battleDialogue');
   const wave=document.querySelector('.wave-panel');
   if(dialogue?.hidden||!wave)return {overlaps:false};
   const a=dialogue.getBoundingClientRect(),b=wave.getBoundingClientRect();
   const rect=x=>({x:x.x,y:x.y,w:x.width,h:x.height});
   return {overlaps:a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top,
    speech:rect(a),wave:rect(b),position:getComputedStyle(dialogue).position,
    left:getComputedStyle(dialogue).left,right:getComputedStyle(dialogue).right,
    transform:getComputedStyle(dialogue).transform};
  });
  assert(!overlap.overlaps,vp.name+' character dialogue obscures the wave bar: '+JSON.stringify(overlap));
  assert(layout.board&&layout.board.w>110&&layout.board.h>110,vp.name+' canvas not visible');
  assert(Math.abs(layout.board.w/layout.board.h-layout.map[0]/layout.map[1])<.04,vp.name+' map aspect wrong');
  assert(layout.board.x>=-2&&layout.board.y>=-2&&layout.board.x+layout.board.w<=vp.width+2&&layout.board.y+layout.board.h<=vp.height+2,vp.name+' board clips viewport');
  assert(layout.controls&&layout.controls.w>100,vp.name+' missing buttons');
  assert(!layout.overflowX,vp.name+' horizontal scrolling caused by UI');
  const visibleControls=await page.evaluate(()=>{
   const ids=['summonButton','autoMergeButton','upgradeToggle','heartButton','speedButton','waveText','fragmentText','crystalText'];
   return ids.map(id=>{
    const el=document.getElementById(id),r=el.getBoundingClientRect();
    return {id,x:r.x,y:r.y,width:r.width,height:r.height,font:parseFloat(getComputedStyle(el).fontSize)};
   });
  });
  for(const e of visibleControls){
   assert(e.x>=-2&&e.y>=-2&&e.x+e.width<=vp.width+2&&e.y+e.height<=vp.height+2,
    vp.name+' clipped UI: '+e.id+JSON.stringify(e));
   if(e.id==='summonButton'||e.id==='autoMergeButton'||e.id==='upgradeToggle'||e.id==='heartButton')
    assert(e.height>=40&&e.width>=55,vp.name+' untappable UI: '+e.id);
  }
  const musicActive=await page.evaluate(()=>window.__sekaiTest.getUI().sound.music.mapId);
  assert.equal(musicActive,'roof',vp.name+' stage Suno music slot not selected');
  const musicScene=await page.evaluate(()=>{
   const director=window.__sekaiTest.getUI().sound.music;
   return {scene:director.currentScene,
    src:director.audio?.currentSrc||director.audio?.src||''};
  });
  assert.equal(musicScene.scene,'roof',vp.name+' wrong SEKAI BGM route');
  if(musicScene.src)assert(/\/(?:roof)\.(?:ogg|mp3)(?:\?|$)/.test(musicScene.src),
   vp.name+' BGM source must match the selected SEKAI: '+musicScene.src);

  // Stage hazard, direct evade selection, click a safe tile, and verify reward.
  await page.evaluate(()=>{
   const g=window.__sekaiTest.getGame();
   g.startWave(5);
   if(!g.beginThreat())throw Error('No hazard began');
   window.__sekaiTest.getUI().update(true);
  });
  await page.waitForFunction(()=>!document.getElementById('dangerBanner').hidden);
  await page.screenshot({path:path.join('artifacts',vp.name+'-danger.png')});
  await page.locator('#dangerMove').click({timeout:12000});
  const tap=await page.evaluate(()=>{
   const g=window.__sekaiTest.getGame(),t=g.interference,rect=document.getElementById('gameCanvas').getBoundingClientRect();
   const target=g.map.available.find(p=>g.canPlace(p.x,p.y)&&p.y>5&&(p.x!==t.x||p.y!==t.y));
   if(!target)throw Error('No free target');
   return {x:rect.x+rect.width*(target.x+.5)/g.map.w,y:rect.y+rect.height*(target.y+.5)/g.map.h};
  });
  await page.mouse.click(tap.x,tap.y);
  const dodge=await page.evaluate(()=>({stats:window.__sekaiTest.getGame().threatStats,active:!!window.__sekaiTest.getGame().interference}));
  assert.equal(dodge.stats.avoided,1,vp.name+' dodge must register from real pointer');
  assert.equal(dodge.active,false,vp.name+' dangerous effect did not clear');
  await page.screenshot({path:path.join('artifacts',vp.name+'-dodge.png')});

  // A real Game heart scene drives both the cut-in and map-wide attack art.
  await page.evaluate(async()=>{
   const {HEARTS}=await import('./src/data/hearts.js');
   const g=window.__sekaiTest.getGame(),ui=window.__sekaiTest.getUI();
   const heart=HEARTS.find(h=>h.style==='burst');
   const actors=heart.required.map((id,i)=>({
    uid:3000+i,id,star:3,x:1+i,y:8,cooldown:0,jamTime:0
   }));
   g.units.push(...actors);
   g.spawnEnemy('boss',5);
   g.heartScene={heart,participants:actors,actorId:actors[0].id,
    actorUid:actors[0].uid,elapsed:0,fired:false};
   ui.onHeartStart({heart,participants:actors,actorId:actors[0].id,
    strength:{average:3,scale:1.96,full:false}});
  });
  await page.waitForFunction(()=>document.getElementById('skillCutin')?.classList.contains('visible'));
  await page.waitForTimeout(250);
  const caster=await page.evaluate(()=>{
   const ui=document.getElementById('skillCutin');
   return {actor:ui?.dataset.actor,name:ui?.querySelector('.skill-cutin-speaker')?.textContent,
    technique:ui?.querySelector('.skill-cutin-type')?.textContent,
    effect:ui?.querySelector('.skill-cutin-words')?.textContent};
  });
  assert(caster.actor==='tsukasa'&&caster.name?.length>0&&caster.technique?.length>0&&
   caster.effect?.includes('장벽'),
   vp.name+' invisible caster / unexplained effect: '+JSON.stringify(caster));
  const skillSize=await page.locator('#skillCutin').boundingBox();
  assert(skillSize&&skillSize.height>=36&&skillSize.height<=48&&skillSize.y<=62
    &&skillSize.width>=180,
   vp.name+' special attack message must stay in the top HUD: '+JSON.stringify(skillSize));
  if(vp.width<vp.height){
   const resources=await page.locator('.resource-row').boundingBox();
   assert(resources&&skillSize.y+skillSize.height<=resources.y+1,
    vp.name+' top skill message overlaps the resources');
  }
  assert(await page.locator('#selectionPanel').evaluate(el=>getComputedStyle(el).visibility==='hidden'),
   vp.name+' selected-character panel must clear the field during a special');
  await page.screenshot({path:path.join('artifacts',vp.name+'-skill-lead.png')});
  await page.waitForTimeout(580);
  assert(await page.locator('#skillCutin').evaluate(el=>el.classList.contains('impact')),
   vp.name+' special attack activation feedback missing');
  const stageSkill=await page.evaluate(()=>{
   const g=window.__sekaiTest.getGame();
   const active=g.heartStates?.find(s=>s.type==='barrier');
   return {gates:active?.gates?.length||0,remaining:active?.remaining,
    mechanics:g.lastHeartEffect?.mechanic,
    target:document.querySelector('#skillCutin .skill-cutin-words')?.textContent};
  });
  assert(stageSkill.gates>=3&&stageSkill.mechanics==='barrier'&&stageSkill.remaining>3,
   vp.name+' special needs real barriers visible on the path: '+JSON.stringify(stageSkill));
  await page.screenshot({path:path.join('artifacts',vp.name+'-skill-impact.png')});
  await page.waitForTimeout(1050);
  // Keep a brief, nonblocking result banner long enough to understand it.
  assert(await page.locator('#skillCutin').evaluate(el=>el.classList.contains('visible')),
   vp.name+' skill effect explanation vanished before the player could read it');
  await page.evaluate(()=>{
   window.__sekaiTest.getUI().renderHearts();
   document.getElementById('heartsOverlay').classList.add('visible');
  });
  const encyclopedia=await page.evaluate(()=>{
   const list=document.getElementById('heartList');
   return {items:list.querySelectorAll('.heart-item').length,
    described:list.querySelectorAll('.heart-ability').length,
    portraits:list.querySelectorAll('.heart-roster img').length,
    locked:list.querySelectorAll('.heart-item.locked').length,
    first:list.firstElementChild?.dataset?.index,
    last:list.lastElementChild?.dataset?.index};
  });
  assert.equal(encyclopedia.items,331,vp.name+' show all 331 Hearts');
  assert.equal(encyclopedia.described+encyclopedia.locked,331,
   vp.name+' discovery must unlock descriptions without hiding entries');
  assert(encyclopedia.portraits>=662&&encyclopedia.first==='1'&&encyclopedia.last==='331',
   vp.name+' missing numbered Heart combinations: '+JSON.stringify(encyclopedia));
  const catalogScroll=await page.evaluate(()=>{
   const list=document.getElementById('heartList');
   list.scrollTop=list.scrollHeight;
   return {scrollTop:list.scrollTop,scrollHeight:list.scrollHeight,
    clientHeight:list.clientHeight,last:list.lastElementChild?.dataset?.index};
  });
  assert(catalogScroll.scrollTop>0&&catalogScroll.last==='331',
   vp.name+' cannot scroll to final Heart: '+JSON.stringify(catalogScroll));
  await page.screenshot({path:path.join('artifacts',vp.name+'-all-331-hearts-bottom.png')});
  await page.evaluate(()=>document.getElementById('heartsOverlay').classList.remove('visible'));

  // Use the actual game-end event to exercise populated result data and layout.
  await page.evaluate(()=>{
   const g=window.__sekaiTest.getGame();
   // A deterministic QA fixture: enough heroes and damage rows to verify
   // actual result-screen layout, rather than a meaningless zero-second loss.
   g.fragments=1000;
   for(let i=0;i<7;i++)g.summon();
   g.realTime=239.4;
   for(const [i,unit] of g.units.entries())
    g.damageByMember[unit.id]=(g.damageByMember[unit.id]||0)+(i+1)*740;
   g.end('lose','final_timeout');
   g.update(1.6);
  });
  await page.waitForFunction(()=>document.getElementById('resultOverlay').classList.contains('visible'));
  const outcome=await page.evaluate(()=>({
   title:document.getElementById('resultTitle').textContent,
   story:document.getElementById('resultStoryLine').textContent,
   speaker:document.getElementById('resultStorySpeaker').textContent,
   world:document.getElementById('resultWorldTitle').textContent,
   portrait:document.getElementById('resultStoryPortrait').naturalWidth
  }));
  assert(outcome.story.length>12&&outcome.speaker&&outcome.world&&outcome.portrait>0,
   vp.name+' post-battle SEKAI story missing: '+JSON.stringify(outcome));
  assert(await page.locator('#resultInsight').locator('div').count()>=4,vp.name+' four result metrics missing');
  await page.waitForTimeout(650);
  await page.screenshot({path:path.join('artifacts',vp.name+'-result.png')});
  // Also inspect the victory/debrief version without simulating a 4-minute
  // playthrough. The result data is the real completed fixture with a QA
  // status override; do not mutate combat performance or player records.
  await page.evaluate(()=>{
   const ui=window.__sekaiTest.getUI();
   const g=window.__sekaiTest.getGame();
   ui.showResult({...g.result,status:'win',reason:null});
  });
  assert((await page.locator('#resultTitle').textContent()).length>=2,
   vp.name+' victory text missing');
  assert((await page.locator('#resultStoryLine').textContent()).length>=12,
   vp.name+' successful SEKAI epilogue missing');
  assert(await page.locator('.result-dialog').evaluate(e=>e.classList.contains('victory')),
   vp.name+' victory result still uses defeat status');
  assert(await page.locator('#resultNext').isEnabled(),
   vp.name+' normal clear should enable the next difficulty');
  await page.screenshot({path:path.join('artifacts',vp.name+'-victory-debrief.png')});
  assert.deepEqual(errors,[],vp.name+' script errors: '+errors.join(' | '));
  summary.push({viewport:vp.name,width:vp.width,height:vp.height,layout,dodged:dodge.stats.avoided,screenshots:10});
  await context.close();
 }
}finally{await browser.close();}
fs.writeFileSync('artifacts/summary.json',JSON.stringify(summary,null,2));
console.log('PASS: visual walkthrough at '+summary.map(s=>s.viewport).join(', '));
console.log(JSON.stringify(summary.map(({viewport,layout})=>({viewport,board:layout.board,controls:layout.controls}))));
