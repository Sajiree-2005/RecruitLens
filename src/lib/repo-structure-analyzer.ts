import type { RepoStructureAnalysis, CommitMessageQuality } from './types';

function clamp(val: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function analyzeRepoStructure(
  repoName: string,
  files: { path: string }[]
): RepoStructureAnalysis {
  const paths = files.map((f) => f.path.toLowerCase());

  const hasSrcDir = paths.some((p) => p.startsWith('src/') || p.startsWith('lib/') || p.startsWith('app/'));
  const hasTestsDir = paths.some((p) => p.startsWith('test/') || p.startsWith('tests/') || p.startsWith('__tests__/') || p.startsWith('spec/') || p.includes('.test.') || p.includes('.spec.'));
  const hasPackageJson = paths.includes('package.json');
  const hasRequirementsTxt = paths.includes('requirements.txt') || paths.includes('pyproject.toml') || paths.includes('setup.py') || paths.includes('pipfile');
  const hasEnvExample = paths.some((p) => p === '.env.example' || p === '.env.sample' || p === '.env.template');
  const hasDockerfile = paths.some((p) => p === 'dockerfile' || p.startsWith('docker-compose') || p === 'docker-compose.yml' || p === 'docker-compose.yaml');
  const hasGithubWorkflows = paths.some((p) => p.startsWith('.github/workflows/'));
  const hasGitignore = paths.includes('.gitignore');
  const hasContributing = paths.some((p) => p === 'contributing.md' || p === 'contributing');
  const hasChangelog = paths.some((p) => p === 'changelog.md' || p === 'changelog' || p === 'history.md');
  const hasEditorconfig = paths.includes('.editorconfig') || paths.includes('.prettierrc') || paths.some((p) => p.includes('eslint'));

  // Count unique top-level directories
  const topDirs = new Set(
    paths.filter((p) => p.includes('/')).map((p) => p.split('/')[0])
  );
  const directoryCount = topDirs.size;
  const isModular = directoryCount >= 3;

  let score = 0;
  if (hasSrcDir) score += 15;
  if (hasTestsDir) score += 15;
  if (hasPackageJson || hasRequirementsTxt) score += 10;
  if (hasEnvExample) score += 10;
  if (hasDockerfile) score += 10;
  if (hasGithubWorkflows) score += 15;
  if (hasGitignore) score += 5;
  if (hasContributing) score += 5;
  if (hasEditorconfig) score += 5;
  if (isModular) score += 10;

  const missing: string[] = [];
  if (!hasTestsDir) missing.push('No tests directory');
  if (!hasGithubWorkflows) missing.push('No CI configuration');
  if (!hasEnvExample) missing.push('No environment config sample');
  if (!hasDockerfile) missing.push('No Docker setup');
  if (!hasSrcDir) missing.push('No organized source directory');
  if (!hasEditorconfig) missing.push('No linter/formatter config');
  if (!hasContributing) missing.push('No contributing guide');

  return {
    repoName,
    score: clamp(score),
    hasSrcDir,
    hasTestsDir,
    hasPackageJson,
    hasRequirementsTxt,
    hasEnvExample,
    hasDockerfile,
    hasGithubWorkflows,
    hasGitignore,
    hasContributing,
    hasChangelog,
    hasEditorconfig,
    directoryCount,
    isModular,
    missing,
  };
}

export function analyzeAllRepoStructures(
  repos: { repoName: string; files: { path: string }[] }[]
): RepoStructureAnalysis[] {
  return repos.map((r) => analyzeRepoStructure(r.repoName, r.files));
}

export function analyzeCommitMessages(
  commits: { repoName: string; messages: { message: string }[] }[]
): CommitMessageQuality {
  const allMessages = commits.flatMap((c) => c.messages.map((m) => m.message));

  if (allMessages.length === 0) {
    return { score: 0, avgLength: 0, genericPercent: 0, descriptivePercent: 0, conventionalPercent: 0, concerns: ['No commit data available'], totalAnalyzed: 0 };
  }

  const genericPatterns = /^(update|fix|wip|test|minor|changes|stuff|\.+|initial commit|first commit|typo|misc|temp|asdf|commit|save|push|add files|upload|edit|modified)$/i;
  const conventionalPattern = /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)(\(.+\))?:\s/;
  const descriptiveVerbs = /^(add|create|implement|refactor|remove|update|fix|improve|optimize|migrate|integrate|configure|handle|resolve|extract|enable|disable)/i;

  let genericCount = 0;
  let descriptiveCount = 0;
  let conventionalCount = 0;
  let totalLength = 0;

  for (const msg of allMessages) {
    const firstLine = msg.split('\n')[0].trim();
    totalLength += firstLine.length;

    if (genericPatterns.test(firstLine) || firstLine.length <= 3) {
      genericCount++;
    }
    if (conventionalPattern.test(firstLine)) {
      conventionalCount++;
    }
    if (descriptiveVerbs.test(firstLine) && firstLine.length >= 10) {
      descriptiveCount++;
    }
  }

  const total = allMessages.length;
  const avgLength = Math.round(totalLength / total);
  const genericPercent = Math.round((genericCount / total) * 100);
  const descriptivePercent = Math.round((descriptiveCount / total) * 100);
  const conventionalPercent = Math.round((conventionalCount / total) * 100);

  let score = 0;
  // Avg length scoring
  if (avgLength >= 30) score += 25;
  else if (avgLength >= 15) score += 15;
  else score += 5;

  // Low generic ratio
  if (genericPercent <= 10) score += 25;
  else if (genericPercent <= 30) score += 15;
  else if (genericPercent <= 50) score += 5;

  // Descriptive verbs
  if (descriptivePercent >= 50) score += 25;
  else if (descriptivePercent >= 25) score += 15;
  else score += 5;

  // Conventional commits bonus
  if (conventionalPercent >= 30) score += 25;
  else if (conventionalPercent >= 10) score += 15;
  else score += 5;

  const concerns: string[] = [];
  if (genericPercent > 40) concerns.push(`${genericPercent}% of commits have generic messages`);
  if (avgLength < 15) concerns.push(`Average message length is only ${avgLength} chars`);
  if (conventionalPercent === 0) concerns.push('No conventional commit format used');
  if (descriptivePercent < 20) concerns.push('Few commits use descriptive action verbs');

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    avgLength,
    genericPercent,
    descriptivePercent,
    conventionalPercent,
    concerns,
    totalAnalyzed: total,
  };
}
