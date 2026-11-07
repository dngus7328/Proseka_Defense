export const ENEMIES={
 pulse:{color:'#bd5666',accent:'#f5d6b2',hp:1,speed:1,reward:7,radius:0.23},
 dash:{color:'#edab68',accent:'#fff0be',hp:.68,speed:1.75,reward:8,radius:.21},
 tank:{color:'#637f9c',accent:'#dbe1dc',hp:3.5,speed:.65,reward:15,radius:.29},
 split:{color:'#b18bb4',accent:'#e8cdea',hp:1.8,speed:1.02,reward:10,radius:.24},
 resist:{color:'#7a9b7e',accent:'#d5dfaf',hp:2.4,speed:1.12,reward:12,radius:.25},
 shard:{color:'#ba91ad',accent:'#f0d8eb',hp:.37,speed:1.37,reward:2,radius:.14},
 boss:{color:'#544d7b',accent:'#f3c8a5',hp:16,speed:.61,reward:170,radius:.48}
};
export const DIFFICULTIES=[
 {id:'normal',hp:0.85,speed:.98,count:.88,boss:1,reward:1.12},
 {id:'advanced',hp:1.15,speed:1.06,count:1,boss:1.15,reward:1.07},
 {id:'expert',hp:1.45,speed:1.16,count:1.1,boss:1.32,reward:1.1},
 {id:'extreme',hp:1.9,speed:1.23,count:1.18,boss:1.54,reward:1.12},
 {id:'endless',hp:2.0,speed:1.23,count:1.2,boss:1.60,reward:1.12}
];
export const UPGRADE_DATA=[
 {id:'attack',icon:'✦',max:6,baseCost:42,costMult:1.65},
 {id:'speed',icon:'≫',max:6,baseCost:52,costMult:1.75},
 {id:'ability',icon:'♧',max:6,baseCost:62,costMult:1.73},
 {id:'income',icon:'◆',max:6,baseCost:34,costMult:1.66},
];
export function upgradeCost(id,level){const p=UPGRADE_DATA.find(x=>x.id===id);return level>=p.max?Infinity:Math.round(p.baseCost*Math.pow(p.costMult,level));}
export function waveEnemies(wave,difficulty){
 const d=DIFFICULTIES.find(x=>x.id===difficulty)||DIFFICULTIES[0];
 let count=Math.ceil((6+wave*1.1)*d.count);
 const types=['pulse']; if(wave>=4)types.push('dash');if(wave>=7)types.push('tank');if(wave>=10)types.push('split');if(wave>=14)types.push('resist');
 const result=Array.from({length:count},(_,i)=>types[(i*7+Math.floor(i/3)+wave*3)%types.length]);
 if(wave%5===0)result.push('boss');
 return result;
}
