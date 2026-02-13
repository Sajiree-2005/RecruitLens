import type {
  GitHubUser,
  GitHubRepo,
  GitHubEvent,
  AnalysisResult,
  ScoreBreakdown,
  Signal,
  Recommendation,
  SignalConfidence,
  SimulationScenario,
  RepoReadme,
  FirstImpressionResult,
  RepoStructureAnalysis,
  CommitMessageQuality,
  DiscoverabilityScore,
  RecruiterSnapshot,
} from './types';
import { analyzeReadmes } from './readme-analyzer';
import { calcRecruiterLenses } from './recruiter-lenses';
import { calcCareerAlignments } from './career-alignment';
import { analyzeAllRepoStructures, analyzeCommitMessages } from './repo-structure-analyzer';

function clamp(val: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

// ──── Score Calculators ────

function calcProfileCompleteness(user: GitHubUser): number {
  let score = 0;
  if (user.name) score += 20;
  if (user.bio) score += 20;
  if (user.blog) score += 15;
  if (user.location) score += 10;
  if (user.company) score += 10;
  if (user.email) score += 10;
  if (user.twitter_username) score += 5;
  if (user.hireable) score += 5;
  if (user.avatar_url && !user.avatar_url.includes('identicon')) score += 5;
  return clamp(score);
}

function calcRepoQuality(repos: GitHubRepo[]): number {
  const own = repos.filter((r) => !r.fork);
  if (own.length === 0) return 0;
  let score = 0;
  score += Math.min(own.length * 3, 20);
  const totalStars = own.reduce((s, r) => s + r.stargazers_count, 0);
  score += Math.min(totalStars * 2, 20);
  const withDesc = own.filter((r) => r.description && r.description.length > 10).length;
  score += (withDesc / own.length) * 20;
  const withTopics = own.filter((r) => r.topics && r.topics.length > 0).length;
  score += (withTopics / own.length) * 15;
  const withLicense = own.filter((r) => r.license).length;
  score += (withLicense / own.length) * 10;
  const withHomepage = own.filter((r) => r.homepage).length;
  score += (withHomepage / own.length) * 15;
  return clamp(score);
}

function calcCommitConsistency(events: GitHubEvent[]): number {
  const pushEvents = events.filter((e) => e.type === 'PushEvent');
  if (pushEvents.length === 0) return 10;
  const days = new Set(pushEvents.map((e) => e.created_at.slice(0, 10)));
  let score = 0;
  score += Math.min(days.size * 4, 50);
  score += Math.min(pushEvents.length * 1.5, 30);
  if (pushEvents.length > 0) {
    const latest = new Date(pushEvents[0].created_at);
    const daysSince = (Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) score += 20;
    else if (daysSince < 30) score += 10;
  }
  return clamp(score);
}

function calcDocumentation(repos: GitHubRepo[], readmes: RepoReadme[]): number {
  const own = repos.filter((r) => !r.fork);
  if (own.length === 0) return 0;
  let score = 0;
  const withDesc = own.filter((r) => r.description && r.description.length > 20).length;
  score += (withDesc / own.length) * 25;
  const withTopics = own.filter((r) => r.topics && r.topics.length >= 2).length;
  score += (withTopics / own.length) * 20;
  const withHomepage = own.filter((r) => r.homepage).length;
  score += (withHomepage / own.length) * 15;

  // README quality bonus
  if (readmes.length > 0) {
    const avgReadme = readmes.reduce((s, r) => s + r.analysis.score, 0) / readmes.length;
    score += (avgReadme / 100) * 40;
  }

  return clamp(score);
}

function calcCommunityEngagement(user: GitHubUser, events: GitHubEvent[]): number {
  let score = 0;
  score += Math.min(user.followers * 2, 30);
  score += Math.min(user.public_gists * 3, 15);
  const prEvents = events.filter((e) => e.type === 'PullRequestEvent').length;
  score += Math.min(prEvents * 5, 25);
  const issueEvents = events.filter((e) => e.type === 'IssuesEvent').length;
  score += Math.min(issueEvents * 3, 15);
  const forkEvents = events.filter((e) => e.type === 'ForkEvent').length;
  score += Math.min(forkEvents * 3, 15);
  return clamp(score);
}

function calcProjectDiversity(repos: GitHubRepo[]): number {
  const own = repos.filter((r) => !r.fork);
  const languages = new Set(own.map((r) => r.language).filter(Boolean));
  let score = 0;
  score += Math.min(languages.size * 12, 50);
  score += Math.min(own.length * 3, 30);
  const allTopics = new Set(own.flatMap((r) => r.topics || []));
  score += Math.min(allTopics.size * 3, 20);
  return clamp(score);
}

function calcOwnershipDepth(repos: GitHubRepo[], events: GitHubEvent[]): number {
  const own = repos.filter((r) => !r.fork);
  if (own.length === 0) return 0;
  let score = 0;

  // Large codebases
  const largerepos = own.filter((r) => r.size > 500);
  score += Math.min(largerepos.length * 8, 25);

  // Long-lived repos (> 6 months old)
  const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
  const longLived = own.filter((r) => new Date(r.created_at).getTime() < sixMonthsAgo);
  score += Math.min(longLived.length * 5, 20);

  // Multi-commit per project (events spread across repos)
  const repoCommitMap: Record<string, number> = {};
  events.filter((e) => e.type === 'PushEvent').forEach((e) => {
    repoCommitMap[e.repo.name] = (repoCommitMap[e.repo.name] || 0) + 1;
  });
  const multiCommit = Object.values(repoCommitMap).filter((c) => c >= 3).length;
  score += Math.min(multiCommit * 8, 30);

  // Complex descriptions
  const complexDesc = own.filter((r) => r.description && r.description.length > 50);
  score += Math.min(complexDesc.length * 5, 25);

  return clamp(score);
}

function calcEngineeringMaturity(repos: GitHubRepo[]): number {
  const own = repos.filter((r) => !r.fork);
  if (own.length === 0) return 0;
  let score = 0;

  // CI/CD & Docker signals
  const ciKeywords = ['ci', 'cd', 'docker', 'kubernetes', 'github-actions', 'travis', 'circleci', 'jenkins', 'test', 'testing', 'jest', 'pytest', 'mocha'];
  const withCI = own.filter((r) => {
    const text = `${r.description || ''} ${(r.topics || []).join(' ')}`.toLowerCase();
    return ciKeywords.some((kw) => text.includes(kw));
  });
  score += Math.min(withCI.length * 10, 35);

  // Has wiki or pages
  const withWiki = own.filter((r) => r.has_wiki).length;
  score += Math.min(withWiki * 3, 15);
  const withPages = own.filter((r) => r.has_pages).length;
  score += Math.min(withPages * 5, 15);

  // License
  const withLicense = own.filter((r) => r.license).length;
  score += (withLicense / own.length) * 15;

  // Topic richness (3+ topics = mature)
  const richTopics = own.filter((r) => r.topics && r.topics.length >= 3).length;
  score += Math.min(richTopics * 5, 20);

  return clamp(score);
}

function calcImpactScore(repos: GitHubRepo[]): number {
  const own = repos.filter((r) => !r.fork);
  if (own.length === 0) return 0;
  let score = 0;

  const totalStars = own.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = own.reduce((s, r) => s + r.forks_count, 0);

  // Star to repo ratio
  const starRatio = totalStars / own.length;
  score += Math.min(starRatio * 5, 30);

  // Forks (shows usability)
  score += Math.min(totalForks * 3, 25);

  // External links (homepage)
  const withLink = own.filter((r) => r.homepage).length;
  score += Math.min(withLink * 5, 20);

  // Open issues (shows active maintenance)
  const withIssues = own.filter((r) => r.open_issues_count > 0).length;
  score += Math.min(withIssues * 5, 15);

  // Watchers
  const totalWatchers = own.reduce((s, r) => s + r.watchers_count, 0);
  score += Math.min(totalWatchers, 10);

  return clamp(score);
}

// ──── Signals ────

function identifyStrengths(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[]): Signal[] {
  const signals: Signal[] = [];
  const own = repos.filter((r) => !r.fork);
  const totalStars = own.reduce((s, r) => s + r.stargazers_count, 0);

  if (totalStars >= 10) signals.push({ label: 'Star Power', description: `${totalStars} total stars — community validation`, severity: 'high' });
  if (user.followers >= 10) signals.push({ label: 'Growing Network', description: `${user.followers} followers indicates visibility`, severity: 'medium' });
  if (user.bio && user.name && user.blog) signals.push({ label: 'Professional Profile', description: 'Complete profile with bio, name, and website', severity: 'high' });

  const languages = new Set(own.map((r) => r.language).filter(Boolean));
  if (languages.size >= 3) signals.push({ label: 'Polyglot Developer', description: `Proficient in ${languages.size} languages`, severity: 'medium' });

  const recentPush = events.find((e) => e.type === 'PushEvent');
  if (recentPush) {
    const daysSince = (Date.now() - new Date(recentPush.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) signals.push({ label: 'Active Contributor', description: 'Pushed code in the last week', severity: 'high' });
  }

  const withLicense = own.filter((r) => r.license).length;
  if (withLicense >= 3) signals.push({ label: 'Open Source Mindset', description: 'Multiple licensed projects', severity: 'medium' });

  // New: Engineering maturity signals
  const ciRepos = own.filter((r) => (r.topics || []).some((t) => ['docker', 'ci', 'testing', 'github-actions'].includes(t)));
  if (ciRepos.length >= 2) signals.push({ label: 'Engineering Practices', description: 'CI/CD and testing signals detected', severity: 'high' });

  const largerepos = own.filter((r) => r.size > 1000);
  if (largerepos.length >= 2) signals.push({ label: 'Deep Contributor', description: `${largerepos.length} substantial codebases maintained`, severity: 'high' });

  const totalForks = own.reduce((s, r) => s + r.forks_count, 0);
  if (totalForks >= 5) signals.push({ label: 'Community Impact', description: `${totalForks} forks — others build on your work`, severity: 'medium' });

  return signals;
}

function identifyRedFlags(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[]): Signal[] {
  const signals: Signal[] = [];
  const own = repos.filter((r) => !r.fork);
  const forkCount = repos.filter((r) => r.fork).length;

  if (!user.bio) signals.push({ label: 'Missing Bio', description: 'No bio set — recruiters skip profiles without introductions', severity: 'high' });
  if (!user.name) signals.push({ label: 'No Display Name', description: 'Using only username — feels anonymous', severity: 'medium' });

  const withoutDesc = own.filter((r) => !r.description || r.description.length < 10).length;
  if (withoutDesc > own.length * 0.5) signals.push({ label: 'Poor Descriptions', description: `${withoutDesc} repos lack meaningful descriptions`, severity: 'high' });

  const pushEvents = events.filter((e) => e.type === 'PushEvent');
  if (pushEvents.length === 0) signals.push({ label: 'No Recent Activity', description: 'No public commits visible — appears inactive', severity: 'high' });

  if (own.length < 3) signals.push({ label: 'Few Original Projects', description: `Only ${own.length} non-forked repos`, severity: 'medium' });

  // Enhanced red flags
  if (forkCount > 0 && repos.length > 0 && forkCount / repos.length > 0.8)
    signals.push({ label: 'Fork Heavy Profile', description: `${Math.round(forkCount / repos.length * 100)}% of repos are forks — shows limited original work`, severity: 'high' });

  // Inactivity gap
  if (pushEvents.length > 0) {
    const latest = new Date(pushEvents[0].created_at);
    const daysSince = (Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 90) signals.push({ label: 'Extended Inactivity', description: `Last commit was ${Math.round(daysSince)} days ago`, severity: 'high' });
  }

  // Empty repos
  const emptyRepos = own.filter((r) => r.size < 10);
  if (emptyRepos.length >= 3) signals.push({ label: 'Empty Repositories', description: `${emptyRepos.length} repos appear to be empty or minimal`, severity: 'medium' });

  // Tutorial clones
  const tutorialKeywords = ['tutorial', 'course', 'udemy', 'coursera', 'freecodecamp', 'todo-app', 'hello-world', 'learn'];
  const tutorialRepos = own.filter((r) => {
    const text = `${r.name} ${r.description || ''} ${(r.topics || []).join(' ')}`.toLowerCase();
    return tutorialKeywords.some((kw) => text.includes(kw));
  });
  if (tutorialRepos.length >= 3 && own.length > 0 && tutorialRepos.length / own.length > 0.5)
    signals.push({ label: 'Tutorial-Heavy Portfolio', description: `${tutorialRepos.length} repos appear to be tutorial/course projects`, severity: 'medium' });

  const withoutTopics = own.filter((r) => !r.topics || r.topics.length === 0).length;
  if (withoutTopics > own.length * 0.7) signals.push({ label: 'Missing Topics/Tags', description: 'Most repos lack topic tags', severity: 'medium' });

  return signals;
}

// ──── Recommendations with Score Predictions ────

function generateRecommendations(user: GitHubUser, repos: GitHubRepo[], scores: ScoreBreakdown, readmes: RepoReadme[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const own = repos.filter((r) => !r.fork);

  if (scores.profileCompleteness < 70) {
    if (!user.bio) recs.push({ title: 'Add a Professional Bio', description: 'Write 1-2 sentences about your expertise. Recruiters scan bios first.', impact: 'high', category: 'Profile', scoreIncrease: 6 });
    if (!user.blog) recs.push({ title: 'Link Your Portfolio/Website', description: 'Add a personal site or LinkedIn URL for more context.', impact: 'medium', category: 'Profile', scoreIncrease: 4 });
  }

  if (scores.repositoryQuality < 60) {
    recs.push({ title: 'Pin Your Best Repositories', description: 'Select 4-6 repos that showcase your strongest work. Add detailed descriptions and demo links.', impact: 'high', category: 'Repositories', scoreIncrease: 8 });
  }

  if (scores.documentation < 50) {
    recs.push({ title: 'Write Better READMEs', description: 'Add screenshots, setup instructions, tech stack, and project purpose. Include architecture diagrams and deployment instructions.', impact: 'high', category: 'Documentation', scoreIncrease: 9 });
    const noTopics = own.filter((r) => !r.topics || r.topics.length === 0);
    if (noTopics.length > 0)
      recs.push({ title: 'Add Topic Tags', description: `${noTopics.length} repos lack topics. Add 3-5 relevant tags for discoverability.`, impact: 'medium', category: 'Documentation', scoreIncrease: 4 });
  }

  if (scores.commitConsistency < 50)
    recs.push({ title: 'Build a Commit Streak', description: 'Aim for 3-4 commits per week. Consistent activity signals dedication.', impact: 'high', category: 'Activity', scoreIncrease: 7 });

  if (scores.communityEngagement < 40)
    recs.push({ title: 'Contribute to Open Source', description: 'Submit PRs to projects you use. Even docs fixes show collaboration.', impact: 'medium', category: 'Community', scoreIncrease: 5 });

  if (scores.engineeringMaturity < 40)
    recs.push({ title: 'Add Tests & CI/CD', description: 'Add testing frameworks and GitHub Actions to your top 3 repos. Shows engineering rigor.', impact: 'high', category: 'Engineering', scoreIncrease: 8 });

  if (scores.ownershipDepth < 40)
    recs.push({ title: 'Deepen Project Ownership', description: 'Focus on 2-3 projects with sustained commits over months. Deep work beats breadth.', impact: 'high', category: 'Ownership', scoreIncrease: 7 });

  if (readmes.length > 0) {
    const avgScore = readmes.reduce((s, r) => s + r.analysis.score, 0) / readmes.length;
    if (avgScore < 50) {
      const topMissing = readmes[0]?.analysis.missing.slice(0, 3) || [];
      recs.push({
        title: 'Enhance README Quality',
        description: `Your top repos are missing: ${topMissing.join(', ')}. Adding these will dramatically improve recruiter impression.`,
        impact: 'high',
        category: 'Documentation',
        scoreIncrease: 9,
      });
    }
  }

  if (recs.length === 0)
    recs.push({ title: 'Maintain Your Momentum', description: 'Your profile is strong! Keep shipping and documenting. Consider writing technical blog posts.', impact: 'low', category: 'Growth', scoreIncrease: 2 });

  return recs.sort((a, b) => (b.scoreIncrease || 0) - (a.scoreIncrease || 0));
}

// ──── Confidence ────

function calcSignalConfidence(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[], readmes: RepoReadme[]): SignalConfidence {
  const factors: string[] = [];
  let coverage = 0;

  if (repos.length >= 10) { coverage += 20; factors.push('Sufficient repo sample size'); }
  else if (repos.length >= 5) { coverage += 10; factors.push('Moderate repo sample'); }
  else factors.push('Limited repos for analysis');

  if (events.length >= 50) { coverage += 20; factors.push('Rich activity history'); }
  else if (events.length >= 20) { coverage += 10; factors.push('Moderate activity data'); }
  else factors.push('Limited recent activity data');

  if (user.bio && user.name) { coverage += 15; factors.push('Profile identity verified'); }
  if (readmes.length >= 3) { coverage += 20; factors.push('README content analyzed'); }
  else if (readmes.length >= 1) { coverage += 10; factors.push('Partial README data'); }

  const own = repos.filter((r) => !r.fork);
  if (own.length >= 5) { coverage += 15; factors.push('Multiple original projects'); }
  if (events.filter((e) => e.type === 'PushEvent').length >= 10) { coverage += 10; factors.push('Strong commit data'); }

  const score = clamp(coverage);
  const label = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low';

  return { score, label, dataCoverage: score, factors };
}

// ──── Simulations ────

function generateSimulations(scores: ScoreBreakdown, overallScore: number): SimulationScenario[] {
  const scenarios: SimulationScenario[] = [];

  if (scores.documentation < 60)
    scenarios.push({ label: 'Add READMEs to top 3 repos', description: 'Add screenshots, setup instructions, and architecture docs', scoreIncrease: 9, newScore: Math.min(100, overallScore + 9) });

  if (scores.engineeringMaturity < 50)
    scenarios.push({ label: 'Add tests to 3 major repos', description: 'Add testing frameworks and CI/CD pipelines', scoreIncrease: 8, newScore: Math.min(100, overallScore + 8) });

  if (scores.commitConsistency < 50)
    scenarios.push({ label: 'Commit daily for 2 weeks', description: 'Build a consistent commit streak to show dedication', scoreIncrease: 7, newScore: Math.min(100, overallScore + 7) });

  if (scores.profileCompleteness < 70)
    scenarios.push({ label: 'Complete your profile', description: 'Add bio, website, company, and location', scoreIncrease: 5, newScore: Math.min(100, overallScore + 5) });

  if (scores.ownershipDepth < 50)
    scenarios.push({ label: 'Deep-dive into 2 projects', description: 'Add 20+ commits over 3 months to show ownership', scoreIncrease: 7, newScore: Math.min(100, overallScore + 7) });

  if (scores.communityEngagement < 40)
    scenarios.push({ label: 'Submit 5 open-source PRs', description: 'Contribute to projects you use daily', scoreIncrease: 5, newScore: Math.min(100, overallScore + 5) });

  return scenarios.sort((a, b) => b.scoreIncrease - a.scoreIncrease).slice(0, 5);
}

// ──── Language Distribution ────

function getLanguageDistribution(repos: GitHubRepo[]): Record<string, number> {
  const dist: Record<string, number> = {};
  const own = repos.filter((r) => !r.fork && r.language);
  for (const repo of own) dist[repo.language!] = (dist[repo.language!] || 0) + 1;
  return dist;
}

// ──── Main Analyzer ────

export function analyzeProfile(
  user: GitHubUser,
  repos: GitHubRepo[],
  events: GitHubEvent[],
  rawReadmes: { repoName: string; content: string }[] = [],
  trees: { repoName: string; files: { path: string }[] }[] = [],
  commits: { repoName: string; messages: { message: string }[] }[] = []
): AnalysisResult {
  const readmeAnalyses = analyzeReadmes(rawReadmes);
  const repoStructures = analyzeAllRepoStructures(trees);
  const commitQuality = analyzeCommitMessages(commits);

  const scores: ScoreBreakdown = {
    profileCompleteness: calcProfileCompleteness(user),
    repositoryQuality: calcRepoQuality(repos),
    commitConsistency: calcCommitConsistency(events),
    documentation: calcDocumentation(repos, readmeAnalyses),
    communityEngagement: calcCommunityEngagement(user, events),
    projectDiversity: calcProjectDiversity(repos),
    ownershipDepth: calcOwnershipDepth(repos, events),
    engineeringMaturity: calcEngineeringMaturity(repos),
    impactScore: calcImpactScore(repos),
  };

  // Boost engineering maturity with actual structure data
  if (repoStructures.length > 0) {
    const avgStructure = repoStructures.reduce((s, r) => s + r.score, 0) / repoStructures.length;
    scores.engineeringMaturity = clamp(scores.engineeringMaturity * 0.5 + avgStructure * 0.5);
  }

  // Factor commit quality into consistency
  if (commitQuality.totalAnalyzed > 0) {
    scores.commitConsistency = clamp(scores.commitConsistency * 0.7 + commitQuality.score * 0.3);
  }

  const weights = {
    profileCompleteness: 0.1,
    repositoryQuality: 0.15,
    commitConsistency: 0.12,
    documentation: 0.15,
    communityEngagement: 0.08,
    projectDiversity: 0.08,
    ownershipDepth: 0.12,
    engineeringMaturity: 0.12,
    impactScore: 0.08,
  };

  const overallScore = clamp(
    Object.entries(scores).reduce(
      (sum, [key, val]) => sum + val * weights[key as keyof ScoreBreakdown],
      0
    )
  );

  const discoverability = calcDiscoverability(user, repos);
  const recommendations = generateRecommendations(user, repos, scores, readmeAnalyses);
  const recruiterSnapshot = calcRecruiterSnapshot(overallScore, scores, recommendations);

  return {
    user,
    repos,
    events,
    scores,
    strengths: identifyStrengths(user, repos, events),
    redFlags: identifyRedFlags(user, repos, events),
    recommendations,
    overallScore,
    languageDistribution: getLanguageDistribution(repos),
    signalConfidence: calcSignalConfidence(user, repos, events, readmeAnalyses),
    recruiterLenses: calcRecruiterLenses(user, repos, events, readmeAnalyses),
    careerAlignments: calcCareerAlignments(repos),
    simulations: generateSimulations(scores, overallScore),
    readmeAnalyses,
    firstImpression: calcFirstImpression(user, repos, readmeAnalyses, overallScore),
    repoStructures,
    commitQuality,
    discoverability,
    recruiterSnapshot,
  };
}

// ──── Discoverability ────

function calcDiscoverability(user: GitHubUser, repos: GitHubRepo[]): DiscoverabilityScore {
  const own = repos.filter((r) => !r.fork);
  let score = 0;
  const factors: string[] = [];
  const missing: string[] = [];

  const bioLength = (user.bio || '').length;
  if (bioLength >= 100) { score += 20; factors.push(`Rich bio (${bioLength} chars)`); }
  else if (bioLength >= 30) { score += 10; factors.push('Bio present'); }
  else missing.push('Detailed bio (100+ chars)');

  const hasPortfolioLink = !!user.blog;
  if (hasPortfolioLink) { score += 15; factors.push('Portfolio/website linked'); }
  else missing.push('Portfolio link');

  const hasSocialLinks = !!user.twitter_username || !!user.email;
  if (hasSocialLinks) { score += 10; factors.push('Social links present'); }
  else missing.push('Social links (Twitter/email)');

  const hasLinkedIn = user.blog ? /linkedin/i.test(user.blog) : false;
  if (hasLinkedIn) { score += 10; factors.push('LinkedIn linked'); }

  // Profile README (check for a repo named same as username)
  const hasProfileReadme = repos.some((r) => r.name.toLowerCase() === user.login.toLowerCase());
  if (hasProfileReadme) { score += 15; factors.push('Profile README repo found'); }
  else missing.push('Profile README');

  // Demo links on repos
  const demoLinkCount = own.filter((r) => r.homepage).length;
  if (demoLinkCount >= 3) { score += 15; factors.push(`${demoLinkCount} repos with live demos`); }
  else if (demoLinkCount >= 1) { score += 8; factors.push(`${demoLinkCount} demo link(s)`); }
  else missing.push('Live demo links on repos');

  // Showcase quality (top repos have good descriptions)
  const topOwn = own.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
  const showcaseQuality = topOwn.filter((r) => r.description && r.description.length > 20).length;
  const hasPinnedShowcase = showcaseQuality >= 3;
  if (hasPinnedShowcase) { score += 15; factors.push('Top repos well-described'); }
  else missing.push('Better showcase repo descriptions');

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    bioLength,
    hasPortfolioLink,
    hasSocialLinks,
    hasProfileReadme,
    hasLinkedIn,
    hasPinnedShowcase,
    demoLinkCount,
    factors,
    missing,
  };
}

// ──── Recruiter Snapshot ────

function calcRecruiterSnapshot(overallScore: number, scores: ScoreBreakdown, recommendations: Recommendation[]): RecruiterSnapshot {
  const hireReadiness = overallScore;
  let hireLabel: string;
  if (hireReadiness >= 80) hireLabel = 'Hiring Ready';
  else if (hireReadiness >= 65) hireLabel = 'Competitive';
  else if (hireReadiness >= 50) hireLabel = 'Foundational';
  else hireLabel = 'Needs Work';

  // Find biggest strength (highest scoring dimension)
  const dimensionLabels: Record<string, string> = {
    profileCompleteness: 'Profile Completeness',
    repositoryQuality: 'Repository Quality',
    commitConsistency: 'Consistent Activity',
    documentation: 'Documentation',
    communityEngagement: 'Community Engagement',
    projectDiversity: 'Project Diversity',
    ownershipDepth: 'Deep Ownership',
    engineeringMaturity: 'Engineering Maturity',
    impactScore: 'Community Impact',
  };

  const sortedDimensions = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const biggestStrength = dimensionLabels[sortedDimensions[0][0]] || 'N/A';

  // Biggest concern (lowest scoring)
  const lowestDim = sortedDimensions[sortedDimensions.length - 1];
  const biggestConcern = `Weak ${dimensionLabels[lowestDim[0]] || 'area'} (${lowestDim[1]}/100)`;

  // Top fix from recommendations
  const topRec = recommendations[0];
  const topFix = topRec ? topRec.title : 'Maintain momentum';
  const topFixIncrease = topRec?.scoreIncrease || 0;

  return { hireReadiness, hireLabel, biggestStrength, biggestConcern, topFix, topFixIncrease };
}

// ──── First Impression ────

function calcFirstImpression(user: GitHubUser, repos: GitHubRepo[], readmes: RepoReadme[], deepScore: number): FirstImpressionResult {
  // 15-second scan: what a recruiter sees at a glance
  let quickScore = 0;
  const quickFactors: string[] = [];
  const deepFactors: string[] = [];

  // Profile presentation
  if (user.bio && user.bio.length > 10) { quickScore += 20; quickFactors.push('Professional bio present'); }
  else quickFactors.push('❌ Missing or weak bio');

  if (user.name) { quickScore += 10; quickFactors.push('Display name set'); }
  else quickFactors.push('❌ No display name');

  if (user.avatar_url && !user.avatar_url.includes('identicon')) { quickScore += 10; quickFactors.push('Custom avatar'); }
  else quickFactors.push('❌ Default avatar');

  // Pinned/top repos visual impression
  const own = repos.filter((r) => !r.fork);
  const withDesc = own.filter((r) => r.description && r.description.length > 15);
  if (withDesc.length >= 3) { quickScore += 15; quickFactors.push('Repos have clear descriptions'); }
  else quickFactors.push('❌ Repos lack descriptions');

  // README presence on top repos
  if (readmes.length >= 2) { quickScore += 15; quickFactors.push('READMEs found on top repos'); }
  else quickFactors.push('❌ Missing READMEs on top repos');

  // Stars (social proof at a glance)
  const totalStars = own.reduce((s, r) => s + r.stargazers_count, 0);
  if (totalStars >= 10) { quickScore += 15; quickFactors.push(`${totalStars} stars visible`); }
  else if (totalStars >= 3) { quickScore += 8; quickFactors.push('Some star traction'); }
  else quickFactors.push('❌ Low star count');

  // Visual clarity: homepage links
  const withHomepage = own.filter((r) => r.homepage).length;
  if (withHomepage >= 1) { quickScore += 10; quickFactors.push('Live demo links present'); }
  else quickFactors.push('❌ No live demo links');

  // Blog/website
  if (user.blog) { quickScore += 5; quickFactors.push('Portfolio link visible'); }

  quickScore = Math.min(100, quickScore);

  // Deep dive factors
  deepFactors.push(`Overall portfolio score: ${deepScore}/100`);
  if (readmes.length > 0) {
    const avgReadme = Math.round(readmes.reduce((s, r) => s + r.analysis.score, 0) / readmes.length);
    deepFactors.push(`Avg README quality: ${avgReadme}/100`);
  }
  const languages = new Set(own.map((r) => r.language).filter(Boolean));
  deepFactors.push(`${languages.size} languages across ${own.length} original repos`);
  deepFactors.push(`${repos.filter(r => r.fork).length} forks vs ${own.length} original projects`);

  return {
    quickScanScore: quickScore,
    deepDiveScore: deepScore,
    quickScanFactors: quickFactors,
    deepDiveFactors: deepFactors,
  };
}
