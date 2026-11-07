import { readFileSync, existsSync } from 'node:fs';
import { TITLE_LOGOS } from '../src/data/branding.js';
const page=readFileSync(new URL('../index.html',import.meta.url),'utf8');
if(!page.includes('id="titleLanguageLogo"')||!page.includes('v07-logo.css')) throw new Error('Missing title logo element or stylesheet');
for(const lang of ['ko','ja','en']) {
  const logo=TITLE_LOGOS[lang];
  if(!logo?.src||!logo.alt)throw new Error(`Missing ${lang} branding`);
  const file=new URL(`../${logo.src.replace(/^\.\//,'')}`,import.meta.url);
  if(!existsSync(file))throw new Error(`Missing logo asset: ${logo.src}`);
  const png=readFileSync(file);
  if(png.toString('hex',0,8)!=='89504e470d0a1a0a')throw new Error(`Invalid PNG: ${lang}`);
  const w=png.readUInt32BE(16),h=png.readUInt32BE(20);
  if(w<1000||h<400)throw new Error(`Unexpected logo dimensions: ${lang} ${w}x${h}`);
}
const ui=readFileSync(new URL('../src/ui/Interface.js',import.meta.url),'utf8');
if(!ui.includes('TITLE_LOGOS[this.save.language]'))throw new Error('Language switch not connected to title logos');
console.log('TITLE LOGOS OK: ko, ja, en');
