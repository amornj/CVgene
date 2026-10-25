import {useMemo} from 'react';
import {ArrowUpRight,ChevronDown,ChevronRight,PersonStanding,Search} from 'lucide-react';
import {genes,isAdded,type Gene} from '../data';
import {clueGroups,clinicalClueGroups,clueKind,clueStrength,externalSyndromes,matchesClue,phenotypePanelStatus,syndromesForGene,syndromeFamilies,syndromeFamily,type ExternalSyndrome} from '../external-phenotypes';
import '../external-phenotypes.css';

function Clues({syndrome}:{syndrome:ExternalSyndrome}){
 return <ul className="physical-clue-list">{syndrome.clues.map(c=><li key={c.text}><span>{c.text}</span><small className={`clue-strength strength-${c.strength}`}>{clueStrength[c.strength]}</small><small className="clue-kind">{clueKind[c.kind]}</small></li>)}</ul>;
}

function SyndromeSources({syndrome}:{syndrome:ExternalSyndrome}){
 return <div className="syndrome-sources">{syndrome.sources.map(r=><a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.title}<ArrowUpRight size={12} aria-hidden="true"/><small>{r.sections}</small></a>)}</div>;
}

/** A single syndrome's full external-phenotype record, for the right pane. */
export function SyndromeDetail({syndrome, gene, onGeneOpen}:{syndrome:ExternalSyndrome;gene:Gene|undefined;onGeneOpen?:(gene:Gene)=>void}){
 return <div className="syndrome-detail syndrome-detail--standalone">
  <div className="syndrome-detail-head">
   <span className="inspector-kicker"><PersonStanding size={14} aria-hidden="true"/>External phenotype &amp; syndrome clues</span>
   <h2 className="syndrome-detail-title" tabIndex={-1}>{syndrome.name}</h2>
   <p className="syndrome-detail-sub">{syndrome.cue==='external'?'External phenotype':'History / assessment clue'}</p>
  </div>
  {syndrome.cue==='clinical'&&<p className="clinical-clue-note">History / specialist assessment; no dependable distinctive external appearance.</p>}
  <p className="phenotype-context-note">An association to review, not a diagnosis. Characteristic patterns are more informative than isolated signs; absence does not exclude disease.</p>
  <Clues syndrome={syndrome}/>
  <dl className="syndrome-facts"><dt>Gene–phenotype connection</dt><dd>{syndrome.mechanism}</dd><dt>Cardiac risks</dt><dd>{syndrome.cardiac}</dd><dt>Inheritance &amp; mechanism</dt><dd>{syndrome.inheritance}</dd><dt>Confirmatory evaluation</dt><dd>{syndrome.testing.join(' ')}</dd><dt>Testing gaps to check</dt><dd>{syndrome.gaps.join(' ')}</dd><dt>Caveats</dt><dd>{syndrome.caveats.join(' ')}</dd></dl>
  <div className="syndrome-genes"><p className="syndrome-genes-label">Catalog genes with this association</p><div className="syndrome-gene-list">{syndrome.genes.map(symbol=>{const g=genes.find(x=>x.symbol===symbol);const added=Boolean(g&&isAdded(g));if(!g||!onGeneOpen){return <span key={symbol} className={added?'is-added':undefined}>{symbol}<small>{phenotypePanelStatus(g)}</small></span>;}return <button key={symbol} type="button" className={`syndrome-gene-chip ${added?'is-added':''}`} onClick={()=>onGeneOpen(g)} aria-label={`Open ${symbol} and highlight it on the organ-involvement map`}>{symbol}<ArrowUpRight size={12} aria-hidden="true"/><small>{phenotypePanelStatus(g)}</small></button>;})}</div></div>
  {gene&&<div className="syndrome-coverage"><strong>{phenotypePanelStatus(gene)}</strong><span>In source PDF · laboratory assay coverage unconfirmed.</span></div>}
  <SyndromeSources syndrome={syndrome}/>
  <p className="phenotype-reviewed">Reviewed 23 Oct 2026 · Qualitative teaching labels, not likelihood ratios. A VUS does not establish a syndrome.</p>
 </div>;
}

