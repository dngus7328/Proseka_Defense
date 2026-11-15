const KEY='sekai-defense-fan-v1';
const defaultStory=()=>({introSeen:false,visitedSekai:[],visitedMission:[],firstClear:[]});
const DEFAULT={language:'ko',volume:35,musicVolume:55,effects:'full',touch:true,cleared:[],best:{},discovered:[],story:defaultStory()};
export function loadSave(){
 try{
  const parsed=JSON.parse(localStorage.getItem(KEY)||'{}');
  const oldStory=parsed.story&&typeof parsed.story==='object'?parsed.story:{};
  return {...DEFAULT,...parsed,
   cleared:Array.isArray(parsed.cleared)?parsed.cleared:[],
   discovered:Array.isArray(parsed.discovered)?parsed.discovered:[],
   best:parsed.best||{},
   story:{
    introSeen:oldStory.introSeen===true,
    visitedSekai:Array.isArray(oldStory.visitedSekai)?oldStory.visitedSekai:[],
    visitedMission:Array.isArray(oldStory.visitedMission)?oldStory.visitedMission:[],
    firstClear:Array.isArray(oldStory.firstClear)?oldStory.firstClear:[]
   }};
 }catch{return {...DEFAULT,story:defaultStory()};}
}
export function persistSave(save){
 try{localStorage.setItem(KEY,JSON.stringify(save));}
 catch{ /* private mode / storage unavailable; never block play */ }
}
