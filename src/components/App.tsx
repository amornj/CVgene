import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  genes,
    clinicalPanelById,
  clinicalGroupsFor,
  panelById,
  searchGenes,
  retainedUnmappedGenes,
  type Gene,
  type Scope,
} from '../data';
import {frequencyForGroup, type FrequencyId} from '../frequency';
import {matchesMapHighlight, type VaFocusId} from '../va-focus';
import {externalFeatureSymbols, externalSyndromes, matchesClue} from '../external-phenotypes';
import {PanelRightClose, PersonStanding} from 'lucide-react';
import Sidebar from './Sidebar';
import {TopBar, SearchBar, ViewToolbar} from './TopBar';
import MapSection from './MapSection';
import Inspector from './Inspector';
import FrequencyPane from './FrequencyPane';
import {GeneTable} from './GeneList';
import {PhysicalClueExplorer, SyndromeDetail} from './ExternalPhenotypes';
import {EmptyState, SectionHeading, FrequencyLaunch, ResetFilters} from './Shared';
import {GeneTooltip, Toast, SourceDialog} from './Overlays';
import type {View} from './types';

const isNarrow = () => window.innerWidth <= 1120;

export default function App() {
  const initialSymbol = new URLSearchParams(location.search).get('gene')?.toUpperCase();

  const [selected, setSelected] = useState<Gene>(
    () => genes.find((g) => g.symbol === initialSymbol) ?? genes.find((g) => g.symbol === 'LMNA') ?? genes[0],
  );
  const [panel, setPanel] = useState('all');
  const [scope, setScope] = useState<Scope>('all');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [showAf, setShowAf] = useState(false);
  const [vaEnabled, setVaEnabled] = useState(false);
  // Default to the full VA set; subtypes are an optional narrowing.
  const [vaFocus, setVaFocus] = useState<VaFocusId>('all');
  const [query, setQuery] = useState('');
  // Always land on By organ involvement, including on phones.
  const [view, setView] = useState<View>('map');
  const [externalOnly, setExternalOnly] = useState(false);
  const [clueGroup, setClueGroup] = useState('all');
  const [clueQuery, setClueQuery] = useState('');
  const [syndromeId, setSyndromeId] = useState('all');
  const [openedSyndrome, setOpenedSyndrome] = useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  // Open by default on wide screens: a gene is already selected, so show its details.
  const [inspectorOpen, setInspectorOpen] = useState(() => Boolean(initialSymbol) || !isNarrow());
  const [inspectorMode, setInspectorMode] = useState<'gene' | 'frequency' | 'syndrome'>('gene');
  const [frequencyContext, setFrequencyContext] = useState<FrequencyId>('dcm');
  const [frequencyBack, setFrequencyBack] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [narrow, setNarrow] = useState(isNarrow);
  const [toast, setToast] = useState('');
  const [tooltip, setTooltip] = useState<{gene: Gene; x: number; y: number; below: boolean} | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDialogElement>(null);

  const activeVaFocus: VaFocusId = vaEnabled ? vaFocus : 'all';
  const highlightEnabled = vaEnabled || externalOnly;

  const focusSymbols = useMemo(
    () =>
      new Set(
        genes
          .filter((g) => matchesMapHighlight(g.symbol, activeVaFocus, externalOnly ? externalFeatureSymbols : undefined))
          .map((g) => g.symbol),
      ),
    [activeVaFocus, externalOnly],
  );

  const clueSymbols = useMemo(
    () =>
      new Set(
        externalSyndromesFilter(clueQuery, clueGroup, syndromeId).flatMap((s) => s.genes),
      ),
    [clueQuery, clueGroup, syndromeId],
  );

  const mapFocusActive = view === 'map' && panel === 'all' && scope === 'all' && !query;

  const matches = useMemo(
    () =>
      searchGenes(query, panel, scope, activeRegion).filter(
        (g) =>
          (view !== 'syndromes' || clueSymbols.has(g.symbol)) &&
          (!mapFocusActive || !highlightEnabled || focusSymbols.has(g.symbol)),
      ),
    [query, panel, scope, activeRegion, view, clueSymbols, mapFocusActive, highlightEnabled, focusSymbols],
  );

  /* ---- responsive ---- */
  useEffect(() => {
    const onResize = () => setNarrow(isNarrow());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ---- auto-select on exact search ---- */
  useEffect(() => {
    if (query.trim().length < 2) return;
    const q = query.trim().toLowerCase();
    const exact =
      matches.find((g) => g.symbol.toLowerCase() === q || g.name.toLowerCase() === q) ||
      (matches.length === 1 ? matches[0] : null);
    if (exact) {
      setSelected(exact);
      setInspectorMode('gene');
      setFrequencyBack(false);
      if (!narrow) setInspectorOpen(true);
      syncUrl(exact.symbol);
    }
  }, [query, matches, narrow]);

  /* ---- keyboard ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setTooltip(null);
        setInspectorOpen(false);
        setNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---- focus trap in narrow inspector ---- */
  useEffect(() => {
    if (!inspectorOpen || !narrow) return;
    const pane = inspectorRef.current;
    if (!pane) return;
    const previous = document.activeElement as HTMLElement;
    pane.querySelector<HTMLButtonElement>('.close-inspector')?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const closed = Array.from(pane.querySelectorAll('details:not([open])'));
      const nodes = Array.from(
        pane.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], select:not([disabled]), summary'),
      ).filter((el) => el.offsetParent !== null && !closed.some((d) => d.contains(el) && d.querySelector('summary') !== el));
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    pane.addEventListener('keydown', trap);
    return () => {
      pane.removeEventListener('keydown', trap);
      previous?.focus({preventScroll: true});
    };
  }, [inspectorOpen, narrow]);

  /* ---- toast timer ---- */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---- dialog ---- */
  useEffect(() => {
    const d = sourceRef.current;
    if (sourcesOpen && !d?.open) d?.showModal();
    else if (!sourcesOpen && d?.open) d.close();
  }, [sourcesOpen]);

  /* ---- tooltip dismiss on scroll ---- */
  useEffect(() => {
    const close = () => setTooltip(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, []);

  /* ---- scroll inspector to top on change ---- */
  useEffect(() => {
    inspectorRef.current?.scrollTo(0, 0);
  }, [selected, inspectorMode, frequencyContext]);

  function syncUrl(symbol: string) {
    const url = new URL(location.href);
    url.searchParams.set('gene', symbol);
    history.replaceState({}, '', url);
  }

  // Selecting a gene always lands on By organ involvement so the symbol is
  // visible in context on the diagram. Clearing the transient search/filters
  // stops them hijacking the view with a results list instead.
  // Clicking a syndrome name opens that syndrome's external-phenotype record
  // in the right pane, without leaving the By clinical syndrome tab.
  const openSyndrome = useCallback((id: string) => {
    setOpenedSyndrome(id);
    setInspectorMode('syndrome');
    setInspectorOpen(true);
    setTooltip(null);
  }, []);

  const choose = useCallback((gene: Gene, fromFrequency = false, syndrome: string | null = null) => {
    setSelected(gene);
    setInspectorMode('gene');
    setFrequencyBack(fromFrequency);
    setInspectorOpen(true);
    setTooltip(null);
    setView('map');
    setPanel('all');
    setScope('all');
    setQuery('');
    setActiveRegion(null);
    syncUrl(gene.symbol);
  }, []);

  function preview(e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, gene: Gene) {
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({
      gene,
      x: Math.max(12, Math.min(r.left + r.width / 2 - 145, window.innerWidth - 302)),
      y: r.top < 150 ? r.bottom + 10 : r.top - 10,
      below: r.top < 150,
    });
  }

  function resetFilters() {
    setVaEnabled(false);
    setPanel('all');
    setScope('all');
    setActiveRegion(null);
    setExternalOnly(false);
    setQuery('');
  }

  function navigate(p: string, v: View = 'map') {
    setVaEnabled(false);
    setExternalOnly(false);
    setFrequencyBack(false);
    setActiveRegion(null);
    setView(v);
    setPanel(p);
    setScope('all');
    setQuery('');
    setNavOpen(false);
    setTooltip(null);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function openFrequency(id: FrequencyId) {
    setFrequencyContext(id);
    setInspectorMode('frequency');
    setInspectorOpen(true);
    setTooltip(null);
  }

  function exportCsv() {
    const rows = [
      ['Gene', 'Full name', 'Source PDF panels', 'Clinical groups', 'Panel status', 'Inheritance', 'Clinical relevance'],
      ...matches.map((g) => [
        g.symbol,
        g.name,
        g.panels.map((p) => panelById(p).name).join('; '),
        clinicalGroupsForExport(g).join('; '),
        g.catalogAddition ? 'AF extension' : g.added ? 'PDF addition' : 'Original',
        g.inheritance,
        g.relevance,
      ]),
    ];
    const csv =
      '\uFEFF' +
      rows
        .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardiogene-${panel}-${scope}-2026.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast(`Exported ${matches.length} genes`);
  }

  const activePanel = panel !== 'all' ? clinicalPanelById(panel) : null;
  const filterActive = scope !== 'all' || panel !== 'all';

  /* ====================================================================== */
  return (
    <div className="app-shell">
      <Sidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        panel={panel}
        onAllGenes={() => navigate('all', 'map')}
        onPanel={(id) => navigate(id, 'map')}
        onSources={() => setSourcesOpen(true)}
      />

      <div className="workspace">
        <TopBar onMenu={() => setNavOpen(true)} onSources={() => setSourcesOpen(true)} onExample={setQuery} />

        <div className={`workspace-body ${inspectorOpen ? 'has-inspector' : ''}`}>
          <main className="main">
            <header className="page-heading">
              <div>
                <span className="eyebrow">Hereditary cardiovascular disease</span>
                <h1>{panel === 'all' ? 'Gene explorer' : activePanel?.name}</h1>
                <p>Ventricular arrhythmia, DCM and HCM — with overlapping AF associations.</p>
              </div>
            </header>

            <SearchBar
              query={query}
              onChange={(v) => {
                setQuery(v);
                setActiveRegion(null);
              }}
              inputRef={searchRef}
              onSubmit={() => matches[0] && choose(matches[0])}
              onExample={(q) => {
                setQuery(q);
                searchRef.current?.focus();
              }}
            />

            <ViewToolbar
              view={view}
              onView={(v) => {
                setView(v);
                if (v === 'map') setPanel('all');
              }}
              onExport={exportCsv}
            />

            {view === 'syndromes' ? (
              <PhysicalClueExplorer
                visibleGenes={matches}
                clue={clueGroup}
                search={clueQuery}
                syndrome={syndromeId}
                onClueChange={(v) => {
                  setClueGroup(v);
                  setSyndromeId('all');
                  resetFilters();
                }}
                onSyndromeChange={(v) => {
                  setSyndromeId(v);
                  setClueGroup('all');
                  resetFilters();
                }}
                onSearchChange={setClueQuery}
                filtered={filterActive || Boolean(query) || Boolean(activeRegion)}
                onReset={resetFilters}
                onGeneSelect={(g, id) => choose(g, false, id)}
                onSyndromeOpen={(id) => openSyndrome(id)}
              />
            ) : view === 'list' || query || filterActive ? (
              <section className="results-section">
                <SectionHeading
                  title={query ? 'Search results' : 'Gene list'}
                  count={matches.length}
                  description={
                    query
                      ? `Matching “${query}”${activePanel ? ' in ' + activePanel.name : ''}.`
                      : activePanel?.description || 'Select a gene to review its clinical relevance and source-panel membership.'
                  }
                  actions={
                    <>
                      {['va', 'af', 'dcm', 'hcm', 'aortopathy', 'pah', 'lipid'].includes(panel) && (
                        <FrequencyLaunch onClick={() => openFrequency(frequencyForGroup(panel, frequencyContext))} />
                      )}
                      {(filterActive || activeRegion) && <ResetFilters onReset={resetFilters} />}
                    </>
                  }
                />
                {!matches.length ? (
                  <EmptyState onReset={resetFilters} />
                ) : (
                  <GeneTable
                    genes={matches}
                    selected={selected}
                    onSelect={choose}
                    onPreview={preview}
                    onPreviewEnd={() => setTooltip(null)}
                    tooltipGene={tooltip?.gene.symbol}
                  />
                )}
              </section>
            ) : (
              <MapSection
                showAf={showAf}
                vaEnabled={vaEnabled}
                vaFocus={vaFocus}
                externalOnly={externalOnly}
                activeVaFocus={activeVaFocus}
                focusSymbols={focusSymbols}
                highlightEnabled={highlightEnabled}
                activeRegion={activeRegion}
                onAfToggle={() => {
                  setShowAf((v) => !v);
                  setActiveRegion(null);
                  setTooltip(null);
                }}
                onRegionSelect={(id) => {
                  if (activeRegion === id) {
                    setActiveRegion(null);
                  } else {
                    setActiveRegion(id);
                    setPanel('all');
                    setScope('all');
                    setQuery('');
                  }
                  setTooltip(null);
                }}
                onVaToggle={() => {
                  setVaEnabled((v) => !v);
                  setActiveRegion(null);
                  setTooltip(null);
                }}
                onVaFocus={(f) => {
                  setVaFocus(f);
                  setActiveRegion(null);
                  setTooltip(null);
                }}
                onExternalToggle={() => {
                  setExternalOnly((v) => !v);
                  setActiveRegion(null);
                  setTooltip(null);
                }}
                onOpenFrequency={openFrequency}
                selected={selected}
                onSelect={choose}
                onPreview={preview}
                onPreviewEnd={() => setTooltip(null)}
                tooltipGene={tooltip?.gene.symbol}
              />
            )}

            <footer className="main-footer">
              <span>Source panel · 22 October 2026</span>
              <button type="button" onClick={() => setSourcesOpen(true)}>
                View source &amp; clinical references
              </button>
            </footer>
          </main>

          {inspectorOpen && (
            <div ref={inspectorRef} className={`inspector-shell ${narrow ? 'is-drawer' : ''}`}>
              {inspectorMode === 'frequency' ? (
                <FrequencyPane
                  context={frequencyContext}
                  onContextChange={setFrequencyContext}
                  onGeneSelect={(g) => choose(g, true)}
                />
              ) : null}
              {inspectorMode === 'syndrome' && openedSyndrome && (() => {
                const syn = externalSyndromes.find((x) => x.id === openedSyndrome);
                if (!syn) return null;
                return (
                  <div className="inspector">
                    <div className="inspector-head">
                      <span className="inspector-kicker">
                        <PersonStanding size={14} />
                        Syndrome details
                      </span>
                      <button
                        type="button"
                        className="icon-button close-inspector"
                        onClick={() => setInspectorOpen(false)}
                        aria-label="Close details pane"
                      >
                        <PanelRightClose size={17} />
                      </button>
                    </div>
                    <div className="inspector-scroll">
                      <SyndromeDetail syndrome={syn} gene={undefined} onGeneOpen={(g) => choose(g)} />
                    </div>
                  </div>
                );
              })()}
              {inspectorMode === 'gene' && (
                <Inspector
                  gene={selected}
                  narrow={narrow}
                  vaFocus={mapFocusActive ? activeVaFocus : 'all'}
                  frequencyBack={frequencyBack}
                  frequencyContext={frequencyContext}
                  onClose={() => setInspectorOpen(false)}
                  onOpenFrequency={openFrequency}
                  onOpenSyndrome={openSyndrome}
                  onBackToFrequency={() => openFrequency(frequencyContext)}
                  onSources={() => setSourcesOpen(true)}
                  onToast={setToast}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {inspectorOpen && narrow && <button type="button" className="inspector-scrim" aria-label="Close details" onClick={() => setInspectorOpen(false)} />}

      {tooltip && <GeneTooltip gene={tooltip.gene} x={tooltip.x} y={tooltip.y} below={tooltip.below} />}
      {toast && <Toast message={toast} />}
      <SourceDialog open={sourcesOpen} onClose={() => setSourcesOpen(false)} dialogRef={sourceRef} />
    </div>
  );
}

/* ---- helpers ------------------------------------------------------------- */

function externalSyndromesFilter(query: string, group: string, syndrome: string) {
  return externalSyndromes.filter((s) => matchesClue(s, query, group, syndrome));
}

function clinicalGroupsForExport(g: Gene) {
  return g.clinical ? Object.keys(g.clinical) : [];
}