export function GeneExternalPhenotypes({gene,expanded,preferredSyndrome,onExpandedChange}:{gene:Gene;expanded:boolean;preferredSyndrome:string|null;onExpandedChange:(open:boolean)=>void}){
 const list=syndromesForGene(gene.symbol).sort((a,b)=>Number(b.id===preferredSyndrome)-Number(a.id===preferredSyndrome));
 if(!list.length)return null;
 return <section className="detail-section external-phenotype-section">
  <details open={expanded} onToggle={e=>onExpandedChange(e.currentTarget.open)}>
   <summary id="external-phenotype-heading"><PersonStanding size={16} aria-hidden="true"/><span>External phenotype & syndrome clues<small>{list.map(s=>s.name).join(' · ')}</small></span><ChevronDown size={14} aria-hidden="true"/></summary>
   <p className="phenotype-context-note">An association to review, not a diagnosis. Characteristic patterns are more informative than isolated signs; absence does not exclude disease.</p>
   {list.map(s=><article className="syndrome-detail" key={s.id}>
    <h3>{s.name}</h3>
    {s.cue==='clinical'&&<p className="clinical-clue-note">History / specialist assessment; no dependable distinctive external appearance.</p>}
    <Clues syndrome={s}/>
    <dl className="syndrome-facts"><dt>Gene–phenotype connection</dt><dd>{s.mechanism}</dd><dt>Cardiac risks</dt><dd>{s.cardiac}</dd><dt>Inheritance & mechanism</dt><dd>{s.inheritance}</dd><dt>Confirmatory evaluation</dt><dd>{s.testing.join(' ')}</dd><dt>Testing gaps to check</dt><dd>{s.gaps.join(' ')}</dd><dt>Caveats</dt><dd>{s.caveats.join(' ')}</dd></dl>
    <div className="syndrome-coverage"><strong>{phenotypePanelStatus(gene)}</strong><span>In source PDF · laboratory assay coverage unconfirmed.</span></div>
    <SyndromeSources syndrome={s}/>
   </article>)}
   <p className="phenotype-reviewed">Reviewed 23 Oct 2026 · Qualitative teaching labels, not likelihood ratios. A VUS does not establish a syndrome.</p>
  </details>
 </section>;
}

