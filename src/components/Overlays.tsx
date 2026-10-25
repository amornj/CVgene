import {createPortal} from 'react-dom';
import {ArrowUpRight, Check, ChevronDown, X} from 'lucide-react';
import {references, type Gene} from '../data';
import {clinicalGroupsFor} from '../data';

export function GeneTooltip({
  gene,
  x,
  y,
  below,
}: {
  gene: Gene;
  x: number;
  y: number;
  below: boolean;
}) {
  return createPortal(
    <div
      id="gene-tooltip"
      role="tooltip"
      className={`gene-tooltip ${below ? 'is-below' : ''}`}
      style={{left: x, top: y}}
    >
      <strong>{gene.symbol}</strong>
      <p>{gene.name}</p>
      <small>
        {clinicalGroupsFor(gene)
          .map((p) => p.short)
          .join(' · ') || 'Retained PDF source gene'}
      </small>
    </div>,
    document.body,
  );
}

export function Toast({message}: {message: string}) {
  return (
    <div className="toast" role="status">
      <Check size={16} />
      {message}
    </div>
  );
}

export function SourceDialog({
  open,
  onClose,
  dialogRef,
}: {
  open: boolean;
  onClose: () => void;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="source-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-head">
        <span className="eyebrow">Traceable by design</span>
        <button type="button" className="icon-button" aria-label="Close sources" onClick={onClose}>
          <X size={19} />
        </button>
      </div>
      <h2>Sources &amp; methodology</h2>
      <p className="dialog-intro">Panel membership and clinical interpretation answer different questions.</p>

      <section>
        <h3>
          <span className="dialog-num">01</span> Your source panel
        </h3>
        <p>
          The original 102 symbols, 114 PDF panel memberships, and 16 red additions were transcribed and checked against the supplied
          two-page document, dated 22 October 2026. The 86 original genes are retained. MYL4 is a separate AF extension beyond the PDF,
          bringing the catalog to 103. Red gene symbols identify additions beyond the original baseline. Status labels distinguish PDF
          additions from the MYL4 extension; neither confirms assay coverage.
        </p>
        <a className="pdf-link" href="/panels-2026.pdf" target="_blank" rel="noreferrer">
          <span>
            Hereditary Cardiovascular Gene Panels
            <small>Updated 22 October 2026 · Original PDF</small>
          </span>
          <ArrowUpRight size={16} />
        </a>
      </section>

      <section>
        <h3>
          <span className="dialog-num">02</span> Clinical explanations
        </h3>
        <p>
          Explicit AF/VA/DCM/HCM memberships use disease-specific curations and primary studies rather than keyword matching. The 13-gene
          AF set is selected coverage within this catalog, not an exhaustive list of all AF-associated loci. HCM includes clearly labeled
          LVH phenocopies. Sources are linked in every gene pane. These are curated summaries, not live ClinGen classifications, variant
          interpretation, or individual treatment recommendations.
        </p>
        <details>
          <summary>
            Clinical reference library
            <ChevronDown size={14} />
          </summary>
          <div className="reference-library">
            {Object.entries(references).map(([id, r]) => (
              <a key={id} href={r.url} target="_blank" rel="noreferrer">
                <span>
                  {r.title}
                  <small>{r.detail}</small>
                </span>
                <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
        </details>
      </section>

      <section>
        <h3>
          <span className="dialog-num">03</span> Reading the map
        </h3>
        <p>
          The default circles are ventricular arrhythmia (VA), DCM and HCM/LVH. AF is off by default; when enabled it overlaps VA and the
          cardiomyopathy groups and extends beyond VA. The AF-only area highlights MYL4 and HCN4 familial / early-onset AF and sinus-node
          contexts. Other familial AF genes occur in the overlaps. Selected VA membership includes primary electrical and structural
          cardiomyopathy contexts and is not an exhaustive list of all genes that can cause ventricular events. Each gene appears once and
          areas are schematic.
        </p>
      </section>

      <section>
        <h3>
          <span className="dialog-num">04</span> Gene frequency estimates
        </h3>
        <p>
          Select a circle label or Gene frequencies to open published estimates in the right pane. DCM, HCM, and early-onset AF use
          different populations and denominators; these are stated beside each list. Ranges, upper limits and lower bounds are preserved.
          Missing estimates are not zero. Frequency is separate from gene–disease validity, penetrance, and event risk.
        </p>
      </section>

      <section>
        <h3>
          <span className="dialog-num">05</span> Names &amp; testing requirements
        </h3>
        <p>
          Approved full names, aliases, and identifiers were matched to the official HGNC dataset. AD means autosomal dominant; AR means
          autosomal recessive. Confirm laboratory inclusion, sequence coverage, and copy-number detection. A variant of uncertain
          significance must not drive treatment or predictive cascade testing.
        </p>
        <a className="inline-link" href="https://www.genenames.org/" target="_blank" rel="noreferrer">
          HGNC gene nomenclature
          <ArrowUpRight size={13} />
        </a>
      </section>

      <div className="dialog-footer">
        <span>Reviewed 23 October 2026</span>
        <button type="button" className="button-primary" onClick={onClose}>
          Back to explorer
        </button>
      </div>
    </dialog>
  );
}
