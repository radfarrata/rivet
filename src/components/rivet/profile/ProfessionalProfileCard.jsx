import React from 'react';
import { ExternalLink, Link2 } from 'lucide-react';

export default function ProfessionalProfileCard({ provider, profile, children }) {
  return <article className="min-w-0 rounded-2xl border border-border bg-card p-4 text-card-foreground">
    <div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{provider.name}</h3>{profile && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Link2 size={12} /> Account linked</span>}</div>
    {profile ? <div className="mt-3 space-y-2">
      <p className="font-medium break-words">{profile.displayName}{profile.username && <span className="block text-xs text-muted-foreground">@{profile.username}</span>}</p>
      {profile.profileUrl && <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs underline">View source profile <ExternalLink size={12} /></a>}
      {profile.bio && <p className="whitespace-pre-wrap text-sm break-words">{profile.bio}</p>}
      {(profile.company || profile.location) && <p className="text-xs text-muted-foreground">{[profile.company, profile.location].filter(Boolean).join(' · ')} (self-reported)</p>}
      {provider.key === 'github' && <p className="text-xs text-muted-foreground">{profile.publicRepos ?? 0} public repositories · {profile.followers ?? 0} followers</p>}
      {profile.items?.length > 0 && <ul className="divide-y divide-border">{profile.items.map(item => <li key={item.url} className="py-2 text-sm">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="break-words underline">{item.title}</a>
        <p className="text-xs text-muted-foreground">{item.kind}{item.stars != null ? ` · ${item.stars} stars` : ''}</p>
        {item.description && <p className="text-xs text-muted-foreground break-words">{item.description}</p>}
      </li>)}</ul>}
      {provider.key !== 'linkedin' && !profile.items?.length && <p className="text-xs text-muted-foreground">No public work returned at the last sync.</p>}
      <p className="text-xs text-muted-foreground">Last synced {new Date(profile.syncedAt).toLocaleString()}</p>
    </div> : <p className="mt-3 text-sm text-muted-foreground">No profile synced yet.</p>}
    <p className="mt-3 text-xs text-muted-foreground">{provider.description}</p>
    {children}
  </article>;
}