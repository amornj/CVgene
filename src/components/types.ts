import type {Gene} from '../data';

export type View = 'map' | 'list' | 'syndromes';
export type Scope = 'all' | 'added' | 'shared' | 'baseline';
export type InspectorMode = 'gene' | 'frequency';

export const scopeLabels: Record<Scope, string> = {
  all: 'All catalog genes',
  added: 'Added genes',
  shared: 'Shared genes',
  baseline: 'Original genes',
};

export const fmtDate = '22 Oct 2026';

/** Shared chip renderer signature used by the map, lists and panels. */
export type RenderGene = (gene: Gene, variant?: 'default' | 'small') => React.ReactNode;

export const exampleSearches = [
  { label: 'LMNA', query: 'LMNA' },
  { label: 'Fabry disease', query: 'Fabry' },
  { label: 'CPVT', query: 'CPVT' },
];
