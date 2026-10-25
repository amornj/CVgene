import type {Gene} from '../data';
import {clinicalGroupsFor, isAdded} from '../data';
import GeneChip, {GeneGroupBadges, StatusPill} from './GeneChip';
import type {RenderGene} from './types';

type GeneTableProps = {
  genes: Gene[];
  selected: Gene;
  onSelect: (gene: Gene) => void;
  onPreview: (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, gene: Gene) => void;
  onPreviewEnd: () => void;
  tooltipGene?: string | null;
};

export function GeneTable({genes, selected, onSelect, onPreview, onPreviewEnd, tooltipGene}: GeneTableProps) {
  return (
    <div className="gene-table-wrap">
      <table className="gene-table">
        <thead>
          <tr>
            <th scope="col">Gene / full name</th>
            <th scope="col">Clinical groups</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {genes.map((gene) => (
            <tr
              key={gene.symbol}
              className={gene.symbol === selected.symbol ? 'is-selected' : ''}
              onClick={() => onSelect(gene)}
            >
              <td>
                <button
                  type="button"
                  className={`gene-name-button ${isAdded(gene) ? 'is-added' : ''}`}
                  onMouseEnter={(e) => onPreview(e, gene)}
                  onMouseLeave={onPreviewEnd}
                  onFocus={(e) => onPreview(e, gene)}
                  onBlur={onPreviewEnd}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(gene);
                  }}
                  aria-label={`Open ${gene.symbol}: ${gene.name}`}
                >
                  {gene.symbol}
                </button>
                <span className="table-fullname">{gene.name}</span>
              </td>
              <td>
                <GeneGroupBadges gene={gene} />
              </td>
              <td>
                <StatusPill gene={gene} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GeneGrid({
  genes,
  selected,
  onSelect,
  onPreview,
  onPreviewEnd,
  tooltipGene,
  variant = 'default',
}: {
  genes: Gene[];
  selected: Gene;
  onSelect: (gene: Gene) => void;
  onPreview: (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, gene: Gene) => void;
  onPreviewEnd: () => void;
  tooltipGene?: string | null;
  variant?: 'default' | 'small';
}) {
  return (
    <div className="gene-grid">
      {genes.map((gene) => (
        <GeneChip
          key={gene.symbol}
          gene={gene}
          small={variant === 'small'}
          selected={gene.symbol === selected.symbol}
          onSelect={onSelect}
          onPreview={onPreview}
          onPreviewEnd={onPreviewEnd}
          tooltipGene={tooltipGene}
        />
      ))}
    </div>
  );
}

export type {RenderGene};
export {GeneChip, GeneGroupBadges, StatusPill};
export {clinicalGroupsFor};
