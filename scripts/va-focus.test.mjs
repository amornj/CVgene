import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const load=code=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
let code=read('../src/data.ts');
for(const [name,file] of Object.entries({metadata:'metadata',clinicalData:'clinical',phenotypeData:'clinical-groups',extensionData:'extensions',externalData:'external-phenotypes'}))code=code.replace(`import ${name} from './data/${file}.json';`,`const ${name}=${JSON.stringify(json('../src/data/'+file+'.json'))};`);
const {genes,mapGenesFor}=await load(code);
const {vaAssociations,vaFocusGroups,vaFocusSources,vaFocusSymbols,matchesMapHighlight,vaSubtypeOptions,vaContextsForGene,vaExportFields,vaExportHeaders,vaSummary}=await load(read('../src/va-focus.ts').replace("import focusData from './data/va-focus.json';",`const focusData=${JSON.stringify(json('../src/data/va-focus.json'))};`));
const symbols=id=>vaFocusSymbols(id);
const association=(symbol,context)=>vaAssociations.find(a=>a.symbol===symbol&&a.context===context);

test('VA associations are explicit, traceable and confined to existing VA catalog membership',()=>{
 assert.equal(vaAssociations.length,36);
 assert.equal(new Set(vaAssociations.map(a=>a.symbol+':'+a.context)).size,vaAssociations.length);
 assert.deepEqual(new Set(symbols('all')),new Set(genes.filter(g=>g.clinical.va).map(g=>g.symbol)));
 for(const a of vaAssociations){
  assert.ok(genes.some(g=>g.symbol===a.symbol&&g.clinical.va),a.symbol);
  assert.ok(a.mechanism&&a.inheritance&&a.evidence&&a.note,a.symbol);
  assert.ok(['structural','electrical'].includes(a.family));
  assert.ok(a.sources.length);
  for(const id of a.sources){assert.ok(vaFocusSources[id]?.title,id);assert.equal(new URL(vaFocusSources[id].url).protocol,'https:');}
 }
});

test('ACM includes broader FLNC and LMNA contexts without calling all structural VA ARVC',()=>{
 assert.deepEqual(symbols('acm'),['DES','DSC2','DSG2','DSP','FLNC','JUP','LMNA','PKP2','PLN','TMEM43']);
 for(const symbol of ['FLNC','LMNA'])assert.match(association(symbol,'acm').note,/not the same as a definitive ARVC/);
 for(const symbol of ['PLN','DES'])assert.match(association(symbol,'acm').evidence,/Moderate ARVC.*2021/);
 assert.match(association('DSP','acm').note,/Left-predominant/);
 for(const symbol of ['RYR2','KCNJ2','TTN','RBM20','MYH7'])assert.equal(symbols('acm').includes(symbol),false,symbol);
 assert.equal(association('SCN5A','structural').family,'structural');
});

test('Long and short QT retain opposite selected mechanisms and syndrome-specific coverage',()=>{
 assert.deepEqual(symbols('lqts'),['CACNA1C','CALM1','CALM2','CALM3','KCNE1','KCNH2','KCNQ1','SCN5A','TRDN']);
 assert.deepEqual(symbols('sqts'),['KCNH2','KCNJ2','KCNQ1']);
 for(const symbol of ['KCNQ1','KCNH2']){
  assert.match(association(symbol,'lqts').mechanism,/Loss of function.*delays repolarization/);
  assert.match(association(symbol,'sqts').mechanism,/gain-of-function.*shorten repolarization/);
 }
 assert.match(association('KCNE1','lqts').inheritance,/Autosomal recessive/);
 assert.match(association('CACNA1C','lqts').evidence,/Timothy.*moderate isolated-LQTS/);
 assert.match(vaFocusGroups.find(g=>g.id==='sqts').scope,/SLC4A3 is outside this catalog/);
 for(const symbol of ['CAV3','KCNE2','TECRL','KCNJ2'])assert.equal(symbols('lqts').includes(symbol),false,symbol);
});

