import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const connectorId = '6aa93326ea3e93a0d60330a3';
const parseRepo = (url) => {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?\/?$/.exec(url || '');
  return match ? { owner: match[1], repo: match[2] } : null;
};
import { githubFetch } from '../../shared/githubApi.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Administrator required.' }, { status: 403 });
    const { action = 'status' } = await req.json();
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);
    const account = await githubFetch('/user', accessToken);
    const versions = await base44.asServiceRole.entities.ModelVersion.list('-updated_date', 500);
    const linked = versions.filter(version => parseRepo(version.githubUrl));
    const latestSync = linked.map(version => version.repositoryMetadataSyncedAt).filter(Boolean).sort().at(-1) || null;
    if (action === 'status') return Response.json({ connected: true, login: account.login, total: versions.length, linked: linked.length, latestSync });
    if (action !== 'refresh') return Response.json({ error: 'Unknown action.' }, { status: 400 });
    const repositories = [...new Map(linked.map(version => [version.githubUrl, parseRepo(version.githubUrl)])).entries()];
    const results = await Promise.all(repositories.map(async ([url, repo]) => {
      try {
        const info = await githubFetch(`/repos/${repo.owner}/${repo.repo}`, accessToken);
        const [commit, release] = await Promise.all([githubFetch(`/repos/${repo.owner}/${repo.repo}/commits/${encodeURIComponent(info.default_branch)}`, accessToken), githubFetch(`/repos/${repo.owner}/${repo.repo}/releases/latest`, accessToken, true)]);
        return { url, metadata: { fullName: info.full_name, description: info.description, defaultBranch: info.default_branch, archived: info.archived, visibility: info.visibility, stars: info.stargazers_count, forks: info.forks_count, openIssues: info.open_issues_count, license: info.license?.spdx_id || null, createdAt: info.created_at, updatedAt: info.updated_at, pushedAt: info.pushed_at, latestReleaseTag: release?.tag_name || null, latestReleasePublishedAt: release?.published_at || null, latestCommitSha: commit.sha, latestCommitDate: commit.commit?.committer?.date || null, apiSource: info.url }, commitSha: commit.sha };
      } catch (error) { return { url, error: error.message }; }
    }));
    const syncedAt = new Date().toISOString();
    const successful = results.filter(result => result.metadata);
    const byUrl = new Map(successful.map(result => [result.url, result]));
    const updates = linked.filter(version => byUrl.has(version.githubUrl)).map(version => { const result = byUrl.get(version.githubUrl); return { id: version.id, repositoryMetadata: result.metadata, repositoryMetadataSourceUrl: version.githubUrl, repositoryMetadataSyncedAt: syncedAt, repositoryMetadataCommitSha: result.commitSha }; });
    if (updates.length) await base44.asServiceRole.entities.ModelVersion.bulkUpdate(updates);
    return Response.json({ connected: true, login: account.login, syncedAt, updatedVersions: updates.length, updatedRepositories: successful.length, skippedWithoutCanonicalGitHubUrl: versions.length - linked.length, failures: results.filter(result => result.error) });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to refresh repository metadata.' }, { status: 500 });
  }
}