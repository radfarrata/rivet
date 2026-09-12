export const METHOD = 'rivet-evidence-1.0';
export const DOMAINS = ['reasoning','coding','mathematics','biology','chemistry','physics','medicine','multimodal','long_context','safety','scientific_reasoning','agentic','other'];
export const MODELS = ['gpt_5_mini','gpt_5_4','claude-sonnet-5','gemini_3_flash'];
export function requireValue(ok, message, status = 400) { if (!ok) { const e = new Error(message); e.status = status; throw e; } }
export async function scan(entity, query = {}) {
  const rows = [];
  for (let skip = 0; skip < 20000; skip += 200) {
    const page = await entity.filter(query, 'created_date', 200, skip);
    rows.push(...page); if (page.length < 200) return rows;
  }
  throw new Error('Dataset exceeds the MVP query limit; no partial statistics were published.');
}
export const isOwner = (task, user) => (task.ownerId || task.created_by_id) === user.id;
export function canRead(task, user, workspaces = []) {
  return !!task && (user.role === 'admin' || task.visibility === 'public' || isOwner(task,user) || workspaces.some(w => w.id === task.workspaceId && (w.ownerId === user.id || w.memberIds?.includes(user.id))));
}
export async function context(b, user) {
  const s = b.asServiceRole.entities;
  const workspaces = await scan(s.EvaluationWorkspace);
  const tasks = (await scan(s.EvaluationTask)).filter(t => canRead(t,user,workspaces));
  return { s, tasks, workspaces: workspaces.filter(w => user.role === 'admin' || w.ownerId === user.id || w.memberIds?.includes(user.id)) };
}
export async function taskAccess(b,user,id,write=false) {
  const task = await b.asServiceRole.entities.EvaluationTask.get(id);
  const workspaces = task?.workspaceId ? await b.asServiceRole.entities.EvaluationWorkspace.filter({id:task.workspaceId}) : [];
  requireValue(task && (write ? isOwner(task,user) || user.role === 'admin' : canRead(task,user,workspaces)), 'Evaluation unavailable or permission denied.', 403);
  return task;
}
export async function related(entity, tasks) {
  const rows = [];
  for (let i=0;i<tasks.length;i+=100) rows.push(...await scan(entity,{taskId:{$in:tasks.slice(i,i+100).map(t=>t.id)}}));
  return rows;
}
export async function hash(text) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join(''); }
export const normalize = text => text.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export async function store(b, value) {
  const text = JSON.stringify(value); requireValue(text.length <= 1500000, 'Evidence is too large for this MVP.');
  const {file_uri} = await b.asServiceRole.integrations.Core.UploadPrivateFile({file:new File([text],'evidence.json',{type:'application/json'})});
  requireValue(file_uri, 'Evidence upload failed.', 502); return {uri:file_uri,hash:await hash(text)};
}
export async function load(b,uri,digest) {
  requireValue(uri && digest,'Missing evidence artifact.',409);
  const {signed_url} = await b.asServiceRole.integrations.Core.CreateFileSignedUrl({file_uri:uri,expires_in:60});
  const response = await fetch(signed_url); requireValue(response.ok,'Evidence could not be read.',502);
  const text = await response.text(); requireValue(await hash(text) === digest,'Evidence integrity check failed.',409); return JSON.parse(text);
}
export async function audit(b,user,action,targetId,taskId='',details={}) {
  return await b.asServiceRole.entities.EvaluationAudit.create({actorId:user.id,action,targetId,taskId,details,occurredAt:new Date().toISOString()});
}
export const validReview = r => r.credentialStatusAtReview === 'verified' && r.hasConflict === false && r.methodologyVersion === METHOD;
export const evidenceComplete = (r,e,v) => !!(e && v && e.status === 'complete' && e.resultId === r.id && e.taskId === r.taskId && e.taskVersionId === r.taskVersionId && e.modelId === r.modelId && e.artifactUri && e.artifactHash && v.snapshotUri && v.snapshotHash && r.methodologyVersion === METHOD && Number.isFinite(r.score) && r.score >= 0 && r.score <= 100);
export function officialEligible(r,e,v,reviews,finals) {
  return evidenceComplete(r,e,v) && e.modelResolution === 'provider_revision' && !!e.providerRevision && v.contaminationRisk !== 'unchecked' && v.contaminationRisk !== 'possible_overlap' && new Set(reviews.filter(validReview).map(x=>x.evaluatorId)).size>=2 && finals.some(f=>f.resultId===r.id && f.methodologyVersion===METHOD && Number.isFinite(f.finalScore) && f.reviewIds?.length>=2);
}