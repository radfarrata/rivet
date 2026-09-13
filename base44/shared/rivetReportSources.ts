import {dataset} from './rivetQueries.ts';
import {related,scan,DOMAINS,requireValue,load} from './rivetCore.ts';
import {reportEligibility,reportRankings} from './rivetReportEligibility.ts';
export async function reportSources(b,user,domain){
  requireValue(DOMAINS.includes(domain),'Choose a report domain.');const cutoffAt=new Date().toISOString(),d=await dataset(b,user);
  const before=x=>x.created_date<=cutoffAt&&(!x.updated_date||x.updated_date<=cutoffAt);
  d.tasks=d.tasks.filter(t=>t.visibility==='public'&&t.domain===domain&&before(t));const taskIds=new Set(d.tasks.map(t=>t.id));
  for(const field of ['results','reviews','evidences','versions','finals','runs','assessments'])d[field]=d[field].filter(x=>taskIds.has(x.taskId)&&before(x));
  const [allEvents,allCredentials]=await Promise.all([related(d.s.EvaluationAudit,d.tasks),scan(d.s.ExpertCredential,{status:'verified'})]);
  const events=allEvents.filter(e=>before(e)&&e.occurredAt<=cutoffAt).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt)||b.id.localeCompare(a.id)),credentials=allCredentials.filter(before);
  const exclusions={},qualified=[];
  for(const r of d.results){const check=reportEligibility(r,d,events,credentials);if(!check.reasons.length)qualified.push({...r,finalScore:check.final.finalScore});else check.reasons.forEach(reason=>exclusions[reason]=(exclusions[reason]||0)+1);}
  const rows=reportRankings(qualified,domain),ids=new Set(rows.flatMap(row=>row.history.map(h=>h.id)));
  if(qualified.length>ids.size)exclusions['Not selected in the latest matched cohort']=qualified.length-ids.size;
  return {d,events,credentials,cutoffAt,exclusions,rows:rows.filter(row=>row.n>0),selected:qualified.filter(r=>ids.has(r.id)),eligibleResults:qualified.length,totalResults:d.results.length};
}
export async function verifyReportSource(b,r,source){
  const check=reportEligibility(r,source.d,source.events,source.credentials);requireValue(!check.reasons.length,'Official eligibility changed. Refresh and try again.',409);
  const {e,v,final,quality,reviews,audits}=check,s=b.asServiceRole.entities;
  const run=source.d.runs.find(x=>x.id===r.runId);
  requireValue(run?.status==='complete'&&run.resultId===r.id&&run.taskVersionId===v.id&&run.rootArtifactId===e.artifactId,'Run provenance is incomplete; no report was saved.',409);
  const artifacts=await scan(s.EvidenceArtifact,{runId:run.id}),root=artifacts.find(a=>a.id===run.rootArtifactId),output=artifacts.find(a=>a.kind==='model_output'&&a.sha256===root?.previousArtifactHash);
  requireValue(root?.kind==='run_bundle'&&root.sha256===e.artifactHash&&root.uri===e.artifactUri&&root.taskVersionId===v.id&&root.taskId===r.taskId&&output?.previousArtifactHash===v.snapshotHash&&output.taskVersionId===v.id&&output.taskId===r.taskId,'Artifact chain is incomplete; no report was saved.',409);
  const [snapshot,bundle,raw]=await Promise.all([load(b,v.snapshotUri,v.snapshotHash),load(b,root.uri,root.sha256),load(b,output.uri,output.sha256)]);
  requireValue(bundle.executionSource==='server_integration'&&raw.executionSource==='server_integration','Execution source is not verified in the stored artifacts; no report was saved.',409);
  requireValue(snapshot.domain===r.domain&&bundle.modelRequested===r.modelId&&bundle.providerRevision===e.providerRevision&&bundle.methodologyVersion===r.methodologyVersion&&bundle.judge?.score===r.score&&typeof bundle.output==='string'&&bundle.output.length>0&&bundle.output===raw.output&&(!bundle.judge.evidenceExcerpt||bundle.output.includes(bundle.judge.evidenceExcerpt)),'Stored evidence does not match the result or provider revision; no report was saved.',409);
  return {resultId:r.id,taskId:r.taskId,taskTitle:snapshot.title,taskVersionId:v.id,taskSnapshotHash:v.snapshotHash,cohortHash:v.contentHash,familyHash:v.familyHash,runId:run.id,modelAlias:r.modelId,providerRevision:e.providerRevision,automatedScore:r.score,finalScore:final.finalScore,finalId:final.id,finalCredentialId:final.credentialId,outputHash:output.sha256,bundleHash:root.sha256,qualityId:quality.id,contaminationScope:quality.scope,qualityChecks:quality.checks,reviews:reviews.map(x=>({id:x.id,credentialId:x.credentialId,credentialStatusAtReview:x.credentialStatusAtReview,hasConflict:x.hasConflict,score:x.score,verdict:x.verdict,createdAt:x.created_date})),auditIds:audits.map(a=>a.id)};
}