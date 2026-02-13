import { motion } from 'framer-motion';
import type { RecruiterSnapshot } from '@/lib/types';
import { Zap, TrendingUp, AlertTriangle, Star, ArrowRight } from 'lucide-react';

interface RecruiterSnapshotCardProps {
  snapshot: RecruiterSnapshot;
}

const RecruiterSnapshotCard = ({ snapshot }: RecruiterSnapshotCardProps) => {
  const getReadinessColor = () => {
    if (snapshot.hireReadiness >= 80) return 'text-primary';
    if (snapshot.hireReadiness >= 65) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-elevated rounded-xl border border-primary/20 p-6 glow"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">2-Minute Recruiter Snapshot</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">Quick View</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hire Readiness */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hire Readiness</p>
          <p className={`text-3xl font-bold font-mono ${getReadinessColor()}`}>{snapshot.hireReadiness}%</p>
          <p className={`text-xs font-semibold mt-1 ${getReadinessColor()}`}>{snapshot.hireLabel}</p>
        </div>

        {/* Biggest Strength */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">Biggest Strength</p>
          </div>
          <p className="text-sm text-foreground font-medium">{snapshot.biggestStrength}</p>
        </div>

        {/* Biggest Concern */}
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <p className="text-xs text-destructive font-semibold uppercase tracking-wider">Biggest Concern</p>
          </div>
          <p className="text-sm text-foreground font-medium">{snapshot.biggestConcern}</p>
        </div>

        {/* Top Fix */}
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            <p className="text-xs text-accent font-semibold uppercase tracking-wider">Top Fix</p>
          </div>
          <p className="text-sm text-foreground font-medium">{snapshot.topFix}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowRight className="w-3 h-3 text-primary" />
            <span className="text-xs font-mono font-bold text-primary">+{snapshot.topFixIncrease} pts</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecruiterSnapshotCard;
