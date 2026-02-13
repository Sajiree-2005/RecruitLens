import { motion } from 'framer-motion';
import type { GitHubRepo } from '@/lib/types';
import { Star, GitFork, ExternalLink } from 'lucide-react';

interface TopReposCardProps {
  repos: GitHubRepo[];
}

const TopReposCard = ({ repos }: TopReposCardProps) => {
  const topRepos = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  if (topRepos.length === 0) return null;

  return (
    <div className="card-elevated rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top Repositories</h3>
      <div className="grid gap-3">
        {topRepos.map((repo, i) => (
          <motion.a
            key={repo.name}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground font-mono truncate">{repo.name}</p>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              {repo.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{repo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                {repo.language && (
                  <span className="text-[10px] font-mono text-accent">{repo.language}</span>
                )}
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Star className="w-3 h-3" />{repo.stargazers_count}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <GitFork className="w-3 h-3" />{repo.forks_count}
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default TopReposCard;
