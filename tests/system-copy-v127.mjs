import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CHARACTER_BY_ID,attackValue,attackInterval} from '../src/data/characters.js';
import {HEARTS} from '../src/data/hearts.js';
import {heartAbilityDescription} from '../src/core/HeartAbilities.js';
import {MAPS} from '../src/data/maps.js';
import {getMissionObjective,getOpening,getEndStory} from '../src/data/storyScenes.js';
import {UPGRADE_DATA,upgradeCost} from '../src/data/enemies.js';
import {UPGRADE_RULES,upgradeExplanation} from '../src/data/upgradeDescriptions.js';
import {getText} from '../src/data/locales.js';

assert.equal(UPGRADE_RULES.attack.perLevel,.29);
assert.equal(UPGRADE_RULES.speed.perLevel,.13);
assert.equal(UPGRADE_RULES.ability.perLevel,.12);
assert.equal(UPGRADE_RULES.income.crystalsPerLevel,3.25);
assert.equal(UPGRADE_RULES.income.fragmentsPerLevel,2.3);
const unit={id:'ichika',star:1};
const character=CHARACTER_BY_ID.ichika;
assert.equal(attackValue(unit,{attack:2}),Math.round(character.atk*(1+2*.29)));
assert.equal(attackInterval(unit,{speed:2}),Math.max(.25,character.rate/(1+2*.13)));
const atZero=upgradeExplanation('attack',0,6,'ko');
assert(atZero.description.endsWith('됩니다.'));
assert(atZero.progress.includes('+0%')&&atZero.progress.includes('+29%'));
assert(upgradeExplanation('speed',5,6,'ko').progress.includes('+78%'));
assert(upgradeExplanation('ability',1,6,'ko').progress.includes('+24%'));
assert(upgradeExplanation('income',0,6,'ko').progress.includes('+3.25/+2.30'));
for(const upgrade of UPGRADE_DATA){
 assert(upgradeCost(upgrade.id,6)===Infinity);
 for(const lang of ['ko','ja','en']){
  const info=upgradeExplanation(upgrade.id,3,6,lang);
  assert(info.description.length>=24&&info.progress.length>=10);
  const max=upgradeExplanation(upgrade.id,6,6,lang);
  assert.equal(max.nextLevel,null);
  assert(!max.progress.includes('→'));
 }
}
for(const heart of HEARTS){
 const desc=heartAbilityDescription(heart,{average:1},'ko').description;
 assert(/[가-힣](?:니다|세요)\.$/.test(desc),'Heart explanation must use formal Korean: '+heart.id+' '+desc);
}
assert.equal(HEARTS.length,331);
for(const map of MAPS){
 const obj=getMissionObjective(map.id,'ko');
 assert(obj.endsWith('합니다.'),'Mission description must be formal: '+map.id+' '+obj);
 const end=getEndStory(map.id,true,true,'ko');
 assert(end.text.length>5&&!end.text.endsWith('합니다.'),'Character ending should remain spoken dialogue');
}
assert(getOpening('ko')[0].text.endsWith('있어.'),'Miku dialogue remains conversational');
assert(getText('ko','upgradeIntro').endsWith('합니다.'));
assert(getText('ko','heartGuide').includes('발동합니다.'));
assert(getText('ko','needCrystals').endsWith('합니다.'));
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../src/ui/Interface.js',import.meta.url),'utf8');
for(const phrase of ['id="heartGuide"','id="upgradeIntro"']){ /* paragraphs use class for heart guide */ }
assert(html.includes('class="heart-guide"')&&html.includes('id="upgradeIntro"'));
assert(html.includes('system-copy-v127.css'));
assert(ui.includes("className='upgrade-card-description'")&&ui.includes("className='upgrade-card-progress'"));
assert(ui.includes('JSON.stringify([g.upgrades,Math.floor(g.crystals)'));
assert(ui.includes("this.t('crystals')"));
console.log('OK — formal system copy, 331 Heart descriptions, 7 mission objectives and 4 accurate upgrade indicators in 3 languages');
