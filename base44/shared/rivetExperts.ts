import {DOMAINS,METHOD,scan,requireValue,audit,validReview} from './rivetCore.ts';
export async function expertAction(b,user,p) {
  const s=b.asServiceRole.entities;
  if(p.action==='experts'){
    const credentials=await scan(s.ExpertCredential,user.role==='admin'?{}:{userId:user.id});
    const reviews=await scan(s.HumanEvaluation,{evaluatorId:user.id});
    return {credentials,reviewCount:reviews.length,verifiedReviewCount:reviews.filter(validReview).length,weight:1,history:reviews.map(r=>({id:r.id,resultId:r.resultId,score:r.score,verdict:r.verdict,created_date:r.created_date,verification:r.credentialStatusAtReview||'legacy'})),isAdmin:user.role==='admin',userId:user.id};
  }
  if(p.action==='applyExpert'){
    requireValue(Array.isArray(p.domains)&&p.domains.length>0&&p.domains.every(d=>DOMAINS.includes(d)),'Select at least one valid domain.');
    requireValue(typeof p.conflictDeclaration==='string' && p.conflictDeclaration.trim().length>=10 && p.conflictDeclaration.length<=2000,'Describe affiliations and potential conflicts (10–2,000 characters).');
    requireValue(typeof p.evidenceNotes==='string' && p.evidenceNotes.trim().length>=20 && p.evidenceNotes.length<=4000,'Provide verification evidence (20–4,000 characters).');
    requireValue(!p.orcid || /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(p.orcid),'ORCID must use the 0000-0000-0000-0000 format.');
    requireValue(!p.portfolioUrl || /^https:\/\//.test(p.portfolioUrl),'Portfolio must be an HTTPS URL.');
    const existing=(await s.ExpertCredential.filter({userId:user.id}))[0];
    const data={userId:user.id,displayName:user.full_name||'Contributor',domains:p.domains,affiliation:String(p.affiliation||'').slice(0,200),orcid:p.orcid||'',portfolioUrl:p.portfolioUrl||'',evidenceNotes:p.evidenceNotes.trim(),conflictDeclaration:p.conflictDeclaration.trim(),status:'pending',verifiedBy:'',verifiedAt:'',decisionReason:''};
    const saved=existing?await s.ExpertCredential.update(existing.id,data):await s.ExpertCredential.create(data);
    await audit(b,user,'expert_application',saved.id,'',{previousStatus:existing?.status||null,application:data});return saved;
  }
  requireValue(user.role==='admin','Administrator verification required.',403);
  const c=await s.ExpertCredential.get(p.credentialId);requireValue(c && c.userId!==user.id,'An administrator cannot verify their own credentials.',403);
  requireValue(['verified','rejected','revoked'].includes(p.status),'Invalid verification decision.');
  requireValue(typeof p.reason==='string'&&p.reason.trim().length>=10,'Document the verification checks and decision.');
  const result=await s.ExpertCredential.update(c.id,{status:p.status,decisionReason:p.reason.trim(),verifiedBy:user.id,verifiedAt:new Date().toISOString()});
  await audit(b,user,'credential_decision',c.id,'',{status:p.status,reason:p.reason.trim()});
  await s.Notification.create({userId:c.userId,type:'credential',title:'Expert verification updated',message:`Your expert verification is now ${p.status}. Review the decision in Expert Workspace.`,read:false});return result;
}