test('KCNJ2 is Andersen–Tawil or selected SQTS; bidirectional VT does not automatically mean CPVT',()=>{
 assert.deepEqual(symbols('ats'),['KCNJ2']);
 assert.match(association('KCNJ2','ats').mechanism,/Loss of function/);
 assert.match(association('KCNJ2','ats').note,/Cardiomyopathy is not required/);
 assert.match(association('KCNJ2','sqts').evidence,/Moderate SQTS.*2022/);
 assert.equal(symbols('cpvt').includes('KCNJ2'),false);
 assert.deepEqual(symbols('cpvt'),['CALM1','CALM2','CALM3','CASQ2','RYR2','TECRL','TRDN']);
 assert.deepEqual(symbols('brugada'),['SCN5A']);
 // 'all' is first so enabling VA shows every VA gene before narrowing to a subtype.
 assert.deepEqual(vaSubtypeOptions.map(option=>option.id),['all','acm','lqts','sqts','cpvt','brugada','ats']);
 assert.deepEqual(symbols('all').length,new Set(vaAssociations.map(a=>a.symbol)).size);
});

test('Functional effects are not universal gene rules and structural/electrical contexts can overlap',()=>{
 assert.match(association('SCN5A','lqts').mechanism,/gain-of-function.*late sodium current/);
 assert.match(association('SCN5A','brugada').mechanism,/loss-of-function/);
 assert.deepEqual(new Set(vaContextsForGene('SCN5A').map(a=>a.family)),new Set(['structural','electrical']));
 assert.match(association('RYR2','cpvt').note,/Loss-of-function.*different calcium-release deficiency/);
 assert.match(association('CASQ2','cpvt').inheritance,/recessive.*dominant/);
 assert.match(association('TECRL','cpvt').note,/not.*typical isolated-LQTS/);
 assert.equal(vaContextsForGene('HCN4').length,0);
});

test('Every focus stays available in both AF modes without changing positions or PDF status',()=>{
 for(const group of vaFocusGroups)for(const showAf of [false,true]){
  const mapped=new Set(mapGenesFor(showAf).map(g=>g.symbol));
  for(const symbol of symbols(group.id))assert.ok(mapped.has(symbol),symbol);
 }
 const frequency=json('../src/data/frequency.json').datasets;
 for(const id of ['lqts','cpvt','brugada']){
  const context=frequency.find(c=>c.id===id);
  for(const entry of context.entries)assert.ok(symbols(id).includes(entry.symbol),id+':'+entry.symbol);
 }
});

test('Inspector sorting and summaries preserve all contexts and their sources',()=>{
 const original=vaContextsForGene('KCNJ2').map(a=>a.context);
 assert.equal(vaContextsForGene('KCNJ2','sqts')[0].context,'sqts');
 assert.deepEqual(vaContextsForGene('KCNJ2').map(a=>a.context),original);
 assert.equal(vaExportFields('KCNJ2').length,vaExportHeaders.length);
 assert.match(vaSummary('KCNJ2'),/Andersen–Tawil.*\nLoss of function/);
 assert.match(vaSummary('KCNJ2'),/Short QT.*\nSelected gain-of-function/);
 assert.match(vaSummary('SCN5A'),/https:\/\//);
 assert.equal(vaSummary('HCN4'),'');
 assert.ok(vaExportFields('HCN4').every(v=>v===''));
});


test('Phenotype highlighting intersects a subtype without excluding other catalog genes by default',()=>{
 const syndromes=json('../src/data/external-phenotypes.json').syndromes;
 const physical=new Set(syndromes.filter(s=>s.cue==='external').flatMap(s=>s.genes));
 assert.equal(matchesMapHighlight('FBN1','all',physical),true);
 assert.equal(matchesMapHighlight('JUP','acm',physical),true);
 assert.equal(matchesMapHighlight('KCNJ2','acm',physical),false);
 assert.equal(matchesMapHighlight('LMNA','acm',physical),false);
 assert.equal(matchesMapHighlight('KCNE1','all',physical),false,'History-only hearing clues are not external morphology');
 assert.equal(matchesMapHighlight('FBN1','all'),true,'Turning both toggles off restores all catalog genes');
});

