import { motion } from 'framer-motion';
import type { CommitMessageQuality } from '@/lib/types';
import { GitCommit, AlertTriangle } from 'lucide-react';
import ScoreRing from './ScoreRing';

interface CommitQualityCardProps {
  quality: CommitMessageQuality;
}

const CommitQualityCard = ({ quality }: CommitQualityCardProps) => {
  if (quality.totalAnalyzed === 0) return null;

  const stats = [
    { label: 'Avg Message Length', value: `${quality.avgLength} chars`, good: quality.avgLength >= 20 },
    { label: 'Generic Messages', value: `${quality.genericPercent}%`, good: quality.genericPercent <= 20 },
    { label: 'Descriptive Verbs', value: `${quality.descriptivePercent}%`, good: quality.descriptivePercent >= 30 },
    { label: 'Conventional Format', value: `${quality.conventionalPercent}%`, good: quality.conventionalPercent >= 10 },
  ];

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <GitCommit className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Commit Message Quality</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Analysis of {quality.totalAnalyzed} recent commit messages
      </p>

      <div className="flex items-center gap-4 mb-5">
        <ScoreRing score={quality.score} size={80} strokeWidth={6} />
        <div className="flex-1 grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-muted/50">
              <p className={`text-sm font-mono font-bold ${s.good ? 'text-primary' : 'text-warning'}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {quality.concerns.length > 0 && (
        <div className="space-y-1.5">
          {quality.concerns.map((c) => (
            <motion.div
              key={c}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
              {c}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommitQualityCard;
