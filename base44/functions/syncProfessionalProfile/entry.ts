import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { profileConnectors, loadProfileAccount, loadProfileWork } from '../../shared/professionalProfileProviders.ts';

export default async function(req) {
  try {
    const b = createClientFromRequest(req);
    const user = await b.auth.me();
    if (!user) return Response.json({ error: 'Sign in to connect your professional accounts.' }, { status: 401 });
    const { provider, action = 'status' } = await req.json();
    if (!Object.hasOwn(profileConnectors, provider) || !['status', 'sync', 'remove'].includes(action)) return Response.json({ error: 'Invalid profile request.' }, { status: 400 });
    // Never accept an owner, account identity, or profile content from the caller.
    const records = b.asServiceRole.entities.ProfessionalProfile;
    const filter = { userId: user.id, provider };
    if (action === 'remove') {
      await records.deleteMany(filter);
      return Response.json({ removed: true });
    }
    let accessToken;
    try { ({ accessToken } = await b.asServiceRole.connectors.getCurrentAppUserConnection(profileConnectors[provider])); }
    catch { return Response.json({ connected: false, error: 'Connect your account to sync its public profile.' }, { status: 409 }); }
    const account = await loadProfileAccount(provider, accessToken);
    if (action === 'status') return Response.json({ connected: true }, { headers: { 'Cache-Control': 'no-store' } });
    const items = await loadProfileWork(provider, accessToken, account);
    const snapshot = { userId: user.id, provider, ...account, items, syncedAt: new Date().toISOString() };
    const existing = await records.filter(filter, '-updated_date', 1);
    const profile = existing.length ? await records.update(existing[0].id, snapshot) : await records.create(snapshot);
    return Response.json({ connected: true, profile }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to sync this profile. Try again.' }, { status: 500 });
  }
}