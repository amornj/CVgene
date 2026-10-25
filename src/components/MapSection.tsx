import {Fragment} from 'react';
import {ArrowUpRight, ChartNoAxesColumn, ChevronDown, Info} from 'lucide-react';
import {
  clinicalPanelById,
  mapGenesFor,
  panelById,
  panels,
  retainedUnmappedGenes,
  sourceGenes,
  type Gene,
} from '../data';
import ClinicalVenn from './ClinicalVenn';
import AfEvidence from './AfEvidence';
import {FrequencyLaunch, SectionHeading} from './Shared';
import GeneChip from './GeneChip';
import {VaFocusControls, VaFocusScope} from './VaFocus';
import type {VaFocusId} from '../va-focus';
import type {FrequencyId} from '../frequency';

type PreviewHandlers = {
  onSelect: (gene: Gene) => void;
  onPreview: (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, gene: Gene) => void;
  onPreviewEnd: () => void;
  tooltipGene?: string | null;
  selected: Gene;
};

type MapSectionProps = PreviewHandlers & {
  showAf: boolean;
  vaEnabled: boolean;
  vaFocus: Exclude<VaFocusId, 'all'>;
  externalOnly: boolean;
  activeVaFocus: VaFocusId;
  focusSymbols: ReadonlySet<string>;
  highlightEnabled: boolean;
  activeRegion: string | null;
  onAfToggle: () => void;
  onRegionSelect: (id: string | null) => void;
  onVaToggle: () => void;
  onVaFocus: (focus: Exclude<VaFocusId, 'all'>) => void;
  onExternalToggle: () => void;
  onOpenFrequency: (id: FrequencyId) => void;
};

const panelIcons = ['aortopathy', 'pah', 'lipid'];

