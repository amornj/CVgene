import {ChartNoAxesColumn, Info, X} from 'lucide-react';
import type {Gene} from '../data';
import GeneChip from './GeneChip';
import {scopeLabels, type Scope, type View} from './types';

type ResultsHeaderProps = {
  query: string;
  count: number;
  hasActiveFilter: boolean;
  onReset: () => void;
  onFrequency: (() => void) | null;
};

export function SectionHeading({title, description, count, actions}: {title: React.ReactNode; description?: React.ReactNode; count?: number; actions?: React.ReactNode}) {
  return (
    <div className="section-heading">
      <div className="section-heading-text">
        <h2>
          {title}
          {count !== undefined && <span className="count-badge">{count}</span>}
        </h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="section-heading-actions">{actions}</div>}
    </div>
  );
}

export function FrequencyLaunch({onClick}: {onClick: () => void}) {
  return (
    <button type="button" className="button-quiet" onClick={onClick}>
      <ChartNoAxesColumn size={15} />
      <span>Gene frequencies</span>
    </button>
  );
}

export function EmptyState({onReset}: {onReset: () => void}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Info size={22} />
      </div>
      <h3>No matching genes</h3>
      <p>Try a gene symbol, full name, alias, or clinical feature — or clear the filters.</p>
      <button type="button" className="button-primary" onClick={onReset}>
        Clear search &amp; filters
      </button>
    </div>
  );
}

export function ResetFilters({onReset}: {onReset: () => void}) {
  return (
    <button type="button" className="text-button" onClick={onReset}>
      Reset filters
      <X size={12} />
    </button>
  );
}

export const scopeLabel = scopeLabels;
export type {Scope, View};
