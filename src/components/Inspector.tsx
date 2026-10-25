import {useState} from 'react';
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Copy,
  Dna,
  GitCompareArrows,
  Info,
  Link as LinkIcon,
  PanelRightClose,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import {
  clinicalGroupsFor,
  clinicalPanelById,
  panelById,
  inheritanceHelp,
  isAdded,
  references,
  statusLabel,
  type Gene,
  type PhenotypeId,
} from '../data';
import AfEvidence from './AfEvidence';
import {GeneExternalPhenotypes} from './ExternalPhenotypes';
import {GeneFrequency, BackToFrequency} from './FrequencyPane';
import {GeneVaContexts} from './VaFocus';
import type {FrequencyId} from '../frequency';
import type {VaFocusId} from '../va-focus';

type GeneInspectorProps = {
  gene: Gene;
  narrow: boolean;
  vaFocus: VaFocusId;
  frequencyBack: boolean;
  frequencyContext: FrequencyId;
  onClose: () => void;
  onOpenFrequency: (id: FrequencyId) => void;
  onBackToFrequency: () => void;
  onSources: () => void;
  onToast: (message: string) => void;
};

function Tier({title, children, muted = false}: {title: string; children: React.ReactNode; muted?: boolean}) {
  return (
    <section className={`inspector-tier ${muted ? 'is-muted' : ''}`}>
      <h3 className="tier-title">{title}</h3>
      {children}
    </section>
  );
}

