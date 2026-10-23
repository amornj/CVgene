import externalData from './data/external-phenotypes.json';
import type {Gene} from './data';

export type PhysicalClue = {text:string;strength:'characteristic'|'supportive'|'nonspecific';kind:'visible'|'examination'|'history'};
export type ExternalSyndrome = {id:string;name:string;genes:string[];cue:'external'|'clinical';groups:string[];keywords:string[];clues:PhysicalClue[];mechanism:string;cardiac:string;inheritance:string;testing:string[];gaps:string[];caveats:string[];sources:{title:string;url:string;sections:string}[]};
export const externalSyndromes=externalData.syndromes as ExternalSyndrome[];
export const phenotypeReviewed=externalData.reviewed;
export const clueStrength={characteristic:'Characteristic pattern',supportive:'Supportive clue',nonspecific:'Nonspecific alone'};
export const clueKind={visible:'Visible sign',examination:'Needs examination',history:'History / assessment'};
export const clinicalClueGroups=[
 {id:'cardiomyopathy-arrhythmia',name:'Cardiomyopathy / arrhythmia'},
 {id:'cardiocutaneous',name:'Heart, hair & skin'},
 {id:'rasopathy',name:'RASopathies / HCM'},
 {id:'neuromuscular',name:'Muscle weakness / cardiomyopathy'},
 {id:'aortic',name:'Aortic aneurysm / dissection'}
];
export const syndromeFamilies=[...clinicalClueGroups.filter(g=>g.id!=='cardiomyopathy-arrhythmia'),{id:'other',name:'Other inherited syndromes'}];
export const syndromeFamily=(s:ExternalSyndrome)=>syndromeFamilies.find(group=>s.groups.includes(group.id))?.id||'other';
export const clueGroups=[
 {id:'hair-skin',name:'Woolly hair + thick palms / soles'},
 {id:'palate-skeletal',name:'Palate, long fingers / limbs, chest'},
 {id:'skin-fragility',name:'Thin skin / easy bruising'},
 {id:'face-chest',name:'Facial pattern / neck / chest'},
 {id:'pigmentation',name:'Lentigines / skin pigmentation'},
 {id:'xanthoma',name:'Xanthomas / lipid deposits'},
 {id:'skin-lesions',name:'Angiokeratomas / sweating clues'},
 {id:'eye',name:'Eye findings (needs examination)'},
 {id:'digits',name:'Syndactyly / curved fifth finger'},
 {id:'muscle-development',name:'Weakness / developmental history'},
 {id:'hearing',name:'Congenital hearing loss (history)'}
];
export const syndromesForGene=(symbol:string)=>externalSyndromes.filter(s=>s.genes.includes(symbol));
export const hasExternalPhenotype=(symbol:string)=>syndromesForGene(symbol).length>0;
export const externalFeatureSymbols=new Set(externalSyndromes.filter(s=>s.cue==='external').flatMap(s=>s.genes));
export const hasExternalFeature=(symbol:string)=>externalFeatureSymbols.has(symbol);
export function syndromeSearchText(s:ExternalSyndrome){return [s.name,...s.genes,...s.keywords,...s.clues.map(c=>c.text)].join(' ').toLowerCase().replace(/[–—]/g,'-');}
export function matchesClue(s:ExternalSyndrome,query:string,group='all',syndrome='all'){
 return (syndrome==='all'||s.id===syndrome)&&(group==='all'||s.groups.includes(group))&&query.toLowerCase().replace(/[–—]/g,'-').split(/[\s-]+/).filter(Boolean).every(t=>syndromeSearchText(s).includes(t));
}
export function phenotypePanelStatus(gene:Pick<Gene,'added'|'catalogAddition'>|undefined){
 return !gene?'Candidate · not in catalog':gene.catalogAddition?'Catalog extension · not in PDF':gene.added?'Proposed PDF addition · not in baseline':'Original panel baseline';
}
export function phenotypeExportFields(symbol:string){
 const list=syndromesForGene(symbol);
 return [list.map(s=>s.name).join('; '),list.map(s=>s.inheritance).join('; '),list.flatMap(s=>s.clues.map(c=>`${s.name}: ${c.text} [${clueStrength[c.strength]}; ${clueKind[c.kind]}]`)).join('; '),list.map(s=>s.cardiac).join('; '),list.flatMap(s=>[...s.testing,...s.gaps]).join('; '),list.flatMap(s=>s.caveats).join('; '),[...new Set(list.flatMap(s=>s.sources.map(r=>r.url)))].join('; '),list.length?phenotypeReviewed:'',list.map(s=>s.mechanism).join('; ')];
}
export const phenotypeExportHeaders=['External phenotype syndrome','Syndrome inheritance / mechanism','Physical clues and specificity','Syndrome cardiac risks','Confirmatory testing / gaps','Syndrome caveats','External phenotype sources','Phenotype review date','Gene–phenotype connection'];
export function phenotypeSummary(symbol:string){
 const list=syndromesForGene(symbol);
 if(!list.length)return '';
 return `\n\nSyndrome clues · reviewed ${phenotypeReviewed}\nAssociation does not diagnose a patient or classify a variant.\n`+list.map(s=>`${s.name}\n${s.inheritance}\n${s.clues.map(c=>`${c.text} — ${clueStrength[c.strength]}; ${clueKind[c.kind]}`).join('\n')}\nGene–phenotype connection: ${s.mechanism}\nCardiac risks: ${s.cardiac}\nTesting: ${s.testing.join(' ')}\nTesting gaps: ${s.gaps.join(' ')}\nCaveats: ${s.caveats.join(' ')}\n${s.sources.map(r=>r.url).join('\n')}`).join('\n\n');
}
