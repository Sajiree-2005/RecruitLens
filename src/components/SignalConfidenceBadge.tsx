import { motion } from 'framer-motion';
import type { SignalConfidence } from '@/lib/types';
import { Shield, Info } from 'lucide-react';
import { useState } from 'react';

interface SignalConfidenceBadgeProps {
  confidence: SignalConfidence;
}

const SignalConfidenceBadge = ({ confidence }: SignalConfidenceBadgeProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const getColor = () => {
    if (confidence.score >= 80) return 'text-primary bg-primary/10 border-primary/20';
    if (confidence.score >= 50) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${getColor()}`}
      >
        <Shield className="w-3.5 h-3.5" />
        Signal Confidence: {confidence.score}% ({confidence.label})
        <Info className="w-3 h-3 opacity-60" />
      </motion.button>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 w-72 p-4 rounded-xl bg-card border border-border shadow-lg z-20"
        >
          <p className="text-xs text-muted-foreground mb-3">Data coverage factors:</p>
          <ul className="space-y-1.5">
            {confidence.factors.map((f) => (
              <li key={f} className="text-xs text-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default SignalConfidenceBadge;
