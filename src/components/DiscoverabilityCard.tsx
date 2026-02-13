import { motion } from 'framer-motion';
import type { DiscoverabilityScore } from '@/lib/types';
import { Globe, CheckCircle2, XCircle } from 'lucide-react';
import ScoreRing from './ScoreRing';

interface DiscoverabilityCardProps {
  discoverability: DiscoverabilityScore;
}

const DiscoverabilityCard = ({ discoverability }: DiscoverabilityCardProps) => {
  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Profile Discoverability</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">How easily recruiters can find and evaluate you</p>

      <div className="flex items-center gap-4 mb-5">
        <ScoreRing score={discoverability.score} size={80} strokeWidth={6} />
        <div className="flex-1">
          <div className="space-y-1.5">
            {discoverability.factors.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-start gap-2 text-xs text-foreground"
              >
                <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                {f}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {discoverability.missing.length > 0 && (
        <div className="pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Missing for full visibility</p>
          <div className="flex flex-wrap gap-2">
            {discoverability.missing.map((m) => (
              <span key={m} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <XCircle className="w-2.5 h-2.5 text-destructive/60" />
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverabilityCard;
