import type { GitHubRepo, CareerAlignment, CareerPath } from './types';

function clamp(val: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

const pathConfig: Record<CareerPath, { label: string; langs: string[]; keywords: string[] }> = {
  frontend: {
    label: 'Frontend Developer',
    langs: ['JavaScript', 'TypeScript', 'CSS', 'HTML'],
    keywords: ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'tailwind', 'frontend', 'ui', 'ux', 'component', 'web app'],
  },
  backend: {
    label: 'Backend Developer',
    langs: ['Python', 'Java', 'Go', 'Rust', 'C#', 'Ruby', 'TypeScript', 'PHP'],
    keywords: ['api', 'server', 'database', 'rest', 'graphql', 'microservice', 'backend', 'auth', 'middleware', 'queue'],
  },
  fullstack: {
    label: 'Full-Stack Developer',
    langs: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go'],
    keywords: ['fullstack', 'full-stack', 'webapp', 'saas', 'mern', 'mean', 'next', 'nuxt', 'deployment'],
  },
  devops: {
    label: 'DevOps Engineer',
    langs: ['Python', 'Go', 'Shell', 'HCL', 'TypeScript'],
    keywords: ['docker', 'kubernetes', 'ci', 'cd', 'terraform', 'ansible', 'devops', 'infrastructure', 'pipeline', 'monitoring', 'deploy'],
  },
  ml: {
    label: 'ML Engineer',
    langs: ['Python', 'R', 'Julia', 'C++'],
    keywords: ['machine learning', 'deep learning', 'neural', 'tensorflow', 'pytorch', 'ml', 'ai', 'data', 'model', 'training', 'nlp'],
  },
};

function calcAlignment(repos: GitHubRepo[], path: CareerPath): CareerAlignment {
  const config = pathConfig[path];
  const own = repos.filter((r) => !r.fork);
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  // Language match
  const langRepos = own.filter((r) => config.langs.includes(r.language || ''));
  const langRatio = own.length > 0 ? langRepos.length / own.length : 0;
  if (langRatio >= 0.5) { score += 30; strengths.push(`Strong ${config.langs.slice(0, 3).join('/')} usage`); }
  else if (langRatio >= 0.2) { score += 15; }
  else gaps.push(`Limited ${config.langs.slice(0, 2).join('/')} projects`);

  // Keyword match in descriptions & topics
  const matchedRepos = own.filter((r) => {
    const text = `${r.description || ''} ${(r.topics || []).join(' ')} ${r.name}`.toLowerCase();
    return config.keywords.some((kw) => text.includes(kw));
  });
  if (matchedRepos.length >= 3) { score += 30; strengths.push(`${matchedRepos.length} relevant projects`); }
  else if (matchedRepos.length >= 1) { score += 15; strengths.push(`${matchedRepos.length} relevant project(s)`); }
  else gaps.push(`No ${config.label.toLowerCase()}-specific projects`);

  // Project depth (stars + size)
  const relevantStars = matchedRepos.reduce((s, r) => s + r.stargazers_count, 0);
  if (relevantStars >= 10) { score += 15; strengths.push('Community-validated work'); }
  else if (relevantStars >= 3) score += 8;
  else gaps.push('Need more community validation');

  // Diversity within domain
  const domainLangs = new Set(matchedRepos.map((r) => r.language).filter(Boolean));
  if (domainLangs.size >= 2) { score += 10; strengths.push('Multi-tool approach'); }

  // Deployments
  const deployed = matchedRepos.filter((r) => r.homepage);
  if (deployed.length >= 1) { score += 15; strengths.push('Deployed/live projects'); }
  else gaps.push('No deployed projects in this domain');

  return { path, label: config.label, readiness: clamp(score), strengths, gaps };
}

export function calcCareerAlignments(repos: GitHubRepo[]): CareerAlignment[] {
  return (['frontend', 'backend', 'fullstack', 'devops', 'ml'] as CareerPath[]).map((p) =>
    calcAlignment(repos, p)
  );
}
