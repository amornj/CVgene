import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const load=code=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
const frequency=await load(read('../src/frequency.ts').replace("import frequencyData from './data/frequency.json';",`const frequencyData=${JSON.stringify(json('../src/data/frequency.json'))};`));
let dataCode=read('../src/data.ts');
for(const [name,file] of Object.entries({metadata:'metadata',clinicalData:'clinical',phenotypeData:'clinical-groups',extensionData:'extensions',externalData:'external-phenotypes'}))dataCode=dataCode.replace(`import ${name} from './data/${file}.json';`,`const ${name}=${JSON.stringify(json('../src/data/'+file+'.json'))};`);
const {genes,hasClinicalGroup,vennRegionId}=await load(dataCode);
const {frequencyDatasets,frequencySections,frequencyById,estimateFor,estimateBounds,formatEstimate,sortedEstimates,contextsForGene,unquantifiedGenes,frequencyForGroup}=frequency;
const gene=symbol=>genes.find(g=>g.symbol===symbol);

test('Every estimate has a traceable population, denominator and existing clinical membership',()=>{
 assert.equal(new Set(frequencyDatasets.map(d=>d.id)).size,frequencyDatasets.length);
 for(const dataset of frequencyDatasets){
  assert.ok(dataset.population.length>20,dataset.id);
  assert.ok(dataset.denominator.length>25,dataset.id);
  assert.ok(dataset.caveat.length>80,dataset.id);
  assert.ok(dataset.sources.length>0,dataset.id);
  for(const source of dataset.sources){assert.ok(source.label&&source.detail);assert.equal(new URL(source.url).protocol,'https:');}
  assert.equal(new Set(dataset.entries.map(e=>e.symbol)).size,dataset.entries.length);
  for(const e of dataset.entries){assert.ok(gene(e.symbol),e.symbol);assert.ok(hasClinicalGroup(gene(e.symbol),dataset.group),`${dataset.id} / ${e.symbol}`);if(['dcm','hcm','af','va'].includes(dataset.group))assert.notEqual(vennRegionId(gene(e.symbol)),'0000');}
  for(const symbol of dataset.eligibleSymbols||[]){assert.ok(gene(symbol),symbol);assert.ok(hasClinicalGroup(gene(symbol),dataset.group),`${dataset.id} scope / ${symbol}`);}
 }
});

test('Ranges, upper bounds and rounded count estimates preserve their original meaning',()=>{
 for(const dataset of frequencyDatasets)for(const e of dataset.entries){
  const {low,high}=estimateBounds(e);
  assert.ok(Number.isFinite(low)&&Number.isFinite(high));assert.ok(low>=0&&high>0&&high<=100&&low<=high,`${dataset.id}/${e.symbol}`);
  if(e.kind==='range'){assert.ok(e.low<e.high);assert.equal(formatEstimate(e),`${e.low}–${e.high}%`);}
  if(e.kind==='upper'){assert.equal(low,0);assert.equal(formatEstimate(e),`<${e.limit}%`);}
  if(e.kind==='lower'){assert.ok(e.limit<100);assert.equal(low,e.limit);assert.equal(high,100);assert.equal(formatEstimate(e),`>${e.limit}%`);}
  if(e.kind==='count'){assert.ok(Number.isInteger(e.count)&&Number.isInteger(e.total)&&e.count>0&&e.total>=e.count);assert.equal(low,e.count/e.total*100);assert.ok(['patients','families'].includes(e.unit||'patients'));}
 }
 assert.deepEqual(estimateBounds(estimateFor('dcm','TTN')),{low:15,high:20});
 assert.equal(formatEstimate(estimateFor('hcm','ACTC1')),'<3%');
});

test('Early-onset AF uses patient counts over all 1,293 tested patients, not positive tests or mortality',()=>{
 const dataset=frequencyById('af');
 assert.match(dataset.denominator,/1,293 tested patients/);
 assert.match(dataset.caveat,/does not establish that it caused AF/);
 for(const [symbol,count,label] of [['TTN',38,'2.9%'],['MYH7',18,'1.4%'],['LMNA',9,'0.7%'],['KCNQ1',8,'0.6%']]){
  const e=estimateFor('af',symbol);assert.equal(e.kind,'count');assert.equal(e.total,1293);assert.equal(e.count,count);assert.equal(formatEstimate(e),label);
 }
 assert.equal(estimateFor('af','MYH6'),null,'An absent catalog gene is not silently introduced');
});

