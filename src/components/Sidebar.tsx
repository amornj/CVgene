import {Activity, BookOpen, ChevronRight, Dna, FileText, Heart, Layers, Network, Stethoscope} from 'lucide-react';
import {clinicalPanelById, genes} from '../data';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  panel: string;
  onAllGenes: () => void;
  onPanel: (id: string) => void;
  onSources: () => void;
};

const diseaseIcons: Record<string, typeof Heart> = {
  va: Activity,
  af: Heart,
  dcm: Heart,
  hcm: Heart,
  aortopathy: Network,
  pah: Stethoscope,
  lipid: Layers,
};

export const diseaseOrder = ['va', 'af', 'dcm', 'hcm', 'aortopathy', 'pah', 'lipid'];

export default function Sidebar({open, onClose, panel, onAllGenes, onPanel, onSources}: SidebarProps) {
  return (
    <>
      {open && <button type="button" className="nav-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-brand-row">
          <a href="/" className="brand" aria-label="CardioGene home">
            <span className="brand-mark"><Activity size={22} strokeWidth={1.9} /></span>
            <span className="brand-text">
              Cardio<span className="brand-light">Gene</span>
            </span>
          </a>
          <button type="button" className="sidebar-close icon-button" aria-label="Close navigation" onClick={onClose}>
            <ChevronRight size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          <p className="nav-label">Browse</p>
          <button
            type="button"
            className={`nav-item ${panel === 'all' ? 'is-active' : ''}`}
            aria-current={panel === 'all' ? 'page' : undefined}
            onClick={onAllGenes}
          >
            <Dna size={18} />
            <span>All genes</span>
            <span className="nav-count">{genes.length}</span>
          </button>

          <p className="nav-label">By disease</p>
          {diseaseOrder.map((id) => {
            const p = clinicalPanelById(id);
            const Icon = diseaseIcons[id] ?? Heart;
            return (
              <button
                key={id}
                type="button"
                className={`nav-item nav-item--disease ${panel === id ? 'is-active' : ''}`}
                aria-current={panel === id ? 'page' : undefined}
                onClick={() => onPanel(id)}
              >
                <Icon size={17} className="nav-disease-icon" style={{color: `var(--${id === 'va' ? 'va' : id})`}} />
                <span>{p.name}</span>
                <span className="nav-count">{p.count}</span>
              </button>
            );
          })}

        </nav>

        <div className="sidebar-foot">
          <button type="button" className="source-button" onClick={onSources}>
            <BookOpen size={16} />
            <span>Sources &amp; methodology</span>
          </button>
          <div className="sidebar-meta">
            <FileText size={13} />
            <span>Panel &amp; evidence reviewed 23 Oct 2026</span>
          </div>
        </div>
      </aside>
    </>
  );
}
