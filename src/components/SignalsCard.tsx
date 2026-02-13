import { motion } from 'framer-motion';
import type { Signal } from '@/lib/types';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface SignalsCardProps {
  title: string;
  signals: Signal[];
  type: 'strength' | 'red-flag';
}

const SignalsCard = ({ title, signals, type }: SignalsCardProps) => {
  const isStrength = type === 'strength';

  const getSeverityIcon = (severity: Signal['severity']) => {
    if (isStrength) return <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />;
    if (severity === 'high') return <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />;
    return <Info className="w-4 h-4 text-warning shrink-0" />;
  };

  if (signals.length === 0) return null;

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {signals.map((signal, i) => (
          <motion.div
            key={signal.label}
            initial={{ opacity: 0, x: isStrength ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
          >
            <div className="mt-0.5">{getSeverityIcon(signal.severity)}</div>
            <div>
              <p className="text-sm font-semibold text-foreground">{signal.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{signal.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SignalsCard;
