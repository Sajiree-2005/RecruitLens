import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import HeroSection from '@/components/HeroSection';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import { fetchAllGitHubData } from '@/lib/github-api';
import { analyzeProfile } from '@/lib/analyzer';
import type { AnalysisResult } from '@/lib/types';
import { motion } from 'framer-motion';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const { toast } = useToast();

  const handleAnalyze = async (username: string) => {
    setIsLoading(true);
    setResult(null);
    setProgress({ stage: 'Starting...', percent: 5 });

    try {
      const data = await fetchAllGitHubData(username, (stage, percent) => {
        setProgress({ stage, percent });
      });
      setProgress({ stage: 'Generating insights...', percent: 95 });
      const analysis = analyzeProfile(data.user, data.repos, data.events, data.readmes, data.trees, data.commits);
      setResult(analysis);
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setProgress({ stage: '', percent: 0 });
    }
  };

  if (result) {
    return <AnalysisDashboard result={result} onBack={() => setResult(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onAnalyze={handleAnalyze} isLoading={isLoading} />
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg mx-auto px-6 -mt-4"
        >
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">{progress.stage}</p>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
