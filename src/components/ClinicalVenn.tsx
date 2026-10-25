import type {CSSProperties, ReactNode} from 'react';
import {Info} from 'lucide-react';
import {type Gene} from '../data';
import layout from '../data/venn-layout.json';
import '../clinical-venn.css';

export type ClinicalVennProps = {
  regions: {id: string; label: string; description: string; count: number; genes: Gene[]}[];
  counts: {dcm: number; hcm: number; af: number; va: number};
  activeRegion: string | null;
  showAf: boolean;
  onAfToggle: () => void;
  onRegionSelect: (id: string | null) => void;
  onGroupSelect: (id: string) => void;
  renderGene: (gene: Gene) => ReactNode;
  focusControls?: ReactNode;
  focusScope?: ReactNode;
  focusSymbols?: ReadonlySet<string>;
};

type MapMode = {
  circles: Record<string, {x: number; y: number; r: number}>;
  titles: Record<string, {x: number; y: number; width: number; height: number}>;
  slots: Record<string, number[][]>;
};

// Each mode has verified slots for complete buttons, not only their centers.
export default function ClinicalVenn({
  regions,
  counts,
  activeRegion,
  showAf,
  onAfToggle,
  onRegionSelect,
  onGroupSelect,
  renderGene,
  focusControls,
  focusScope,
  focusSymbols,
}: ClinicalVennProps) {
  const mode: MapMode = layout.modes[showAf ? 'af' : 'main'];
  const total = regions.reduce((n, r) => n + r.count, 0);
  const at = (x: number, y: number): CSSProperties => ({
    left: `${(x / layout.width) * 100}%`,
    top: `${(y / layout.height) * 100}%`,
  });
  const titleAt = (id: string): CSSProperties => ({
    ...at(mode.titles[id].x, mode.titles[id].y),
    width: `${(mode.titles[id].width / layout.width) * 100}%`,
    height: `${(mode.titles[id].height / layout.height) * 100}%`,
  });

  return (
    <div className="clinical-venn-component">
      <div className="map-toolbar">
        <div className="map-focus-context">{focusScope}</div>
        <div className="map-toggle-stack">
          <button
            type="button"
            className="af-circle-toggle"
            aria-label="Show AF circle"
            aria-pressed={showAf}
            aria-controls="clinical-venn-canvas"
            onClick={onAfToggle}
          >
            <span className="af-toggle-track" aria-hidden="true">
              <i />
            </span>
            <span>AF</span>
          </button>
          {focusControls}
        </div>
      </div>

      <div className="clinical-venn-scroll" tabIndex={0} aria-label={`Scrollable clinical phenotype diagram with ${total} gene symbols`}>
        <div id="clinical-venn-canvas" className="clinical-venn-canvas">
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            className="clinical-venn-svg"
            role="img"
            aria-labelledby="clinical-venn-title clinical-venn-description"
          >
            <title id="clinical-venn-title">
              {showAf
                ? 'Overlapping ventricular arrhythmia, AF, DCM and HCM associations'
                : 'Ventricular arrhythmia, DCM and HCM associations'}
            </title>
            <desc id="clinical-venn-description">
              Every visible gene appears once in its exact selected overlap.{' '}
              {showAf
                ? 'AF overlaps ventricular arrhythmia and extends beyond it. MYL4 and HCN4 highlight familial / early-onset AF and sinus-node contexts outside the selected VA set.'
                : 'The AF circle is hidden. MYL4 and HCN4 remain available in AF navigation and search.'}{' '}
              Circle areas are schematic, associations are non-exhaustive and placement does not assign individual risk.
            </desc>
            {(['dcm', 'hcm', 'va', 'af'] as const)
              .filter((id) => showAf || id !== 'af')
              .map((id) => {
                const c = mode.circles[id];
                return <circle key={id} data-circle={id} className={`clinical-circle-shape circle-${id}`} cx={c.x} cy={c.y} r={c.r} />;
              })}
          </svg>

          <button className="clinical-circle-title clinical-circle-va" style={titleAt('va')} onClick={() => onGroupSelect('va')} aria-label="View ventricular arrhythmia gene frequencies by syndrome">
            <span>Ventricular arrhythmia</span>
            <strong>{counts.va}</strong>
          </button>
          <button className="clinical-circle-title clinical-circle-dcm" style={titleAt('dcm')} onClick={() => onGroupSelect('dcm')} aria-label="View DCM gene frequencies">
            <span>DCM</span>
            <strong>{counts.dcm}</strong>
          </button>
          <button className="clinical-circle-title clinical-circle-hcm" style={titleAt('hcm')} onClick={() => onGroupSelect('hcm')} aria-label="View HCM gene frequencies">
            <span>HCM / LVH</span>
            <strong>{counts.hcm}</strong>
          </button>
          {showAf && (
            <button className="clinical-circle-title clinical-circle-af" style={titleAt('af')} onClick={() => onGroupSelect('af')} aria-label="View early-onset AF gene frequencies">
              <span>AF</span>
              <strong>{counts.af}</strong>
            </button>
          )}
          {showAf && mode.titles.afFocus && (
            <div className="clinical-af-focus-label" style={titleAt('afFocus')}>
              Familial / early-onset
              <br />
              AF focus
            </div>
          )}

          {regions.flatMap((region) => {
            if (mode.slots[region.id]?.length !== region.genes.length) {
              throw new Error(`Update the verified Venn layout for ${region.label}`);
            }
            return region.genes.map((gene, i) => {
              const [x, y] = mode.slots[region.id][i];
              return (
                <div
                  key={gene.symbol}
                  className={`clinical-gene-slot ${activeRegion === region.id ? 'is-region-active' : ''}`}
                  data-region={region.id}
                  data-gene={gene.symbol}
                  style={{
                    ...at(x, y),
                    width: `${(layout.chipWidth / layout.width) * 100}%`,
                    height: `${(layout.chipHeight / layout.height) * 100}%`,
                  }}
                >
                  {renderGene(gene)}
                </div>
              );
            });
          })}
        </div>
      </div>

      <div className="map-footer">
        <label className="map-region-filter">
          <span>Explore an overlap</span>
          <select value={activeRegion || ''} onChange={(e) => onRegionSelect(e.target.value || null)}>
            <option value="">{focusSymbols ? 'All overlaps' : `All ${total} map genes`}</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} · {focusSymbols ? `${r.genes.filter((g) => focusSymbols.has(g.symbol)).length} matching` : r.count}
              </option>
            ))}
          </select>
        </label>
        <p className="map-legend-note">
          <Info size={13} />
          Each symbol appears once · circle areas are schematic, not proportional
        </p>
      </div>
    </div>
  );
}
