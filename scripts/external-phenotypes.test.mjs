import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const load=code=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
let code=read('../src/data.ts');
for(const [name,file] of Object.entries({metadata:'metadata',clinicalData:'clinical',phenotypeData:'clinical-groups',extensionData:'extensions',externalData:'external-phenotypes'}))code=code.replace(`import ${name} from './data/${file}.json';`,`const ${name}=${JSON.stringify(json('../src/data/'+file+'.json'))};`);
const {genes,searchGenes}=await load(code);
const {externalSyndromes,syndromesForGene,hasExternalPhenotype,matchesClue,phenotypePanelStatus,phenotypeExportFields,phenotypeExportHeaders,phenotypeSummary}=await load(read('../src/external-phenotypes.ts').replace("import externalData from './data/external-phenotypes.json';",`const externalData=${JSON.stringify(json('../src/data/external-phenotypes.json'))};`));
const byId=id=>externalSyndromes.find(s=>s.id===id);
const gene=s=>genes.find(g=>g.symbol===s);

test('Curated syndromes use only catalog genes and preserve PDF provenance',()=>{
 const expected='JUP DSP TGFBR1 TGFBR2 SMAD2 SMAD3 TGFB2 TGFB3 FBN1 COL3A1 LDLR APOB PCSK9 LDLRAP1 ABCG5 ABCG8 GLA LAMP2 CACNA1C KCNJ2 KCNQ1 KCNE1 PTPN11 RAF1 RIT1 DMD'.split(' ');
 assert.equal(externalSyndromes.length,15);
 assert.deepEqual(new Set(externalSyndromes.flatMap(s=>s.genes)),new Set(expected));
 assert.equal(genes.filter(g=>hasExternalPhenotype(g.symbol)).length,26);
 assert.deepEqual(expected.filter(s=>gene(s).added).sort(),['DMD','GLA','TGFB3']);
 for(const s of expected)assert.ok(gene(s).panels.length,s);
 assert.equal(phenotypePanelStatus(undefined),'Candidate · not in catalog');
 assert.match(phenotypePanelStatus(gene('GLA')),/Proposed PDF addition/);
 assert.match(phenotypePanelStatus(gene('JUP')),/Original panel baseline/);
 assert.match(phenotypePanelStatus(gene('MYL4')),/not in PDF/);
 assert.equal(syndromesForGene('LMNA').length,0);
});

test('Each association is traceable, has separate risks, tests, caveats, and honest clue labels',()=>{
 for(const s of externalSyndromes){
  assert.ok(s.mechanism&&s.cardiac&&s.inheritance&&s.testing.length&&s.gaps.length&&s.caveats.length,s.id);
  assert.ok(s.sources.length,s.id);
  for(const r of s.sources){assert.equal(new URL(r.url).protocol,'https:');assert.match(new URL(r.url).hostname,/^(www\.)?(ncbi\.nlm\.nih\.gov|medlineplus\.gov)$/);assert.ok(r.sections);}
  for(const c of s.clues){assert.ok(['characteristic','supportive','nonspecific'].includes(c.strength));assert.ok(['visible','examination','history'].includes(c.kind));}
 }
 assert.equal(byId('danon').cue,'clinical');
 assert.equal(byId('jervell-lange-nielsen').cue,'clinical');
 assert.ok(byId('jervell-lange-nielsen').clues.every(c=>c.kind==='history'));
 for(const id of ['naxos','carvajal'])assert.equal(byId(id).clues.find(c=>c.text==='Curly hair alone').strength,'nonspecific');
 assert.equal(byId('marfan').clues.find(c=>c.text==='Tall stature alone').strength,'nonspecific');
});

test('Recessive syndromes and variant mechanisms are not inferred from a gene label',()=>{
 for(const id of ['naxos','carvajal','sitosterolemia','jervell-lange-nielsen'])assert.match(byId(id).inheritance,/recessive.*biallelic/);
 assert.match(byId('fh').inheritance,/LDLRAP1: recessive/);
 assert.match(byId('fh').caveats.join(' '),/PCSK9 gain-of-function/);
 assert.match(byId('fh').caveats.join(' '),/APOB/);
 assert.match(byId('carvajal').caveats.join(' '),/Monoallelic DSP/);
 assert.match(byId('timothy').caveats.join(' '),/not every variant/);
 assert.match(byId('jervell-lange-nielsen').caveats.join(' '),/one variant in each gene does not establish/);
});

test('Major biochemical, structural-variant and second-allele testing gaps stay explicit',()=>{
 assert.match(byId('sitosterolemia').testing.join(' '),/sitosterol.*campesterol.*GC-MS.*LC-MS/);
 assert.match(byId('sitosterolemia').gaps.join(' '),/routine lipid profile does not measure plant sterols/);
 assert.match(byId('sitosterolemia').caveats.join(' '),/ezetimibe/);
 assert.match(byId('fabry').gaps.join(' '),/Normal enzyme activity does not exclude Fabry in females/);
 for(const id of ['fh','danon','marfan','andersen-tawil'])assert.match(byId(id).gaps.join(' '),/deletion\/duplication/);
 assert.match(byId('timothy').gaps.join(' '),/8 \/ 8A/);
 assert.match(byId('jervell-lange-nielsen').gaps.join(' '),/second-allele/);
});

test('Clue exploration groups alternatives instead of assigning one diagnosis',()=>{
 assert.deepEqual(externalSyndromes.filter(s=>matchesClue(s,'','xanthoma')).map(s=>s.id),['fh','sitosterolemia']);
 assert.deepEqual(externalSyndromes.filter(s=>matchesClue(s,'woolly hair')).map(s=>s.id),['naxos','carvajal']);
 assert.deepEqual(externalSyndromes.filter(s=>matchesClue(s,'bifid uvula')).map(s=>s.id),['loeys-dietz']);
 assert.deepEqual(externalSyndromes.filter(s=>matchesClue(s,'hearing loss')).map(s=>s.id),['jervell-lange-nielsen','noonan-lentigines']);
 assert.equal(matchesClue(byId('fabry'),'','xanthoma'),false);
 assert.equal(matchesClue(byId('loeys-dietz'),'Loeys-Dietz'),true);
});

