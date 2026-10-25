import {type CSSProperties} from 'react';
import {ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, ChartNoAxesColumn} from 'lucide-react';
import {genes, isAdded, panelById, type Gene} from '../data';
import {
  contextsForGene,
  estimateBounds,
  estimateFor,
  formatEstimate,
  frequencyById,
  frequencyDatasets,
  frequencyForGroup,
  frequencySections,
  sortedEstimates,
  unquantifiedGenes,
  type FrequencyEstimate,
  type FrequencyId,
  type FrequencyPanelId,
} from '../frequency';
import '../frequency.css';

function EstimateBar({estimate}: {estimate: FrequencyEstimate}) {
  const {low, high} = estimateBounds(estimate);
  return (
    <span className="frequency-bar" aria-hidden="true">
      <i className="frequency-bar-solid" style={{width: `${low}%`}} />
      {estimate.kind === 'lower' ? (
        <i className="frequency-bar-lower" style={{left: `${low}%`}} />
      ) : (
        high > low && <i className="frequency-bar-range" style={{left: `${low}%`, width: `${high - low}%`}} />
      )}
    </span>
  );
}

export default function FrequencyPane({
  context,
  onContextChange,
  onGeneSelect,
}: {
  context: FrequencyId;
  onContextChange: (id: FrequencyId) => void;
  onGeneSelect: (gene: Gene) => void;
}) {
  const dataset = frequencyById(context);
  const entries = sortedEstimates(dataset);
  const missing = unquantifiedGenes(dataset, genes);
  const hasRanges = entries.some((e) => e.kind === 'range' || e.kind === 'upper');
  const hasLower = entries.some((e) => e.kind === 'lower');
  const colors: Record<FrequencyPanelId, string> = {
    va: 'var(--va)',
    af: 'var(--af)',
    hcm: 'var(--hcm)',
    dcm: 'var(--dcm)',
    aortopathy: 'var(--ao)',
    pah: 'var(--pah)',
    lipid: 'var(--lip)',
  };

  return (
    <div className="inspector-scroll frequency-pane" style={{'--frequency-color': colors[dataset.group]} as CSSProperties}>
      <div className="frequency-heading">
        <span className="inspector-kicker">
          <ChartNoAxesColumn size={14} />
          Gene frequencies
        </span>
        <h2 id="frequency-heading" tabIndex={-1}>
          {dataset.title}
        </h2>
      </div>

      <label className="field-label" htmlFor="frequency-context">
        Disease / syndrome
      </label>
      <select
        id="frequency-context"
        className="frequency-context"
        value={context}
        onChange={(e) => onContextChange(e.target.value as FrequencyId)}
      >
        {frequencySections.map((section) => (
          <optgroup key={section.label} label={section.label}>
            {section.contexts.map((id) => (
              <option key={id} value={id}>
                {frequencyById(id).name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <div className="frequency-population">
        <h3>{dataset.metric}</h3>
        <dl className="fact-list">
          <dt>Population</dt>
          <dd>{dataset.population}</dd>
          <dt>Denominator</dt>
          <dd>{dataset.denominator}</dd>
        </dl>
        {dataset.coverageNote && <p className="frequency-coverage-note">{dataset.coverageNote}</p>}
      </div>

      <div className="frequency-list-heading">
        <h3>Published estimates</h3>
        <span>0–100% scale</span>
      </div>

      <div className="frequency-list" aria-label={`${dataset.title} published gene frequency estimates`}>
        {entries.map((estimate) => {
          const gene = genes.find((g) => g.symbol === estimate.symbol)!;
          return (
            <button
              key={gene.symbol}
              type="button"
              className={`frequency-row ${isAdded(gene) ? 'frequency-added' : ''}`}
              onClick={() => onGeneSelect(gene)}
              aria-label={`${gene.symbol}, ${formatEstimate(estimate)}. Open gene explanation`}
            >
              <span className="frequency-row-heading">
                <strong>{gene.symbol}</strong>
                <span>{formatEstimate(estimate)}</span>
                <ArrowRight size={12} />
              </span>
              <EstimateBar estimate={estimate} />
              {estimate.kind === 'count' && (
                <span className="frequency-row-note">
                  {estimate.count} / {estimate.total.toLocaleString('en-US')} {estimate.unit || 'patients'}
                </span>
              )}
              {estimate.note && <span className="frequency-row-note">{estimate.note}</span>}
            </button>
          );
        })}
      </div>

      <p className="frequency-chart-note">
        {hasLower
          ? 'An arrow marks a lower bound; faded bars show ranges or upper limits.'
          : hasRanges
            ? 'Faded bars show a range or upper limit. Ordered by upper estimate; ranges may overlap.'
            : 'Higher estimates first. Values are rounded.'}{' '}
        Selected catalog estimates; do not add them to predict panel yield.
      </p>

      {missing.length > 0 && (
        <details className="frequency-missing">
          <summary>
            Other genes in this context
            <ChevronDown size={13} />
          </summary>
          <p>Not reliably estimated here. No comparable estimate is curated in this reference; this does not mean 0% or weak disease evidence.</p>
          <div>
            {missing.map((g) => (
              <button key={g.symbol} className={isAdded(g) ? 'red-text' : ''} onClick={() => onGeneSelect(g)}>
                {g.symbol}
                <ArrowRight size={11} />
              </button>
            ))}
          </div>
        </details>
      )}

      <div className="frequency-interpretation">
        <h3>How to interpret</h3>
        <p>{dataset.caveat}</p>
        <p className="frequency-risk-note">Frequency is not penetrance, event risk or clinical severity.</p>
      </div>

      <details className="frequency-sources">
        <summary>
          Sources &amp; study details
          <ChevronDown size={13} />
        </summary>
        {dataset.sources.map((source) => (
          <div key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.label}
              <ArrowUpRight size={12} />
            </a>
            <p>{source.detail}</p>
          </div>
        ))}
      </details>

      <div className="frequency-reviewed">Reference estimates · reviewed 22 Oct 2026</div>
    </div>
  );
}

export function GeneFrequency({gene, onOpen}: {gene: Gene; onOpen: (id: FrequencyId) => void}) {
  const contexts = contextsForGene(gene);
  const unquantifiedVa = Boolean(gene.clinical.va) && !contexts.some((d) => d.group === 'va');
  const structuralVa = gene.clinical.va?.kind.includes('CM') || gene.clinical.va?.kind.includes('Cardiomyopathy');
  const unquantifiedPanels = ['aortopathy', 'pah', 'lipid'].filter(
    (id) => gene.panels.includes(id) && !contexts.some((d) => d.group === id),
  );
  if (!contexts.length && !unquantifiedVa && !unquantifiedPanels.length) return null;
  return (
    <details className="inspector-disclosure">
      <summary>
        <ChartNoAxesColumn size={15} />
        <span className="disclosure-title">Frequency by disease</span>
        <ChevronDown size={15} className="disclosure-chevron" />
      </summary>
      <div className="disclosure-body">
        <div className="gene-frequency-rows">
          {contexts.map((dataset) => {
            const estimate = estimateFor(dataset.id, gene.symbol);
            return (
              <button key={dataset.id} type="button" onClick={() => onOpen(dataset.id)} aria-label={`View ${dataset.title} frequencies`}>
                <span className="gene-frequency-label">
                  {dataset.title}
                  <small>{estimate ? dataset.metric : 'No comparable estimate curated'}</small>
                </span>
                <span className={estimate ? 'gene-frequency-value' : 'gene-frequency-unknown'}>
                  {estimate ? formatEstimate(estimate) : 'Not reliably estimated'}
                </span>
                <ArrowRight size={12} />
              </button>
            );
          })}
          {unquantifiedVa &&
            (structuralVa ? (
              <div className="gene-frequency-static">
                <span className="gene-frequency-label">
                  Ventricular arrhythmia
                  <small>Structural disease context · no pooled VA estimate</small>
                </span>
                <span className="gene-frequency-unknown">Not reliably estimated</span>
              </div>
            ) : (
              <button type="button" onClick={() => onOpen('lqts')}>
                <span className="gene-frequency-label">
                  Ventricular arrhythmia
                  <small>Choose a specific syndrome</small>
                </span>
                <span className="gene-frequency-unknown">Not reliably estimated</span>
                <ArrowRight size={12} />
              </button>
            ))}
          {unquantifiedPanels.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onOpen(frequencyForGroup(id, 'dcm'))}
              aria-label={`Explore ${panelById(id).name} frequency contexts`}
            >
              <span className="gene-frequency-label">
                {panelById(id).name}
                <small>No comparable disease-specific estimate curated</small>
              </span>
              <span className="gene-frequency-unknown">Not reliably estimated</span>
              <ArrowRight size={12} />
            </button>
          ))}
        </div>
        <p className="micro-note">Each figure uses its own disease population. Select a row for the denominator and sources.</p>
      </div>
    </details>
  );
}

export function BackToFrequency({context, onClick}: {context: FrequencyId; onClick: () => void}) {
  return (
    <button className="back-to-frequency" type="button" onClick={onClick}>
      <ArrowLeft size={13} />
      {frequencyById(context).title} frequencies
    </button>
  );
}

export function FrequencyLibrary() {
  return (
    <div className="reference-library">
      {frequencyDatasets.flatMap((dataset) =>
        dataset.sources.map((source) => (
          <a key={`${dataset.id}-${source.url}`} href={source.url} target="_blank" rel="noreferrer">
            <span>
              {source.label}
              <small>
                {dataset.title} · {dataset.denominator}
              </small>
            </span>
            <ArrowUpRight size={14} />
          </a>
        )),
      )}
    </div>
  );
}
