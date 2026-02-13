import { motion } from 'framer-motion';
import type { CareerAlignment } from '@/lib/types';
import { Target, CheckCircle2, XCircle } from 'lucide-react';

interface CareerAlignmentCardProps {
  alignments: CareerAlignment[];
}

const pathEmoji: Record<string, string> = {
  frontend: '🎨',
  backend: '⚙️',
  fullstack: '🔗',
  devops: '🚀',
  ml: '🧠',
};

const CareerAlignmentCard = ({ alignments }: CareerAlignmentCardProps) => {
  const sorted = [...alignments].sort((a, b) => b.readiness - a.readiness);
  const best = sorted[0];

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Career Path Alignment</h3>
      </div>

      {/* All paths */}
      <div className="space-y-3 mb-5">
        {sorted.map((a, i) => {
          const isBest = i === 0;
          return (
            <motion.div
              key={a.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <span>{pathEmoji[a.path]}</span>
                  {a.label}
                  {isBest && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold ml-1">Best Match</span>}
                </span>
                <span className="text-sm font-mono font-semibold text-foreground">{a.readiness}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${a.readiness >= 60 ? 'bg-primary' : a.readiness >= 35 ? 'bg-warning' : 'bg-destructive'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${a.readiness}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Best match details */}
      {best && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            {pathEmoji[best.path]} {best.label} — {best.readiness}% Ready
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {best.strengths.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Strengths</p>
                {best.strengths.map((s) => (
                  <p key={s} className="text-xs text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-primary" />{s}
                  </p>
                ))}
              </div>
            )}
            {best.gaps.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Gaps</p>
                {best.gaps.map((g) => (
                  <p key={g} className="text-xs text-foreground flex items-center gap-1.5">
                    <XCircle className="w-3 h-3 text-destructive" />{g}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerAlignmentCard;
