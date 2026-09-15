import {context,requireValue,store,load,audit,scan,METHOD,DOMAINS} from './rivetCore.ts';
import {metrics} from './rivetStatistics.ts';
import {reportSources,verifyReportSource} from './rivetReportSources.ts';
import {REPORT_TEMPLATES,REPORT_VERSION,REPORT_METHOD,REPORT_LIMITATIONS,reportMarkdown} from './rivetReportTemplates.ts';
const label=x=>x.split('_').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');
const summary=r=>({id:r.id,title:r.title,domain:r.domain,templateId:r.templateId,snapshotHash:r.snapshotHash,generatedAt:r.generatedAt,resultCount:r.resultCount,auditCount:r.auditCount});
async function allowedReports(b,user,domain){
  const {s,tasks}=await context(b,user),allowed=new Set(tasks.map(t=>t.id));
  const reports=await scan(s.DomainReport,{domain});
  return reports.filter(r=>r.taskIds?.length&&r.taskIds.every(id=>allowed.has(id))).sort((a,b)=>b.generatedAt.localeCompare(a.generatedAt));
}
export async function reportAction(b,user,p){
  if(p.action==='reportAvailability'){
    requireValue(DOMAINS.includes(p.domain),'Choose a report domain.');
    const reports=await allowedReports(b,user,p.domain),byModel=new Map();
    for(let i=0;i<reports.length;i+=4){
      const batch=reports.slice(i,i+4);
      const manifests=await Promise.all(batch.map(r=>load(b,r.snapshotUri,r.snapshotHash)));
      manifests.forEach((manifest,index)=>{
        const report=batch[index];
        requireValue(manifest.domain===p.domain&&manifest.evidence?.length&&manifest.evidence.every(e=>report.taskIds.includes(e.taskId)),'Report source access has changed.',403);
        for(const evidence of manifest.evidence)if(evidence.modelAlias&&!byModel.has(evidence.modelAlias))byModel.set(evidence.modelAlias,{modelId:evidence.modelAlias,report:summary(report)});
      });
    }
    return {models:[...byModel.values()]};
  }
  if(p.action==='reportSnapshot'){
    requireValue(typeof p.snapshotHash==='string'&&/^[a-f0-9]{64}$/.test(p.snapshotHash),'A full report snapshot identifier is required.');
    const saved=(await b.asServiceRole.entities.DomainReport.filter({snapshotHash:p.snapshotHash}))[0];requireValue(saved,'Report unavailable.',404);
    const {tasks}=await context(b,user),allowed=new Set(tasks.map(t=>t.id));requireValue(saved.taskIds?.length&&saved.taskIds.every(id=>allowed.has(id)),'Report unavailable or permission denied.',403);
    const manifest=await load(b,saved.snapshotUri,p.snapshotHash);
    requireValue(manifest.evidence?.length&&manifest.evidence.every(e=>allowed.has(e.taskId)),'Report source access has changed.',403);
    return {report:summary(saved),manifest,citation:`Rivet. (${manifest.generatedAt.slice(0,10)}). ${manifest.title}. ${manifest.templateVersion}. SHA-256: ${p.snapshotHash}.`};
  }
  const source=await reportSources(b,user,p.domain);
  if(p.action==='reportReadiness')return {templates:REPORT_TEMPLATES,cutoffAt:source.cutoffAt,totalResults:source.totalResults,eligibleResults:source.eligibleResults,citedResults:source.selected.length,modelCount:source.rows.length,canGenerate:source.selected.length>0,exclusions:source.exclusions,reports:(await allowedReports(b,user,p.domain)).slice(0,20).map(summary),note:'Readiness checks metadata. Generation rechecks eligibility and verifies every cited artifact hash; missing or inconsistent files block saving.'};
  requireValue(p.action==='generateReport','Unknown report action.');const template=REPORT_TEMPLATES.find(t=>t.id===p.templateId);requireValue(template,'Choose a report template.');
  requireValue(source.selected.length>0,'No official evidence qualifies for a matched domain snapshot. Resolve the listed eligibility gaps first.',409);
  const evidence=[];for(let i=0;i<source.selected.length;i+=4)evidence.push(...await Promise.all(source.selected.slice(i,i+4).map(r=>verifyReportSource(b,r,source))));
  const auditIds=new Set(evidence.flatMap(e=>e.auditIds)),audits=source.events.filter(a=>auditIds.has(a.id)).map(a=>({id:a.id,action:a.action,targetId:a.targetId,taskId:a.taskId,occurredAt:a.occurredAt}));
  const {tasks}=await context(b,user);requireValue(evidence.every(e=>tasks.some(t=>t.id===e.taskId&&t.visibility==='public')),'Source visibility changed; no report was saved.',409);
  const reviewIds=new Set(evidence.flatMap(e=>e.reviews.map(r=>r.id))),finalIds=new Set(evidence.map(e=>e.finalId)),generatedAt=new Date().toISOString();
  const manifest={schemaVersion:REPORT_VERSION,templateVersion:REPORT_VERSION,template,domain:p.domain,domainLabel:label(p.domain),title:`${label(p.domain)} — ${template.title}`,generatedAt,cutoffAt:source.cutoffAt,latestAuditAt:audits[0]?.occurredAt,methodologyVersion:METHOD,methodology:REPORT_METHOD,limitations:REPORT_LIMITATIONS,totalResults:source.totalResults,eligibleResults:source.eligibleResults,exclusions:source.exclusions,rows:source.rows,metrics:metrics(source.selected,source.d.reviews.filter(r=>reviewIds.has(r.id)),source.d.finals.filter(f=>finalIds.has(f.id))),evidence,audits};
  manifest.markdown=reportMarkdown(manifest);const artifact=await store(b,manifest);
  const saved=await b.asServiceRole.entities.DomainReport.create({title:manifest.title,domain:p.domain,templateId:template.id,templateVersion:REPORT_VERSION,snapshotHash:artifact.hash,snapshotUri:artifact.uri,generatedAt,cutoffAt:source.cutoffAt,generatedBy:user.id,taskIds:[...new Set(evidence.map(e=>e.taskId))],resultCount:evidence.length,auditCount:audits.length});
  await audit(b,user,'domain_report_generated',saved.id,'',{snapshotHash:artifact.hash,domain:p.domain,resultCount:evidence.length});
  return {report:summary(saved)};
}