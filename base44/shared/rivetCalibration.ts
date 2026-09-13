import {judgeRankingAgreement} from './rivetJudgeRanking.ts';
export const mean = xs => xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
export const scoreBand = n => n>=80?'pass':n>=50?'partial':'fail';
export const sampleVariance = xs => xs.length>1?xs.reduce((sum,x)=>sum+(x-mean(xs))**2,0)/(xs.length-1):null;
export function nominalAlpha(units) {
  const paired=units.filter(xs=>xs.length>=2),counts={pass:0,partial:0,fail:0};let n=0,disagreement=0;
  for(const xs of paired){
    n+=xs.length;xs.forEach(x=>counts[x]++);
    xs.forEach((x,i)=>xs.forEach((y,j)=>{if(i!==j&&x!==y)disagreement+=1/(xs.length-1);}));
  }
  const expected=n>1?(n*n-Object.values(counts).reduce((s,c)=>s+c*c,0))/(n*(n-1)):0;
  return expected?1-(disagreement/n)/expected:null;
}
export function calibrationExtensions(pairs,reviewUnits) {
  const labels=['fail','partial','pass'],matrix=labels.map(()=>labels.map(()=>0));
  pairs.forEach(p=>matrix[labels.indexOf(scoreBand(p.humanScore))][labels.indexOf(scoreBand(p.score))]++);
  const n=pairs.length,observed=n?matrix.reduce((s,row,i)=>s+row[i],0)/n:null;
  const expected=n?labels.reduce((s,_,i)=>s+matrix[i].reduce((a,b)=>a+b,0)*matrix.reduce((a,row)=>a+row[i],0),0)/(n*n):null;
  const errors=pairs.map(p=>p.score-p.humanScore),variance=sampleVariance(errors);
  const variances=reviewUnits.map(rs=>sampleVariance(rs.map(r=>r.score).filter(x=>Number.isFinite(x)&&x>=0&&x<=100))).filter(x=>x!==null);
  return {statisticsVersion:'rivet-calibration-2.0',cohenKappa:n&&expected<1?(observed-expected)/(1-expected):null,confusionMatrix:matrix,confusionLabels:labels,meanSignedError:mean(errors),scoreErrorVariance:variance,scoreErrorSD:variance===null?null:Math.sqrt(variance),meanReviewerVariance:mean(variances),reviewerVarianceResults:variances.length,rankingAgreement:judgeRankingAgreement(pairs),repeatJudgeVariance:null};
}