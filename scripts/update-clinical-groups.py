"""Build explicit, source-linked phenotype memberships; PDF metadata is unchanged."""
import json
from pathlib import Path

evidence={}
def add(symbol,group,kind,note,reference):
 evidence.setdefault(symbol,{})[group]={'kind':kind,'note':note,'reference':reference}

# DCM: high-evidence genes already present in the PDF, plus dystrophinopathy.
core='ACTC1 ACTN2 BAG3 DES DSP FLNC JPH2 LMNA MYH7 NEXN PLN RBM20 SCN5A TNNC1 TNNI3 TNNT2 TPM1 TTN VCL'.split()
for symbol in core:
 add(symbol,'dcm','Intrinsic cardiomyopathy','DCM association; inheritance and variant mechanism must match.','dcm2026')
add('DMD','dcm','Dystrophinopathy','Cardiac-predominant or syndromic DCM; validated copy-number testing is required.','dmd')
evidence['JPH2']['dcm'].update(kind='Inheritance-specific evidence',note='DCM evidence differs by inheritance. Published abstract and ClinGen/preprint records conflict on AD versus AR grading; confirm the current gene-disease curation.')
evidence['NEXN']['dcm'].update(kind='Updated evidence',note='DCM evidence was upgraded in the 2026 reappraisal; the PDF’s second-priority label is historical panel provenance.')
evidence['TNNI3']['dcm'].update(note='Both dominant and recessive DCM were rated Strong in the 2026 assessment.')
evidence['TTN']['dcm'].update(note='Interpret truncating variants in relevant cardiac-expressed exons; most rare missense changes remain uncertain.')
evidence['FLNC']['dcm'].update(note='Truncating variants are relevant to dilated/arrhythmogenic disease; HCM often involves different missense mechanisms.')

# HCM includes intrinsic disease and explicitly named LVH phenocopies, per 2025 curation.
hcm='ACTC1 ACTN2 ALPK3 CACNA1C CSRP3 DES FHL1 FHOD3 FLNC GLA JPH2 LAMP2 MYBPC3 MYH7 MYL2 MYL3 PLN PRKAG2 PTPN11 RAF1 RIT1 TNNC1 TNNI3 TNNT2 TPM1 TTR'.split()
syndromes={'CACNA1C':'Timothy-spectrum LVH','DES':'Desmin-related myopathy','FHL1':'FHL1-related myopathy','FLNC':'Variant-specific HCM / myopathy','GLA':'Fabry LVH phenocopy','LAMP2':'Danon LVH phenocopy','PRKAG2':'Glycogen-storage LVH phenocopy','PTPN11':'RASopathy-associated LVH','RAF1':'RASopathy-associated LVH','RIT1':'RASopathy-associated LVH','TTR':'ATTR amyloid LVH phenocopy'}
for symbol in hcm:
 add(symbol,'hcm',syndromes.get(symbol,'Intrinsic HCM'),'HCM/LVH association in the 2025 reappraisal; disease mechanism matters.','hcm')
for symbol in ['GLA','LAMP2','PRKAG2','TTR']:
 evidence[symbol]['hcm']['note']='A distinct cause of increased wall thickness; distinguish from primary sarcomeric HCM.'
evidence['ALPK3']['hcm']['note']='Dominant loss-of-function and recessive disease have different presentations and evidence.'
evidence['FLNC']['hcm']['note']='HCM association is variant-specific; do not transfer truncating-variant DCM risk to every missense variant.'
evidence['CACNA1C']['hcm']['note']='Timothy-spectrum LVH is distinct from an isolated sarcomeric HCM diagnosis.'

# AF is independent of VA; memberships overlap only where separately supported.
for symbol in 'SCN5A KCNQ1 TTN MYL4'.split():
 add(symbol,'af','Familial AF focus','Consensus-supported familial AF evaluation; mechanism and clinical context are essential.','afconsensus')
