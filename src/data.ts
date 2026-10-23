import metadata from './data/metadata.json';
import clinicalData from './data/clinical.json';
import phenotypeData from './data/clinical-groups.json';
import extensionData from './data/extensions.json';
import externalData from './data/external-phenotypes.json';

export const panels = [
  {id:'cardiomyopathy',name:'Cardiomyopathy',short:'CM',count:43,color:'#76629e',light:'#f1edf8',description:'Hypertrophic, dilated, restrictive, arrhythmogenic, and syndromic cardiomyopathies.'},
  {id:'arrhythmia',name:'Arrhythmia',short:'ARR',count:28,color:'#3f7a87',light:'#edf5f5',description:'Inherited channelopathies, conduction disorders, and arrhythmogenic disease.'},
  {id:'aortopathy',name:'Aortopathy',short:'AO',count:23,color:'#95703c',light:'#faf5eb',description:'Heritable aortic disease and connective tissue / vascular syndromes.'},
  {id:'pah',name:'Pulmonary hypertension',short:'PAH',count:12,color:'#5e7d4f',light:'#f0f5ed',description:'Heritable PAH, PVOD/PCH, and syndromic pulmonary vascular disease.'},
  {id:'lipid',name:'Lipid disorders',short:'LIP',count:8,color:'#99657c',light:'#f8f0f4',description:'Familial hypercholesterolemia and clinically important lipid phenocopies.'},
] as const;
export type PanelId = typeof panels[number]['id'];
export type Scope = 'all'|'added'|'shared'|'baseline';
export const references:Record<string,{title:string;url:string;detail:string}> = {
 afguideline:{title:'2023 ACC/AHA/ACCP/HRS AF guideline',url:'https://www.jacc.org/doi/10.1016/j.jacc.2023.08.017',detail:'Section 10.1 · Early-onset AF genetic counseling, testing and surveillance'},
 ttnafva:{title:'Clinical outcomes in TTN-positive AF',url:'https://www.jacc.org/doi/10.1016/j.jacep.2024.07.029',detail:'JACC Clinical Electrophysiology, 2024 · Cardiomyopathy and ventricular events after AF'},
 hcmva:{title:'MYH7 and MYBPC3 HCM clinical outcomes',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12602694/',detail:'Primary HCM cohort · Structural disease and ventricular arrhythmic outcomes'},
 hcmrisk:{title:'2024 AHA/ACC HCM guideline',url:'https://www.jacc.org/doi/10.1016/j.jacc.2024.02.014',detail:'Clinical risk assessment · Genotype alone does not establish individual sudden-death risk'},
 hcn4va:{title:'HCN4 variant-specific ventricular arrhythmia',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9663530/',detail:'Case evidence · AF-predominant placement does not exclude ventricular events'},
 afconsensus:{title:'Cardiac genetic testing consensus — AF',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9435643/',detail:'EHRA/HRS/APHRS/LAHRS, 2022 · Familial AF and mechanism-specific context'},
 afclinic:{title:'Early-onset AF: cardiomyopathy overlap',url:'https://academic.oup.com/eurheartj/article/47/13/1554/8306976',detail:'European Heart Journal, 2026 · Observed pathogenic findings, Table 3'},
 myl4:{title:'MYL4-related atrial cardiomyopathy',url:'https://www.nature.com/articles/ncomms11303',detail:'Nature Communications, 2016 · Variant-specific familial AF'},
 myl4ar:{title:'Recessive MYL4-related AF',url:'https://pubmed.ncbi.nlm.nih.gov/27742809/',detail:'Primary familial study · Recessive loss-of-function disease'},
 hcn4af:{title:'HCN4 tachycardia–bradycardia and AF',url:'https://pubmed.ncbi.nlm.nih.gov/23178648/',detail:'Primary familial study · Sinus-node / AF context'},
 dcm2026:{title:'Updated ClinGen DCM evidence assessment',url:'https://pubmed.ncbi.nlm.nih.gov/42708185/',detail:'Circulation, September 2026 · Disease and inheritance-specific reassessment'},
 va2026:{title:'Genotype and arrhythmic risk in DCM',url:'https://pubmed.ncbi.nlm.nih.gov/42864989/',detail:'European Heart Journal, October 2026 · Cohort risk differs by genotype'},
 arvcvalidity:{title:'ClinGen ARVC gene validity reappraisal',url:'https://doi.org/10.1161/CIRCGEN.120.003273',detail:'Primary curation · Desmosomal and structural arrhythmia context'},
 cpvtvalidity:{title:'ClinGen CPVT and short-QT reappraisal',url:'https://pubmed.ncbi.nlm.nih.gov/34557911/',detail:'Primary curation, 2021 · Mechanism-specific channelopathy evidence'},
 hcm:{title:'ClinGen HCM reappraisal',url:'https://pubmed.ncbi.nlm.nih.gov/39971408/',detail:'JACC, 2025 · Gene- and inheritance-specific validity'},
 dcm:{title:'Dilated Cardiomyopathy Overview',url:'https://www.ncbi.nlm.nih.gov/books/NBK1309/',detail:'GeneReviews · Genetic causes and evaluation'},
 acm:{title:'Arrhythmogenic Cardiomyopathy Overview',url:'https://www.ncbi.nlm.nih.gov/books/NBK1131/',detail:'GeneReviews · Phenotype and family evaluation'},
 lmna:{title:'LMNA-Related Dilated Cardiomyopathy',url:'https://www.ncbi.nlm.nih.gov/books/NBK1674/',detail:'GeneReviews · Conduction disease and cardiomyopathy'},
 lqts:{title:'Long QT Syndrome Overview',url:'https://www.ncbi.nlm.nih.gov/books/NBK1129/',detail:'GeneReviews · Gene-disease validity and phenotypes'},
 cpvt:{title:'Catecholaminergic Polymorphic VT',url:'https://www.ncbi.nlm.nih.gov/books/NBK1289/',detail:'GeneReviews · CPVT and recessive disease'},
 brugada:{title:'ClinGen Brugada gene reappraisal',url:'https://pubmed.ncbi.nlm.nih.gov/29959160/',detail:'Circulation, 2018 · SCN5A versus disputed candidates'},
 hta:{title:'Heritable Thoracic Aortic Disease',url:'https://www.ncbi.nlm.nih.gov/books/NBK1120/',detail:'GeneReviews · Syndromic and isolated HTAD'},
 pah:{title:'ClinGen PAH gene validity assessment',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10766870/',detail:'2023 · PAH and associated syndromic disease'},
 lipid:{title:'Familial Hypercholesterolemia',url:'https://www.ncbi.nlm.nih.gov/books/NBK174884/',detail:'GeneReviews · FH and differential diagnosis'},
 fabry:{title:'Fabry Disease',url:'https://www.ncbi.nlm.nih.gov/books/NBK1292/',detail:'GeneReviews · GLA testing and management'},
 dmd:{title:'Dystrophinopathies',url:'https://www.ncbi.nlm.nih.gov/books/NBK1119/',detail:'GeneReviews · DMD testing and female relatives'},
 nexn:{title:'NEXN in cardiomyopathies and sudden death',url:'https://pubmed.ncbi.nlm.nih.gov/38059363/',detail:'Circ Genom Precis Med · Clinical cohort, 2023/2024'},
};
export type PhenotypeId = 'dcm'|'hcm'|'af'|'va';
export type ClinicalGroupId = 'arrhythmia'|PhenotypeId|'aortopathy'|'pah'|'lipid';
export type PhenotypeEvidence = {kind:string;note:string;reference:string};
export type Gene = typeof metadata[number] & {catalogAddition:boolean;inheritance:string;phenotypes:string[];relevance:string;consideration:string;reference:string;caution:string;clinical:Partial<Record<PhenotypeId,PhenotypeEvidence>>};
const details = clinicalData as Record<string,{inheritance:string;phenotypes:string;relevance:string;consideration:string;reference:string;caution:string}>;
const phenotypeEvidence = phenotypeData as Record<string,Partial<Record<PhenotypeId,PhenotypeEvidence>>>;
export const sourceGenes:Gene[] = metadata.map(g=>({...g,catalogAddition:false,...details[g.symbol],phenotypes:details[g.symbol].phenotypes.split(';'),clinical:phenotypeEvidence[g.symbol]||{}}));
export const genes:Gene[] = [...sourceGenes,...extensionData.map(g=>({...g,phenotypes:g.phenotypes.split(';'),clinical:phenotypeEvidence[g.symbol]||{}}))].sort((a,b)=>a.symbol.localeCompare(b.symbol));
export const panelById = (id:string)=>panels.find(p=>p.id===id)!;
export const isAdded = (g:Gene)=>g.added||g.catalogAddition;
export const statusLabel = (g:Gene)=>g.catalogAddition?'AF extension · absent from source PDF':g.added?'PDF addition · absent from baseline':'Retained from original panel';
export function hasClinicalGroup(g:Gene,id:string):boolean {
 if(id==='arrhythmia')return Boolean(g.clinical.af||g.clinical.va);
 if(['dcm','hcm','af','va'].includes(id))return Boolean(g.clinical[id as PhenotypeId]);
 return g.panels.includes(id);
}
const clinicalDefinitions = [
 {id:'arrhythmia',name:'Rhythm disorders',short:'ARR',color:'#3f7a87',light:'#edf5f5',description:'Combined selected AF and ventricular-arrhythmia contexts; this union is not the VA circle.'},
 {id:'dcm',name:'Dilated cardiomyopathy',short:'DCM',color:'#76629e',light:'#f1edf8',description:'Evidence-informed DCM associations within this catalog, with inheritance and variant-mechanism caveats.'},
 {id:'hcm',name:'Hypertrophic cardiomyopathy',short:'HCM',color:'#a17b46',light:'#faf5eb',description:'HCM and LVH phenocopies from the 2025 gene reappraisal. Syndromic mimics are identified in gene details.'},
 {id:'af',name:'Atrial fibrillation',short:'AF',color:'#a46688',light:'#fcf0f7',description:'Selected familial / early-onset AF, atrial myopathy, cardiomyopathy-associated and syndrome-specific contexts. AF overlaps VA; it is not a subset of VA.'},
 {id:'va',name:'Ventricular arrhythmia',short:'VA',color:'#49818c',light:'#edf5f5',description:'Selected primary electrical and structural cardiomyopathy contexts for ventricular arrhythmia. Non-exhaustive membership; this is not a high-risk genotype list.'},
 ...panels.slice(2),
];
export const clinicalPanels = clinicalDefinitions.map(p=>({...p,count:genes.filter(g=>hasClinicalGroup(g,p.id)).length}));
export const clinicalPanelById = (id:string)=>clinicalPanels.find(p=>p.id===id)!;
export function clinicalGroupsFor(g:Gene) {return clinicalPanels.filter(p=>p.id!=='arrhythmia'&&hasClinicalGroup(g,p.id));}
export function vennRegionId(g:Gene):string {return ['va','dcm','hcm','af'].map(id=>hasClinicalGroup(g,id)?'1':'0').join('');}
export const regionDefinitions = [
 {id:'0001',label:'Familial / early-onset AF focus',description:'MYL4 and HCN4: selected atrial-predominant / sinus-node contexts without separate VA, DCM or HCM membership here. Familial AF also occurs in overlaps. This does not exclude ventricular risk.'},
 {id:'1000',label:'VA only',description:'Selected VA association without AF, DCM or HCM membership in this map.'},
 {id:'1001',label:'VA + AF',description:'Separate ventricular and atrial arrhythmia contexts, without DCM or HCM membership.'},
 {id:'1100',label:'VA + DCM',description:'VA and DCM, without AF or HCM membership.'},
 {id:'1101',label:'VA + DCM + AF',description:'VA, DCM and AF, without HCM membership.'},
 {id:'1010',label:'VA + HCM',description:'VA and HCM/LVH, without AF or DCM membership.'},
 {id:'1011',label:'VA + HCM + AF',description:'VA, HCM and AF, without DCM membership.'},
 {id:'1110',label:'VA + DCM + HCM',description:'All three main phenotypes, without selected AF membership.'},
 {id:'1111',label:'VA + DCM + HCM + AF',description:'Selected associations with all four clinical groups; variant mechanisms can differ.'},
 {id:'0100',label:'DCM only',description:'DCM without other selected map memberships. Absence from VA is not a claim of no ventricular risk.'},
 {id:'0010',label:'HCM / LVH only',description:'HCM/LVH without other selected map memberships. HCM can carry ventricular risk even without separate VA membership here.'},
 {id:'0110',label:'DCM + HCM',description:'DCM and HCM/LVH without separate VA or AF membership in this selected map.'},
];
export const clinicalRegions = regionDefinitions.map(r=>({...r,genes:genes.filter(g=>vennRegionId(g)===r.id),count:genes.filter(g=>vennRegionId(g)===r.id).length}));
const threeCircleDefinitions = [
 {id:'100',label:'VA only',description:'Selected VA association without DCM or HCM membership. AF is not separated in this view.'},
 {id:'110',label:'VA + DCM',description:'VA and DCM without HCM membership. AF is not separated in this view.'},
 {id:'101',label:'VA + HCM',description:'VA and HCM/LVH without DCM membership. AF is not separated in this view.'},
 {id:'111',label:'VA + DCM + HCM',description:'All three main phenotypes. AF is not separated in this view.'},
 {id:'010',label:'DCM only',description:'DCM without separate selected VA or HCM membership; ventricular risk is not excluded.'},
 {id:'001',label:'HCM / LVH only',description:'HCM/LVH without separate selected VA or DCM membership; ventricular risk is not excluded.'},
 {id:'011',label:'DCM + HCM',description:'DCM and HCM/LVH without separate selected VA membership.'},
];
const threeCircleRegions = threeCircleDefinitions.map(r=>{const members=genes.filter(g=>vennRegionId(g).slice(0,3)===r.id);return {...r,genes:members,count:members.length};});
export function clinicalRegionsFor(showAf=false){return showAf?clinicalRegions:threeCircleRegions;}
export function isInVennRegion(g:Gene,region:string){return region.length===3?vennRegionId(g).slice(0,3)===region:vennRegionId(g)===region;}
export const mappedGenes = genes.filter(g=>vennRegionId(g)!=='0000');
export const mapGenesFor = (showAf=false)=>genes.filter(g=>showAf?vennRegionId(g)!=='0000':vennRegionId(g).slice(0,3)!=='000');
export const clinicalSharedGenes = genes.filter(g=>['va','dcm','hcm','af'].filter(id=>hasClinicalGroup(g,id)).length>1);
export const retainedUnmappedGenes = sourceGenes.filter(g=>g.panels.some(p=>['cardiomyopathy','arrhythmia'].includes(p))&&vennRegionId(g)==='0000');
export function searchGenes(query:string, panel:string='all', scope:Scope='all', region:string|null=null) {
 const terms=query.toLowerCase().replace(/[–—-]/g,' ').trim().split(/\s+/).filter(Boolean);
 const exactGroup=clinicalPanels.find(p=>[p.short.toLowerCase(),p.name.toLowerCase()].includes(query.trim().toLowerCase()));
 return genes.filter(g=>(panel==='all'||(panel.startsWith('source:')?g.panels.includes(panel.slice(7)):hasClinicalGroup(g,panel)))&&(!region||isInVennRegion(g,region))&&(scope!=='added'||isAdded(g))&&(scope!=='shared'||clinicalSharedGenes.includes(g))&&(scope!=='baseline'||!isAdded(g))&&(exactGroup?hasClinicalGroup(g,exactGroup.id):terms.every(t=>[g.symbol,g.name,...g.aliases,...g.phenotypes,g.inheritance,g.relevance,...clinicalGroupsFor(g).map(p=>p.name+' '+p.short),...externalData.syndromes.filter(s=>s.genes.includes(g.symbol)).flatMap(s=>[s.name,...s.keywords,...s.clues.map(c=>c.text)])].join(' ').toLowerCase().replace(/[–—-]/g,' ').includes(t)))).sort((a,b)=>{
  if(query.trim().toUpperCase()===a.symbol)return -1;
  if(query.trim().toUpperCase()===b.symbol)return 1;
  return a.symbol.localeCompare(b.symbol);
 });
}
export const inheritanceHelp='AD: autosomal dominant · AR: autosomal recessive · X-linked: X chromosome inheritance. Semidominant: both monoallelic and biallelic disease, often with greater severity in biallelic individuals. Patterns depend on the specific disease and variant.';
