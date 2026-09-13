import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
export default function ReportMarkdown({ markdown }) {
  const blocks=[];
  for(const line of markdown.split('\n')){const table=line.startsWith('|');if(!blocks.length||blocks[blocks.length-1].table!==table)blocks.push({table,lines:[]});blocks[blocks.length-1].lines.push(line);}
  const components={h1:({children})=><h1 className="text-2xl font-bold tracking-tight mb-4">{children}</h1>,h2:({children})=><h2 className="text-lg font-semibold border-t border-border pt-6 mt-8 mb-3">{children}</h2>,h3:({children})=><h3 className="text-sm font-semibold mt-5 mb-2">{children}</h3>,p:({children})=><p className="text-sm leading-relaxed mb-3 break-words">{children}</p>,ul:({children})=><ul className="list-disc pl-5 space-y-2 text-sm mb-4">{children}</ul>,a:({href,children})=><Link to={href} className="underline underline-offset-4">{children}</Link>};
  const cells=line=>line.slice(1,-1).split('|').map(cell=>cell.trim());
  return <article className="space-y-3">{blocks.map((block,index)=>!block.table?<ReactMarkdown key={index} components={components}>{block.lines.join('\n')}</ReactMarkdown>:<div key={index} className="overflow-x-auto rounded-lg border border-border"><table className="w-full text-left text-xs"><thead className="bg-muted/50"><tr>{cells(block.lines[0]).map((cell,i)=><th scope="col" key={i} className="p-3 font-semibold"><ReactMarkdown>{cell}</ReactMarkdown></th>)}</tr></thead><tbody>{block.lines.slice(2).map((line,i)=><tr key={i} className="border-t border-border">{cells(line).map((cell,j)=><td key={j} className="p-3 align-top"><ReactMarkdown>{cell}</ReactMarkdown></td>)}</tr>)}</tbody></table></div>)}</article>;
}