evidence['TTN']['af']['note']='Relevant truncating variants may associate with early AF before overt DCM; this is not evidence for all TTN variants.'
evidence['MYL4']['af']['note']='Atrial myopathy / early AF: selected dominant missense or biallelic loss-of-function variants; establish mechanism and phase.'
evidence['MYL4']['af'].update(note=evidence['MYL4']['af']['note']+' Atrial-predominant placement is not a guarantee of absent ventricular risk.',reference='myl4')
for symbol in 'LMNA PKP2 FLNC DSP MYH7 MYBPC3'.split():
 add(symbol,'af','Cardiomyopathy-associated AF','Pathogenic variants were observed in an early-onset AF clinic cohort; not proof of isolated monogenic AF for every variant.','afclinic')
for symbol in ['KCNH2','KCNJ2']:
 add(symbol,'af','Short-QT variant context','AF can accompany selected short-QT mechanisms; other variants may cause different electrical phenotypes.','afconsensus')
add('HCN4','af','Sinus-node / AF context','Rare familial sinus-node dysfunction with tachycardia–bradycardia or AF. This is not a generic AF risk assignment. Selected VA membership is not assigned; rare variant-specific ventricular arrhythmias have also been reported.','hcn4af')

# VA separates inherited electrical disease from structural cardiomyopathy context.
for symbol in 'CACNA1C CALM1 CALM2 CALM3 CASQ2 KCNE1 KCNH2 KCNJ2 KCNQ1 RYR2 SCN5A TECRL TRDN'.split():
 add(symbol,'va','Electrical / syndromic VA','Ventricular arrhythmia relevance depends on the channelopathy, variant mechanism, and inheritance.','cpvtvalidity' if symbol in ['RYR2','CASQ2','TECRL','TRDN','KCNJ2'] else 'lqts')
evidence['KCNE1']['va']['note']='Biallelic Jervell–Lange-Nielsen disease is established; monoallelic isolated congenital LQTS evidence is limited.'
for symbol in 'DES DSC2 DSG2 DSP FLNC JUP LMNA PKP2 PLN RBM20 TMEM43 TTN'.split():
 add(symbol,'va','Cardiomyopathy-associated VA','Structural disease with ventricular arrhythmia relevance; assess phenotype and variant-specific risk.','arvcvalidity' if symbol in ['DSC2','DSG2','JUP','PKP2','TMEM43'] else 'va2026')
evidence['TTN']['va'].update(note='Relevant pathogenic truncating variants can link AF, DCM, and ventricular arrhythmia. Follow-up of TTN-positive AF patients documented ventricular events; this does not make every TTN variant a high-risk genotype.',reference='ttnafva')
for symbol in ['MYH7','MYBPC3']:
 add(symbol,'va','HCM-associated VA context','Ventricular arrhythmia can occur in gene-positive HCM. This is a structural HCM context, not an isolated channelopathy or a gene-alone sudden-death risk assignment. Use clinical HCM risk markers.','hcmva')
Path('src/data/clinical-groups.json').write_text(json.dumps(evidence,indent=2)+'\n')

hgnc=json.loads(Path('/tmp/cvgene-review/hgnc.json').read_text())['response']['docs']
h=next(g for g in hgnc if g['symbol']=='MYL4')
extension={'symbol':'MYL4','panels':[],'added':False,'catalogAddition':True,'name':h['name'],'hgncId':h['hgnc_id'],'ncbiId':str(h['entrez_id']),'aliases':h.get('alias_symbol',[]),'inheritance':'AD / AR; variant-dependent','phenotypes':'Early-onset AF;Atrial cardiomyopathy;Conduction disease','relevance':'Atrial myosin light chain helps maintain atrial contraction and structure. Selected MYL4 variants cause atrial myopathy with early-onset atrial fibrillation or conduction disease. Dominant and recessive disease mechanisms have been described.','consideration':'Distinguish selected dominant missense variants from biallelic loss-of-function disease. Confirm zygosity, phase, and phenotype; one recessive allele does not establish a diagnosis.','reference':'myl4','caution':'AF extension beyond the source PDF. Variant-specific familial evidence is not a blanket pathogenicity rule for all MYL4 variants.'}
Path('src/data/extensions.json').write_text(json.dumps([extension],indent=2)+'\n')
print('Explicit disease memberships:',{g:sum(g in e for e in evidence.values()) for g in ['dcm','hcm','af','va']})
