import { METHOD, validReview } from './rivetCore.ts';
const mean = xs => xs.length ? xs.reduce((s,x)=>s+x,0)/xs.length : null;
export function interval(values) {
  if (values.length < 2) return null;
  let seed = 72431; const rnd = () => { seed = (Math.imul(1664525,seed)+1013904223)>>>0; return seed/4294967296; };
  const samples = Array.from({length:2000},()=>mean(values.map(()=>values[Math.floor(rnd()*values.length)]))).sort((a,b)=>a-b);
  return [samples[49],samples[1949]];
}
export function metrics(results,reviews,finals=[]) {
  const eligible = reviews.filter(validReview); let pairs=0,agree=0; const errors=[],matches=[]; let pairedResults=0, calibrationResults=0;
  for (const r of results) {
    const unique = [...new Map(eligible.filter(x=>x.resultId===r.id).map(x=>[x.evaluatorId,x])).values()];
    if(unique.length>=2) pairedResults++;
    unique.forEach((left,i) => { unique.slice(i+1).forEach(right => { pairs++; if(left.verdict === right.verdict) agree++; }); });
    const f=finals.find(f=>f.resultId===r.id && f.methodologyVersion===METHOD && Number.isFinite(f.finalScore));
    if(f && unique.length>=2){calibrationResults++;errors.push(Math.abs(r.score-f.finalScore)); const band=n=>n>=80?'pass':n>=50?'partial':'fail';matches.push(Number(band(r.score)===band(f.finalScore)));}
  }
  return {reviewCount:eligible.length,pairedResults,pairCount:pairs,agreement:pairs?100*agree/pairs:null,calibrationResults,meanAbsoluteError:mean(errors),judgeHumanAgreement:matches.length?100*mean(matches):null,protocol:'Non-blinded observational reviews; not independent validation or held-out calibration. Score bands: pass ≥80, partial ≥50, fail <50.'};
}
export function rankings(results,domain,official=false) {
  const scoped = results.filter(r=>r.domain===domain && r.evidenceStatus==='complete' && (!official || r.officialEligible));
  const byModel = new Map();
  for(const r of scoped){const key=r.modelId; if(!byModel.has(key))byModel.set(key,[]);byModel.get(key).push(r);}
  const cohortKey = r => r.cohortHash || r.familyHash;
  const modelCohorts=[...byModel.values()].map(rs=>new Set(rs.map(cohortKey)));
  const shared=modelCohorts.length ? [...modelCohorts[0]].filter(f=>modelCohorts.every(s=>s.has(f))) : [];
  const familyChoice = new Map();
  scoped.filter(r=>shared.includes(cohortKey(r))).sort((a,b)=>a.created_date.localeCompare(b.created_date)).forEach(r=>familyChoice.set(r.familyHash,cohortKey(r)));
  return [...byModel.entries()].map(([modelId,rs])=>{
    const history=[...new Map(rs.filter(r=>familyChoice.get(r.familyHash)===cohortKey(r)).sort((a,b)=>a.created_date.localeCompare(b.created_date)).map(r=>[r.familyHash,r])).values()];
    const values=history.map(r=>official?r.finalScore:r.score); const ci=interval(values); const n=values.length;
    return {modelId,model:rs[0].model,avg:mean(values),ci,n,runCount:rs.length,availableFamilies:new Set(rs.map(r=>r.familyHash)).size,methodologyVersion:METHOD,label:n<30?'insufficient evidence':official && n>=50 && ci && ci[1]-ci[0]<=10?'verified':'exploratory',history:history.map(r=>({id:r.id,taskTitle:r.taskTitle,score:official?r.finalScore:r.score,created_date:r.created_date})),coverage:rs.length? n/new Set(rs.map(r=>r.familyHash)).size:0};
  }).sort((a,b)=>(b.avg??-1)-(a.avg??-1));
}