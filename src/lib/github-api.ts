import type { GitHubUser, GitHubRepo, GitHubEvent } from './types';

const BASE_URL = 'https://api.github.com';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error('User not found');
    if (res.status === 403) throw new Error('API rate limit exceeded. Try again later.');
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  return fetchJSON<GitHubUser>(`${BASE_URL}/users/${username}`);
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  return fetchJSON<GitHubRepo[]>(
    `${BASE_URL}/users/${username}/repos?per_page=100&sort=updated&direction=desc`
  );
}

export async function fetchGitHubEvents(username: string): Promise<GitHubEvent[]> {
  return fetchJSON<GitHubEvent[]>(
    `${BASE_URL}/users/${username}/events/public?per_page=100`
  );
}

export async function fetchRepoReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const data = await fetchJSON<{ content: string; encoding: string }>(
      `${BASE_URL}/repos/${owner}/${repo}/readme`
    );
    if (data.encoding === 'base64') {
      return atob(data.content.replace(/\n/g, ''));
    }
    return data.content;
  } catch {
    return null;
  }
}

export async function fetchRepoTree(owner: string, repo: string, branch: string): Promise<{ path: string }[]> {
  try {
    const data = await fetchJSON<{ tree: { path: string; type: string }[] }>(
      `${BASE_URL}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );
    return data.tree.map((t) => ({ path: t.path }));
  } catch {
    return [];
  }
}

export async function fetchRepoCommits(owner: string, repo: string): Promise<{ message: string }[]> {
  try {
    const data = await fetchJSON<{ commit: { message: string } }[]>(
      `${BASE_URL}/repos/${owner}/${repo}/commits?per_page=30`
    );
    return data.map((c) => ({ message: c.commit.message }));
  } catch {
    return [];
  }
}

export async function fetchAllGitHubData(username: string, onProgress?: (stage: string, percent: number) => void) {
  onProgress?.('Fetching profile & repos...', 10);
  const [user, repos, events] = await Promise.all([
    fetchGitHubUser(username),
    fetchGitHubRepos(username),
    fetchGitHubEvents(username),
  ]);

  onProgress?.('Analyzing READMEs...', 40);

  // Fetch READMEs for top 5 non-fork repos
  const topRepos = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  const readmes = await Promise.all(
    topRepos.map(async (r) => ({
      repoName: r.name,
      content: await fetchRepoReadme(username, r.name),
    }))
  );

  onProgress?.('Scanning repo structures...', 60);

  // Fetch repo trees for top 3
  const topForTree = topRepos.slice(0, 3);
  const trees = await Promise.all(
    topForTree.map(async (r) => ({
      repoName: r.name,
      files: await fetchRepoTree(username, r.name, r.default_branch),
    }))
  );

  onProgress?.('Analyzing commit quality...', 80);

  // Fetch commits for top 3
  const commits = await Promise.all(
    topForTree.map(async (r) => ({
      repoName: r.name,
      messages: await fetchRepoCommits(username, r.name),
    }))
  );

  onProgress?.('Generating insights...', 95);

  return {
    user,
    repos,
    events,
    readmes: readmes.filter((r) => r.content !== null) as { repoName: string; content: string }[],
    trees,
    commits,
  };
}
