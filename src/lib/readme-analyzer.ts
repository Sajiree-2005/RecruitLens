import type { ReadmeAnalysis, RepoReadme } from './types';

function analyzeReadmeContent(content: string): ReadmeAnalysis {
  const lower = content.toLowerCase();
  const lines = content.split('\n');

  // Structural checks
  const hasH1 = /^#\s+.+/m.test(content);
  const hasTOC = /#{1,3}\s*(table of contents|contents|toc)/i.test(content) || (content.match(/\n\s*-\s*\[.*\]\(#.*\)/g) || []).length >= 3;
  const hasInstallation = /#{1,3}\s*(install|setup|getting started|quick start)/i.test(content) || /(npm install|pip install|yarn add|docker build|brew install|cargo install|go get)/i.test(content);
  const hasUsage = /#{1,3}\s*(usage|how to use|examples?|demo|run)/i.test(content) || /(npm run|python |node |cargo run|go run)/i.test(content);
  const hasArchitecture = /#{1,3}\s*(architect|design|structure|overview|how it works|system design|diagram)/i.test(content);
  const hasScreenshots = /!\[.*\]\(.*\)/.test(content) || /<img\s/i.test(content);
  const hasBadges = /\[!\[.*\]\(https?:\/\/.*\)\]\(.*\)/.test(content) || /img\.shields\.io/.test(content) || /badge/i.test(content);
  const hasContributing = /#{1,3}\s*(contribut|pull request)/i.test(content) || /CONTRIBUTING\.md/i.test(content);
  const hasLicense = /#{1,3}\s*license/i.test(content) || lower.includes('mit license') || lower.includes('apache license') || lower.includes('gpl');
  const hasDemoLink = /(live demo|deployed|https?:\/\/.*\.(vercel|netlify|herokuapp|github\.io|surge\.sh|render\.com|fly\.dev))/i.test(content);
  const hasApiDocs = /#{1,3}\s*(api|endpoint|route)/i.test(content);

  // Impact keywords
  const impactKeywords = ['users', 'performance', 'scalable', 'deployed', 'production', 'million', 'thousand', 'enterprise', 'revenue', 'traffic', 'uptime', 'latency', 'concurrent'];
  const hasImpactKeywords = impactKeywords.some((kw) => lower.includes(kw));

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const headingCount = lines.filter((l) => /^#{1,6}\s/.test(l)).length;
  const codeBlockCount = Math.floor((content.match(/```/g) || []).length / 2);

  // ── Structural Score (0-100) ──
  let structuralScore = 0;
  if (hasH1) structuralScore += 20;
  if (hasTOC) structuralScore += 15;
  if (headingCount >= 4) structuralScore += 20;
  else if (headingCount >= 2) structuralScore += 10;
  if (codeBlockCount >= 2) structuralScore += 15;
  else if (codeBlockCount >= 1) structuralScore += 8;
  // Tiered word count scoring
  if (wordCount >= 500) structuralScore += 20;
  else if (wordCount >= 300) structuralScore += 15;
  else if (wordCount >= 100) structuralScore += 10;
  else if (wordCount >= 50) structuralScore += 5;
  if (hasScreenshots) structuralScore += 10;
  structuralScore = Math.min(100, structuralScore);

  // ── Professional Signal Score (0-100) ──
  let professionalScore = 0;
  if (hasBadges) professionalScore += 20;
  if (hasLicense) professionalScore += 15;
  if (hasContributing) professionalScore += 15;
  if (hasInstallation) professionalScore += 20;
  if (hasApiDocs) professionalScore += 15;
  if (hasDemoLink) professionalScore += 15;
  professionalScore = Math.min(100, professionalScore);

  // ── Storytelling Score (0-100) ──
  let storytellingScore = 0;
  if (hasUsage) storytellingScore += 20;
  if (hasArchitecture) storytellingScore += 20;
  if (hasScreenshots) storytellingScore += 15;
  if (hasDemoLink) storytellingScore += 15;
  if (hasImpactKeywords) storytellingScore += 15;
  // Problem/solution framing
  const hasProblemFraming = /#{1,3}\s*(problem|motivation|why|background|goal|objective)/i.test(content) || lower.includes('this project') || lower.includes('solves') || lower.includes('built to');
  if (hasProblemFraming) storytellingScore += 15;
  storytellingScore = Math.min(100, storytellingScore);

  // ── Overall Score (weighted combo) ──
  const score = Math.min(100, Math.round(structuralScore * 0.35 + professionalScore * 0.35 + storytellingScore * 0.30));

  const missing: string[] = [];
  if (!hasH1) missing.push('H1 title');
  if (!hasTOC && wordCount > 200) missing.push('Table of Contents');
  if (!hasInstallation) missing.push('Installation instructions');
  if (!hasUsage) missing.push('Usage examples');
  if (!hasArchitecture) missing.push('Architecture diagram');
  if (!hasScreenshots) missing.push('Screenshots or visuals');
  if (!hasDemoLink) missing.push('Live demo link');
  if (!hasContributing) missing.push('Contributing guide');
  if (!hasBadges) missing.push('Status badges');
  if (!hasApiDocs && wordCount > 200) missing.push('API documentation');
  if (!hasImpactKeywords) missing.push('Impact/scale metrics');

  return {
    score,
    structuralScore,
    professionalScore,
    storytellingScore,
    hasH1, hasTOC,
    hasInstallation, hasUsage, hasArchitecture, hasScreenshots,
    hasBadges, hasContributing, hasLicense, hasDemoLink, hasApiDocs,
    hasImpactKeywords,
    wordCount, headingCount, codeBlockCount,
    missing,
  };
}

export function analyzeReadmes(readmes: { repoName: string; content: string }[]): RepoReadme[] {
  return readmes.map((r) => ({
    repoName: r.repoName,
    content: r.content,
    analysis: analyzeReadmeContent(r.content),
  }));
}
