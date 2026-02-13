import { motion } from 'framer-motion';
import type { ScoreBreakdown } from '@/lib/types';
import { User, GitBranch, Activity, FileText, Users, Layers, Shield, Wrench, Zap } from 'lucide-react';

interface ScoreBarProps {
  label: string;
  score: number;
  weight: string;
  icon: React.ReactNode;
  delay: number;
}

const ScoreBar = ({ label, score, weight, icon, delay }: ScoreBarProps) => {
  const getColor = (s: number) => {
    if (s >= 75) return 'bg-primary';
    if (s >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-[10px] text-muted-foreground font-mono">({weight})</span>
        </div>
        <span className="text-sm font-mono font-semibold text-foreground">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
};

interface ScoreBreakdownCardProps {
  scores: ScoreBreakdown;
}

const ScoreBreakdownCard = ({ scores }: ScoreBreakdownCardProps) => {
  const items = [
    { label: 'Repository Quality', score: scores.repositoryQuality, weight: '15%', icon: <GitBranch className="w-4 h-4" /> },
    { label: 'Documentation', score: scores.documentation, weight: '15%', icon: <FileText className="w-4 h-4" /> },
    { label: 'Ownership & Depth', score: scores.ownershipDepth, weight: '12%', icon: <Shield className="w-4 h-4" /> },
    { label: 'Engineering Maturity', score: scores.engineeringMaturity, weight: '12%', icon: <Wrench className="w-4 h-4" /> },
    { label: 'Commit Consistency', score: scores.commitConsistency, weight: '12%', icon: <Activity className="w-4 h-4" /> },
    { label: 'Profile Completeness', score: scores.profileCompleteness, weight: '10%', icon: <User className="w-4 h-4" /> },
    { label: 'Impact Score', score: scores.impactScore, weight: '8%', icon: <Zap className="w-4 h-4" /> },
    { label: 'Community Engagement', score: scores.communityEngagement, weight: '8%', icon: <Users className="w-4 h-4" /> },
    { label: 'Project Diversity', score: scores.projectDiversity, weight: '8%', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="card-elevated rounded-xl border border-border p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Score Breakdown</h3>
      <p className="text-xs text-muted-foreground -mt-2">Transparent scoring formula — weights shown per dimension</p>
      {items.map((item, i) => (
        <ScoreBar key={item.label} {...item} delay={0.2 + i * 0.08} />
      ))}
    </div>
  );
};

export default ScoreBreakdownCard;
