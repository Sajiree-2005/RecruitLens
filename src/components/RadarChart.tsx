import { motion } from 'framer-motion';
import type { ScoreBreakdown } from '@/lib/types';

interface RadarChartProps {
  scores: ScoreBreakdown;
}

const RadarChart = ({ scores }: RadarChartProps) => {
  const dimensions = [
    { key: 'profileCompleteness', label: 'Profile' },
    { key: 'repositoryQuality', label: 'Repos' },
    { key: 'commitConsistency', label: 'Consistency' },
    { key: 'documentation', label: 'Docs' },
    { key: 'ownershipDepth', label: 'Ownership' },
    { key: 'engineeringMaturity', label: 'Engineering' },
    { key: 'impactScore', label: 'Impact' },
    { key: 'communityEngagement', label: 'Community' },
    { key: 'projectDiversity', label: 'Diversity' },
  ];

  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 90;
  const levels = [25, 50, 75, 100];
  const n = dimensions.length;

  const getPoint = (index: number, value: number) => {
    const angle = (2 * Math.PI * index) / n - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const dataPoints = dimensions.map((d, i) => getPoint(i, scores[d.key as keyof ScoreBreakdown]));
  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Skill Depth Radar</h3>
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid levels */}
          {levels.map((lvl) => {
            const points = Array.from({ length: n }, (_, i) => getPoint(i, lvl));
            const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
            return <path key={lvl} d={d} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />;
          })}

          {/* Axes */}
          {dimensions.map((_, i) => {
            const p = getPoint(i, 100);
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="0.5" />;
          })}

          {/* Data area */}
          <motion.path
            d={pathData}
            fill="hsl(160 84% 39% / 0.15)"
            stroke="hsl(160, 84%, 39%)"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Data points */}
          {dataPoints.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="hsl(160, 84%, 39%)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            />
          ))}

          {/* Labels */}
          {dimensions.map((d, i) => {
            const p = getPoint(i, 118);
            return (
              <text
                key={d.key}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] fill-muted-foreground"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default RadarChart;
