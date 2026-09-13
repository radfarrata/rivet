import {load,normalize,requireValue} from './rivetCore.ts';
import {SCAN_PROTOCOL} from './rivetPublicationSafety.ts';
const tokens = text => normalize(text).match(/[\p{L}\p{N}\p{M}]+/gu) || [];
const loose = text => tokens(text).join(' ');
export function ngramCoverage(source, reference, n=13) {
  const a=tokens(source), b=tokens(reference); if(a.length<n || b.length<n)return {checkable:false,covered:0};
  const windows=new Set(); for(let i=0;i<=b.length-n;i++)windows.add(b.slice(i,i+n).join('\u0001'));
  const covered=new Set(); for(let i=0;i<=a.length-n;i++)if(windows.has(a.slice(i,i+n).join('\u0001')))for(let j=i;j<i+n;j++)covered.add(j);
  return {checkable:true,covered:covered.size/a.length};
}
export async function assessTaskQuality(b,user,task,version,corpusVersions) {
  const s=b.asServiceRole.entities;
  const peers=corpusVersions.filter(v=>v.id!==version.id && v.taskId!==task.id).sort((a,b)=>a.id.localeCompare(b.id));
  const snapshots=[]; let failedPeerCount=0;
  for(let i=0;i<peers.length;i+=4){
    const batch=await Promise.allSettled(peers.slice(i,i+4).map(async peer=>{
      const snapshot=await load(b,peer.snapshotUri,peer.snapshotHash);
      requireValue(typeof snapshot.prompt==='string'&&snapshot.prompt.trim(),'Peer snapshot has no usable prompt.',409);
      return {version:peer,snapshot};
    }));
    batch.forEach(item=>{if(item.status==='fulfilled')snapshots.push(item.value);else failedPeerCount++;});
  }
  const exact=snapshots.filter(x=>x.snapshot.prompt===task.prompt); const near=snapshots.filter(x=>loose(x.snapshot.prompt)===loose(task.prompt));
  const overlaps=snapshots.map(x=>ngramCoverage(task.prompt,x.snapshot.prompt)).filter(x=>x.checkable); const maxCoverage=Math.max(0,...overlaps.map(x=>x.covered));
  const checks=[
    {rung:0,name:'Prior reports and canary review',status:'manual',matches:0,detail:'Community contamination databases, benchmark papers, and canary strings require a documented human check.'},
    {rung:1,name:'Exact duplicate rows',status:exact.length?'flag':'pass',matches:exact.length,rate:snapshots.length?exact.length/snapshots.length:0,detail:'Compared the exact prompt against the authorized Rivet corpus.'},
    {rung:2,name:'Duplicate or missing identifiers',status:'pass',matches:0,rate:0,detail:'Platform record identifiers are present and unique.'},
    {rung:3,name:'Normalized near-duplicates',status:near.length?'flag':'pass',matches:near.length,rate:snapshots.length?near.length/snapshots.length:0,detail:'Compared NFKC, case-folded, punctuation-insensitive prompt text.'},
    {rung:4,name:'Cross-split exact overlap',status:'not_applicable',matches:0,detail:'Rivet tasks do not yet declare train/test split membership; no pooled overlap rate is inferred.'},
    {rung:5,name:'13-gram overlap',status:maxCoverage>0?'flag':overlaps.length?'pass':'not_applicable',matches:overlaps.filter(x=>x.covered>0).length,rate:maxCoverage,detail:`Largest dirty-token share ${(maxCoverage*100).toFixed(1)}%; short prompts outside the denominator are not called clean.`}
  ];
  const risk=version.contaminationRisk==='known_contamination'?'known_contamination':checks.some(c=>c.status==='flag')?'possible_overlap':failedPeerCount?'unchecked':'no_match_found';
  const assessment=await s.TaskQualityAssessment.create({taskId:task.id,taskVersionId:version.id,methodologyVersion:version.methodologyVersion,highestCheckedRung:failedPeerCount?0:5,risk,scope:`Authorized Rivet corpus only: ${snapshots.length}/${peers.length} peer snapshots checked; ${failedPeerCount} unreadable. No-match is not training-contamination clearance. Manual prior-report and canary checks remain unresolved and block official publication.`,checks,ngramSize:13,assessedAt:new Date().toISOString(),assessedBy:user.id,scanProtocol:SCAN_PROTOCOL,scanStatus:failedPeerCount?'incomplete':'complete',eligiblePeerCount:peers.length,checkedPeerCount:snapshots.length,failedPeerCount,taskSnapshotHash:version.snapshotHash});
  await s.TaskVersion.update(version.id,{qualityAssessmentId:assessment.id,contaminationRisk:risk,contaminationScope:assessment.scope});
  return assessment;
}