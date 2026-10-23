Visual thesis: A quiet, lavender-and-ink clinical workbench, with a precise gene map as its visual anchor and comfortably readable evidence at the right.
Content plan: Persistent disease navigation; searchable gene workspace; true two-set Venn for the only overlapping panels; independent aortopathy, PAH and lipid groups; contextual gene inspector and traceable source drawer.
Interaction thesis: Gentle map entrance, immediate search filtering with highlighted results, and a short inspector transition on gene selection. Respect reduced motion. Tooltips work on pointer hover and keyboard focus.
Data: The supplied two-page PDF is the authority for membership and additions, not for current assay coverage or equivalent gene-disease validity. Full names and identifiers come from HGNC. Clinical explanations are source-linked educational summaries; no variant classification or individualized prescribing.

## Independent VA and AF phenotype map

Visual thesis: preserve the quiet clinical workbench with three main circles for ventricular arrhythmia, DCM and HCM/LVH; an optional AF circle partially overlaps VA and extends beyond it. AF and VA are peers in navigation.
Content plan: actual gene symbols in exact regions; a familial / early-onset AF focus for MYL4 and HCN4 outside selected VA membership; source-linked clinical details and a compact expandable AF evidence overview. Familial AF also occurs in overlaps. Absence from a selected VA set is never presented as exclusion of ventricular risk.
Interaction thesis: AF starts off. Switching modes clears the overlap filter, keeps the inspected gene and repositions labels in the appropriate verified layout. AF-only genes remain searchable and accessible via the AF list. Hover bubbles gain no additional information. Red gene symbols retain their provenance meaning without plus markers.

All 51 default-map genes and all 53 AF-enabled genes appear once in the diagram. Static geometry in `src/data/venn-layout.json` is validated for complete gene-button rectangles, other buttons and reserved labels in both modes. AF has 13 selected genes; VA has 27 selected primary-electrical or structural-disease contexts. These are non-exhaustive associations, not risk categories. The AF circle is neither contained by nor contains VA.

The slider stays at top right: just a track and AF, with no container border or background. No Compare tab or aggregate count strip is restored. Every HCM pane explains that clinical VA risk can exist without separate map membership and links the 2024 clinical risk guideline. The full catalog, source document and exports retain original PDF provenance.

## Disease-specific gene frequency

Visual thesis: preserve the map as a membership diagram and use the existing right inspector for a restrained, cardless frequency list. Circle geometry, gene colors, and hover bubbles do not encode frequency.
Content plan: circle labels and a small Gene frequencies action open the inspector; a disease/syndrome selector provides DCM, HCM, early-onset AF, LQTS, CPVT, and Brugada contexts. Population and denominator precede the ranked estimates. Sources, limitations and genes without curated estimates are available in the same pane. Each gene explanation includes a compact disease-specific frequency section.
Interaction thesis: selecting an estimate opens that gene's existing explanation and highlights its map symbol; a back action restores the ranking. Map hover/focus bubbles retain exactly their prior content. Existing AF visibility and source-addition styling are independent of frequency.
Data: ranges and upper limits are preserved, bars share a 0–100% scale, and lists are ordered by reported upper estimate without normalization. AF carrier percentages use all 1,293 tested patients from one early-onset cohort. HCM estimates refer to positive molecular diagnoses, not all HCM patients. Missing data stays null, never zero. No pooled VA percentage or automatic syndrome membership is inferred.

## Independent-panel frequency contexts

Visual thesis: extend the existing inspector and source-panel colors; keep the phenotype map and its hover bubbles independent of frequency.
Content plan: Aortopathy, pulmonary hypertension and lipid panel headings open their frequency context. Their filtered gene lists provide the same Gene frequencies action. A grouped selector adds HTAD referrals, Loeys–Dietz syndrome, familial/idiopathic PAH, sporadic/familial PVOD, and clinical FH. Population, denominator and critical coverage exclusions precede the estimates.
Interaction thesis: panel heading → disease-specific estimates → existing gene explanation → back to estimates, with the same mobile drawer and keyboard behavior. Genes without a comparable estimate remain inspectable. Original PDF status continues to control red styling.
Data: the HTAD cohort is 60 sequence-positive patients among 810 tested referrals; six separate CNV diagnoses are excluded. Loeys–Dietz estimates are confined to its six catalog genes. PAH literature ranges and PVOD discovery cohorts remain distinct. Familial PVOD counts families rather than patients and is explicitly not universal sensitivity. FH uses an arrow for the LDLR >50% lower bound; its other lipid disorders are not assigned FH percentages. Explicit eligible-symbol lists prevent subgroup membership from being inferred from a broad source panel. Assay detection rates are not used as gene frequencies.

## External phenotype and syndrome clues

Preserve the lavender-and-ink workbench, source-addition red, Venn geometry and established full-name hover bubbles. Use one person icon beside the Phenotype highlight switch. Individual symbols and rows remain free of phenotype icons.

A single Phenotype switch highlights external-pattern genes; a Syndromes & clues tab allows exploration by a named syndrome, clinical group or specific physical clue. Gene selection uses the existing inspector. Opening a cue expands its source-linked syndrome section and puts keyboard focus on the disclosure; selecting a gene from a syndrome places that syndrome first. Ordinary gene selection keeps the section collapsed. Source-panel status and laboratory coverage are separate from syndrome association.

Characteristic, supportive and nonspecific patterns use text labels. Visible signs, examination findings and history clues are explicitly distinguished; Danon and JLNS use Clinical clues. Do not use a risk color, diagnostic score or appearance-based classification. Keep assay gaps and variant / inheritance caveats close to the clues. Respect existing reduced-motion settings and mobile drawer behavior.

## Syndrome-first navigation

Visual thesis: retain the calm clinical workbench and use the existing clues surface as a syndrome explorer, without adding another tab or diagram.
Content plan: direct syndrome selection, grouped aortic and cardiocutaneous navigation, clue search, visible phenotype patterns, and the existing source-linked gene inspector. Aortic coverage distinguishes Marfan, Loeys–Dietz and vascular Ehlers–Danlos rather than merging them into one syndrome.
Interaction thesis: selecting a named syndrome clears conflicting workspace and clue filters; selecting a clinical group returns to all syndromes in that group. A named syndrome opens its testing/source details. Gene actions retain the existing right-pane and mobile drawer behavior; hover bubbles remain unchanged.

The expanded cardiomyopathy / arrhythmia group provides ten source-linked teaching contexts, including distinct Naxos / Carvajal and Noonan / Noonan-with-multiple-lentigines entries, plus Duchenne / Becker dystrophinopathy. Every syndrome includes a brief gene–phenotype mechanism. Features requiring examination or history retain explicit labels. RASopathy catalog coverage remains partial and is labeled in the testing gaps.

## Ventricular-arrhythmia focus

Visual thesis: preserve the gene overlap diagram and its quiet lavender workbench; a compact text selector focuses attention within VA without moving genes or assigning a new risk color.
Content plan: stack AF, VA and Phenotype switches at the upper right of the map, all off initially. VA reveals a single six-syndrome dropdown; Phenotype highlights external visible/examination associations. Both together select the intersection. Other symbols fade and remain inspectable. A short expandable scope/source note explains selected coverage.
Interaction thesis: immediate dimming makes focus changes legible; the existing gene-inspector transition connects a symbol to its mechanism. Preserve existing AF behavior and reduced-motion preferences. Primary electrical disease and structural cardiomyopathy may overlap in one gene; condition sets are explicit rather than inferred from keywords, channel class or GOF/LOF alone. Original PDF red and hover bubbles keep their established meanings.
