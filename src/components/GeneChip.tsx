import type {Gene} from '../data';
import {clinicalGroupsFor, isAdded, statusLabel} from '../data';

type GeneChipProps = {
  gene: Gene;
  small?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  onSelect: (gene: Gene) => void;
  onPreview: (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, gene: Gene) => void;
  onPreviewEnd: () => void;
  tooltipGene?: string | null;
};

/**
 * The atomic gene symbol button used by the map, region lists and panels.
 * Keeps provenance (added = red), selection and dimming in one place.
 */
export default function GeneChip({
  gene,
  small = false,
  selected = false,
  dimmed = false,
  onSelect,
  onPreview,
  onPreviewEnd,
  tooltipGene,
}: GeneChipProps) {
  const classes = [
    'gene-chip',
    small ? 'gene-chip--small' : '',
    isAdded(gene) ? 'is-added' : '',
    selected ? 'is-selected' : '',
    dimmed ? 'is-dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={`${gene.symbol}: ${gene.name}${isAdded(gene) ? ', ' + statusLabel(gene) : ''}`}
      aria-describedby={tooltipGene === gene.symbol ? 'gene-tooltip' : undefined}
      aria-pressed={selected}
      onMouseEnter={(e) => onPreview(e, gene)}
      onMouseLeave={onPreviewEnd}
      onFocus={(e) => onPreview(e, gene)}
      onBlur={onPreviewEnd}
      onClick={() => onSelect(gene)}
    >
      <span>{gene.symbol}</span>
    </button>
  );
}

/** Small provenance / clinical-group badges shared across panes. */
export function GeneGroupBadges({gene}: {gene: Gene}) {
  const groups = clinicalGroupsFor(gene).filter(
    (p) => p.id !== 'arrhythmia' || (!gene.clinical.af && !gene.clinical.va),
  );
  if (!groups.length) return <span className="source-only-tag">Source only</span>;
  return (
    <div className="gene-group-badges">
      {groups.map((p) => (
        <span key={p.id} className={`group-badge group-badge--${p.id}`} title={p.name}>
          {p.short}
        </span>
      ))}
    </div>
  );
}

export function StatusPill({gene}: {gene: Gene}) {
  if (!isAdded(gene)) return <span className="status-pill status-pill--original">Original</span>;
  return (
    <span className="status-pill status-pill--added">
      {gene.catalogAddition ? 'AF extension' : 'PDF addition'}
    </span>
  );
}
