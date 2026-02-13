import { motion } from 'framer-motion';
import type { Recommendation } from '@/lib/types';
import { ArrowUpRight, Flame, TrendingUp, Sparkles } from 'lucide-react';

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

const impactConfig = {
  high: { icon: Flame, color: 'text-destructive', bg: 'bg-destructive/10', label: 'High Impact' },
  medium: { icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10', label: 'Medium Impact' },
  low: { icon: Sparkles, color: 'text-info', bg: 'bg-info/10', label: 'Nice to Have' },
};

const RecommendationsCard = ({ recommendations }: RecommendationsCardProps) => {
  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">Tactical Roadmap</h3>
      <p className="text-xs text-muted-foreground mb-4">Prioritized by estimated score impact</p>
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const config = impactConfig[rec.impact];
          const Icon = config.icon;
          return (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-4 rounded-lg bg-muted/50 border border-border/50 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{rec.category}</span>
                    {rec.scoreIncrease && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        +{rec.scoreIncrease} pts
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsCard;
