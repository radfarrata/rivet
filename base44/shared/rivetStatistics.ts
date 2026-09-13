import { METHOD, validReview } from './rivetCore.ts';
import {scoreBand,nominalAlpha,calibrationExtensions} from './rivetCalibration.ts';
const mean = xs => xs.length ? xs.reduce((s,x)=>s+x,0)/xs.length : null;
export function interval(values) {
  if (values.length < 2) return null;
  let seed = 72431; const rnd = () => { seed = (Math.imul(1664525,seed)+1013904223)>>>0; return seed/4294967296; };
  const samples = Array.from({length:2000},()=>mean(values.map(()=>values[Math.floor(rnd()*values.length)]))).sort((a,b)=>a-b);
  return [samples[49],samples[1949]];
}
export function metrics(results,reviews,finals=[]) {
  const ids=new Set(results.map(r=>r.id));
  const eligible=reviews.filter(review=>ids.has(review.resultId)&&review.evaluatorId&&validReview(review)&&results.some(result=>result.id===review.resultId&&result.methodologyVersion===review.methodologyVersion)&&['pass','partial','fail'].includes(review.verdict));
  let pairs=0,agree=0,pairedResults=0,reviewCount=0;
  const errors=[],matches=[],calibration=[],adjudicated=[],reviewUnits=[];
  for(const r of results){
    const unique=[...new Map(eligible.filter(x=>x.resultId===r.id).sort((a,b)=>(a.created_date||'').localeCompare(b.created_date||'')).map(x=>[x.evaluatorId,x])).values()];
    reviewUnits.push(unique);reviewCount+=unique.length;
    if(unique.length>=2)pairedResults++;
    unique.forEach((left,i)=>unique.slice(i+1).forEach(right=>{pairs++;if(left.verdict===right.verdict)agree++;}));
    const f=finals.find(x=>x.resultId===r.id&&x.methodologyVersion===r.methodologyVersion&&Number.isFinite(x.finalScore)&&x.finalScore>=0&&x.finalScore<=100);
    if(f&&unique.length>=2&&Number.isFinite(r.score)&&r.score>=0&&r.score<=100){
      adjudicated.push({...r,humanScore:f.finalScore});errors.push(Math.abs(r.score-f.finalScore));
      const correct=Number(scoreBand(r.score)===scoreBand(f.finalScore));matches.push(correct);
      if(Number.isFinite(r.judgeConfidence)&&r.judgeConfidence>=0&&r.judgeConfidence<=1)calibration.push({confidence:r.judgeConfidence,correct});
    }
  }
  const alpha=nominalAlpha(reviewUnits.map(rs=>rs.map(r=>r.verdict)));
  const bins=Array.from({length:10},(_,i)=>{const items=calibration.filter(x=>Math.min(9,Math.floor(x.confidence*10))===i);const confidence=mean(items.map(x=>x.confidence));const accuracy=mean(items.map(x=>x.correct));return {range:`${(i/10).toFixed(1)}–${((i+1)/10).toFixed(1)}`,n:items.length,confidence,accuracy,gap:items.length?Math.abs(confidence-accuracy):null};});
  const brierScore=mean(calibration.map(x=>(x.confidence-x.correct)**2));
  const ece=calibration.length?bins.reduce((sum,b)=>sum+(b.n/calibration.length)*(b.gap||0),0):null;
  const mce=calibration.length?Math.max(...bins.map(b=>b.gap||0)):null;const high=calibration.filter(x=>x.confidence>=.9);
  return {...calibrationExtensions(adjudicated,reviewUnits),reviewCount,pairedResults,pairCount:pairs,agreement:pairs?100*agree/pairs:null,krippendorffAlpha:alpha,calibrationResults:adjudicated.length,calibratedConfidenceResults:calibration.length,meanAbsoluteError:mean(errors),judgeHumanAgreement:matches.length?100*mean(matches):null,brierScore,ece,mce,calibrationBins:bins,highConfidenceCount:high.length,highConfidenceErrors:high.filter(x=>!x.correct).length,protocol:'Verified, conflict-free reviews only, scoped to these results and deduplicated by reviewer. Nominal Krippendorff alpha uses coincidence weighting and finite-sample expected disagreement; singleton reviews are excluded from alpha. Judge calibration uses final adjudications backed by at least two reviewers. ECE uses 10 equal-width bins; confidence ≥0.90 defines the high-confidence slice. Confidence scores are self-reported. Observational, non-blinded MVP data—not held-out validation.'};
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
    return {modelId,model:rs[0].model,modelAlias:modelId,modelRevision:resolved[0]?.providerRevision||null,aliasStatus:resolved.length===rs.length?'resolved':'alias only',avg:mean(values),ci,n,runCount:rs.length,availableFamilies:new Set(rs.map(r=>r.familyHash)).size,methodologyVersion:rs[0]?.methodologyVersion||METHOD,label:n<30?'insufficient evidence':official&&n>=50&&ci&&ci[1]-ci[0]<=10?'verified':'exploratory',history:history.map(r=>({id:r.id,taskTitle:r.taskTitle,score:official?r.finalScore:r.score,created_date:r.created_date})),coverage:rs.length?n/new Set(rs.map(r=>r.familyHash)).size:0};
  }).sort((a,b)=>(b.avg??-1)-(a.avg??-1));
}