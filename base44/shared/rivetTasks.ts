import {METHOD,MODELS,DOMAINS,requireValue,taskAccess,context,audit,scan,hash,normalize,store,isOwner} from './rivetCore.ts';
export async function createTask(b,user,p) {
  const d=p.data||{};
  requireValue(typeof d.title==='string' && d.title.trim().length>0 && d.title.length<=200,'Title is required (maximum 200 characters).');
  requireValue(typeof d.prompt==='string' && d.prompt.trim().length>0 && d.prompt.length<=40000,'Prompt is required (maximum 40,000 characters).');
  requireValue(Array.isArray(d.models) && d.models.length>=2 && d.models.length<=4 && new Set(d.models).size===d.models.length && d.models.every(x=>MODELS.includes(x)),'Choose 2–4 supported, distinct models.');
  requireValue(DOMAINS.includes(d.domain),'Choose a supported domain.');
  requireValue(['basic','intermediate','advanced'].includes(d.difficulty||'intermediate'),'Invalid difficulty.');
  requireValue(['automated','human','hybrid'].includes(d.evaluationType||'hybrid'),'Invalid evaluation type.');
  requireValue(!d.evaluationCriteria || typeof d.evaluationCriteria==='string' && d.evaluationCriteria.length<=12000,'Criteria are too long.');
  const visibility=d.visibility==='public'?'public':'private';
  if(d.workspaceId){const {workspaces}=await context(b,user);requireValue(workspaces.some(w=>w.id===d.workspaceId),'Workspace permission denied.',403);requireValue(visibility==='private','Workspace evaluations must stay private in this MVP.');}
  const task=await b.asServiceRole.entities.EvaluationTask.create({title:d.title.trim(),prompt:d.prompt.trim(),domain:d.domain,difficulty:d.difficulty||'intermediate',evaluationCriteria:d.evaluationCriteria?.trim()||'Accuracy, correctness, and completeness of the answer.',evaluationType:d.evaluationType||'hybrid',visibility,workspaceId:d.workspaceId||'',models:d.models,status:'pending',creatorName:user.full_name||'Contributor',ownerId:user.id,integrityVersion:METHOD});
  await audit(b,user,'task_created',task.id,task.id,{visibility,workspaceId:task.workspaceId}); return task;
}
export async function prepareVersion(b,user,taskId) {
  const t=await taskAccess(b,user,taskId,true); const s=b.asServiceRole.entities;
  requireValue(t.prompt?.trim() && t.models?.length && t.models.every(x=>MODELS.includes(x)),'Task prompt or selected models are invalid.');
  const criteria=t.evaluationCriteria?.trim()||'Accuracy, correctness, and completeness of the answer.';
  const snapshot={title:t.title,prompt:t.prompt,criteria,domain:t.domain,difficulty:t.difficulty,evaluationType:t.evaluationType,models:t.models,methodologyVersion:METHOD};
  const contentHash=await hash(JSON.stringify(snapshot)); const familyHash=await hash(normalize(t.prompt));
  const versions=await scan(s.TaskVersion,{taskId:t.id}); let v=versions.find(x=>x.contentHash===contentHash);
  if(!v){
    const accessible=(await context(b,user)).tasks.filter(x=>t.visibility!=='public'||x.visibility==='public');
    const matches=(await scan(s.TaskVersion,{familyHash})).filter(x=>accessible.some(task=>task.id===x.taskId));
    const artifact=await store(b,snapshot);
    v=await s.TaskVersion.create({taskId:t.id,workspaceId:t.workspaceId||'',version:Math.max(0,...versions.map(x=>x.version))+1,contentHash,familyHash,snapshotUri:artifact.uri,snapshotHash:artifact.hash,methodologyVersion:METHOD,contaminationRisk:matches.length?'possible_overlap':'no_match_found',contaminationScope:'Exact normalized-prompt search of the authorized corpus only (public corpus for public tasks); online exposure and training contamination are unknown.',difficultySource:'Contributor-declared; not empirically calibrated'});
    await audit(b,user,'task_version_captured',v.id,t.id,{contentHash,version:v.version});
  }
  const completed=await s.EvaluationEvidence.filter({taskVersionId:v.id,status:'complete'});
  const status=t.models.every(id=>completed.some(e=>e.modelId===id&&e.resultId))?'evaluated':'running';
  await s.EvaluationTask.update(t.id,{currentVersionId:v.id,status});return {versionId:v.id,models:t.models};
}
export async function reviseTask(b,user,p) {
  const t=await taskAccess(b,user,p.taskId,true);
  requireValue(typeof p.prompt==='string' && p.prompt.trim().length>0 && p.prompt.length<=40000,'A prompt of 1–40,000 characters is required.');
  requireValue(typeof p.criteria==='string' && p.criteria.trim().length>0 && p.criteria.length<=12000,'Criteria of 1–12,000 characters are required.');
  const running=await b.asServiceRole.entities.EvaluationEvidence.filter({taskId:t.id,status:'running'});
  requireValue(!running.some(r=>Date.now()-new Date(r.startedAt).getTime()<600000),'Wait for the running evaluation before revising.');
  const updated=await b.asServiceRole.entities.EvaluationTask.update(t.id,{prompt:p.prompt.trim(),evaluationCriteria:p.criteria.trim(),status:'pending'});
  await audit(b,user,'task_draft_revised',t.id,t.id,{previousVersionId:t.currentVersionId||null}); return updated;
}
export async function workspaceAction(b,user,p) {
  const s=b.asServiceRole.entities;
  if(p.action==='workspaces'){const {workspaces}=await context(b,user);return workspaces;}
  if(p.action==='createWorkspace'){
    requireValue(typeof p.name==='string' && p.name.trim().length>0 && p.name.length<=100,'Workspace name is required.');
    const w=await s.EvaluationWorkspace.create({name:p.name.trim(),ownerId:user.id,memberIds:[]});await audit(b,user,'workspace_created',w.id);return w;
  }
  const w=await s.EvaluationWorkspace.get(p.workspaceId);requireValue(w && (w.ownerId===user.id||user.role==='admin'),'Only the workspace owner or administrator can change membership.',403);
  let ids=w.memberIds||[];
  if(p.action==='addMember'){
    requireValue(typeof p.email==='string' && p.email.includes('@'),'Enter the existing app member’s email.');
    const matches=await s.User.filter({email:p.email.trim().toLowerCase()});requireValue(matches.length===1,'No registered app member found for that email.');
    ids=[...new Set([...ids,matches[0].id])];
  } else {requireValue(p.action==='removeMember' && typeof p.userId==='string','Invalid membership action.'); ids=ids.filter(id=>id!==p.userId);}
  const updated=await s.EvaluationWorkspace.update(w.id,{memberIds:ids});await audit(b,user,'workspace_membership_changed',w.id,'',{memberIds:ids});return updated;
}