import {Activity, ArrowUpRight, ChevronDown, PersonStanding} from 'lucide-react';
import type {Gene} from '../data';
import {
  matchesVaContext,
  vaContextsForGene,
  vaFocusGroup,
  vaFocusReviewed,
  vaFocusSources,
  vaSubtypeOptions,
  type VaFocusId,
} from '../va-focus';
import '../va-focus.css';

export function VaFocusControls({
  enabled,
  focus,
  external,
  onToggle,
  onChange,
  onExternalToggle,
}: {
  enabled: boolean;
  focus: VaFocusId;
  external: boolean;
  onToggle: () => void;
  onChange: (focus: VaFocusId) => void;
  onExternalToggle: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className="af-circle-toggle map-highlight-toggle"
        aria-label="Highlight VA subtype genes"
        aria-pressed={enabled}
        aria-controls="clinical-venn-canvas va-focus-gene-list"
        onClick={onToggle}
      >
        <span className="af-toggle-track" aria-hidden="true">
          <i />
        </span>
        <span>VA</span>
      </button>
      {/* Always rendered so enabling VA never reflows the toggle row. */}
      <label className={`va-subtype-select ${enabled ? '' : 'is-hidden'}`} aria-hidden={!enabled}>
        <span className="sr-only">VA subtype</span>
        <select
          aria-label="VA subtype"
          tabIndex={enabled ? 0 : -1}
          value={focus}
          onChange={(e) => onChange(e.target.value as VaFocusId)}
        >
          {vaSubtypeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={12} aria-hidden="true" />
      </label>
      <button
        type="button"
        className="af-circle-toggle map-highlight-toggle phenotype-highlight-toggle"
        aria-label="Highlight external phenotype genes"
        aria-pressed={external}
        aria-controls="clinical-venn-canvas va-focus-gene-list"
        onClick={onExternalToggle}
      >
        <span className="af-toggle-track" aria-hidden="true">
          <i />
        </span>
        <PersonStanding size={13} aria-hidden="true" />
        <span>Phenotype</span>
      </button>
    </>
  );
}

export function VaFocusScope({focus, external = false}: {focus: VaFocusId; external?: boolean}) {
  const group = vaFocusGroup(focus);
  if (!group && !external) return null;
  return (
    <div className="va-focus-scope" key={focus}>
      <p role="status">
        {group && (
          <>
            <strong>{group.label}</strong> · {group.description}
          </>
        )}
        {external && (
          <>
            {group
              ? ' Only genes also linked to external phenotype patterns are highlighted.'
              : 'External phenotype patterns are highlighted; other genes fade.'}{' '}
            Visible signs and examination findings are covered; history-only clues remain in gene details.
          </>
        )}
      </p>
      {group && (
        <details>
          <summary>
            Focus scope &amp; sources
            <ChevronDown size={12} aria-hidden="true" />
          </summary>
          <p>{group.scope}</p>
          <p>
            Selected catalog coverage, reviewed {vaFocusReviewed}. Evidence labels refer to the cited publications and are not live
            ClinGen classifications.
          </p>
          <div className="va-source-links">
            {group.sources.map((id) => {
              const source = vaFocusSources[id];
              return (
                <a key={id} href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                  <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}

export function GeneVaContexts({gene, focus}: {gene: Gene; focus: VaFocusId}) {
  const list = vaContextsForGene(gene.symbol, focus);
  if (!list.length) return null;
  const families = [...new Set(list.map((a) => a.family))];
  const outside = focus !== 'all' && !list.some((a) => matchesVaContext(a, focus));
  return (
    <section className="detail-section va-mechanism-section">
      <h3>
        <Activity size={15} aria-hidden="true" />
        VA phenotype &amp; mechanism
      </h3>
      <p className="va-family-label">
        {families.map((family) => (family === 'structural' ? 'Structural cardiomyopathy' : 'Primary electrical disease')).join(' · ')}
      </p>
      {outside && <p className="va-outside-focus">This gene is outside the {vaFocusGroup(focus)?.label} focus.</p>}
      {list.map((a) => (
        <article className={`va-mechanism ${focus !== 'all' && matchesVaContext(a, focus) ? 'va-mechanism-focused' : ''}`} key={a.context}>
          <h4>{a.label}</h4>
          <p>{a.mechanism}</p>
          <p className="va-mechanism-inheritance">{a.inheritance}</p>
          <p>{a.note}</p>
          <details>
            <summary>
              Evidence &amp; sources
              <ChevronDown size={12} aria-hidden="true" />
            </summary>
            <p>{a.evidence}</p>
            <div className="va-source-links">
              {a.sources.map((id) => {
                const source = vaFocusSources[id];
                return (
                  <a key={id} href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                    <ArrowUpRight size={11} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </details>
        </article>
      ))}
      <p className="va-mechanism-foot">
        These mechanisms describe selected pathogenic variants. A gene name, a predicted functional effect or a VUS does not establish
        a syndrome.
      </p>
    </section>
  );
}

export function VaFocusSources() {
  return (
    <div className="reference-library">
      {Object.entries(vaFocusSources).map(([id, source]) => (
        <a key={id} href={source.url} target="_blank" rel="noreferrer">
          <span>
            {source.title}
            <small>{source.detail}</small>
          </span>
          <ArrowUpRight size={13} />
        </a>
      ))}
    </div>
  );
}