export function PhysicalClueExplorer({visibleGenes,onGeneSelect,onSyndromeOpen,onReset,filtered,clue,search,syndrome,onClueChange:setClue,onSearchChange:setSearch,onSyndromeChange:setSyndrome}:{visibleGenes:Gene[];onGeneSelect:(gene:Gene,syndrome:string)=>void;onSyndromeOpen:(id:string)=>void;onReset:()=>void;filtered:boolean;clue:string;search:string;syndrome:string;onClueChange:(value:string)=>void;onSearchChange:(value:string)=>void;onSyndromeChange:(value:string)=>void}){
 const visible=useMemo(()=>new Set(visibleGenes.map(g=>g.symbol)),[visibleGenes]);
 const list=externalSyndromes.filter(s=>matchesClue(s,search,clue,syndrome)&&s.genes.some(symbol=>visible.has(symbol)));
 const count=new Set(list.flatMap(s=>s.genes.filter(symbol=>visible.has(symbol)))).size;
 const aortic=clue==='aortic'||(syndrome!=='all'&&list.some(s=>s.groups.includes('aortic')));
 return <section className="physical-clue-explorer" aria-labelledby="physical-clue-heading">
  <div className="section-heading"><div><h2 id="physical-clue-heading">Syndrome explorer <span className="count-badge">{count} genes</span></h2><p>Choose a syndrome or clinical pattern, then open a gene for its explanation.</p></div></div>
  <p className="clue-explorer-note">Visible signs, examination findings and history clues are labeled separately. This selected reference does not rank diagnoses or exclude other causes.</p>
  <div className="physical-clue-controls">
   <label htmlFor="syndrome-select">Syndrome<select id="syndrome-select" value={syndrome} onChange={e=>setSyndrome(e.target.value)}><option value="all">All curated syndromes</option>{syndromeFamilies.map(f=><optgroup key={f.id} label={f.name}>{externalSyndromes.filter(s=>syndromeFamily(s)===f.id).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>)}</select></label>
   <label htmlFor="physical-clue-group">Clinical / physical group<select id="physical-clue-group" value={clue} onChange={e=>setClue(e.target.value)}><option value="all">All groups</option><optgroup label="Clinical groups">{clinicalClueGroups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</optgroup><optgroup label="Physical and history clues">{clueGroups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</optgroup></select></label>
   <label className="syndrome-clue-search" htmlFor="physical-clue-search">Find a clue or syndrome<span><Search size={15} aria-hidden="true"/><input id="physical-clue-search" type="search" value={search} placeholder="e.g. Naxos, woolly hair, bifid uvula…" onChange={e=>setSearch(e.target.value)}/></span></label>
  </div>
  {aortic&&<p className="aortic-syndrome-note">These are selected named syndromes. Heritable thoracic aortic disease can also occur without distinctive external features; the Aortopathy panel provides broader gene coverage. <a href="https://www.ncbi.nlm.nih.gov/books/NBK1120/" target="_blank" rel="noreferrer">HTAD overview<ArrowUpRight size={11} aria-hidden="true"/></a></p>}
  <div className="clue-result-status" role="status">{list.length} syndromes · {count} matching catalog genes{filtered&&<> · Workspace filters apply <button className="text-button" onClick={onReset}>Reset workspace filters</button></>}</div>
  {!list.length&&<div className="clue-empty"><p>No curated syndromes match the current filters.</p><button className="text-button" onClick={()=>{setSyndrome('all');setSearch('');onReset();}}>Clear syndrome search & filters</button></div>}
  {list.map(s=><article className="clue-explorer-row" key={s.id}>
   <div className="clue-explorer-title"><h3><button type="button" className="clue-syndrome-name" onClick={()=>onSyndromeOpen(s.id)} aria-label={`Open ${s.name} external phenotype details`}>{s.name}<ChevronRight size={14} aria-hidden="true"/></button></h3><span>{s.cue==='external'?'External phenotype':'History / assessment clue'}</span></div>
   <Clues syndrome={s}/>
   <div className="phenotype-gene-links">{s.genes.map(symbol=>{const gene=genes.find(g=>g.symbol===symbol);const inScope=visible.has(symbol);return <div key={symbol}><button type="button" disabled={!gene||!inScope} className={gene&&isAdded(gene)?'red-text':''} onClick={()=>gene&&onGeneSelect(gene,s.id)} aria-label={`${symbol}: ${phenotypePanelStatus(gene)}. Open ${s.name} clues and testing`}>{symbol}<ArrowUpRight size={12} aria-hidden="true"/></button><small>{phenotypePanelStatus(gene)}{gene&&!inScope?' · filtered out':''}</small></div>;})}</div>
   <p className="clue-gene-connection"><strong>Gene–phenotype connection</strong>{s.mechanism}</p><p className="clue-row-risk">{s.cardiac}</p>
   <details className="clue-preview-details" open={syndrome===s.id}><summary>Testing, caveats & sources<ChevronDown size={13} aria-hidden="true"/></summary><p>{s.inheritance}</p><p><strong>Testing:</strong> {s.testing.join(' ')} {s.gaps.join(' ')}</p><p><strong>Caveats:</strong> {s.caveats.join(' ')}</p><SyndromeSources syndrome={s}/></details>
  </article>)}
  <PhenotypeCoverage/>
 </section>;
}

export function ExternalPhenotypeSources(){
 const sources=[...new Map(externalSyndromes.flatMap(s=>s.sources).map(r=>[r.url,r])).values()];
 return <div className="reference-library">{sources.map(r=><a key={r.url} href={r.url} target="_blank" rel="noreferrer"><span>{r.title}</span><ArrowUpRight size={13}/></a>)}</div>;
}

export function PhenotypeCoverage(){
 const included=genes.filter(g=>externalSyndromes.some(s=>s.genes.includes(g.symbol)));
 const additions=included.filter(g=>g.added).map(g=>g.symbol);
 const baseline=included.filter(g=>!isAdded(g)).length;
 return <p className="phenotype-reviewed">Selected coverage: {externalSyndromes.length} syndromes and {included.length} catalog genes · {baseline} original baseline genes and {additions.length} proposed PDF additions ({additions.join(', ')}). Source-panel status is preserved; laboratory assay coverage is unconfirmed. Reviewed 23 Oct 2026.</p>;
}