export default function MapSection({
  showAf,
  vaEnabled,
  vaFocus,
  externalOnly,
  activeVaFocus,
  focusSymbols,
  highlightEnabled,
  activeRegion,
  onAfToggle,
  onRegionSelect,
  onVaToggle,
  onVaFocus,
  onExternalToggle,
  onOpenFrequency,
  selected,
  onSelect,
  onPreview,
  onPreviewEnd,
  tooltipGene,
}: MapSectionProps) {
  const regions = showAf ? clinicalRegionsForClient(true) : clinicalRegionsForClient(false);
  const region = regions.find((r) => r.id === activeRegion);
  const mapGenes = (region ? region.genes : mapGenesFor(showAf)).filter((g) => !highlightEnabled || focusSymbols.has(g.symbol));

  const chip = (gene: Gene, small = false) => (
    <GeneChip
      key={gene.symbol}
      gene={gene}
      small={small}
      selected={gene.symbol === selected.symbol}
      dimmed={highlightEnabled && !focusSymbols.has(gene.symbol)}
      onSelect={onSelect}
      onPreview={onPreview}
      onPreviewEnd={onPreviewEnd}
      tooltipGene={tooltipGene}
    />
  );

  return (
    <section className="map-section">
      <SectionHeading
        title="Clinical phenotype overlap"
        description={
          showAf
            ? 'AF overlaps ventricular arrhythmia, DCM and HCM; the AF-only area highlights familial / early-onset AF.'
            : 'Ventricular arrhythmia, DCM and HCM. Turn on AF to explore its distinct and shared associations.'
        }
        actions={<FrequencyLaunch onClick={() => onOpenFrequency('dcm')} />}
      />

      <ClinicalVenn
        regions={regions}
        counts={{
          dcm: clinicalPanelById('dcm').count,
          hcm: clinicalPanelById('hcm').count,
          af: clinicalPanelById('af').count,
          va: clinicalPanelById('va').count,
        }}
        activeRegion={activeRegion}
        showAf={showAf}
        onAfToggle={onAfToggle}
        onRegionSelect={onRegionSelect}
        onGroupSelect={(id) => onOpenFrequency(frequencyForGroupClient(id))}
        renderGene={(gene) => chip(gene)}
        focusControls={
          <VaFocusControls
            enabled={vaEnabled}
            focus={vaFocus}
            external={externalOnly}
            onToggle={onVaToggle}
            onChange={onVaFocus}
            onExternalToggle={onExternalToggle}
          />
        }
        focusScope={<VaFocusScope focus={activeVaFocus} external={externalOnly} />}
        focusSymbols={highlightEnabled ? focusSymbols : undefined}
      />

      <div className="map-note">
        <Info size={15} />
        <p>
          Selected, non-exhaustive associations. Familial / early-onset AF also occurs in the overlaps. Placement outside VA does not
          exclude ventricular risk; shared genes can involve different variant mechanisms.
        </p>
      </div>

      {showAf && <AfEvidence />}

      <section id="va-focus-gene-list" className="region-section" aria-live="polite">
        <SectionHeading
          title={
            region
              ? region.label
              : externalOnly
                ? 'External phenotype genes'
                : vaEnabled
                  ? `${vaFocusGroupLabel(vaFocus)} genes`
                  : 'Genes in the current map'
          }
          count={mapGenes.length}
          description={region?.description}
          actions={
            region ? (
              <button type="button" className="text-button" onClick={() => onRegionSelect(null)}>
                {highlightEnabled ? 'All matching genes' : 'All map genes'}
              </button>
            ) : undefined
          }
        />
        <div className="gene-grid">
          {mapGenes.map((g) => chip(g))}
        </div>
        {!mapGenes.length && (
          <p className="empty-inline">No genes in this overlap match the current focus. Choose another overlap or turn off the highlights.</p>
        )}
      </section>

      <div className="map-legend">
        <span>
          <i className="legend-swatch legend-swatch--original" />
          Original baseline gene
        </span>
        <span className="red-text">Added beyond original baseline</span>
        <span>
          <i className="legend-swatch legend-swatch--selected" />
          Selected gene
        </span>
      </div>

      <details className="retained-genes">
        <summary>
          <span>Retained source genes outside these clinical circles</span>
          <span className="count-badge">{retainedUnmappedGenes.length}</span>
          <ChevronDown size={15} className="disclosure-chevron" />
        </summary>
        <p>
          Limited, disputed, or other phenotype-specific associations are not promoted into the clinical map. Original gene
          explanations and source memberships remain available.
        </p>
        <div className="gene-grid">{retainedUnmappedGenes.map((g) => chip(g))}</div>
      </details>

      <div className="independent-panels">
        {panels.slice(2).map((p) => (
          <section className="independent-panel" key={p.id}>
            <button
              type="button"
              className="independent-heading"
              aria-label={`View ${p.name} gene frequencies`}
              onClick={() => onOpenFrequency(frequencyForGroupClient(p.id))}
            >
              <span className={`panel-icon panel-icon--${p.id}`}>
                <ChartNoAxesColumn size={16} />
              </span>
              <span className="independent-text">
                <strong>{p.id === 'pah' ? 'Pulmonary hypertension' : p.name}</strong>
                <small>{p.count} source genes</small>
              </span>
              <ArrowUpRight size={14} />
            </button>
            <div className="gene-grid gene-grid--tight">
              {sourceGenes
                .filter((g) => g.panels.includes(p.id))
                .map((g) => chip(g, true))}
            </div>
          </section>
        ))}
      </div>

      <aside className="workspace-note">
        <Info size={16} />
        <p>
          <strong>Panel membership is a starting point.</strong> Use phenotype-specific evidence and validated laboratory coverage. A
          VUS must not guide treatment or predictive cascade testing.
        </p>
      </aside>
    </section>
  );
}

/* ---- local helpers (kept local to avoid circular imports) ---------------- */

import {clinicalRegions, clinicalRegionsFor} from '../data';
import {frequencyForGroup} from '../frequency';
import {vaFocusGroups} from '../va-focus';

function clinicalRegionsForClient(showAf: boolean) {
  return clinicalRegionsFor(showAf);
}
function frequencyForGroupClient(id: string) {
  return frequencyForGroup(id, 'dcm');
}
function vaFocusGroupLabel(focus: Exclude<VaFocusId, 'all'>) {
  return vaFocusGroups.find((g) => g.id === focus)?.label ?? '';
}

export {Fragment, clinicalRegions, panelById};
