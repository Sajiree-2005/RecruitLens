import { motion } from 'framer-motion';
import type { SimulationScenario } from '@/lib/types';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface BeforeAfterSimulatorProps {
  currentScore: number;
  simulations: SimulationScenario[];
}

const BeforeAfterSimulator = ({ currentScore, simulations }: BeforeAfterSimulatorProps) => {
  if (simulations.length === 0) return null;

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Score Improvement Simulator</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">See how specific actions could boost your score</p>

      <div className="space-y-3">
        {simulations.map((sim, i) => (
          <motion.div
            key={sim.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="p-4 rounded-lg bg-muted/50 border border-border/50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold text-foreground">{sim.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground">{currentScore}</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-mono font-bold text-primary">{sim.newScore}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  +{sim.scoreIncrease}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{sim.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BeforeAfterSimulator;
