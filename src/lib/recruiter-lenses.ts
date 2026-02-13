import type { GitHubRepo, GitHubEvent, GitHubUser, RecruiterLensResult, RepoReadme } from './types';

function clamp(val: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function generateVerdict(lens: string, score: number, highlights: string[], concerns: string[]): string {
  if (lens === 'startup') {
    if (score >= 70) return `Strong shipping velocity and product awareness. ${highlights[0] ? highlights[0] + '.' : ''} Would advance to technical interview.`;
    if (score >= 45) return `Moderate potential — shows initiative but lacks ${concerns[0]?.toLowerCase() || 'deployed demos'}. Would request live demo before moving forward.`;
    return `Insufficient shipping signals. ${concerns.slice(0, 2).map(c => c.toLowerCase()).join(' and ')}. Needs portfolio polish before startup readiness.`;
  }
  if (lens === 'enterprise') {
    if (score >= 70) return `Strong engineering discipline with documented practices. ${highlights[0] ? highlights[0] + '.' : ''} Fits enterprise standards.`;
    if (score >= 45) return `Some structure present but ${concerns[0]?.toLowerCase() || 'gaps in test coverage'}. Risk for large-scale systems without more maturity signals.`;
    return `Insufficient test coverage and documentation signals. ${concerns.slice(0, 2).map(c => c.toLowerCase()).join(' and ')}. Not enterprise-ready yet.`;
  }
  // aiml
  if (score >= 70) return `Clear ML/AI specialization with research depth. ${highlights[0] ? highlights[0] + '.' : ''} Strong candidate for technical roles.`;
  if (score >= 45) return `Some AI/ML exposure but ${concerns[0]?.toLowerCase() || 'lacks experiment tracking'}. Would probe for deeper ML system design knowledge.`;
  return `No significant ML/AI portfolio signals. ${concerns.slice(0, 2).map(c => c.toLowerCase()).join(' and ')}. Needs dedicated ML projects to be competitive.`;
}

function calcStartupScore(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[], readmes: RepoReadme[]): RecruiterLensResult {
  const own = repos.filter((r) => !r.fork);
  let score = 0;
  const highlights: string[] = [];
  const concerns: string[] = [];

  const pushEvents = events.filter((e) => e.type === 'PushEvent');
  if (pushEvents.length > 10) { score += 20; highlights.push('High shipping velocity'); }
  else if (pushEvents.length > 3) score += 10;
  else concerns.push('Low shipping frequency');

  const withHomepage = own.filter((r) => r.homepage);
  if (withHomepage.length >= 2) { score += 20; highlights.push(`${withHomepage.length} deployed projects`); }
  else if (withHomepage.length === 1) score += 10;
  else concerns.push('No deployed projects found');

  const withDesc = own.filter((r) => r.description && r.description.length > 20);
  if (withDesc.length >= own.length * 0.6) { score += 15; highlights.push('Clear product descriptions'); }
  else concerns.push('Most repos lack clear descriptions');

  const langs = new Set(own.map((r) => r.language).filter(Boolean));
  if (langs.size >= 3) { score += 15; highlights.push(`${langs.size} technologies used`); }
  else score += 5;

  const stars = own.reduce((s, r) => s + r.stargazers_count, 0);
  if (stars >= 20) { score += 15; highlights.push(`${stars} community stars`); }
  else if (stars >= 5) score += 8;

  const avgReadme = readmes.length > 0 ? readmes.reduce((s, r) => s + r.analysis.score, 0) / readmes.length : 0;
  if (avgReadme >= 50) { score += 15; highlights.push('Good documentation'); }
  else if (avgReadme >= 25) score += 8;
  else concerns.push('READMEs need improvement');

  const finalScore = clamp(score);
  return { lens: 'startup', label: 'Startup Recruiter', emoji: '🏢', score: finalScore, highlights, concerns, verdict: generateVerdict('startup', finalScore, highlights, concerns) };
}

function calcEnterpriseScore(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[], readmes: RepoReadme[]): RecruiterLensResult {
  const own = repos.filter((r) => !r.fork);
  let score = 0;
  const highlights: string[] = [];
  const concerns: string[] = [];

  const withTests = own.filter((r) => {
    const d = (r.description || '').toLowerCase();
    const t = (r.topics || []).join(' ').toLowerCase();
    return d.includes('test') || t.includes('test') || t.includes('ci') || t.includes('docker');
  });
  if (withTests.length >= 2) { score += 20; highlights.push('Testing/CI signals detected'); }
  else concerns.push('No testing or CI signals found');

  const avgReadme = readmes.length > 0 ? readmes.reduce((s, r) => s + r.analysis.score, 0) / readmes.length : 0;
  if (avgReadme >= 60) { score += 20; highlights.push('Strong documentation practices'); }
  else if (avgReadme >= 30) score += 10;
  else concerns.push('Documentation needs significant improvement');

  const withLicense = own.filter((r) => r.license).length;
  if (withLicense >= own.length * 0.5) { score += 15; highlights.push('Proper licensing practices'); }
  else concerns.push('Most repos lack licenses');

  const structured = own.filter((r) => r.topics && r.topics.length >= 2);
  if (structured.length >= 3) { score += 15; highlights.push('Well-organized repositories'); }
  else score += 5;

  const pushDays = new Set(events.filter((e) => e.type === 'PushEvent').map((e) => e.created_at.slice(0, 10)));
  if (pushDays.size >= 10) { score += 15; highlights.push('Consistent commit history'); }
  else if (pushDays.size >= 5) score += 8;
  else concerns.push('Inconsistent activity pattern');

  const prEvents = events.filter((e) => e.type === 'PullRequestEvent').length;
  if (prEvents >= 3) { score += 15; highlights.push('Active PR participation'); }
  else concerns.push('Limited PR/review activity');

  const finalScore = clamp(score);
  return { lens: 'enterprise', label: 'Enterprise Recruiter', emoji: '🏦', score: finalScore, highlights, concerns, verdict: generateVerdict('enterprise', finalScore, highlights, concerns) };
}

function calcAimlScore(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[], readmes: RepoReadme[]): RecruiterLensResult {
  const own = repos.filter((r) => !r.fork);
  let score = 0;
  const highlights: string[] = [];
  const concerns: string[] = [];

  const mlKeywords = ['machine learning', 'deep learning', 'neural', 'tensorflow', 'pytorch', 'ml', 'ai', 'nlp', 'computer vision', 'data science', 'model', 'training', 'dataset', 'notebook'];

  const mlRepos = own.filter((r) => {
    const text = `${r.description || ''} ${(r.topics || []).join(' ')} ${r.name}`.toLowerCase();
    return mlKeywords.some((kw) => text.includes(kw));
  });
  if (mlRepos.length >= 3) { score += 25; highlights.push(`${mlRepos.length} ML/AI repositories`); }
  else if (mlRepos.length >= 1) { score += 12; highlights.push(`${mlRepos.length} ML/AI repo(s) found`); }
  else concerns.push('No ML/AI projects detected');

  const mlLangs = own.filter((r) => ['Python', 'R', 'Julia'].includes(r.language || ''));
  if (mlLangs.length >= 2) { score += 20; highlights.push('ML-focused language stack'); }
  else if (mlLangs.length >= 1) score += 10;
  else concerns.push('No Python/R/Julia projects found');

  const notebooks = own.filter((r) => r.name.toLowerCase().includes('notebook') || (r.topics || []).includes('jupyter'));
  if (notebooks.length >= 1) { score += 15; highlights.push('Jupyter notebook projects'); }

  const researchRepos = own.filter((r) => {
    const text = `${r.description || ''} ${(r.topics || []).join(' ')}`.toLowerCase();
    return text.includes('paper') || text.includes('research') || text.includes('experiment') || text.includes('benchmark');
  });
  if (researchRepos.length >= 1) { score += 15; highlights.push('Research-oriented projects'); }
  else concerns.push('No research or paper implementations');

  const avgReadme = readmes.length > 0 ? readmes.reduce((s, r) => s + r.analysis.score, 0) / readmes.length : 0;
  if (avgReadme >= 50) { score += 15; highlights.push('Well-documented experiments'); }
  else concerns.push('Experiment documentation lacking');

  const mlStars = mlRepos.reduce((s, r) => s + r.stargazers_count, 0);
  if (mlStars >= 10) { score += 10; highlights.push(`${mlStars} stars on ML projects`); }

  const finalScore = clamp(score);
  return { lens: 'aiml', label: 'AI/ML Recruiter', emoji: '🤖', score: finalScore, highlights, concerns, verdict: generateVerdict('aiml', finalScore, highlights, concerns) };
}

export function calcRecruiterLenses(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[], readmes: RepoReadme[]): RecruiterLensResult[] {
  return [
    calcStartupScore(user, repos, events, readmes),
    calcEnterpriseScore(user, repos, events, readmes),
    calcAimlScore(user, repos, events, readmes),
  ];
}
