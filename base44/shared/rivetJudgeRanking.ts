const mean = xs => xs.reduce((a,b)=>a+b,0)/xs.length;
export function kendallTauB(xs,ys) {
  let concordant=0,discordant=0,tiedX=0,tiedY=0;
  for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){
    const a=Math.sign(xs[i]-xs[j]),b=Math.sign(ys[i]-ys[j]);
    if(!a&&!b)continue;
    if(!a)tiedX++;else if(!b)tiedY++;else if(a===b)concordant++;else discordant++;
  }
  const denominator=Math.sqrt((concordant+discordant+tiedX)*(concordant+discordant+tiedY));
  return denominator?(concordant-discordant)/denominator:null;
}
export function judgeRankingAgreement(pairs) {
  const groups=new Map();
  for(const p of pairs){
    if(!p.modelId||!p.taskVersionId||!p.methodologyVersion||!p.domain)continue;
    const key=JSON.stringify([p.domain,p.methodologyVersion,p.judgedBy||'Unknown judge']);
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);
  }
  return [...groups.entries()].map(([key,items])=>{
    const [domain,methodologyVersion,judge]=JSON.parse(key),models=new Map();
    const family=p=>p.familyHash||p.taskId;
    const snapshot=p=>JSON.stringify([family(p),p.cohortHash||p.taskVersionId]);
    for(const p of [...items].sort((a,b)=>(a.created_date||'').localeCompare(b.created_date||'')||a.id.localeCompare(b.id))){
      const model=JSON.stringify([p.modelId,p.providerRevision||'alias only']);
      if(!models.has(model))models.set(model,new Map());models.get(model).set(snapshot(p),p);
    }
    const sets=[...models.values()];
    const common=sets.length?[...sets[0].keys()].filter(s=>sets.every(set=>set.has(s))):[];
    const families=new Map();
    common.sort((a,b)=>{
      const time=s=>Math.max(...sets.map(set=>Date.parse(set.get(s).created_date)||0));
      return time(a)-time(b)||a.localeCompare(b);
    }).forEach(s=>families.set(family(sets[0].get(s)),s));
    const selected=[...families.values()];
    const rows=[...models.entries()].map(([model,set])=>{
      const [modelId,revision]=JSON.parse(model),rs=selected.map(s=>set.get(s));
      return {modelId,revision,n:rs.length,judgeMean:rs.length?mean(rs.map(r=>r.score)):null,humanMean:rs.length?mean(rs.map(r=>r.humanScore)):null,resultIds:rs.map(r=>r.id)};
    });
    const sufficient=rows.length>=3&&selected.length>=2;
    return {domain,methodologyVersion,judge,modelCount:rows.length,matchedTasks:selected.length,tauB:sufficient?kendallTauB(rows.map(r=>r.judgeMean),rows.map(r=>r.humanMean)):null,rows};
  });
}