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
  await page.screenshot({path:path.join('artifacts',vp.name+'-title.png')});
  await page.locator('#titleEnter').click({timeout:12000});
  await page.waitForFunction(()=>{
   const list=[...document.querySelectorAll('#lobbyTeamPreview img')];
   return list.length===4&&list.every(img=>img.complete&&img.naturalWidth>0);
  },null,{timeout:12000});
  await page.waitForTimeout(520);
  await page.screenshot({path:path.join('artifacts',vp.name+'-lobby.png')});
  await page.locator('#startButton').click({timeout:12000});
  await page.waitForFunction(()=>window.__sekaiTest?.getGame()?.phase==='playing',{timeout:10000});
  await page.locator('#summonButton').click({timeout:12000});
  await page.waitForFunction(()=>window.__sekaiTest.getGame().units.length>=1,{timeout:10000});
  await page.screenshot({path:path.join('artifacts',vp.name+'-battle.png')});
  // A landscape roster must show actionable information rather than empty space.
  if(vp.width>vp.height){
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
  assert(layout.board&&layout.board.w>110&&layout.board.h>110,vp.name+' canvas not visible');
  assert(Math.abs(layout.board.w/layout.board.h-layout.map[0]/layout.map[1])<.04,vp.name+' map aspect wrong');
  assert(layout.board.x>=-2&&layout.board.y>=-2&&layout.board.x+layout.board.w<=vp.width+2&&layout.board.y+layout.board.h<=vp.height+2,vp.name+' board clips viewport');
  assert(layout.controls&&layout.controls.w>100,vp.name+' missing buttons');
  assert(!layout.overflowX,vp.name+' horizontal scrolling caused by UI');

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
  assert(await page.locator('#resultInsight').locator('div').count()>=4,vp.name+' four result metrics missing');
  await page.waitForTimeout(650);
  await page.screenshot({path:path.join('artifacts',vp.name+'-result.png')});
  assert.deepEqual(errors,[],vp.name+' script errors: '+errors.join(' | '));
  summary.push({viewport:vp.name,width:vp.width,height:vp.height,layout,dodged:dodge.stats.avoided,screenshots:6});
  await context.close();
 }
}finally{await browser.close();}
fs.writeFileSync('artifacts/summary.json',JSON.stringify(summary,null,2));
console.log('PASS: visual walkthrough at '+summary.map(s=>s.viewport).join(', '));
console.log(JSON.stringify(summary.map(({viewport,layout})=>({viewport,board:layout.board,controls:layout.controls}))));
