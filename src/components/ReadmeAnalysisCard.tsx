import { motion } from 'framer-motion';
import type { RepoReadme } from '@/lib/types';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';

interface ReadmeAnalysisCardProps {
  readmes: RepoReadme[];
}

const SubScoreBar = ({ label, score, delay }: { label: string; score: number; delay: number }) => {
  const getColor = (s: number) => {
    if (s >= 60) return 'bg-primary';
    if (s >= 30) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-foreground">{label}</span>
        <span className="text-[11px] font-mono font-semibold text-foreground">{score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay }}
        />
      </div>
    </div>
  );
};

const ReadmeAnalysisCard = ({ readmes }: ReadmeAnalysisCardProps) => {
  if (readmes.length === 0) return null;

  const checks = (r: RepoReadme) => [
    { label: 'H1 Title', ok: r.analysis.hasH1 },
    { label: 'TOC', ok: r.analysis.hasTOC },
    { label: 'Installation', ok: r.analysis.hasInstallation },
    { label: 'Usage', ok: r.analysis.hasUsage },
    { label: 'Architecture', ok: r.analysis.hasArchitecture },
    { label: 'Screenshots', ok: r.analysis.hasScreenshots },
    { label: 'Badges', ok: r.analysis.hasBadges },
    { label: 'Demo Link', ok: r.analysis.hasDemoLink },
    { label: 'Contributing', ok: r.analysis.hasContributing },
    { label: 'License', ok: r.analysis.hasLicense },
    { label: 'Impact Metrics', ok: r.analysis.hasImpactKeywords },
  ];

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">README Quality Analysis</h3>
      </div>

      <div className="space-y-4">
        {readmes.map((readme, i) => (
          <motion.div
            key={readme.repoName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="p-4 rounded-lg bg-muted/50 border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-mono font-semibold text-foreground">{readme.repoName}</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold font-mono ${
                  readme.analysis.score >= 60 ? 'text-primary' : readme.analysis.score >= 30 ? 'text-warning' : 'text-destructive'
                }`}>
                  {readme.analysis.score}
                </span>
                <span className="text-[10px] text-muted-foreground">/100</span>
              </div>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <SubScoreBar label="Structural" score={readme.analysis.structuralScore} delay={0.2 + i * 0.1} />
              <SubScoreBar label="Professional Signal" score={readme.analysis.professionalScore} delay={0.3 + i * 0.1} />
              <SubScoreBar label="Storytelling" score={readme.analysis.storytellingScore} delay={0.4 + i * 0.1} />
            </div>

            {/* Checks grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {checks(readme).map((c) => (
                <span key={c.label} className={`flex items-center gap-1 text-[10px] ${c.ok ? 'text-primary' : 'text-muted-foreground'}`}>
                  {c.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {c.label}
                </span>
              ))}
            </div>

            {/* Missing items */}
            {readme.analysis.missing.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground">
                  Missing: {readme.analysis.missing.slice(0, 5).join(' · ')}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground font-mono">
              <span>{readme.analysis.wordCount} words</span>
              <span>{readme.analysis.headingCount} headings</span>
              <span>{readme.analysis.codeBlockCount} code blocks</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReadmeAnalysisCard;
