// The UI uses exactly the same six effect rules that Game.fireHeart applies.
// Pair bonuses are scaled to 70% of the group version.
const TEXT={
 ko:{
  star:{title:'별의 속박',short:'범위 피해 + 적 둔화',long:d=>`여러 적에게 피해를 주고 맞은 적의 이동을 약 ${d(1.6)}초 늦춰.`},
  rain:{title:'희망의 비',short:'범위 피해 + 재화 획득',long:(_,c,f)=>`여러 적에게 피해를 주고 크리스탈 +${c}, 마음의 조각 +${f} 획득.`},
  slash:{title:'비트 강타',short:'범위 피해 + 강력한 집중 일격',long:()=>`여러 적을 타격하고 중심에 가까운 적 한 명에게 추가 강타.`},
  burst:{title:'무대 폭발',short:'범위 피해 + 적 밀쳐내기',long:d=>`여러 적을 공격하고 맞은 적을 경로에서 약 ${d(1.65)}칸 뒤로 밀어.`},
  wave:{title:'새벽의 파동',short:'범위 피해 + 전장 전체 둔화',long:d=>`범위 피해를 주고 전장 모든 적을 ${d(4.2)}초 동안 느리게 해.`},
  orbit:{title:'공명의 궤도',short:'범위 피해 + 팀 공격력 70% 강화',long:d=>`범위 피해를 주고 팀 전원의 공격력을 ${d(6)}초간 70% 높여.`}
 },
 ja:{
  star:{title:'星の束縛',short:'範囲ダメージ＋鈍足',long:d=>`複数の敵にダメージ。命中した敵を約${d(1.6)}秒間減速。`},
  rain:{title:'希望の雨',short:'範囲ダメージ＋資源獲得',long:(_,c,f)=>`複数の敵に攻撃。クリスタル+${c}、かけら+${f}を獲得。`},
  slash:{title:'ビート強打',short:'範囲攻撃＋集中強打',long:()=>`複数の敵を攻撃し、中心に近い敵に追加強打。`},
  burst:{title:'ステージ爆発',short:'範囲攻撃＋ノックバック',long:d=>`複数の敵を攻撃し、経路を約${d(1.65)}マス押し戻す。`},
  wave:{title:'夜明けの波動',short:'範囲攻撃＋全敵鈍足',long:d=>`範囲攻撃を行い、全ての敵を${d(4.2)}秒間減速。`},
  orbit:{title:'共鳴の軌道',short:'範囲攻撃＋全員攻撃力70%UP',long:d=>`範囲攻撃と味方全員の攻撃力70%UP（${d(6)}秒）。`}
 },
 en:{
  star:{title:'Starlit Bind',short:'Area damage + slow',long:d=>`Hits multiple enemies and slows those struck for ${d(1.6)}s.`},
  rain:{title:'Rain of Hope',short:'Area damage + resources',long:(_,c,f)=>`Damages nearby enemies and grants +${c} crystals and +${f} fragments.`},
  slash:{title:'Beat Strike',short:'Area damage + focused strike',long:()=>`Damages multiple enemies and delivers an extra heavy hit to one target.`},
  burst:{title:'Stage Burst',short:'Area damage + knockback',long:d=>`Damages multiple enemies and pushes them back about ${d(1.65)} path tiles.`},
  wave:{title:'Dawn Wave',short:'Area damage + mass slow',long:d=>`Deals area damage and slows all enemies for ${d(4.2)}s.`},
  orbit:{title:'Resonance Orbit',short:'Area damage + team ATK +70%',long:d=>`Deals area damage and boosts all allies' attack by 70% for ${d(6)}s.`}
 }
};
export function heartEffectDetails(heart,strength={average:1},lang='ko'){
 const average=Math.max(1,Number(strength?.average)||1);
 const factor=heart.type==='group'?1:.7;
 const round=v=>Number((v*factor).toFixed(1)).toLocaleString(lang==='ja'?'ja-JP':lang==='en'?'en-US':'ko-KR');
 const crystal=Math.round((13+average*3)*factor),fragment=Math.round(8*factor);
 const group=TEXT[lang]||TEXT.ko;
 const effect=group[heart.style]||group.star;
 return {title:effect.title,short:effect.short,
  detail:effect.long(round,crystal,fragment),style:heart.style,
  temporary:heart.style==='orbit'||heart.style==='wave'||heart.style==='star'};
}
export function heartCasterDescription(heart,participants,lookup,lang='ko'){
 const names=participants.map(u=>lookup[u.id]?.names?.[lang]||lookup[u.id]?.names?.ko||u.id);
 if(lang==='ja')return `参加: ${names.join('・')}`;
 if(lang==='en')return `Members: ${names.join(' · ')}`;
 return `참여: ${names.join(' · ')}`;
}
