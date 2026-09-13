import {scan,requireValue,audit,METHOD,canRead,evidenceComplete,officialEligible} from './rivetCore.ts';
import {interval,rankings,metrics} from './rivetStatistics.ts';
import {ngramCoverage} from './rivetContamination.ts';
import {calibrationChecks} from './rivetCalibrationChecks.ts';
import {reportChecks} from './rivetReportChecks.ts';
export async function migrate(b,user) {
  requireValue(user.role==='admin','Administrator required.',403);
  const rows=await scan(b.asServiceRole.entities.ModelResult);
  const updates=rows.filter(r=>!r.evidenceId && r.evidenceStatus!=='legacy').map(r=>({id:r.id,evidenceStatus:'legacy'}));
  for(let i=0;i<updates.length;i+=100)await b.asServiceRole.entities.ModelResult.bulkUpdate(updates.slice(i,i+100));
  await audit(b,user,'legacy_migration',METHOD,'',{labelledResults:updates.length,preservedOriginalData:true});return {labelledResults:updates.length,preservedOriginalData:true};
}
export function selfChecks() {
  const checks=[];const check=(name,pass)=>checks.push({name,pass:!!pass});
  check('Single-task interval is unavailable',interval([75])===null);
  check('Constant-sample bootstrap is exact',JSON.stringify(interval([50,50,50]))==='[50,50]');
  const rows=[{id:'test1',modelId:'a',model:'A',domain:'biology',score:80,methodologyVersion:METHOD,evidenceStatus:'complete',familyHash:'same',created_date:'2026-01-01'},{id:'test2',modelId:'a',model:'A',domain:'biology',score:90,methodologyVersion:METHOD,evidenceStatus:'complete',familyHash:'same',created_date:'2026-01-02'}];
  const rank=rankings(rows,'biology')[0];check('Duplicate prompts count once',rank.n===1&&rank.runCount===2&&rank.avg===90);check('Sparse cohorts never verified',rank.label==='insufficient evidence');
  check('Legacy results never enter rankings',rankings([{...rows[0],evidenceStatus:'legacy'}],'biology').length===0);
  check('Missing evidence prevents publication',!evidenceComplete(rows[0],null,null));check('No reviews yields unavailable agreement',metrics(rows,[]).agreement===null);
  check('Unrelated user cannot read private task',!canRead({visibility:'private',ownerId:'owner',workspaceId:'w'},{id:'other',role:'user'},[{id:'w',ownerId:'owner',memberIds:[]} ]));
  check('Workspace member can read private task',canRead({visibility:'private',ownerId:'owner',workspaceId:'w'},{id:'member',role:'user'},[{id:'w',ownerId:'owner',memberIds:['member']} ]));
  check('Revoked member loses private access',!canRead({visibility:'private',ownerId:'owner',workspaceId:'w'},{id:'member',role:'user'},[{id:'w',ownerId:'owner',memberIds:[]} ]));
  const mixed=rankings([{...rows[0],cohortHash:'rubric-a'},{...rows[1],modelId:'b',cohortHash:'rubric-b'}],'biology');
  check('Different rubric snapshots are not compared',mixed.every(r=>r.n===0));
  const reviewed=[{resultId:'test1',evaluatorId:'x',credentialStatusAtReview:'verified',hasConflict:false,methodologyVersion:METHOD,verdict:'pass'},{resultId:'test1',evaluatorId:'y',credentialStatusAtReview:'verified',hasConflict:false,methodologyVersion:METHOD,verdict:'fail'}];
  const observed=metrics(rows,reviewed);check('Actual differing votes report disagreement',observed.pairCount===1&&observed.agreement===0);check('Unverified votes cannot establish agreement',metrics(rows,reviewed.map(r=>({...r,credentialStatusAtReview:'pending'}))).agreement===null);
  check('Empty comparisons cannot be verified',rankings([],'biology',true).length===0);
  const overlap=ngramCoverage('one two three four five six seven eight nine ten eleven twelve thirteen extra','zero one two three four five six seven eight nine ten eleven twelve thirteen',13);
  check('13-gram overlap reports covered-token share',overlap.checkable&&overlap.covered===13/14);
  check('Short prompts stay outside the n-gram denominator',ngramCoverage('too short','also short',13).checkable===false);
  const calibrated=metrics([{...rows[0],judgeConfidence:.9}],reviewed,[{resultId:'test1',methodologyVersion:METHOD,finalScore:20}]);
  check('Calibration reports Brier and chance-corrected disagreement',calibrated.brierScore===.81&&calibrated.krippendorffAlpha===0);
  checks.push(...calibrationChecks(),...reportChecks());
  return {ok:checks.every(c=>c.pass),checks,note:'Isolated in-memory checks only; no test experts, rankings, or scores persisted.'};
}