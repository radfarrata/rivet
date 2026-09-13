import {METHOD,taskAccess,requireValue,scan,validReview,audit,evidenceComplete,officialEligible} from './rivetCore.ts';
export async function reviewAction(b,user,p) {
  const s=b.asServiceRole.entities;
  const credential=(await s.ExpertCredential.filter({userId:user.id,status:'verified'}))[0];
  requireValue(credential,'Verified expert credentials are required. Apply in Expert Workspace.',403);
  const r=await s.ModelResult.get(p.resultId);const task=await taskAccess(b,user,r?.taskId);
  requireValue(credential.domains?.includes(r.domain),'Your verified domains do not include this task.',403);
  requireValue((task.ownerId||task.created_by_id)!==user.id,'You cannot review or adjudicate your own task.',403);
  requireValue(r.evidenceId && r.taskVersionId,'Legacy scores cannot receive official reviews. Run a new version first.',409);
  const e=await s.EvaluationEvidence.get(r.evidenceId),v=await s.TaskVersion.get(r.taskVersionId);
  requireValue(evidenceComplete(r,e,v),'Complete provenance is required before expert review.',409);
  requireValue(p.hasConflict===false && typeof p.conflictDeclaration==='string' && p.conflictDeclaration.trim().length>=10 && p.conflictDeclaration.length<=2000,'Confirm no conflict and provide a declaration (10–2,000 characters).');
  requireValue(Number.isFinite(p.score)&&p.score>=0&&p.score<=100,'Score must be between 0 and 100.');
  requireValue(typeof p.notes==='string'&&p.notes.trim().length>=20&&p.notes.length<=8000,'Provide structured evidence-based feedback (20–8,000 characters).');
  const reviews=await scan(s.HumanEvaluation,{resultId:r.id});
  if(p.action==='submitReview'){
    requireValue(!reviews.some(x=>x.evaluatorId===user.id),'You have already reviewed this result.',409);
    requireValue(['pass','partial','fail'].includes(p.verdict),'Select a verdict.');
    const categories=['none','hallucination','reasoning_error','factual_error','incomplete','instruction_violation','safety_issue','formatting','other'];
    requireValue(categories.includes(p.failureCategory||'none'),'Invalid failure category.');
    const saved=await s.HumanEvaluation.create({taskId:r.taskId,resultId:r.id,modelId:r.modelId,model:r.model,domain:r.domain,evaluatorId:user.id,evaluatorName:user.full_name||'Verified reviewer',score:p.score,verdict:p.verdict,failureCategory:p.failureCategory||'none',notes:p.notes.trim(),evidenceId:r.evidenceId,credentialId:credential.id,credentialStatusAtReview:'verified',conflictDeclaration:p.conflictDeclaration.trim(),hasConflict:false,methodologyVersion:r.methodologyVersion,reviewWeight:1,reviewProtocol:'non_blinded_observational'});
    await audit(b,user,'expert_review_submitted',saved.id,task.id,{resultId:r.id,credentialId:credential.id});return saved;
  }
  requireValue(p.action==='finalAdjudication' && user.role==='admin','Final adjudication requires an administrator with verified domain credentials.',403);
  requireValue(!reviews.some(x=>x.evaluatorId===user.id),'Final adjudicator must be separate from the initial reviewers.',403);
  const qualified=reviews.filter(x=>validReview(x)&&x.methodologyVersion===r.methodologyVersion);requireValue(new Set(qualified.map(x=>x.evaluatorId)).size>=2,'Two distinct verified, conflict-free reviews are required.');
  requireValue(!(await s.ExpertEvaluation.filter({resultId:r.id})).length,'A final adjudication already exists; corrections require a new evaluation version.',409);
  const saved=await s.ExpertEvaluation.create({traceId:`evidence:${r.evidenceId}`,resultId:r.id,taskId:r.taskId,evidenceId:r.evidenceId,expertId:user.id,expertName:user.full_name||'Adjudicator',verdict:p.score>=80?'false_positive':'confirmed_failure',severity:'medium',failureType:'other',structuredFeedback:p.notes.trim(),finalScore:p.score,reviewIds:qualified.map(x=>x.id),credentialId:credential.id,conflictDeclaration:p.conflictDeclaration.trim(),methodologyVersion:r.methodologyVersion});
  await audit(b,user,'final_adjudication',saved.id,task.id,{resultId:r.id,reviewIds:saved.reviewIds,finalScore:p.score});
  if(r.rankingEntryId)await s.RankingEntry.update(r.rankingEntryId,{officialEligible:officialEligible(r,e,v,reviews,[saved]),computedAt:new Date().toISOString()});
  return saved;
}
export async function legacyAdjudication(b,user,p) {
  const s=b.asServiceRole.entities;
  const trace=await b.entities.AgentTrace.get(p.traceId);
  requireValue(trace && (trace.created_by_id===user.id||user.role==='admin'),'Trace permission denied.',403);
  const credential=(await s.ExpertCredential.filter({userId:user.id,status:'verified'}))[0];
  requireValue(credential,'Verified credentials are required in Expert Workspace.',403);
  requireValue(trace.status==='needs_review','This trace is not awaiting review.');
  requireValue(['confirmed_failure','false_positive','needs_info'].includes(p.verdict),'Invalid verdict.');
  requireValue(typeof p.structuredFeedback==='string'&&p.structuredFeedback.trim().length>=20,'Add at least 20 characters of feedback.');
  requireValue(p.verdict!=='confirmed_failure'||typeof p.ruleDefinition==='string'&&p.ruleDefinition.trim().length>=10,'Add a reusable regression rule.');
  requireValue(typeof p.conflictDeclaration==='string'&&p.conflictDeclaration.trim().length>=10,'A conflict declaration is required.');
  const saved=await s.ExpertEvaluation.create({traceId:trace.id,expertId:user.id,expertName:user.full_name||'Reviewer',credentialId:credential.id,verdict:p.verdict,severity:['critical','high','medium','low'].includes(p.severity)?p.severity:'medium',failureType:['hallucination','tool_misuse','safety_violation','non_compliance','logic_error','other'].includes(p.failureType)?p.failureType:'other',structuredFeedback:p.structuredFeedback.trim(),ruleDefinition:p.ruleDefinition?.trim()||'',conflictDeclaration:p.conflictDeclaration.trim()});
  let regression=null;
  if(p.verdict==='confirmed_failure')regression=await b.entities.RegressionTest.create({name:`Review needed: ${trace.caseTitle}`.slice(0,120),sourceEvaluationId:saved.id,traceId:trace.id,rule:p.ruleDefinition.trim(),inputContext:trace.steps?.find(x=>x.type==='input')?.content||'',expectedBehavior:p.structuredFeedback.trim(),severity:saved.severity,verifiedByExpertName:saved.expertName,active:false});
  await b.entities.AgentTrace.update(trace.id,{status:'adjudicated'});await audit(b,user,'legacy_trace_adjudicated',saved.id,'',{traceId:trace.id,regressionId:regression?.id||null});return {evaluation:saved,regression};
}