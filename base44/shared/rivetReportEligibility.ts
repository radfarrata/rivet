import {METHOD,evidenceComplete,validReview} from './rivetCore.ts';
import {rankings} from './rivetStatistics.ts';
import {publicationSafetyReasons} from './rivetPublicationSafety.ts';
export function reportEligibility(r,d,events,credentials) {
  const reasons=[],e=d.evidences.find(x=>x.id===r.evidenceId),v=d.versions.find(x=>x.id===r.taskVersionId);
  if(!evidenceComplete(r,e,v)||v?.id!==r.taskVersionId||v?.taskId!==r.taskId||e?.methodologyVersion!==METHOD||v?.methodologyVersion!==METHOD)reasons.push('Incomplete or inconsistent provenance');
  if(e?.modelResolution!=='provider_revision'||!e.providerRevision?.trim())reasons.push('Exact provider revision unavailable');
  const quality=d.assessments.find(x=>x.id===v?.qualityAssessmentId);
  reasons.push(...publicationSafetyReasons(e,v,quality));
  const credential=(id,uid)=>credentials.some(c=>c.id===id&&c.userId===uid&&c.status==='verified'&&c.domains?.includes(r.domain));
  const owner=d.tasks.find(t=>t.id===r.taskId);const ownerId=owner?.ownerId||owner?.created_by_id;
  const reviews=d.reviews.filter(x=>x.resultId===r.id&&x.taskId===r.taskId&&x.evidenceId===e?.id&&x.evaluatorId!==ownerId&&validReview(x)&&credential(x.credentialId,x.evaluatorId));
  const final=d.finals.find(f=>f.resultId===r.id&&f.taskId===r.taskId&&f.evidenceId===e?.id&&f.methodologyVersion===METHOD&&Number.isFinite(f.finalScore)&&f.finalScore>=0&&f.finalScore<=100&&credential(f.credentialId,f.expertId)&&f.expertId!==ownerId&&!reviews.some(x=>x.evaluatorId===f.expertId)&&new Set(reviews.filter(x=>f.reviewIds?.includes(x.id)).map(x=>x.evaluatorId)).size>=2);
  const selected=final?reviews.filter(x=>final.reviewIds.includes(x.id)):reviews;
  if(new Set(selected.map(x=>x.evaluatorId)).size<2)reasons.push('Two verified conflict-free reviews required');
  if(!final)reasons.push('Verified independent final adjudication missing');
  const completion=events.find(a=>a.taskId===r.taskId&&a.action==='evaluation_completed'&&a.targetId===e?.id&&a.details?.resultId===r.id&&a.details?.artifactHash===e?.artifactHash);
  const finalAudit=final&&events.find(a=>a.taskId===r.taskId&&a.action==='final_adjudication'&&a.targetId===final.id&&a.details?.resultId===r.id);
  const reviewAudits=selected.map(review=>events.find(a=>a.taskId===r.taskId&&a.action==='expert_review_submitted'&&a.targetId===review.id&&a.details?.resultId===r.id)).filter(Boolean);
  if(!completion||!finalAudit||new Set(selected.filter(x=>reviewAudits.some(a=>a.targetId===x.id)).map(x=>x.evaluatorId)).size<2)reasons.push('Supporting audit trail incomplete');
  return {reasons,e,v,quality,final,reviews:selected,audits:[completion,finalAudit,...reviewAudits].filter(Boolean)};
}
export function reportRankings(results,domain){
  const keys=new Map(results.map(r=>[JSON.stringify([r.modelId,r.providerRevision]),r.modelId]));
  return rankings(results.map(r=>({...r,modelId:JSON.stringify([r.modelId,r.providerRevision])})),domain,true).map(row=>({...row,modelAlias:keys.get(row.modelId)}));
}