import { motion } from 'framer-motion';
import type { FirstImpressionResult } from '@/lib/types';
import ScoreRing from './ScoreRing';
import { Eye, Search, CheckCircle2, XCircle } from 'lucide-react';

interface FirstImpressionCardProps {
  impression: FirstImpressionResult;
}

const FirstImpressionCard = ({ impression }: FirstImpressionCardProps) => {
  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <Eye className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Recruiter First Impression</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">15-second scan vs. deep evaluation comparison</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Quick Scan */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <ScoreRing score={impression.quickScanScore} size={80} strokeWidth={6} />
            <div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">First Impression</p>
              </div>
              <p className="text-[10px] text-muted-foreground">15-second scan</p>
            </div>
          </div>
          <ul className="space-y-1.5">
            {impression.quickScanFactors.map((f) => {
              const isNegative = f.startsWith('❌');
              return (
                <li key={f} className={`flex items-start gap-2 text-[11px] ${isNegative ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {isNegative
                    ? <XCircle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                    : <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  }
                  {isNegative ? f.slice(2) : f}
                </li>
              );
            })}
          </ul>
        </motion.div>

        {/* Deep Dive */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <ScoreRing score={impression.deepDiveScore} size={80} strokeWidth={6} />
            <div>
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Deep Evaluation</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Full analysis</p>
            </div>
          </div>
          <ul className="space-y-1.5">
            {impression.deepDiveFactors.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[11px] text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Gap indicator */}
      {Math.abs(impression.quickScanScore - impression.deepDiveScore) >= 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20"
        >
          <p className="text-xs text-warning font-semibold">
            ⚠️ {impression.quickScanScore > impression.deepDiveScore
              ? `Profile looks better than it is. First impression is ${impression.quickScanScore - impression.deepDiveScore} points higher than actual depth.`
              : `Hidden potential! Your deep score is ${impression.deepDiveScore - impression.quickScanScore} points higher than first impression. Improve profile presentation.`
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FirstImpressionCard;
