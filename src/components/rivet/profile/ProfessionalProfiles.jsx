import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { profileProviders } from '@/components/rivet/profile/profileProviders';
import ProfessionalProfileCard from '@/components/rivet/profile/ProfessionalProfileCard';
import ProfileConnectionControls from '@/components/rivet/profile/ProfileConnectionControls';

export default function ProfessionalProfiles({ userId, currentUser }) {
  const client = useQueryClient();
  const [authed, setAuthed] = useState(null);
  useEffect(() => { let active = true; base44.auth.isAuthenticated().then(value => { if (active) setAuthed(value); }); return () => { active = false; }; }, []);
  const owner = Boolean(userId && userId === currentUser?.id);
  const { data: profiles = [], isLoading, error, refetch } = useQuery({ queryKey: ['professional-profiles', userId], queryFn: () => base44.entities.ProfessionalProfile.filter({ userId }, '-syncedAt', 20), enabled: Boolean(authed && userId) });
  const onSaved = useCallback(() => { client.invalidateQueries({ queryKey: ['professional-profiles', userId] }); }, [client, userId]);
  if (!userId) return null;
  return <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 text-card-foreground">
    <h2 className="text-lg font-bold">Professional profile & public work</h2>
    <p className="mt-1 text-sm text-muted-foreground">Source-linked evidence for your résumé. A linked account confirms account access—not qualifications, employment, or expertise.</p>
    {owner && <p className="mt-2 text-xs text-muted-foreground">Connecting and syncing displays your public profile and work to profile visitors. Private repositories and email addresses are never shown. Disconnecting removes the saved profile.</p>}
    {authed === null || (authed && isLoading) ? <p role="status" className="mt-4 text-sm text-muted-foreground">Loading professional profiles…</p> : !authed ? <button onClick={() => base44.auth.redirectToLogin()} className="mt-4 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm">Sign in to view connections</button> : error ? <div role="alert" className="mt-4 text-sm text-destructive">Unable to load profiles. <button onClick={() => refetch()} className="underline">Retry</button></div> : <div className="mt-5 grid grid-cols-1 xl:grid-cols-3 gap-4">
      {profileProviders.filter(provider => owner || profiles.some(p => p.provider === provider.key)).map(provider => {
        const profile = profiles.find(p => p.provider === provider.key);
        return <ProfessionalProfileCard key={provider.key} provider={provider} profile={profile}>{owner && <ProfileConnectionControls provider={provider} hasSnapshot={Boolean(profile)} onSaved={onSaved} />}</ProfessionalProfileCard>;
      })}
      {!owner && !profiles.length && <p className="text-sm text-muted-foreground">No professional accounts shared yet.</p>}
    </div>}
  </section>;
}