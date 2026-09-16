export const githubFetch = async (path, token, optional = false) => {
  const response = await fetch(`https://api.github.com${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Rivet-Model-Metadata' } });
  if (optional && response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub returned ${response.status} for ${path}.`);
  return response.json();
};