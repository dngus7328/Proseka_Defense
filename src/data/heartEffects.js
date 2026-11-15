import {heartAbilityDescription} from '../core/HeartAbilities.js?v=1.21.0';

// A single authoritative mechanical description powers both the collection
// and the live cast banner. It must never claim damage/resources when the
// actual ability places gates, buffs allies or moves enemy positions.
export function heartEffectDetails(heart,strength={average:1},lang='ko'){
 const value=heartAbilityDescription(heart,strength,lang);
 return {
  title:value.label,short:value.label,detail:value.description,
  style:heart.style,mechanic:value.mechanic,duration:value.duration,
  temporary:true
 };
}
export function heartCasterDescription(heart,participants,lookup,lang='ko'){
 const names=participants.map(u=>lookup[u.id]?.names?.[lang]||lookup[u.id]?.names?.ko||u.id);
 if(lang==='ja')return `参加: ${names.join('・')}`;
 if(lang==='en')return `Members: ${names.join(' · ')}`;
 return `참여: ${names.join(' · ')}`;
}
