import {METHOD,OPEN_WEIGHT_METHOD,officialEligible} from './rivetCore.ts';
import {SCAN_PROTOCOL,publicationSafetyReasons} from './rivetPublicationSafety.ts';
import {rankings} from './rivetStatistics.ts';
import {assessTaskQuality} from './rivetContamination.ts';
export function publicationChecks(){
  const checks=[],check=(name,pass)=>checks.push({name,pass:!!pass});
  const r={id:'r',taskId:'t',taskVersionId:'v',modelId:'m',domain:'biology',score:80,methodologyVersion:METHOD};
  const e={resultId:'r',taskId:'t',taskVersionId:'v',modelId:'m',status:'complete',artifactUri:'private',artifactHash:'hash',methodologyVersion:METHOD,executionSource:'server_integration',modelResolution:'provider_revision',providerRevision:'revision'};
  const v={id:'v',taskId:'t',snapshotUri:'private',snapshotHash:'hash',methodologyVersion:METHOD,qualityAssessmentId:'q',contaminationRisk:'no_match_found'};
  const q={id:'q',taskId:'t',taskVersionId:'v',taskSnapshotHash:'hash',methodologyVersion:METHOD,risk:'no_match_found',scanProtocol:SCAN_PROTOCOL,scanStatus:'complete',eligiblePeerCount:201,checkedPeerCount:201,failedPeerCount:0,checks:[0,1,2,3,4,5].map(rung=>({rung,status:rung===4?'not_applicable':'pass'}))};
  const reviews=['one','two'].map(evaluatorId=>({evaluatorId,credentialStatusAtReview:'verified',hasConflict:false,methodologyVersion:METHOD}));
  const finals=[{resultId:'r',methodologyVersion:METHOD,finalScore:85,reviewIds:['one','two']}];
  check('Safeguards accept fully linked, resolved test metadata',officialEligible(r,e,v,reviews,finals,q));
  for(const risk of ['unchecked','possible_overlap','known_contamination',undefined])check(`Official rankings reject contamination state ${risk}`,!officialEligible(r,e,{...v,contaminationRisk:risk},reviews,finals,q));
  const cases=[['missing assessment',null],['legacy scan',{...q,scanProtocol:undefined}],['partial corpus',{...q,checkedPeerCount:200}],['unreadable peer',{...q,failedPeerCount:1}],['incomplete scan',{...q,scanStatus:'incomplete'}],['snapshot mismatch',{...q,taskSnapshotHash:'other'}],['methodology mismatch',{...q,methodologyVersion:OPEN_WEIGHT_METHOD}],['manual pending',{...q,checks:q.checks.map(c=>c.rung===0?{...c,status:'manual'}:c)}],['flagged check',{...q,checks:q.checks.map(c=>c.rung===5?{...c,status:'flag'}:c)}]];
  cases.forEach(([name,quality])=>check(`Publication blocks ${name}`,!officialEligible(r,e,v,reviews,finals,quality)));
  for(const executionSource of ['external_import','unknown',undefined])check(`Human adjudication cannot override ${executionSource} origin`,!officialEligible(r,{...e,executionSource},v,reviews,finals,q));
  check('Historical open-weight imports remain blocked',publicationSafetyReasons({...e,methodologyVersion:OPEN_WEIGHT_METHOD},v,q).length>0);
  const row={...r,evidenceStatus:'complete',familyHash:'family',cohortHash:'cohort',created_date:'2026-01-01',officialEligible:officialEligible(r,{...e,executionSource:'external_import'},v,reviews,finals,q)};
  check('Blocked imports remain exploratory but leave official rankings',rankings([row],'biology').length===1&&rankings([row],'biology',true).length===0);
  return checks;
}
export async function contaminationSafetyChecks(){
  let attempted=0,saved,updated;
  const b={asServiceRole:{integrations:{Core:{CreateFileSignedUrl:async()=>{attempted++;throw new Error('In-memory unreadable snapshot fixture');}}},entities:{TaskQualityAssessment:{create:async data=>{saved={...data,id:'assessment'};return saved;}},TaskVersion:{update:async(id,data)=>{updated=data;}}}}};
  const task={id:'task',prompt:'A task for the isolated scan failure check'};
  const version={id:'version',taskId:'task',snapshotHash:'hash',methodologyVersion:OPEN_WEIGHT_METHOD,contaminationRisk:'no_match_found'};
  const peers=Array.from({length:201},(_,i)=>({id:`peer-${i}`,taskId:`other-${i}`,snapshotUri:'fake-private',snapshotHash:'fake-hash'}));
  await assessTaskQuality(b,{id:'tester'},task,version,peers);
  return [{name:'Corpus scan attempts all 201 peers without truncation',pass:attempted===201},{name:'Unreadable peers persist incomplete coverage and unchecked risk',pass:saved.scanStatus==='incomplete'&&saved.failedPeerCount===201&&saved.checkedPeerCount===0&&saved.eligiblePeerCount===201&&updated.contaminationRisk==='unchecked'},{name:'Quality assessment preserves suite methodology and snapshot',pass:saved.methodologyVersion===OPEN_WEIGHT_METHOD&&saved.taskSnapshotHash==='hash'}];
}