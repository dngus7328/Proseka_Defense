const KEY='sekai-defense-fan-v1';
const DEFAULT={language:'ko',volume:35,effects:'full',touch:true,cleared:[],best:{},discovered:[]};
export function loadSave(){try{const parsed=JSON.parse(localStorage.getItem(KEY)||'{}');return {...DEFAULT,...parsed,cleared:Array.isArray(parsed.cleared)?parsed.cleared:[],discovered:Array.isArray(parsed.discovered)?parsed.discovered:[],best:parsed.best||{}};}catch{return {...DEFAULT};}}
export function persistSave(save){try{localStorage.setItem(KEY,JSON.stringify(save));}catch{ /* private mode / storage unavailable */ }}
