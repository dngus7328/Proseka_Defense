// Original, telegraphed SEKAI interference rules.
 // All zones target an occupied square. The player can move the marked unit away
 // during the warning to negate the effect and earn a small resource reward.
 // No invisible or unavoidable damage is used.
export const INTERFERENCE_BY_MAP={
 roof:{type:'silence',color:'#c77370',duration:4.5,names:{ko:'수업의 정적',ja:'教室の静寂',en:'Classroom Silence'}},
 stage:{type:'silence',color:'#c984ae',duration:3.7,names:{ko:'조명 이상',ja:'照明の異常',en:'Spotlight Malfunction'}},
 city:{type:'rush',color:'#de9b65',duration:4.5,names:{ko:'박자 폭주',ja:'暴走するビート',en:'Runaway Beat'}},
 wonderland:{type:'silence',color:'#cd8bb6',duration:3.5,names:{ko:'무대 장치 오작동',ja:'舞台装置の暴走',en:'Stage Malfunction'}},
 night:{type:'silence',color:'#919abc',duration:5.5,names:{ko:'소리의 공백',ja:'音の空白',en:'Silent Gap'}},
 closedwindow:{type:'drain',color:'#af8193',duration:3.5,names:{ko:'닫힌 창의 간섭',ja:'閉ざされた窓の干渉',en:'Closed-Window Interference'}},
 openwindow:{type:'rush',color:'#8baaba',duration:3.8,names:{ko:'열린 창의 역류',ja:'開かれた窓の逆流',en:'Open-Window Reversal'}}
};
export const INTERFERENCE_WARNING_SECONDS=5;
export function interferenceForMap(mapId){return INTERFERENCE_BY_MAP[mapId]||INTERFERENCE_BY_MAP.roof;}
