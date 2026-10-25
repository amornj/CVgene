# CardioGene

A browser-only clinician reference with explicit clinical phenotype mappings and preserved PDF provenance. No patient records, backend, or generated-at-runtime clinical advice.

## Run and validate

```sh
npm install
npm run dev
npm test
npm run build
```

## Clinical views

The default map shows **ventricular arrhythmia (VA), DCM and HCM/LVH**, with 51 genes. AF is off by default. Its independent circle overlaps VA and the cardiomyopathy groups and extends beyond VA; enabling it adds MYL4 and HCN4 for 53 visible genes. AF navigation and search always include all 13 selected AF genes. The AF slider remains at the diagram’s top right, with only the label AF.

Gene symbols are directly selectable in their exact regions; hover/focus shows the established full-name bubble, and selection opens the clinical pane. AF and VA are peer clinical filters. Exact aliases AF, VA, DCM and HCM resolve to explicit memberships; ARR remains a search alias for the combined rhythm-disorder union, not the VA circle.

The AF-only region is labeled **Familial / early-onset AF focus** and contains atrial-predominant MYL4 and sinus-node/AF HCN4 contexts. Familial AF is not confined to this region: SCN5A, KCNQ1 and relevant TTN truncating variants lie in overlaps. The 2022 testing consensus and 2023 AF guideline are linked in the clinical evidence section. Cardiomyopathy-gene findings in AF cohorts do not establish isolated monogenic AF causation. AF-only placement does not exclude ventricular events.

VA membership is a selected, non-exhaustive collection of primary electrical and structural cardiomyopathy contexts, **not a high-arrhythmogenic genotype list**. MYH7 and MYBPC3 have explicitly labeled HCM-associated VA context. Other HCM genes may also carry ventricular risk through the phenotype; every HCM clinical pane links clinical risk assessment guidance. Shared genes may involve different variants and mechanisms. HCM includes labeled syndromic LVH phenocopies.

`src/data/clinical-groups.json` holds explicit, source-linked per-gene memberships. `scripts/update-clinical-groups.py` regenerates them without changing the source PDF metadata. Four-bit regions use VA/DCM/HCM/AF order; AF on has 12 nonempty disjoint regions, AF off has seven. `src/data/venn-layout.json` supplies separate layouts for each mode; tests verify complete button rectangles against all circle boundaries, titles and other buttons. Areas are schematic and encode neither frequency nor risk.

## PDF provenance and catalog extension

The original source is served at `/panels-2026.pdf`: 102 genes, 114 memberships across five PDF panels, 16 red additions over an 86-gene baseline. `src/data/metadata.json` and `scripts/pdf-membership.json` preserve those memberships exactly. Clinical membership may differ from source membership; both are shown in the inspector and exports.

MYL4 is the one additional catalog gene for AF, stored in `src/data/extensions.json`, for 103 catalog genes total. It is labeled **AF extension — absent from source PDF**, separately from the 16 PDF-red additions. All 17 additions versus the original baseline are red. Laboratory assay inclusion is not implied.

Genes with limited, disputed, or other phenotype-specific evidence remain searchable and have their original explanations; they are not silently promoted into the curated circles. The DCM context incorporates the September 2026 reassessment. A JPH2 inheritance-grade discrepancy between the published abstract and ClinGen/preprint records is explicitly flagged rather than resolved by assumption. NEXN's original PDF inclusion priority remains provenance, while the current DCM note reflects upgraded evidence.

## Sources, exports, and editing

### Gene frequency reference

Select a disease label on the map or **Gene frequencies** to view source-linked estimates in the right pane. Select an estimate to open the gene explanation and highlight its map symbol; the back action restores the list. The gene inspector also includes a Frequency by disease section. Hover bubbles are unchanged.

`src/data/frequency.json` is a separate, frozen reference dataset, reviewed 22 October 2026. It does not alter clinical memberships or source PDF additions. `src/frequency.ts` preserves point estimates, published ranges, upper limits, and patient counts. Bars use a common 0–100% scale and are not normalized to the displayed catalog subset. Frequency is not penetrance, event risk, or gene–disease validity.

