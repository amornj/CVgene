"""Reproducible PDF membership and official HGNC identifier import."""
import json, re, sys, urllib.request, time
from pathlib import Path
import fitz

pdf = Path(sys.argv[1] if len(sys.argv)>1 else 'public/panels-2026.pdf')
doc = fitz.open(pdf)
columns = [(70,180,'cardiomyopathy'),(180,280,'arrhythmia'),(280,380,'aortopathy'),(380,480,'pah'),(480,560,'lipid')]
records = {}
for block in doc[0].get_text('dict')['blocks']:
 for line in block.get('lines',[]):
  for span in line['spans']:
   text=span['text'].strip()
   if not (166 < span['bbox'][1] < 683) or not re.fullmatch(r'[A-Z][A-Z0-9]+(?: \+)?',text): continue
   symbol=text.replace(' +','')
   panel=next((p for a,b,p in columns if a<=span['bbox'][0]<b),None)
   if not panel: continue
   row=records.setdefault(symbol,{'symbol':symbol,'panels':[],'added':False})
   row['panels'].append(panel)
   row['added'] |= span['color']==0xbc242b
hgnc={d['symbol']:d for d in json.loads(Path('/tmp/cvgene-review/hgnc.json').read_text())['response']['docs']}
for symbol,row in records.items():
 d=hgnc[symbol]
 row.update(name=d['name'],hgncId=d['hgnc_id'],ncbiId=str(d.get('entrez_id','')),aliases=d.get('alias_symbol',[])+d.get('prev_symbol',[]))
assert len(records)==102
assert sum(r['added'] for r in records.values())==16
assert {p:sum(p in r['panels'] for r in records.values()) for a,b,p in columns}=={'cardiomyopathy':43,'arrhythmia':28,'aortopathy':23,'pah':12,'lipid':8}
Path('src/data/metadata.json').write_text(json.dumps(sorted(records.values(),key=lambda r:r['symbol']),indent=2)+'\n')
Path('scripts/pdf-membership.json').write_text(json.dumps({s:{'panels':r['panels'],'added':r['added']} for s,r in sorted(records.items())},indent=2)+'\n')
ids=','.join(r['ncbiId'] for r in records.values())
url='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&retmode=json&id='+ids
try:
 with urllib.request.urlopen(url,timeout=40) as response:
  data=json.load(response)
 Path('/tmp/cvgene-review/ncbi-summaries.json').write_text(json.dumps(data,indent=2))
 print('NCBI gene summaries fetched:',len(data.get('result',{}).get('uids',[])))
except Exception as error:
 print('NCBI bulk summary unavailable:',error)
print('Verified: 102 genes, 114 memberships, 16 additions; HGNC full names matched for every symbol.')
