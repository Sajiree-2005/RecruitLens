import { motion } from 'framer-motion';
import { useState } from 'react';
import type { RecruiterLensResult } from '@/lib/types';
import ScoreRing from './ScoreRing';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface RecruiterLensCardProps {
  lenses: RecruiterLensResult[];
}

const RecruiterLensCard = ({ lenses }: RecruiterLensCardProps) => {
  const [active, setActive] = useState(0);
  const lens = lenses[active];

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recruiter Simulation Mode</h3>

      {/* Lens tabs */}
      <div className="flex gap-2 mb-5">
        {lenses.map((l, i) => (
          <button
            key={l.lens}
            onClick={() => setActive(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              active === i
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{l.emoji}</span>
            {l.label}
          </button>
        ))}
      </div>

      {/* Active lens */}
      <motion.div
        key={lens.lens}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5"
      >
        {/* Verdict */}
        <div className="p-3 rounded-lg bg-muted/60 border border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Recruiter Verdict</p>
          <p className="text-sm text-foreground italic leading-relaxed">"{lens.verdict}"</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0 flex justify-center">
            <ScoreRing score={lens.score} size={120} strokeWidth={8} />
          </div>
          <div className="flex-1 space-y-4">
            {lens.highlights.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Highlights</p>
                <ul className="space-y-1.5">
                  {lens.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lens.concerns.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">Concerns</p>
                <ul className="space-y-1.5">
                  {lens.concerns.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-xs text-foreground">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RecruiterLensCard;