test('Global clue search composes with original panel and provenance filters',()=>{
 for(const s of ['TGFBR1','TGFBR2','SMAD2','SMAD3','TGFB2','TGFB3'])assert.ok(searchGenes('bifid uvula').some(g=>g.symbol===s),s);
 assert.deepEqual(searchGenes('bifid uvula','aortopathy','added').map(g=>g.symbol),['TGFB3']);
 assert.equal(searchGenes('bifid uvula','lipid').length,0);
 assert.ok(searchGenes('woolly hair').some(g=>g.symbol==='DSP'));
 assert.ok(searchGenes('congenital deafness').some(g=>g.symbol==='KCNE1'));
 assert.ok(searchGenes('Andersen-Tawil').some(g=>g.symbol==='KCNJ2'));
});

test('Copied summaries and exports retain specificity, risks, inheritance, gaps and source links',()=>{
 assert.equal(phenotypeExportFields('GLA').length,phenotypeExportHeaders.length);
 assert.match(phenotypeSummary('GLA'),/Normal enzyme activity does not exclude Fabry in females/);
 assert.match(phenotypeSummary('JUP'),/Curly hair alone — Nonspecific alone/);
 assert.match(phenotypeSummary('JUP'),/https:\/\/www.ncbi.nlm.nih.gov\/books\/NBK1131/);
 assert.match(phenotypeSummary('JUP'),/Cardiac risks:/);
 assert.match(phenotypeSummary('JUP'),/Gene–phenotype connection:.*desmosomes/);
 assert.match(phenotypeExportFields('JUP')[2],/Curly hair alone \[Nonspecific alone; Visible sign\]/);
 assert.match(phenotypeExportFields('DMD')[8],/dystrophin/);
 assert.equal(phenotypeSummary('LMNA'),'');
 assert.ok(phenotypeExportFields('LMNA').every(v=>v===''));
});

test('RASopathy syndromes distinguish gene coverage and cardiac patterns',()=>{
 assert.deepEqual(byId('noonan').genes,['PTPN11','RAF1','RIT1']);
 assert.deepEqual(byId('noonan-lentigines').genes,['PTPN11','RAF1']);
 assert.match(byId('noonan').cardiac,/HCM is particularly associated with RAF1 and RIT1/);
 assert.match(byId('noonan-lentigines').cardiac,/HCM/);
 assert.match(byId('noonan').gaps.join(' '),/not a complete RASopathy panel/);
 assert.match(byId('noonan-lentigines').gaps.join(' '),/BRAF and MAP2K1/);
 assert.deepEqual(searchGenes('LEOPARD syndrome').map(g=>g.symbol).sort(),['PTPN11','RAF1']);
});

test('Dystrophinopathy links muscle and cardiac disease without implying muscle signs are required',()=>{
 const s=byId('dystrophinopathy');
 assert.deepEqual(s.genes,['DMD']);
 assert.equal(gene('DMD').added,true);
 assert.match(s.cardiac,/cardiac-predominant disease can occur/);
 assert.match(s.gaps.join(' '),/deletion\/duplication/);
 assert.equal(s.clues.find(c=>c.text==='Large calves alone').strength,'nonspecific');
 assert.deepEqual(searchGenes('Gowers').map(g=>g.symbol),['DMD']);
});

test('Clinical groups expose relevant syndromes without changing source panels',()=>{
 assert.equal(externalSyndromes.filter(s=>matchesClue(s,'','cardiomyopathy-arrhythmia')).length,10);
 assert.deepEqual(externalSyndromes.filter(s=>matchesClue(s,'','rasopathy')).map(s=>s.id),['noonan','noonan-lentigines']);
 assert.deepEqual(externalSyndromes.filter(s=>matchesClue(s,'','neuromuscular')).map(s=>s.id),['dystrophinopathy']);
 assert.equal(gene('JUP').panels.includes('arrhythmia'),true);
 assert.equal(gene('DSP').panels.includes('arrhythmia'),true);
});

test('Direct syndrome selection keeps Naxos distinct from shared hair and skin clues',()=>{
 assert.deepEqual(externalSyndromes.filter(s=>matchesClue(s,'','all','naxos')).map(s=>s.id),['naxos']);
 assert.equal(matchesClue(byId('carvajal'),'woolly hair','all','naxos'),false);
 assert.equal(matchesClue(byId('naxos'),'Naxos syndrome'),true);
 assert.deepEqual(searchGenes('Naxos syndrome').map(g=>g.symbol),['JUP']);
});

test('The aortic clinical group preserves separate named syndromes and original gene coverage',()=>{
 const aortic=externalSyndromes.filter(s=>matchesClue(s,'','aortic'));
 assert.deepEqual(aortic.map(s=>s.id),['loeys-dietz','marfan','vascular-eds']);
 assert.deepEqual(new Set(aortic.flatMap(s=>s.genes)),new Set(['TGFBR1','TGFBR2','SMAD2','SMAD3','TGFB2','TGFB3','FBN1','COL3A1']));
 assert.equal(matchesClue(byId('naxos'),'','aortic'),false);
 assert.equal(matchesClue(byId('marfan'),'aortic aneurysm','aortic','marfan'),true);
 assert.deepEqual(externalSyndromes.filter(s=>matchesClue(s,'','cardiocutaneous')).map(s=>s.id),['naxos','carvajal']);
});
