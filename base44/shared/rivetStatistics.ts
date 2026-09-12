import { METHOD, validReview } from './rivetCore.ts';
const mean = xs => xs.length ? xs.reduce((s,x)=>s+x,0)/xs.length : null;
export function interval(values) {
  if (values.length < 2) return null;
  let seed = 72431; const rnd = () => { seed = (Math.imul(1664525,seed)+1013904223)>>>0; return seed/4294967296; };
  const samples = Array.from({length:2000},()=>mean(values.map(()=>values[Math.floor(rnd()*values.length)]))).sort((a,b)=>a-b);
  return [samples[49],samples[1949]];
}
export function metrics(results,reviews,finals=[]) {
  const eligible=reviews.filter(validReview); let pairs=0,agree=0,disagree=0,pairedResults=0,calibrationResults=0;
  const errors=[],matches=[],calibration=[]; const band=n=>n>=80?'pass':n>=50?'partial':'fail';
  for(const r of results){
    const unique=[...new Map(eligible.filter(x=>x.resultId===r.id).map(x=>[x.evaluatorId,x])).values()];
    if(unique.length>=2)pairedResults++;
    unique.forEach((left,i)=>unique.slice(i+1).forEach(right=>{pairs++;if(left.verdict===right.verdict)agree++;else disagree++;}));
    const f=finals.find(x=>x.resultId===r.id&&x.methodologyVersion===METHOD&&Number.isFinite(x.finalScore));
    if(f&&unique.length>=2){calibrationResults++;errors.push(Math.abs(r.score-f.finalScore));const correct=Number(band(r.score)===band(f.finalScore));matches.push(correct);if(Number.isFinite(r.judgeConfidence))calibration.push({confidence:Math.max(0,Math.min(1,r.judgeConfidence)),correct});}
  }
  const labels=['pass','partial','fail'];const total=eligible.length;
  const expectedDisagreement=total>1?1-labels.reduce((sum,label)=>sum+(eligible.filter(r=>r.verdict===label).length/total)**2,0):0;
  const alpha=pairs&&expectedDisagreement?1-(disagree/pairs)/expectedDisagreement:null;
  const bins=Array.from({length:10},(_,i)=>{const items=calibration.filter(x=>Math.min(9,Math.floor(x.confidence*10))===i);const confidence=mean(items.map(x=>x.confidence));const accuracy=mean(items.map(x=>x.correct));return {range:`${(i/10).toFixed(1)}–${((i+1)/10).toFixed(1)}`,n:items.length,confidence,accuracy,gap:items.length?Math.abs(confidence-accuracy):null};});
  const brierScore=mean(calibration.map(x=>(x.confidence-x.correct)**2));
  const ece=calibration.length?bins.reduce((sum,b)=>sum+(b.n/calibration.length)*(b.gap||0),0):null;
  const mce=calibration.length?Math.max(...bins.map(b=>b.gap||0)):null;const high=calibration.filter(x=>x.confidence>=.9);
  return {reviewCount:eligible.length,pairedResults,pairCount:pairs,agreement:pairs?100*agree/pairs:null,krippendorffAlpha:alpha,calibrationResults,calibratedConfidenceResults:calibration.length,meanAbsoluteError:mean(errors),judgeHumanAgreement:matches.length?100*mean(matches):null,brierScore,ece,mce,calibrationBins:bins,highConfidenceCount:high.length,highConfidenceErrors:high.filter(x=>!x.correct).length,protocol:'Verified, conflict-free reviews only. Raw agreement is paired with nominal Krippendorff alpha for chance correction. Judge calibration uses final adjudications backed by at least two reviewers; ECE uses 10 equal-width bins and confidence ≥0.90 defines the high-confidence slice. Observational, non-blinded MVP data—not held-out validation.'};
}
export function rankings(results,domain,official=false) {
  const scoped=results.filter(r=>r.domain===domain&&r.evidenceStatus==='complete'&&(!official||r.officialEligible));const byModel=new Map();
  for(const r of scoped){if(!byModel.has(r.modelId))byModel.set(r.modelId,[]);byModel.get(r.modelId).push(r);}
  const cohortKey=r=>r.cohortHash||r.familyHash;const modelCohorts=[...byModel.values()].map(rs=>new Set(rs.map(cohortKey)));
  const shared=modelCohorts.length?[...modelCohorts[0]].filter(f=>modelCohorts.every(s=>s.has(f))):[];const familyChoice=new Map();
  scoped.filter(r=>shared.includes(cohortKey(r))).sort((a,b)=>a.created_date.localeCompare(b.created_date)).forEach(r=>familyChoice.set(r.familyHash,cohortKey(r)));
  return [...byModel.entries()].map(([modelId,rs])=>{
    const history=[...new Map(rs.filter(r=>familyChoice.get(r.familyHash)===cohortKey(r)).sort((a,b)=>a.created_date.localeCompare(b.created_date)).map(r=>[r.familyHash,r])).values()];
    const values=history.map(r=>official?r.finalScore:r.score);const ci=interval(values);const n=values.length;const resolved=rs.filter(r=>r.modelResolution==='provider_revision'&&r.providerRevision);
    return {modelId,model:rs[0].model,modelAlias:modelId,modelRevision:resolved[0]?.providerRevision||null,aliasStatus:resolved.length===rs.length?'resolved':'alias only',avg:mean(values),ci,n,runCount:rs.length,availableFamilies:new Set(rs.map(r=>r.familyHash)).size,methodologyVersion:METHOD,label:n<30?'insufficient evidence':official&&n>=50&&ci&&ci[1]-ci[0]<=10?'verified':'exploratory',history:history.map(r=>({id:r.id,taskTitle:r.taskTitle,score:official?r.finalScore:r.score,created_date:r.created_date})),coverage:rs.length?n/new Set(rs.map(r=>r.familyHash)).size:0};
  }).sort((a,b)=>(b.avg??-1)-(a.avg??-1));
}