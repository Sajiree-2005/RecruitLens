import { motion } from 'framer-motion';

interface LanguageChartProps {
  distribution: Record<string, number>;
}

const COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(185, 72%, 48%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(350, 72%, 55%)',
  'hsl(210, 68%, 55%)',
  'hsl(120, 50%, 45%)',
  'hsl(30, 80%, 55%)',
];

const LanguageChart = ({ distribution }: LanguageChartProps) => {
  const entries = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return null;

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Language Distribution</h3>
      
      {/* Bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        {entries.map(([lang, count], i) => (
          <motion.div
            key={lang}
            initial={{ width: 0 }}
            animate={{ width: `${(count / total) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
            className="h-full"
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {entries.map(([lang, count], i) => (
          <div key={lang} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-xs text-foreground font-medium">{lang}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {Math.round((count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageChart;