DCM uses preliminary nonsyndromic case-series estimates; HCM uses shares of positive molecular diagnoses (phenocopies excluded). AF uses verified gene carrier counts over all 1,293 early-onset AF participants in Yoneda et al., 2021, corroborated by the 2022 follow-up; these P/LP findings do not establish AF causation or general-population AF prevalence. Ventricular arrhythmia uses separate LQTS, CPVT, and Brugada contexts. A VA gene is not automatically assigned to each syndrome. Estimates are selected reference coverage; missing values remain null and display “Not reliably estimated,” rather than 0%. Sources and denominator details are attached to each dataset. Clinical CSV exports and copied summaries retain their existing scope.

Aortopathy, pulmonary hypertension and lipid source-panel headings also open the frequency inspector; the filtered gene lists have a Gene frequencies shortcut. Seven additional contexts cover the mixed HTAD referral cohort, Loeys–Dietz syndrome, familial PAH, idiopathic PAH, sporadic PVOD, familial PVOD and clinical FH. The grouped disease selector includes all 13 contexts. Independent-panel genes stay outside the three-circle map and retain their existing clinical explanations and PDF provenance.

The HTAD reference (Overwater et al., 2018) uses the 60 sequence-variant diagnoses over all 810 index referrals, excluding the six separate CNV diagnoses. Its source's within-positive percentages are not copied as case frequencies. Loeys–Dietz contribution estimates use the GeneReviews contribution column, not assay detection rates. Familial and idiopathic BMPR2 ranges use separate populations; rare-gene percentages are not invented. PVOD counts from Eyries et al. distinguish 5/20 sporadic patients from 13/13 selected families, with explicit discovery-cohort limitations. The FH LDLR >50% value is retained as a lower bound with an arrow, and ABCG5/ABCG8/APOE/LIPA are excluded from FH frequency membership. Explicit `eligibleSymbols` lists distinguish unquantified genes in a context from genes outside that context. Broader aortic disease, other PH groups and other lipid disorders are not assigned these subgroup percentages.

Clinical reference URLs live in `src/data.ts`. HGNC full names, aliases, and NCBI IDs are frozen locally. Source clinical text is `src/data/clinical.tsv`, with matching JSON used by the app. Exports contain both PDF source memberships and clinical memberships, evidence context, and source URLs. Copying a clinical summary preserves that distinction. Deep links use `?gene=MYL4`.

Clinical summaries are educational, not live expert classifications or individual treatment recommendations. Use phenotype, variant mechanism, inheritance, and validated laboratory coverage. A VUS must not drive treatment or predictive cascade testing. DMD requires validated deletion/duplication analysis.

## VA phenotype focus

The diagram has three minimal switches arranged horizontally at its upper right: **VA**, **AF**, and **Phenotype**. All start off. VA reveals one dropdown containing ACM/ARVC, Long QT, Short QT, CPVT, Brugada and Andersen–Tawil. Turning VA off restores the overview and hides the dropdown; its chosen subtype is retained. There is no combined three-syndrome choice. Phenotype highlights catalog genes with curated visible or examination patterns and fades other chips, including in the independent panels; history-only associations remain in gene details. If both highlights are enabled, matching genes satisfy both conditions. The single human icon belongs beside the Phenotype switch; individual gene icons are removed from map lists, independent panels and tables. Selected genes keep their original positions and source-addition red. Overlap selectors and CSV exports use the active highlight intersection. Search and Gene list retain catalog-wide access.

`src/data/va-focus.json` stores 36 explicit associations for the existing 27 VA genes, reviewed 23 October 2026. ACM coverage comprises the eight genes with definitive or moderate ARVC evidence in the 2021 reappraisal and FLNC / LMNA for the broader ACM context in the 2022 consensus. The gene pane distinguishes those categories. The nine-gene long-QT selection includes atypical and syndromic contexts, including biallelic KCNE1 / JLNS; KCNJ2 stays in Andersen–Tawil and selected short-QT contexts. Short-QT coverage is restricted to KCNH2, KCNQ1 and KCNJ2, with unequal evidence and SLC4A3's absence made explicit. CPVT uses the seven-gene 2021/2022 reappraisal set and explains differently grouped mimics in some references. Brugada uses SCN5A.

