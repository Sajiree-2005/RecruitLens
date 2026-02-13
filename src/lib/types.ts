export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  twitter_username: string | null;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  has_wiki: boolean;
  has_pages: boolean;
  license: { name: string } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  size: number;
  default_branch: string;
}

export interface GitHubEvent {
  type: string;
  created_at: string;
  repo: { name: string };
}

export interface ReadmeAnalysis {
  score: number;
  structuralScore: number;
  professionalScore: number;
  storytellingScore: number;
  hasH1: boolean;
  hasTOC: boolean;
  hasInstallation: boolean;
  hasUsage: boolean;
  hasArchitecture: boolean;
  hasScreenshots: boolean;
  hasBadges: boolean;
  hasContributing: boolean;
  hasLicense: boolean;
  hasDemoLink: boolean;
  hasApiDocs: boolean;
  hasImpactKeywords: boolean;
  wordCount: number;
  headingCount: number;
  codeBlockCount: number;
  missing: string[];
}

export interface RepoReadme {
  repoName: string;
  content: string;
  analysis: ReadmeAnalysis;
}

export type RecruiterLens = 'startup' | 'enterprise' | 'aiml';

export interface RecruiterLensResult {
  lens: RecruiterLens;
  label: string;
  emoji: string;
  score: number;
  highlights: string[];
  concerns: string[];
  verdict: string;
}

export type CareerPath = 'frontend' | 'backend' | 'fullstack' | 'devops' | 'ml';

export interface CareerAlignment {
  path: CareerPath;
  label: string;
  readiness: number;
  strengths: string[];
  gaps: string[];
}

export interface ScoreBreakdown {
  profileCompleteness: number;
  repositoryQuality: number;
  commitConsistency: number;
  documentation: number;
  communityEngagement: number;
  projectDiversity: number;
  ownershipDepth: number;
  engineeringMaturity: number;
  impactScore: number;
}

export interface Signal {
  label: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  scoreIncrease?: number;
}

export interface SimulationScenario {
  label: string;
  description: string;
  scoreIncrease: number;
  newScore: number;
}

export interface SignalConfidence {
  score: number;
  label: string;
  dataCoverage: number;
  factors: string[];
}

export interface FirstImpressionResult {
  quickScanScore: number;
  deepDiveScore: number;
  quickScanFactors: string[];
  deepDiveFactors: string[];
}

export interface RepoStructureFile {
  path: string;
}

export interface RepoStructureAnalysis {
  repoName: string;
  score: number;
  hasSrcDir: boolean;
  hasTestsDir: boolean;
  hasPackageJson: boolean;
  hasRequirementsTxt: boolean;
  hasEnvExample: boolean;
  hasDockerfile: boolean;
  hasGithubWorkflows: boolean;
  hasGitignore: boolean;
  hasContributing: boolean;
  hasChangelog: boolean;
  hasEditorconfig: boolean;
  directoryCount: number;
  isModular: boolean;
  missing: string[];
}

export interface CommitMessageQuality {
  score: number;
  avgLength: number;
  genericPercent: number;
  descriptivePercent: number;
  conventionalPercent: number;
  concerns: string[];
  totalAnalyzed: number;
}

export interface DiscoverabilityScore {
  score: number;
  bioLength: number;
  hasPortfolioLink: boolean;
  hasSocialLinks: boolean;
  hasProfileReadme: boolean;
  hasLinkedIn: boolean;
  hasPinnedShowcase: boolean;
  demoLinkCount: number;
  factors: string[];
  missing: string[];
}

export interface RecruiterSnapshot {
  hireReadiness: number;
  hireLabel: string;
  biggestStrength: string;
  biggestConcern: string;
  topFix: string;
  topFixIncrease: number;
}

export interface AnalysisResult {
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  scores: ScoreBreakdown;
  strengths: Signal[];
  redFlags: Signal[];
  recommendations: Recommendation[];
  overallScore: number;
  languageDistribution: Record<string, number>;
  signalConfidence: SignalConfidence;
  recruiterLenses: RecruiterLensResult[];
  careerAlignments: CareerAlignment[];
  simulations: SimulationScenario[];
  readmeAnalyses: RepoReadme[];
  firstImpression: FirstImpressionResult;
  repoStructures: RepoStructureAnalysis[];
  commitQuality: CommitMessageQuality;
  discoverability: DiscoverabilityScore;
  recruiterSnapshot: RecruiterSnapshot;
}