test('HCM genetic-diagnosis shares are not presented as the yield among all HCM cases',()=>{
 const dataset=frequencyById('hcm');
 assert.match(dataset.denominator,/Genetically solved HCM cases/);
 assert.match(dataset.caveat,/LVH phenocopies.*excluded/);
 assert.equal(estimateFor('hcm','MYBPC3').value,50);assert.equal(estimateFor('hcm','MYH7').value,33);
 assert.equal(estimateFor('hcm','GLA'),null);
 assert.ok(unquantifiedGenes(dataset,genes).some(g=>g.symbol==='GLA'));
});

test('Missing estimates stay null and cannot turn into a 0% bar or a cross-disease estimate',()=>{
 assert.equal(estimateFor('dcm','DSP'),null);
 assert.equal(estimateFor('af','MYL4'),null);
 assert.equal(estimateFor('hcm','TTN'),null);
 assert.ok(unquantifiedGenes(frequencyById('af'),genes).some(g=>g.symbol==='MYL4'));
 assert.ok(!unquantifiedGenes(frequencyById('dcm'),genes).some(g=>g.symbol==='TTN'));
 assert.deepEqual(unquantifiedGenes(frequencyById('lqts'),genes),[],'All VA genes are not implicitly LQTS genes');
 assert.ok(!contextsForGene(gene('PKP2')).some(d=>d.id==='lqts'));
});

test('Arrhythmia contexts remain syndrome and variant-mechanism specific',()=>{
 assert.equal(formatEstimate(estimateFor('lqts','SCN5A')),'5–10%');
 assert.match(estimateFor('lqts','SCN5A').note,/Gain-of-function/);
 assert.equal(formatEstimate(estimateFor('brugada','SCN5A')),'~20%');
 assert.match(estimateFor('brugada','SCN5A').note,/Loss-of-function/);
 assert.deepEqual(frequencyById('brugada').entries.map(e=>e.symbol),['SCN5A']);
 assert.match(estimateFor('dcm','TTN').note,/Truncating/);
 for(const symbol of ['CAV3','CACNB2','GPD1L','KCNE2'])assert.equal(contextsForGene(gene(symbol)).length,0,symbol);
 assert.equal(frequencyForGroup('arrhythmia','dcm'),'lqts');
 assert.equal(frequencyForGroup('va','cpvt'),'cpvt');
 assert.equal(frequencyForGroup('hcm','cpvt'),'hcm');
});

test('Frequency ordering is descending without mutating or normalizing source estimates',()=>{
 for(const dataset of frequencyDatasets){
  const original=JSON.stringify(dataset.entries);
  const sorted=sortedEstimates(dataset);
  for(let i=1;i<sorted.length;i++)assert.ok(estimateBounds(sorted[i-1]).high>=estimateBounds(sorted[i]).high);
  assert.equal(JSON.stringify(dataset.entries),original);
 }
 assert.equal(sortedEstimates(frequencyById('hcm'))[0].symbol,'MYBPC3');
 assert.equal(sortedEstimates(frequencyById('af'))[0].symbol,'TTN');
 assert.equal(sortedEstimates(frequencyById('cpvt'))[0].symbol,'RYR2');
});

test('HTAD uses all 810 referrals, with sequence and CNV findings kept distinct',()=>{
 const dataset=frequencyById('htad');
 assert.equal(dataset.entries.reduce((n,e)=>n+e.count,0),60);
 assert.ok(dataset.entries.every(e=>e.kind==='count'&&e.total===810));
 assert.equal(estimateFor('htad','FBN1').count,18);
 assert.equal(formatEstimate(estimateFor('htad','FBN1')),'2.2%');
 assert.equal(estimateFor('htad','SMAD3').count,7);
 assert.match(dataset.coverageNote,/Six additional copy-number diagnoses/);
 assert.match(dataset.caveat,/VUS are excluded/);
 assert.equal(estimateFor('htad','MYLK'),null,'Separate CNV diagnoses are not silently added to sequence counts');
 assert.ok(!contextsForGene(gene('LOX')).some(d=>d.id==='htad'),'An untested gene is not assigned to the referral cohort');
});

