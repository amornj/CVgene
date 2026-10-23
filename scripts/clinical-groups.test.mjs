import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const files={metadata:'metadata',clinicalData:'clinical',phenotypeData:'clinical-groups',extensionData:'extensions',externalData:'external-phenotypes'};
let code=readFileSync(new URL('../src/data.ts',import.meta.url),'utf8');
for(const [name,file] of Object.entries(files))code=code.replace(`import ${name} from './data/${file}.json';`,`const ${name}=${JSON.stringify(read('../src/data/'+file+'.json'))};`);
const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const data=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const {genes,sourceGenes,clinicalPanels,clinicalRegions,clinicalRegionsFor,mappedGenes,hasClinicalGroup,vennRegionId,searchGenes,isAdded,references}=data;
const bySymbol=s=>genes.find(g=>g.symbol===s);
test('Clinical views have explicit memberships with independent AF and VA sets',()=>{
 for(const [id,count] of Object.entries({arrhythmia:29,af:13,va:27,dcm:20,hcm:26}))assert.equal(clinicalPanels.find(p=>p.id===id).count,count,id);
 for(const g of genes){if(hasClinicalGroup(g,'af')||hasClinicalGroup(g,'va'))assert.ok(hasClinicalGroup(g,'arrhythmia'),g.symbol);}
});
test('All twelve map regions are disjoint and cover the mapped union exactly once',()=>{
 const symbols=clinicalRegions.flatMap(r=>r.genes.map(g=>g.symbol));assert.equal(symbols.length,new Set(symbols).size);assert.equal(symbols.length,mappedGenes.length);assert.equal(mappedGenes.length,53);
 assert.deepEqual(new Set(symbols),new Set(mappedGenes.map(g=>g.symbol)));
 for(const r of clinicalRegions){assert.equal(r.genes.length,r.count);for(const g of r.genes)assert.equal(vennRegionId(g),r.id);}
 assert.deepEqual(clinicalRegions.find(r=>r.id==='1111').genes.map(g=>g.symbol),['FLNC','MYH7']);
 assert.deepEqual(clinicalRegions.find(r=>r.id==='1011').genes.map(g=>g.symbol),['MYBPC3']);
});
test('PDF provenance remains immutable and the single MYL4 extension is distinguished',()=>{
 assert.equal(genes.length,103);assert.equal(sourceGenes.length,102);assert.equal(sourceGenes.filter(g=>g.added).length,16);assert.equal(genes.filter(isAdded).length,17);
 const g=bySymbol('MYL4');assert.equal(g.catalogAddition,true);assert.equal(g.added,false);assert.deepEqual(g.panels,[]);assert.equal(g.hgncId,'HGNC:7585');assert.equal(g.ncbiId,'4635');assert.equal(hasClinicalGroup(g,'va'),false);
 assert.equal(isAdded(bySymbol('HCN4')),false,'HCN4 is black in the original PDF arrhythmia panel');
 assert.equal(searchGenes('','source:arrhythmia').length,28);assert.equal(searchGenes('','source:cardiomyopathy').length,43);assert.equal(searchGenes('','all','baseline').length,86);
});
test('AF contexts distinguish familial focus, cardiomyopathy, and syndrome-specific effects',()=>{
 for(const s of ['SCN5A','KCNQ1','TTN','MYL4'])assert.equal(bySymbol(s).clinical.af.kind,'Familial AF focus');
 for(const s of ['LMNA','PKP2','FLNC','DSP','MYH7','MYBPC3'])assert.equal(bySymbol(s).clinical.af.kind,'Cardiomyopathy-associated AF');
 for(const s of ['KCNH2','KCNJ2'])assert.equal(bySymbol(s).clinical.af.kind,'Short-QT variant context');
 assert.equal(bySymbol('HCN4').clinical.af.kind,'Sinus-node / AF context');
 assert.match(bySymbol('TTN').clinical.af.note,/truncating/);assert.match(bySymbol('MYL4').clinical.af.note,/biallelic/);
});
test('Historical disputed candidates are not silently promoted; disease-specific HCM exclusions hold',()=>{
 for(const s of ['CAV3','CACNB2','GPD1L','KCNE2'])assert.equal(vennRegionId(bySymbol(s)),'0000',s);
 for(const s of ['TTN','SCN5A','KCNQ1','RBM20','NEXN','DSP'])assert.equal(hasClinicalGroup(bySymbol(s),'hcm'),false,s);
 assert.equal(hasClinicalGroup(bySymbol('CACNA1C'),'hcm'),true);assert.equal(bySymbol('CACNA1C').panels.includes('cardiomyopathy'),false);
 assert.match(bySymbol('GLA').clinical.hcm.kind,/phenocopy/);assert.match(bySymbol('JPH2').clinical.dcm.note,/conflict/);
});
test('Exact phenotype aliases avoid substring false positives and compose with filters',()=>{
 for(const [q,count] of Object.entries({AF:13,VA:27,DCM:20,HCM:26,ARR:29,'atrial fibrillation':13,'ventricular arrhythmia':27}))assert.equal(searchGenes(q).length,count,q);
 assert.equal(searchGenes('AF').some(g=>g.symbol==='RAF1'),false);assert.equal(searchGenes('MYL4','af','added').length,1);
 assert.equal(searchGenes('MYL4','va').length,0);assert.equal(searchGenes('','all','all','1111').length,2);
});
test('All clinical evidence and extensions have functional reference keys and complete content',()=>{
 for(const g of genes){assert.ok(g.relevance?.length>60,g.symbol);assert.ok(g.consideration?.length>30,g.symbol);for(const e of Object.values(g.clinical)){assert.ok(e.kind&&e.note&&e.reference,g.symbol);assert.ok(references[e.reference]?.url.startsWith('https://'),g.symbol);}}
});
test('Every complete gene button fits its exact circles in both AF modes',()=>{
 const layout=read('../src/data/venn-layout.json');
 const {chipWidth:w,chipHeight:h}=layout;
 for(const showAf of [false,true]){
  const {circles,slots,titles}=layout.modes[showAf?'af':'main'];
  const circleOrder=showAf?['va','dcm','hcm','af']:['va','dcm','hcm'];
  const boxes=[];
  for(const region of clinicalRegionsFor(showAf)){
   assert.equal(slots[region.id].length,region.genes.length,region.label);
   slots[region.id].forEach(([x,y],i)=>{
    const symbol=region.genes[i].symbol;
    assert.ok(x-w/2>=0&&x+w/2<=layout.width&&y-h/2>=0&&y+h/2<=layout.height,symbol+' outside canvas');
    circleOrder.forEach((key,bit)=>{
     const c=circles[key],dx=Math.abs(x-c.x),dy=Math.abs(y-c.y);
     const farthest=Math.hypot(dx+w/2,dy+h/2);
     const nearest=Math.hypot(Math.max(0,dx-w/2),Math.max(0,dy-h/2));
     assert.ok(region.id[bit]==='1'?farthest<c.r-1:nearest>c.r+1,`${symbol}: ${key} boundary`);
    });
    for(const title of Object.values(titles))assert.ok(Math.abs(x-title.x)>(w+title.width)/2||Math.abs(y-title.y)>(h+title.height)/2,`${symbol} covers a circle title`);
    boxes.push({x,y,symbol});
   });
  }
  assert.equal(boxes.length,showAf?53:51);
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(Math.abs(a.x-b.x)>=w+2||Math.abs(a.y-b.y)>=h+2,`${a.symbol} overlaps ${b.symbol}`);}
 }
 const {af,va}=layout.modes.af.circles;
 const distance=Math.hypot(af.x-va.x,af.y-va.y);
 assert.ok(distance<af.r+va.r,'AF and VA overlap');
 assert.ok(distance>Math.abs(af.r-va.r),'Neither AF nor VA contains the other');
});

