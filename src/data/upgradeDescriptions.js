// Upgrade descriptions mirror the actual Game and characters.js coefficients.
// These are additive formula modifiers, not an unconditional DPS percentage.
export const UPGRADE_RULES=Object.freeze({
 attack:{perLevel:.29},speed:{perLevel:.13,minimumInterval:.25},
 ability:{perLevel:.12,minimumCooldown:24},
 income:{crystalsPerLevel:3.25,fragmentsPerLevel:2.3}
});
const rounded=(n)=>String(Math.round(n*100)/100);
const fixed2=(n)=>n.toFixed(2);
const entries={
 ko:{
  attack:{
   description:'멤버의 기본 공격력에 레벨당 29%를 추가합니다. 성급 보정과 합산됩니다.',
   progress:(l,n)=>'기본 공격력 보정 +'+rounded(l*29)+'%'+(n===null?'':' → +'+rounded(n*29)+'%')
  },
  speed:{
   description:'공격 간격 계산에 사용되는 속도 보정치가 레벨당 13%p 증가합니다. 최소 공격 간격은 0.25초입니다.',
   progress:(l,n)=>'속도 보정 +'+rounded(l*13)+'%'+(n===null?'':' → +'+rounded(n*13)+'%')
  },
  ability:{
   description:'세카이의 마음 재발동 간격 계산에 사용되는 보정치가 레벨당 12%p 증가합니다. 최소 재발동 간격은 24초입니다.',
   progress:(l,n)=>'재발동 보정 +'+rounded(l*12)+'%'+(n===null?'':' → +'+rounded(n*12)+'%')
  },
  income:{
   description:'적 처치 보상 계산값에 크리스탈과 마음의 조각을 추가합니다. 최종 보상의 소수점은 버립니다.',
   progress:(l,n)=>'처치 보상 가산(크리스탈/조각) +'+fixed2(l*3.25)+'/+'+fixed2(l*2.3)+(n===null?'':' → +'+fixed2(n*3.25)+'/+'+fixed2(n*2.3))
  }
 },
 ja:{
  attack:{
   description:'基本攻撃力にレベルごとに29%相当を加算します。レア度補正とは加算方式です。',
   progress:(l,n)=>'基本攻撃補正 +'+rounded(l*29)+'%'+(n===null?'':' → +'+rounded(n*29)+'%')
  },
  speed:{
   description:'攻撃間隔の計算に用いる速度補正がレベルごとに13ポイント増加します。最短攻撃間隔は0.25秒です。',
   progress:(l,n)=>'速度補正 +'+rounded(l*13)+'%'+(n===null?'':' → +'+rounded(n*13)+'%')
  },
  ability:{
   description:'セカイの想いの再発動間隔を計算する補正がレベルごとに12ポイント増加します。最短24秒です。',
   progress:(l,n)=>'再発動補正 +'+rounded(l*12)+'%'+(n===null?'':' → +'+rounded(n*12)+'%')
  },
  income:{
   description:'撃破報酬のクリスタルと想いのカケラに追加分を加算します。最後に切り捨てます。',
   progress:(l,n)=>'撃破報酬加算(C/欠片) +'+fixed2(l*3.25)+'/+'+fixed2(l*2.3)+(n===null?'':' → +'+fixed2(n*3.25)+'/+'+fixed2(n*2.3))
  }
 },
 en:{
  attack:{
   description:'Adds 29% of each member’s base attack per level. Stacks additively with star bonuses.',
   progress:(l,n)=>'Base attack bonus +'+rounded(l*29)+'%'+(n===null?'':' → +'+rounded(n*29)+'%')
  },
  speed:{
   description:'Adds 13 percentage points per level to the attack interval speed factor. Minimum interval: 0.25 s.',
   progress:(l,n)=>'Speed factor +'+rounded(l*13)+'%'+(n===null?'':' → +'+rounded(n*13)+'%')
  },
  ability:{
   description:'Adds 12 percentage points per level to the SEKAI Heart cooldown factor. Minimum cooldown: 24 s.',
   progress:(l,n)=>'Cooldown factor +'+rounded(l*12)+'%'+(n===null?'':' → +'+rounded(n*12)+'%')
  },
  income:{
   description:'Adds crystals and wish pieces to each enemy defeat reward. The final values are rounded down.',
   progress:(l,n)=>'Kill bonus (crystals/pieces) +'+fixed2(l*3.25)+'/+'+fixed2(l*2.3)+(n===null?'':' → +'+fixed2(n*3.25)+'/+'+fixed2(n*2.3))
  }
 }
};
export function upgradeExplanation(id,level=0,max=6,lang='ko'){
 const entry=(entries[lang]||entries.ko)[id];
 if(!entry)throw new Error('Unknown upgrade: '+id);
 const current=Math.max(0,Math.min(max,Number(level)||0));
 const next=current>=max?null:current+1;
 return {description:entry.description,progress:entry.progress(current,next),currentLevel:current,nextLevel:next};
}
