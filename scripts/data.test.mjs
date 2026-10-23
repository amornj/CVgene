import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=(p)=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const metadata=read('../src/data/metadata.json');
const clinical=read('../src/data/clinical.json');
const fixture=read('./pdf-membership.json');
const phenotypeData=read('../src/data/clinical-groups.json');
const extensionData=read('../src/data/extensions.json');
let source=readFileSync(new URL('../src/data.ts',import.meta.url),'utf8').replace("import metadata from './data/metadata.json';",`const metadata=${JSON.stringify(metadata)};`).replace("import clinicalData from './data/clinical.json';",`const clinicalData=${JSON.stringify(clinical)};`).replace("import phenotypeData from './data/clinical-groups.json';",`const phenotypeData=${JSON.stringify(phenotypeData)};`).replace("import extensionData from './data/extensions.json';",`const extensionData=${JSON.stringify(extensionData)};`);
source=source.replace("import externalData from './data/external-phenotypes.json';",`const externalData=${JSON.stringify(read('../src/data/external-phenotypes.json'))};`);
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {genes,sourceGenes,panels,references,searchGenes}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('Exact source membership: 102 unique genes and 114 memberships',()=>{
 assert.equal(sourceGenes.length,102);assert.equal(new Set(sourceGenes.map(g=>g.symbol)).size,102);
 assert.equal(sourceGenes.reduce((n,g)=>n+g.panels.length,0),114);
 assert.deepEqual(Object.fromEntries(sourceGenes.map(g=>[g.symbol,{panels:g.panels,added:g.added}])),fixture);
 for(const p of panels)assert.equal(sourceGenes.filter(g=>g.panels.includes(p.id)).length,p.count);
});
test('The exact 16 red source genes are additions, leaving 86 original genes',()=>{
 assert.deepEqual(genes.filter(g=>g.added).map(g=>g.symbol).sort(),['ACTN2','ACVRL1','ALPK3','ATP13A3','DMD','EIF2AK4','ENG','FHOD3','GLA','KCNK3','KDR','NEXN','SOX17','TBX4','TECRL','TGFB3'].sort());
 assert.equal(searchGenes('','all','baseline').length,86);
});
test('Only CM and arrhythmia overlap, with exactly the 12 source genes',()=>{
 assert.deepEqual(sourceGenes.filter(g=>g.panels.length>1).map(g=>g.symbol),['CAV3','DES','DSC2','DSG2','DSP','JUP','LMNA','PKP2','PLN','RYR2','SCN5A','TTN']);
 for(const p of panels.slice(2)) assert.equal(genes.filter(g=>g.panels.includes(p.id)&&g.panels.length>1).length,0);
});
test('Every source gene has an official name, a complete clinical explanation, and live resource URLs',()=>{
 assert.equal(Object.keys(clinical).length,102);
 for(const g of sourceGenes){assert.ok(g.name.length>3,g.symbol);assert.match(g.hgncId,/^HGNC:\d+$/);assert.match(g.ncbiId,/^\d+$/);assert.ok(g.relevance.length>70,g.symbol);assert.ok(g.consideration.length>30,g.symbol);assert.ok(g.phenotypes.length);assert.ok(g.inheritance);assert.ok(references[g.reference],g.symbol);assert.ok(references[g.reference].url.startsWith('https://'));}
});
test('Search matches symbol, full name, alias, and phenotype, without case sensitivity',()=>{
 assert.equal(searchGenes('lmna')[0].symbol,'LMNA');assert.ok(searchGenes('lamin A/C').some(g=>g.symbol==='LMNA'));
 assert.ok(searchGenes('Fabry').some(g=>g.symbol==='GLA'));assert.ok(searchGenes('CPVT').some(g=>g.symbol==='TECRL'));
 const gene=genes.find(g=>g.aliases.length);assert.ok(searchGenes(gene.aliases[0]).some(g=>g.symbol===gene.symbol));
 assert.equal(searchGenes('nonexistentgeneabcdef').length,0);
});
test('Panel, status and search filters compose correctly',()=>{
 assert.equal(searchGenes('','pah','added').length,8);assert.equal(searchGenes('','cardiomyopathy','added').length,6);
 assert.equal(searchGenes('','source:arrhythmia').filter(g=>g.panels.length>1).length,12);assert.equal(searchGenes('','lipid','added').length,0);
 assert.equal(searchGenes('GLA','source:arrhythmia').length,0);assert.equal(searchGenes('GLA','all','added')[0].symbol,'GLA');
});
test('Important interpretation caveats and assay requirements are retained',()=>{
 assert.match(clinical.DMD.consideration,/deletion\/duplication/);assert.match(clinical.GLA.consideration,/females/);
 for(const symbol of ['CACNB2','GPD1L','KCNE2','TCAP'])assert.match(clinical[symbol].caution,/disputed/);
 assert.match(clinical.TGFB3.consideration,/second-priority/);assert.match(clinical.NEXN.consideration,/2026 DCM reassessment/);
 assert.match(clinical.TECRL.inheritance,/AR/);assert.match(clinical.EIF2AK4.inheritance,/AR/);
});