test('AF off shows the VA/DCM/HCM union; AF-only genes stay searchable',()=>{
 const simple=clinicalRegionsFor();
 assert.equal(simple.length,7);
 assert.deepEqual(Object.fromEntries(simple.map(r=>[r.id,r.count])),{'100':16,'110':5,'101':2,'111':4,'010':4,'001':13,'011':7});
 assert.equal(clinicalRegionsFor(true),clinicalRegions);
 const symbols=simple.flatMap(r=>r.genes.map(g=>g.symbol));
 assert.equal(symbols.length,51);assert.equal(new Set(symbols).size,51);
 for(const region of simple){assert.deepEqual(searchGenes('','all','all',region.id).map(g=>g.symbol),region.genes.map(g=>g.symbol));}
 assert.deepEqual(searchGenes('','all','all','111').map(g=>g.symbol),['DES','FLNC','MYH7','PLN']);
 assert.deepEqual(searchGenes('','all','all','1111').map(g=>g.symbol),['FLNC','MYH7']);
 assert.equal(searchGenes('MYL4','all','all','100').length,0);
 assert.equal(searchGenes('','af').length,13);
 assert.deepEqual(clinicalRegions.find(r=>r.id==='0001').genes.map(g=>g.symbol),['HCN4','MYL4']);
 assert.equal(searchGenes('MYL4').length,1);assert.equal(searchGenes('HCN4').length,1);
});

test('Familial AF focus includes overlap genes; structural VA is not a high-risk genotype assertion',()=>{
 for(const s of ['SCN5A','KCNQ1','TTN']){
  assert.equal(bySymbol(s).clinical.af.kind,'Familial AF focus');
  assert.equal(hasClinicalGroup(bySymbol(s),'va'),true);
 }
 for(const s of ['MYH7','MYBPC3']){
  assert.equal(bySymbol(s).clinical.va.kind,'HCM-associated VA context');
  assert.match(bySymbol(s).clinical.va.note,/not an isolated channelopathy/);
 }
 assert.match(bySymbol('MYL4').clinical.af.note,/not a guarantee/);
 assert.match(bySymbol('HCN4').clinical.af.note,/ventricular arrhythmias/);
});
