import {context,related,taskAccess,scan,evidenceComplete,officialEligible,load,METHOD,validReview} from './rivetCore.ts';
import {metrics,rankings} from './rivetStatistics.ts';
export async function dataset(b,user) {
  const {s,tasks,workspaces} = await context(b,user);
  const [results,reviews,evidences,versions,finals] = await Promise.all(['ModelResult','HumanEvaluation','EvaluationEvidence','TaskVersion','ExpertEvaluation'].map(name=>related(s[name],tasks)));
  const enriched=results.map(r=>{
    const e=evidences.find(e=>e.id===r.evidenceId),v=versions.find(v=>v.id===r.taskVersionId),rs=reviews.filter(x=>x.resultId===r.id),fs=finals.filter(x=>x.resultId===r.id);
    const complete=evidenceComplete(r,e,v);
    return {...r,rawResponse:r.rawResponse || '',evidenceStatus:!r.evidenceId?'legacy':complete?'complete':'incomplete',methodologyVersion:r.methodologyVersion || 'legacy / unknown',familyHash:v?.familyHash,cohortHash:v?.contentHash,contaminationRisk:v?.contaminationRisk || 'unchecked',modelResolution:e?.modelResolution || 'unknown',officialEligible:officialEligible(r,e,v,rs,fs),finalScore:fs[0]?.finalScore};
  });
  return {s,tasks,workspaces,results:enriched,reviews,finals,evidences,versions};
}
export async function evidenceView(b,user,resultId) {
  const s=b.asServiceRole.entities, r=await s.ModelResult.get(resultId);
  const task=await taskAccess(b,user,r?.taskId);
  const reviews=await scan(s.HumanEvaluation,{resultId:r.id});
  const finals=await scan(s.ExpertEvaluation,{resultId:r.id});
  const events=await scan(s.EvaluationAudit,{taskId:task.id});
  if(!r.evidenceId) return {task,result:r,legacy:true,reviews,finals,events,metrics:metrics([r],reviews,finals),officialEligible:false};
  const e=await s.EvaluationEvidence.get(r.evidenceId), v=await s.TaskVersion.get(r.taskVersionId);
  const [bundle,snapshot]=await Promise.all([load(b,e.artifactUri,e.artifactHash),load(b,v.snapshotUri,v.snapshotHash)]);
  return {task,result:r,legacy:false,evidence:{id:e.id,modelId:e.modelId,modelResolution:e.modelResolution,providerRevision:e.providerRevision,judgeModel:e.judgeModel,methodologyVersion:e.methodologyVersion,artifactHash:e.artifactHash,startedAt:e.startedAt,completedAt:e.completedAt},version:{id:v.id,version:v.version,contentHash:v.contentHash,familyHash:v.familyHash,contaminationRisk:v.contaminationRisk,contaminationScope:v.contaminationScope,difficultySource:v.difficultySource},bundle,snapshot,reviews,finals,events,metrics:metrics([r],reviews,finals),officialEligible:officialEligible(r,e,v,reviews,finals)};
}
export async function rankingView(b,user,domain,official) {
  const d=await dataset(b,user); const publicIds=new Set(d.tasks.filter(t=>t.visibility==='public').map(t=>t.id));
  const results=d.results.filter(r=>publicIds.has(r.taskId)); const reviews=d.reviews.filter(r=>publicIds.has(r.taskId)); const finals=d.finals.filter(r=>publicIds.has(r.taskId));
  const scoped=results.filter(r=>r.domain===domain);
  return {rows:rankings(results,domain,official),domain,methodologyVersion:METHOD,excludedLegacy:scoped.filter(r=>r.evidenceStatus!=='complete').length,blockedOfficial:scoped.filter(r=>!r.officialEligible).length,metrics:metrics(scoped.filter(r=>r.evidenceStatus==='complete'),reviews.filter(r=>scoped.some(s=>s.id===r.resultId)),finals),computedAt:new Date().toISOString(),methodology:'Equal-weight latest result per normalized-prompt family, restricted to identical task-snapshot hashes shared by every included model in this domain. All models use the same selected snapshot within each family; changed criteria cannot be mixed. 2,000 seeded percentile bootstrap resamples; 95% CI. Exact-duplicate families are a proxy for independence, not a verified source-cluster audit. Model aliases may change over time. n <30 insufficient; ≥30 exploratory; verified requires official eligibility, ≥50 families and CI width ≤10. No overall intelligence score. Official eligibility requires complete artifacts, resolved provider revision, reviewed contamination status, two verified conflict-free reviewers and final adjudication. No exact provider revisions are asserted by the current integration.'};
}