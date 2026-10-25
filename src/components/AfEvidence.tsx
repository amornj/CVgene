import {ArrowUpRight,ChevronDown} from 'lucide-react';
import {references} from '../data';
import '../af-evidence.css';

export default function AfEvidence(){
 return <details className="af-evidence">
  <summary><span>Familial & early-onset AF</span><ChevronDown size={13}/></summary>
  <div>
   <p><strong>When to consider evaluation.</strong> For AF onset before age 45 without obvious risk factors, genetic counseling, rare-variant testing and surveillance for cardiomyopathy or arrhythmia syndromes may be reasonable (2023 guideline, class 2b).</p>
   <p><strong>Familial testing focus.</strong> The 2022 consensus allows consideration of SCN5A, KCNQ1, MYL4 and relevant truncating TTN variants in familial AF before age 60. Interpret the variant mechanism, inheritance and family phenotype together.</p>
   <p><strong>Reading the AF focus.</strong> MYL4 atrial myopathy and HCN4 sinus-node / AF contexts extend beyond the selected VA set. This does not exclude ventricular events. Familial / early-onset AF also occurs in the overlaps; cardiomyopathy-gene findings in AF clinics do not by themselves prove isolated monogenic AF.</p>
   <div className="af-evidence-links">{(['afguideline','afconsensus','myl4','hcn4af','afclinic'] as const).map(id=><a key={id} href={references[id].url} target="_blank" rel="noreferrer">{references[id].title}<ArrowUpRight size={11}/></a>)}</div>
  </div>
 </details>;
}
