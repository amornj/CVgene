import {ArrowUpRight, Command, Info, Menu, Search, X} from 'lucide-react';
import {exampleSearches} from './types';

type TopBarProps = {
  onMenu: () => void;
  onSources: () => void;
  onExample: (query: string) => void;
};

export function TopBar({onMenu, onSources, onExample}: TopBarProps) {
  return (
    <header className="topbar">
      <button type="button" className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}>
        <Menu size={20} />
      </button>
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-sep">/</span>
        <strong>Gene explorer</strong>
      </div>
      <button type="button" className="topbar-source" onClick={onSources}>
        <span className="live-dot" />
        <span className="topbar-source-text">Panel updated 22 Oct 2026</span>
        <Info size={14} />
      </button>
    </header>
  );
}

type SearchBarProps = {
  query: string;
  onChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onExample: (query: string) => void;
};

export function SearchBar({query, onChange, inputRef, onSubmit, onExample}: SearchBarProps) {
  return (
    <div className="search-block">
      <div className="search-wrap">
        <Search size={19} className="search-icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search genes, full names, or phenotypes"
          placeholder="Search a gene, full name, or clinical feature…"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="icon-button search-clear"
            aria-label="Clear search"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
          >
            <X size={16} />
          </button>
        ) : (
          <kbd className="search-kbd">
            <Command size={11} /> K
          </kbd>
        )}
      </div>
      <div className="search-examples">
        <span className="search-examples-label">Try</span>
        {exampleSearches.map((example) => (
          <button key={example.label} type="button" className="example-chip" onClick={() => onExample(example.query)}>
            {example.label}
          </button>
        ))}
        <span className="search-examples-hint">Symbols, aliases and clinical features</span>
      </div>
    </div>
  );
}

export function ViewToolbar({
  view,
  scope,
  onView,
  onScope,
  onExport,
}: {
  view: string;
  scope: string;
  onView: (view: 'map' | 'list' | 'syndromes') => void;
  onScope: (scope: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="view-toolbar">
      <div className="segmented" role="tablist" aria-label="Gene explorer views">
        <button role="tab" aria-selected={view === 'map'} className={view === 'map' ? 'is-chosen' : ''} onClick={() => onView('map')}>
          By organ involvement
        </button>
        <button role="tab" aria-selected={view === 'list'} className={view === 'list' ? 'is-chosen' : ''} onClick={() => onView('list')}>
          By alphabet
        </button>
        <button role="tab" aria-selected={view === 'syndromes'} className={view === 'syndromes' ? 'is-chosen' : ''} onClick={() => onView('syndromes')}>
          By clinical syndrome
        </button>
      </div>
      <div className="toolbar-actions">
        <label className="scope-select">
          <span className="sr-only">Filter by panel status</span>
          <select value={scope} onChange={(e) => onScope(e.target.value)}>
            <option value="all">All genes</option>
            <option value="added">Added genes</option>
            <option value="shared">Shared genes</option>
            <option value="baseline">Original genes</option>
          </select>
        </label>
        <button type="button" className="button-secondary" onClick={onExport}>
          <ArrowUpRight size={15} />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}