The right pane separates primary electrical disease from structural cardiomyopathy and explains each syndrome-specific mechanism and inheritance. KCNQ1 / KCNH2 loss versus gain of function, KCNJ2 Andersen–Tawil versus SQTS, and SCN5A LQT3 versus Brugada versus structural disease remain separate records. RYR2 calcium-release deficiency is not automatically equated with typical CPVT. Evidence wording is dated to the linked publications, not presented as live ClinGen status. Focus does not classify a patient's variant, assign sudden-death risk, or claim complete assay coverage. Hover bubbles and original PDF red status are unchanged. CSV and copied summaries include these contexts and sources; CSV export from a focused map uses the matching gene set. The inspector header remains visible while scrolling.

## Deploy

Vite emits `dist/`; `vercel.json` configures the build and response headers. The linked production project is `cvgene-clinical-2026`. Use the authenticated Vercel CLI with `deploy --prod`.

## Syndrome explorer and phenotype clues

Gene chips and table rows remain free of phenotype badges. The single **Phenotype** map switch highlights genes linked to curated external patterns. Clicking a highlighted phenotype gene opens its syndrome section in the inspector; the **Syndromes & clues** tab provides direct exploration. Danon disease and Jervell–Lange-Nielsen syndrome remain clinical/history contexts rather than dependable visible appearances. Exact Venn geometry and full-name hover bubbles are preserved.

**Syndromes & clues** provides direct syndrome selection, clinical-group exploration and free-text search. Choosing a syndrome clears conflicting workspace filters and expands source/testing details. Xanthomas, for example, return both FH and sitosterolemia. Global search also finds the curated clues. Filtered CSV and copied summaries retain specificity, syndrome inheritance, mechanisms, cardiac risks, testing gaps, caveats, sources and review date.

`src/data/external-phenotypes.json` is a separate frozen, source-linked reference reviewed 23 October 2026. It covers 15 syndromes and 26 catalog genes. Every gene occurs in the source PDF: 23 in the original baseline and DMD / GLA / TGFB3 as proposed PDF additions. No new genes or clinical map memberships are introduced. Catalog presence and original-panel status never imply laboratory assay coverage. Candidate / absent-from-catalog status is handled separately.

Each clue is tagged **Characteristic pattern**, **Supportive clue** or **Nonspecific alone**, and separately as **Visible sign**, **Needs examination** or **History / assessment**. These are qualitative teaching judgments, not validated likelihood ratios, a diagnostic score or a variant classification. Absence of a feature does not exclude disease. Syndrome-specific inheritance and mechanism are retained: classic recessive JUP / DSP syndromes, recessive LDLRAP1 and JLNS, PCSK9 gain of function, receptor-binding-defective APOB, and the wider CACNA1C / KCNJ2 spectra.

Testing gaps include dedicated plasma plant sterols (not a routine lipid profile); Fabry molecular testing despite potentially normal enzyme activity in females; validated deletion/duplication detection, especially LDLR and LAMP2; relevant CACNA1C alternative-exon coverage; and second-allele / phase assessment for recessive syndromes. These are requirements to confirm with the chosen laboratory, not claims about this panel's validated performance.

All links point to GeneReviews or NLM MedlinePlus Genetics, with the relevant sections recorded per syndrome. Accessible native buttons and disclosures open the established inspector; the mobile drawer keeps its keyboard trap and restores focus. New clinical-data tests protect the exact scope, specificity, inheritance, search behavior, provenance and test gaps.

Naxos (JUP) and Carvajal (DSP) remain distinct entries with their recessive mechanisms and different cardiac patterns. The syndrome explorer includes separate Noonan and Noonan-with-multiple-lentigines entries, with variant-specific PTPN11 / RAF1 distinctions and selected RIT1 coverage for classic Noonan. Duchenne / Becker dystrophinopathy adds muscle–cardiac clues for DMD. Every entry explains the gene–phenotype connection. A cardiomyopathy / arrhythmia group collects ten teaching contexts; the aortic group retains separate Marfan, Loeys–Dietz and vascular Ehlers–Danlos entries, with a note about nonsyndromic HTAD. The RASopathy entries explicitly identify incomplete gene coverage. No genotype percentages or diagnostic scores are inferred.


## Sidebar navigation

**All genes** opens the complete catalog and displays its current gene count. **Disease** and **Genetic syndrome** are independent collapsible menus, both collapsed on a fresh page load. Disease contains the seven disease panels; Genetic syndrome lists all 15 existing syndrome records, including Naxos and Carvajal. Selecting a syndrome clears workspace filters and opens that syndrome in Syndromes & clues.
