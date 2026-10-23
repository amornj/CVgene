import frequencyData from './data/frequency.json';
import type {Gene} from './data';

export type FrequencyId = 'dcm'|'hcm'|'af'|'lqts'|'cpvt'|'brugada'|'htad'|'lds'|'pah_familial'|'pah_idiopathic'|'pvod_sporadic'|'pvod_familial'|'fh';
export type FrequencyPanelId = 'dcm'|'hcm'|'af'|'va'|'aortopathy'|'pah'|'lipid';
type EstimateBase = {symbol:string;note?:string};
export type FrequencyEstimate = EstimateBase & (
 {kind:'point';value:number} |
 {kind:'range';low:number;high:number} |
 {kind:'upper';limit:number} |
 {kind:'lower';limit:number} |
 {kind:'count';count:number;total:number;unit?:'patients'|'families'}
);
export type FrequencyDataset = {
 id:FrequencyId;group:FrequencyPanelId;title:string;name:string;
 metric:string;population:string;denominator:string;caveat:string;
 eligibleSymbols?:string[];defaultForPanel?:boolean;coverageNote?:string;
 sources:{label:string;url:string;detail:string}[];
 entries:FrequencyEstimate[];
};

export const frequencyReviewed = frequencyData.reviewed;
export const frequencyDatasets = frequencyData.datasets as FrequencyDataset[];
export const frequencySections:{label:string;contexts:FrequencyId[]}[] = [
 {label:'Cardiomyopathy',contexts:['dcm','hcm']},
 {label:'Atrial fibrillation',contexts:['af']},
 {label:'Ventricular arrhythmia syndromes',contexts:['lqts','cpvt','brugada']},
 {label:'Aortic disease',contexts:['htad','lds']},
 {label:'Pulmonary vascular disease',contexts:['pah_familial','pah_idiopathic','pvod_sporadic','pvod_familial']},
 {label:'Lipid disorders',contexts:['fh']},
];
export const frequencyById = (id:FrequencyId)=>frequencyDatasets.find(d=>d.id===id)!;
export const estimateFor = (id:FrequencyId,symbol:string):FrequencyEstimate|null=>frequencyById(id).entries.find(e=>e.symbol===symbol)||null;
export function estimateBounds(estimate:FrequencyEstimate):{low:number;high:number}{
 switch(estimate.kind){
  case 'range':return {low:estimate.low,high:estimate.high};
  case 'upper':return {low:0,high:estimate.limit};
  // 100 is the mathematical ceiling, not a measured study upper bound.
  case 'lower':return {low:estimate.limit,high:100};
  case 'count':{const value=estimate.count/estimate.total*100;return {low:value,high:value};}
  case 'point':return {low:estimate.value,high:estimate.value};
 }
}
export function formatEstimate(estimate:FrequencyEstimate):string{
 switch(estimate.kind){
  case 'range':return `${estimate.low}–${estimate.high}%`;
  case 'upper':return `<${estimate.limit}%`;
  case 'lower':return `>${estimate.limit}%`;
  case 'count':return `${(estimate.count/estimate.total*100).toFixed(1)}%`;
  case 'point':return `~${estimate.value}%`;
 }
}
export function sortedEstimates(dataset:FrequencyDataset):FrequencyEstimate[]{
 return [...dataset.entries].sort((a,b)=>{
  const x=estimateBounds(a),y=estimateBounds(b);
  return y.high-x.high||y.low-x.low||a.symbol.localeCompare(b.symbol);
 });
}
export function contextsForGene(gene:Gene):FrequencyDataset[]{
 return frequencyDatasets.filter(d=>d.entries.some(e=>e.symbol===gene.symbol)||(d.eligibleSymbols?d.eligibleSymbols.includes(gene.symbol):(['dcm','hcm','af'].includes(d.id)&&Boolean(gene.clinical[d.id as 'dcm'|'hcm'|'af']))));
}
export function unquantifiedGenes(dataset:FrequencyDataset,catalog:Gene[]):Gene[]{
 // A VA gene is not automatically a member of every electrical syndrome.
 if(dataset.group==='va')return [];
 return catalog.filter(g=>(dataset.eligibleSymbols?dataset.eligibleSymbols.includes(g.symbol):Boolean(g.clinical[dataset.group as 'dcm'|'hcm'|'af']))&&!dataset.entries.some(e=>e.symbol===g.symbol));
}
export function frequencyForGroup(group:string,current:FrequencyId):FrequencyId{
 if(group==='arrhythmia'||group==='va')return frequencyById(current).group==='va'?current:'lqts';
 if(['aortopathy','pah','lipid'].includes(group))return frequencyById(current).group===group?current:frequencyDatasets.find(d=>d.group===group&&d.defaultForPanel)!.id;
 return ['dcm','hcm','af'].includes(group)?group as FrequencyId:'dcm';
}
