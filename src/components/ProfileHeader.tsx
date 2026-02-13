import { motion } from 'framer-motion';
import type { GitHubUser } from '@/lib/types';
import { MapPin, Building2, Link2, Calendar, Users, BookOpen } from 'lucide-react';

interface ProfileHeaderProps {
  user: GitHubUser;
  overallScore: number;
}

const ProfileHeader = ({ user, overallScore }: ProfileHeaderProps) => {
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated rounded-xl border border-border p-6"
    >
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-20 h-20 rounded-xl border-2 border-border"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user.name || user.login}</h2>
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
              >
                @{user.login}
              </a>
            </div>
          </div>
          {user.bio && (
            <p className="text-sm text-secondary-foreground mt-2 max-w-xl">{user.bio}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
            {user.company && (
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{user.company}</span>
            )}
            {user.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.location}</span>
            )}
            {user.blog && (
              <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Link2 className="w-3.5 h-3.5" />{user.blog}
              </a>
            )}
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {joinDate}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{user.followers} followers</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{user.public_repos} repos</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