test('Loeys–Dietz estimates do not become percentages for Marfan or all aortic disease',()=>{
 assert.equal(formatEstimate(estimateFor('lds','TGFBR2')),'55–60%');
 assert.equal(formatEstimate(estimateFor('lds','SMAD2')),'1–5%');
 assert.equal(estimateFor('lds','FBN1'),null);
 assert.ok(!contextsForGene(gene('COL3A1')).some(d=>d.id==='lds'));
 assert.match(frequencyById('lds').denominator,/not all aortic disease/);
 for(const symbol of ['FBN1','ACTA2','BMPR2','EIF2AK4','LDLR'])assert.equal(vennRegionId(gene(symbol)),'0000','Frequency does not move independent-panel genes into the three circles');
});

test('Familial and idiopathic PAH are distinct from PVOD and from penetrance',()=>{
 assert.equal(formatEstimate(estimateFor('pah_familial','BMPR2')),'60–80%');
 assert.equal(formatEstimate(estimateFor('pah_idiopathic','BMPR2')),'10–20%');
 assert.match(frequencyById('pah_familial').caveat,/not the probability/);
 assert.equal(estimateFor('pah_familial','EIF2AK4'),null);
 assert.ok(!contextsForGene(gene('EIF2AK4')).some(d=>d.id==='pah_familial'));
 assert.deepEqual(contextsForGene(gene('EIF2AK4')).map(d=>d.id),['pvod_sporadic','pvod_familial']);
});

test('PVOD discovery counts preserve family versus patient denominators',()=>{
 const familial=estimateFor('pvod_familial','EIF2AK4'),sporadic=estimateFor('pvod_sporadic','EIF2AK4');
 assert.equal(familial.count,13);assert.equal(familial.total,13);assert.equal(familial.unit,'families');
 assert.equal(sporadic.count,5);assert.equal(sporadic.total,20);assert.equal(sporadic.unit||'patients','patients');
 assert.equal(formatEstimate(sporadic),'25.0%');
 assert.match(frequencyById('pvod_familial').coverageNote,/not universal test sensitivity/);
 assert.match(frequencyById('pvod_sporadic').caveat,/Both EIF2AK4 alleles/);
});

test('FH preserves the LDLR lower bound and excludes other lipid disorders from FH membership',()=>{
 const ldlr=estimateFor('fh','LDLR');
 assert.equal(ldlr.kind,'lower');assert.equal(formatEstimate(ldlr),'>50%');
 assert.deepEqual(estimateBounds(ldlr),{low:50,high:100});
 assert.equal(sortedEstimates(frequencyById('fh'))[0].symbol,'LDLR');
 for(const symbol of ['ABCG5','ABCG8','APOE','LIPA']){assert.equal(estimateFor('fh',symbol),null);assert.ok(!contextsForGene(gene(symbol)).some(d=>d.id==='fh'));}
 assert.match(estimateFor('fh','PCSK9').note,/Gain-of-function/);
 assert.match(estimateFor('fh','LDLRAP1').note,/Biallelic/);
 assert.deepEqual(unquantifiedGenes(frequencyById('fh'),genes),[],'Other lipid diseases are not labeled as unquantified FH genes');
});

test('All contexts are reachable exactly once and panel headings choose an appropriate default',()=>{
 const selectable=frequencySections.flatMap(s=>s.contexts);
 assert.equal(selectable.length,new Set(selectable).size);
 assert.deepEqual(new Set(selectable),new Set(frequencyDatasets.map(d=>d.id)));
 assert.equal(frequencyForGroup('aortopathy','dcm'),'htad');
 assert.equal(frequencyForGroup('aortopathy','lds'),'lds');
 assert.equal(frequencyForGroup('pah','hcm'),'pah_familial');
 assert.equal(frequencyForGroup('pah','pvod_sporadic'),'pvod_sporadic');
 assert.equal(frequencyForGroup('lipid','dcm'),'fh');
});
