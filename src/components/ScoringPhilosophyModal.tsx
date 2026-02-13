import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';

const dimensions = [
  { name: 'Repository Quality', weight: '15%', desc: 'Descriptions, topics, licenses, homepage links, and stars' },
  { name: 'Documentation', weight: '15%', desc: 'README quality, descriptions, topic tags, and homepage presence' },
  { name: 'Ownership & Depth', weight: '12%', desc: 'Codebase size, long-lived repos, multi-commit projects' },
  { name: 'Engineering Maturity', weight: '12%', desc: 'CI/CD, Docker, testing signals, wiki/pages, topic richness' },
  { name: 'Commit Consistency', weight: '12%', desc: 'Active days, push frequency, recency of last commit' },
  { name: 'Profile Completeness', weight: '10%', desc: 'Bio, name, blog, location, company, avatar, hireable flag' },
  { name: 'Impact Score', weight: '8%', desc: 'Star-to-repo ratio, forks, external links, watchers' },
  { name: 'Community Engagement', weight: '8%', desc: 'Followers, gists, PRs, issues, fork contributions' },
  { name: 'Project Diversity', weight: '8%', desc: 'Language variety, project count, topic breadth' },
];

const ranges = [
  { range: '80–100', label: 'Hiring Ready', color: 'text-primary', desc: 'Strong portfolio — advances past recruiter screens' },
  { range: '65–79', label: 'Competitive', color: 'text-accent', desc: 'Solid foundation — needs targeted polish' },
  { range: '50–64', label: 'Foundational', color: 'text-warning', desc: 'Shows potential — gaps in key areas' },
  { range: '< 50', label: 'Rebuilding', color: 'text-destructive', desc: 'Portfolio needs significant investment' },
];

const ScoringPhilosophyModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="w-3.5 h-3.5" />
          Scoring Philosophy
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scoring Philosophy</DialogTitle>
          <DialogDescription>
            How we calculate your portfolio score — transparent and explainable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">9 Weighted Dimensions</h4>
            <div className="space-y-2">
              {dimensions.map((d) => (
                <div key={d.name} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50">
                  <span className="text-xs font-mono font-bold text-primary shrink-0 w-8 text-right">{d.weight}</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Score Ranges</h4>
            <div className="space-y-2">
              {ranges.map((r) => (
                <div key={r.range} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                  <span className={`text-sm font-mono font-bold shrink-0 w-14 ${r.color}`}>{r.range}</span>
                  <div>
                    <p className={`text-xs font-semibold ${r.color}`}>{r.label}</p>
                    <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              ⚠️ <strong>Disclaimer:</strong> Private repositories are not included in this analysis.
              Scores are based entirely on publicly available GitHub data via the GitHub REST API.
              Analysis is heuristic-based and may not capture all engineering practices.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoringPhilosophyModal;