function Collapsible({
  title,
  icon,
  children,
  defaultOpen = false,
  summaryHint,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  summaryHint?: string;
}) {
  return (
    <details className="inspector-disclosure" open={defaultOpen}>
      <summary>
        {icon}
        <span className="disclosure-title">
          {title}
          {summaryHint && <small>{summaryHint}</small>}
        </span>
        <ChevronDown size={15} className="disclosure-chevron" />
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}

export default function Inspector({
  gene,
  narrow,
  vaFocus,
  frequencyBack,
  frequencyContext,
  onClose,
  onOpenFrequency,
  onBackToFrequency,
  onSources,
  onToast,
}: GeneInspectorProps) {
  const [copied, setCopied] = useState(false);
  const groups = clinicalGroupsFor(gene);
  const overlapCount = (['va', 'dcm', 'hcm', 'af'] as PhenotypeId[]).filter((id) => groups.some((p) => p.id === id)).length;
  const evidenceIds = (['af', 'va', 'dcm', 'hcm'] as PhenotypeId[]).filter((id) => gene.clinical[id]);

  async function copySummary() {
    const text = [
      `${gene.symbol} — ${gene.name}`,
      `Clinical groups: ${groups.map((p) => p.name).join(' / ') || 'None curated'}`,
      `PDF source: ${gene.panels.map((p) => panelById(p).short).join(' / ') || 'Not present'}`,
      statusLabel(gene),
      `Inheritance: ${gene.inheritance}`,
      '',
      gene.relevance,
      '',
      `Clinical consideration: ${gene.consideration}`,
      gene.caution ? `Evidence caution: ${gene.caution}` : '',
      '',
      'A VUS must not drive treatment or predictive cascade testing.',
      `https://www.ncbi.nlm.nih.gov/gene/${gene.ncbiId}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onToast(`${gene.symbol} summary copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast('Clipboard unavailable — select the text manually');
    }
  }

  return (
    <aside
      className="inspector"
      role={narrow ? 'dialog' : 'complementary'}
      aria-modal={narrow ? true : undefined}
      aria-label={`${gene.symbol} clinical details`}
    >
      <div className="inspector-head">
        <span className="inspector-kicker">
          <Dna size={14} />
          Gene details
        </span>
        <button type="button" className="icon-button close-inspector" onClick={onClose} aria-label="Close details pane">
          <PanelRightClose size={17} />
        </button>
      </div>

      <div className="inspector-scroll">
        {frequencyBack && <BackToFrequency context={frequencyContext} onClick={onBackToFrequency} />}

        {/* ---------- Tier 1: identity ---------- */}
        <header className="gene-header">
          <div className="gene-header-row">
            <h2 className="gene-symbol" tabIndex={-1}>
              {gene.symbol}
            </h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Copy link to this gene"
              title="Copy link"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${location.origin}/?gene=${gene.symbol}`);
                  onToast('Gene link copied');
                } catch {
                  onToast('Clipboard unavailable');
                }
              }}
            >
              <LinkIcon size={16} />
            </button>
          </div>
          <p className="gene-fullname">{gene.name}</p>

          <div className="gene-status-row">
            <span className={`status-line ${isAdded(gene) ? 'is-added' : ''}`}>
              {!isAdded(gene) && <span className="included-dot" />}
              {statusLabel(gene)}
            </span>
          </div>

          {groups.length > 0 && (
            <div className="gene-pills">
              {groups.map((p) => (
                <span key={p.id} className={`pill pill--${p.id}`}>
                  <i />
                  {p.short === 'ARR' ? 'Arrhythmia' : p.name}
                </span>
              ))}
            </div>
          )}

          <div className="gene-meta-row">
            <span className="meta-label">PDF source</span>
            <span className="meta-value">{gene.panels.length ? gene.panels.map((p) => panelById(p).short).join(' / ') : 'Not in source PDF'}</span>
          </div>
          {overlapCount > 1 && (
            <p className="overlap-note">
              <GitCompareArrows size={14} />
              Shared across {overlapCount} clinical phenotypes
            </p>
          )}
        </header>

        {/* ---------- Tier 2: the clinical answer ---------- */}
        <Tier title="Why it matters">
          <p className="prose">{gene.relevance}</p>
        </Tier>

        {gene.consideration && (
          <Tier title="Clinical consideration">
            <p className="prose">{gene.consideration}</p>
          </Tier>
        )}

        {gene.caution && (
          <div className="callout callout--warn">
            <Info size={16} />
            <div>
              <strong>Evidence needs context</strong>
              <p>{gene.caution}</p>
            </div>
          </div>
        )}

        {isAdded(gene) && (
          <div className="callout callout--added">
            <div>
              <strong>{gene.catalogAddition ? 'AF extension beyond the PDF' : 'Proposed PDF panel addition'}</strong>
              <p>
                {gene.catalogAddition
                  ? 'MYL4 was added for familial AF coverage. It is absent from the supplied PDF; this is distinct from its 16 red additions.'
                  : 'Highlighted in red in the PDF and absent from its 86-gene baseline. Actual laboratory coverage needs confirmation.'}
              </p>
            </div>
          </div>
        )}

        {/* ---------- Tier 3: evidence, collapsed ---------- */}
        <div className="inspector-evidence">
          <p className="evidence-heading">Evidence &amp; context</p>

          <Collapsible title="Variant context" icon={<Dna size={15} />} summaryHint={gene.inheritance}>
            <dl className="fact-list">
              <dt>Inheritance</dt>
              <dd>
                {gene.inheritance === 'AD'
                  ? 'Autosomal dominant'
                  : gene.inheritance === 'AR'
                    ? 'Autosomal recessive'
                    : gene.inheritance}
              </dd>
              <dt>Clinical associations</dt>
              <dd>
                <div className="phenotype-tags">
                  {gene.phenotypes.map((p) => (
                    <span key={p}>{p}</span>
                  ))}
                </div>
              </dd>
            </dl>
            <p className="micro-note">{inheritanceHelp}</p>
          </Collapsible>

          {evidenceIds.length > 0 && (
            <Collapsible title="Disease-specific context" icon={<Stethoscope size={15} />}>
              {evidenceIds.map((id) => {
                const e = gene.clinical[id]!;
                return (
                  <div key={id} className="disease-block">
                    <p className="disease-block-head">
                      <strong>{clinicalPanelById(id).short}</strong>
                      <span>{e.kind}</span>
                    </p>
                    <p className="prose prose--sm">{e.note}</p>
                    {id === 'hcm' && (
                      <p className="micro-note">
                        HCM can carry arrhythmic risk even without separate VA membership. Genotype alone does not establish individual
                        sudden-death risk.
                      </p>
                    )}
                    {references[e.reference] && (
                      <a className="inline-link" href={references[e.reference].url} target="_blank" rel="noreferrer">
                        {references[e.reference].title}
                        <ArrowUpRight size={12} />
                      </a>
                    )}
                    {id === 'hcm' && (
                      <a className="inline-link" href={references.hcmrisk.url} target="_blank" rel="noreferrer">
                        2024 HCM risk assessment guideline
                        <ArrowUpRight size={12} />
                      </a>
                    )}
                  </div>
                );
              })}
              {gene.clinical.af && <AfEvidence />}
            </Collapsible>
          )}

          <GeneVaContexts gene={gene} focus={vaFocus} />

          <GeneFrequency gene={gene} onOpen={onOpenFrequency} />

          <GeneExternalPhenotypes gene={gene} expanded={false} preferredSyndrome={null} onExpandedChange={() => {}} />

          <Collapsible title="Sources" icon={<BookOpen size={15} />}>
            <div className="source-links">
              {references[gene.reference] && (
                <a href={references[gene.reference].url} target="_blank" rel="noreferrer">
                  <BookOpen size={14} />
                  <span>
                    {references[gene.reference].title}
                    <small>{references[gene.reference].detail}</small>
                  </span>
                  <ArrowUpRight size={13} />
                </a>
              )}
              <a href={`https://www.ncbi.nlm.nih.gov/gene/${gene.ncbiId}`} target="_blank" rel="noreferrer">
                <Dna size={14} />
                <span>
                  NCBI Gene · {gene.symbol}
                  <small>Function and linked literature</small>
                </span>
                <ArrowUpRight size={13} />
              </a>
              <a href={`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${gene.hgncId}`} target="_blank" rel="noreferrer">
                <LinkIcon size={14} />
                <span>
                  {gene.hgncId}
                  <small>HGNC approved symbol &amp; name</small>
                </span>
                <ArrowUpRight size={13} />
              </a>
              <a href={`https://search.clinicalgenome.org/kb/genes/${gene.hgncId}`} target="_blank" rel="noreferrer">
                <ShieldCheck size={14} />
                <span>
                  Check current ClinGen curation
                  <small>Validity is disease- and inheritance-specific</small>
                </span>
                <ArrowUpRight size={13} />
              </a>
              <button type="button" className="inline-link inline-link--button" onClick={onSources}>
                Read the full methodology
                <ArrowUpRight size={12} />
              </button>
            </div>
          </Collapsible>
        </div>

        <button type="button" className="button-primary button-full" onClick={copySummary}>
          <Copy size={15} />
          {copied ? 'Copied' : 'Copy clinical summary'}
        </button>

        <p className="inspector-footnote">
          <ShieldCheck size={13} />
          Reference context for clinicians. Interpret the variant, phenotype and family together.
        </p>
      </div>
    </aside>
  );
}
