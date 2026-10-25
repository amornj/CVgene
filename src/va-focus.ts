import focusData from './data/va-focus.json';

export type VaContextId='acm'|'lqts'|'sqts'|'cpvt'|'brugada'|'ats'|'structural';
export type VaFocusId='all'|Exclude<VaContextId,'structural'>;
export type VaAssociation={symbol:string;context:VaContextId;family:'structural'|'electrical';label:string;mechanism:string;inheritance:string;evidence:string;note:string;sources:string[]};
export type VaFocusGroup={id:Exclude<VaFocusId,'all'>;label:string;description:string;scope:string;sources:string[]};
export const vaAssociations=focusData.associations as VaAssociation[];
export const vaFocusGroups=focusData.groups as VaFocusGroup[];
export const vaFocusSources=focusData.sources as Record<string,{title:string;url:string;detail:string}>;
export const vaFocusReviewed=focusData.reviewed;
// 'all' is the default: every VA-associated gene, before any subtype is chosen.
export const vaSubtypeOptions:{id:VaFocusId;label:string}[]=[{id:'all',label:'All VA genes'},{id:'acm',label:'ACM / ARVC'},{id:'lqts',label:'Long QT'},{id:'sqts',label:'Short QT'},{id:'cpvt',label:'CPVT'},{id:'brugada',label:'Brugada'},{id:'ats',label:'Andersen–Tawil'}];
export const vaFocusGroup=(id:VaFocusId)=>vaFocusGroups.find(group=>group.id===id);
export const matchesVaContext=(association:VaAssociation,id:VaFocusId)=>id==='all'||association.context===id;
export function vaFocusSymbols(id:VaFocusId){return [...new Set(vaAssociations.filter(a=>matchesVaContext(a,id)).map(a=>a.symbol))].sort();}
export function vaContextsForGene(symbol:string,focus:VaFocusId='all'){
 return vaAssociations.filter(a=>a.symbol===symbol).sort((a,b)=>Number(matchesVaContext(b,focus))-Number(matchesVaContext(a,focus)));
}
export function matchesMapHighlight(symbol:string,focus:VaFocusId,externalSymbols?:ReadonlySet<string>){return (focus==='all'||vaFocusSymbols(focus).includes(symbol))&&(!externalSymbols||externalSymbols.has(symbol));}
export const vaExportHeaders=['VA syndrome / context','VA variant mechanism','VA context inheritance','VA evidence and caveats','VA context sources','VA context review date'];
export function vaExportFields(symbol:string){
 const list=vaContextsForGene(symbol);
 return [list.map(a=>a.label).join('; '),list.map(a=>`${a.label}: ${a.mechanism}`).join('; '),list.map(a=>`${a.label}: ${a.inheritance}`).join('; '),list.map(a=>`${a.label}: ${a.evidence} ${a.note}`).join('; '),[...new Set(list.flatMap(a=>a.sources.map(id=>vaFocusSources[id].url)))].join('; '),list.length?vaFocusReviewed:''];
}
export function vaSummary(symbol:string){
 const list=vaContextsForGene(symbol);
 return list.length?`\n\nVA phenotypes & mechanisms · reviewed ${vaFocusReviewed}\nSelected pathogenic-variant mechanisms; not a classification of the patient's variant.\n`+list.map(a=>`${a.label}\n${a.mechanism}\n${a.inheritance}\n${a.evidence}\n${a.note}\n${a.sources.map(id=>vaFocusSources[id].url).join('\n')}`).join('\n\n'):'';
}
