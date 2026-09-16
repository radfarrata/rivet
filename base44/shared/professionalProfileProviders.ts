import { githubFetch } from './githubApi.ts';
export const profileConnectors = { github: '6aa93326ea3e93a0d60330a3', linkedin: '6aaa5136cb10312ea7757fec', hugging_face: '6aaa51385d88ab7fb8aee738' };
const json = async (url, token) => {
  const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, redirect: 'error' });
  if (!response.ok) throw new Error(`Profile service returned ${response.status}. Please retry or reconnect your account.`);
  return response.json();
};
const text = value => typeof value === 'string' ? value.slice(0, 2000) : '';
export async function loadProfileAccount(provider, token) {
  if (provider === 'github') {
    const a = await githubFetch('/user', token);
    if (!a.id || !a.login) throw new Error('GitHub did not return an account identity.');
    return { providerAccountId: String(a.id), displayName: text(a.name || a.login), username: a.login, profileUrl: `https://github.com/${encodeURIComponent(a.login)}`, bio: text(a.bio), location: text(a.location), company: text(a.company), publicRepos: a.public_repos || 0, followers: a.followers || 0 };
  }
  const a = await json(provider === 'linkedin' ? 'https://api.linkedin.com/v2/userinfo' : 'https://huggingface.co/oauth/userinfo', token);
  if (!a.sub) throw new Error('The provider did not return an account identity.');
  const username = provider === 'hugging_face' ? text(a.preferred_username) : '';
  if (provider === 'hugging_face' && !username) throw new Error('Hugging Face did not return a username. Reconnect with profile permission.');
  return { providerAccountId: String(a.sub), displayName: text(a.name || username || 'LinkedIn member'), username, profileUrl: username ? `https://huggingface.co/${encodeURIComponent(username)}` : '', bio: '', location: '', company: '' };
}
export async function loadProfileWork(provider, token, account) {
  if (provider === 'linkedin') return [];
  if (provider === 'github') {
    const repos = await githubFetch(`/users/${encodeURIComponent(account.username)}/repos?type=owner&sort=updated&per_page=6`, token);
    return repos.filter(r => !r.private).map(r => ({ title: text(r.full_name), url: `https://github.com/${encodeURIComponent(r.owner.login)}/${encodeURIComponent(r.name)}`, description: text(r.description), kind: r.fork ? 'Fork' : 'Repository', stars: r.stargazers_count || 0 }));
  }
  // Hub identity and repository endpoints are separate from the inference router.
  const groups = await Promise.all(['models', 'datasets', 'spaces'].map(async kind => {
    const items = await json(`https://huggingface.co/api/${kind}?author=${encodeURIComponent(account.username)}&limit=3&sort=lastModified&direction=-1`);
    return items.filter(item => !item.private).map(item => ({ title: text(item.id), url: `https://huggingface.co/${kind === 'models' ? '' : kind + '/'}${item.id.split('/').map(encodeURIComponent).join('/')}`, description: text(item.pipeline_tag), kind: kind === 'models' ? 'Model' : kind === 'datasets' ? 'Dataset' : 'Space' }));
  }));
  return groups.flat();
}