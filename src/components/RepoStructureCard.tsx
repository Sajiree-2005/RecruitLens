import { motion } from 'framer-motion';
import type { RepoStructureAnalysis } from '@/lib/types';
import { FolderTree, CheckCircle2, XCircle } from 'lucide-react';
import ScoreRing from './ScoreRing';

interface RepoStructureCardProps {
  structures: RepoStructureAnalysis[];
}

const checks = [
  { key: 'hasSrcDir', label: 'Source directory (src/)' },
  { key: 'hasTestsDir', label: 'Tests directory' },
  { key: 'hasGithubWorkflows', label: 'CI/CD workflows' },
  { key: 'hasDockerfile', label: 'Docker setup' },
  { key: 'hasEnvExample', label: 'Env config sample' },
  { key: 'hasGitignore', label: '.gitignore' },
  { key: 'hasEditorconfig', label: 'Linter/formatter config' },
  { key: 'isModular', label: 'Modular folder structure' },
] as const;

const RepoStructureCard = ({ structures }: RepoStructureCardProps) => {
  if (structures.length === 0) return null;

  const avgScore = Math.round(structures.reduce((s, r) => s + r.score, 0) / structures.length);

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <FolderTree className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Engineering Structure Analysis</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Code structure & best practices heuristics from repo file trees
      </p>

      <div className="flex items-center gap-4 mb-5">
        <ScoreRing score={avgScore} size={80} strokeWidth={6} />
        <div>
          <p className="text-sm font-semibold text-foreground">Avg Structure Score</p>
          <p className="text-xs text-muted-foreground">Across {structures.length} top repositories</p>
        </div>
      </div>

      <div className="space-y-4">
        {structures.map((repo, i) => (
          <motion.div
            key={repo.repoName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="p-4 rounded-lg bg-muted/50 border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground font-mono">{repo.repoName}</p>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                repo.score >= 60 ? 'bg-primary/10 text-primary' :
                repo.score >= 35 ? 'bg-warning/10 text-warning' :
                'bg-destructive/10 text-destructive'
              }`}>
                {repo.score}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {checks.map(({ key, label }) => {
                const has = repo[key as keyof RepoStructureAnalysis] as boolean;
                return (
                  <div key={key} className="flex items-center gap-1.5 text-[11px]">
                    {has ? (
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 text-destructive/60 shrink-0" />
                    )}
                    <span className={has ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RepoStructureCard;
