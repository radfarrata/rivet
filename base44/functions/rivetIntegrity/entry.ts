import {createClientFromRequest} from 'npm:@base44/sdk@0.8.44';
import {METHOD,requireValue,DOMAINS,store,load} from '../../shared/rivetCore.ts';
import {dataset,evidenceView,rankingView} from '../../shared/rivetQueries.ts';
import {createTask,reviseTask,workspaceAction} from '../../shared/rivetTasks.ts';
import {expertAction} from '../../shared/rivetExperts.ts';
import {reviewAction,legacyAdjudication} from '../../shared/rivetReviews.ts';
import {migrate,selfChecks} from '../../shared/rivetMigration.ts';
import {reportAction} from '../../shared/rivetReports.ts';
export default async function(req) {
  try {
    const b=createClientFromRequest(req);const user=await b.auth.me();if(!user)return Response.json({error:'Sign in to access evaluation evidence.'},{status:401});
    const p=await req.json();let result;
    switch(p.action){
      case 'tasks':case 'results':case 'reviews': {
        const d=await dataset(b,user);d.tasks.sort((a,b)=>b.created_date.localeCompare(a.created_date));d.results.sort((a,b)=>b.created_date.localeCompare(a.created_date));d.reviews.sort((a,b)=>b.created_date.localeCompare(a.created_date));result=p.action==='tasks'?d.tasks.map(t=>({...t,canManage:user.role==='admin'||(t.ownerId||t.created_by_id)===user.id,workspaceAccess:true})):p.action==='results'?d.results:d.reviews;break;
      }
      case 'evidence':requireValue(typeof p.resultId==='string','Result ID is required.');result=await evidenceView(b,user,p.resultId);break;
      case 'rankings':requireValue(DOMAINS.includes(p.domain),'Choose one domain; overall intelligence scores are not supported.');result=await rankingView(b,user,p.domain,p.official===true);break;
      case 'reportReadiness':case 'generateReport':case 'reportSnapshot':result=await reportAction(b,user,p);break;
      case 'createTask':result=await createTask(b,user,p);break;
      case 'reviseTask':result=await reviseTask(b,user,p);break;
      case 'workspaces':case 'createWorkspace':case 'addMember':case 'removeMember':result=await workspaceAction(b,user,p);break;
      case 'experts':case 'applyExpert':case 'verifyExpert':result=await expertAction(b,user,p);break;
      case 'submitReview':case 'finalAdjudication':result=await reviewAction(b,user,p);break;
      case 'legacyAdjudication':result=await legacyAdjudication(b,user,p);break;
      case 'migrate':result=await migrate(b,user);break;
      case 'selfChecks':requireValue(user.role==='admin','Administrator required.',403);result=selfChecks();break;
      case 'storageCheck': {
        requireValue(user.role==='admin','Administrator required.',403);
        const diagnostic={purpose:'Private evidence storage diagnostic',methodologyVersion:METHOD};
        const artifact=await store(b,diagnostic);const restored=await load(b,artifact.uri,artifact.hash);
        result={ok:restored.purpose===diagnostic.purpose,privateArtifact:true,sha256Verified:true,noEvaluationRecordsCreated:true};break;
      }
      default:requireValue(false,'Unknown integrity action.');
    }
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch(error){return Response.json({error:error.status?error.message:'Unable to complete this evaluation operation. Please retry or contact the app administrator.'},{status:error.status||500});}
}