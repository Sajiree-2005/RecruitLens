import { motion } from 'framer-motion';
import type { AnalysisResult } from '@/lib/types';
import ScoreRing from './ScoreRing';
import ScoreBreakdownCard from './ScoreBreakdownCard';
import ProfileHeader from './ProfileHeader';
import SignalsCard from './SignalsCard';
import RecommendationsCard from './RecommendationsCard';
import LanguageChart from './LanguageChart';
import TopReposCard from './TopReposCard';
import SignalConfidenceBadge from './SignalConfidenceBadge';
import RecruiterLensCard from './RecruiterLensCard';
import CareerAlignmentCard from './CareerAlignmentCard';
import BeforeAfterSimulator from './BeforeAfterSimulator';
import ReadmeAnalysisCard from './ReadmeAnalysisCard';
import FirstImpressionCard from './FirstImpressionCard';
import RadarChart from './RadarChart';
import RecruiterSnapshotCard from './RecruiterSnapshotCard';
import RepoStructureCard from './RepoStructureCard';
import CommitQualityCard from './CommitQualityCard';
import DiscoverabilityCard from './DiscoverabilityCard';
import ScoringPhilosophyModal from './ScoringPhilosophyModal';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  onBack: () => void;
}

const AnalysisDashboard = ({ result, onBack }: AnalysisDashboardProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Nav */}
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Analyze another profile
        </motion.button>

        {/* Profile header */}
        <ProfileHeader user={result.user} overallScore={result.overallScore} />

        {/* Confidence badge + Scoring philosophy */}
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <SignalConfidenceBadge confidence={result.signalConfidence} />
          <ScoringPhilosophyModal />
        </div>

        {/* ⚡ 2-Minute Recruiter Snapshot */}
        <div className="mt-6">
          <RecruiterSnapshotCard snapshot={result.recruiterSnapshot} />
        </div>

        {/* First Impression */}
        <div className="mt-6">
          <FirstImpressionCard impression={result.firstImpression} />
        </div>

        {/* Overall score + breakdown + radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card-elevated rounded-xl border border-border p-6 flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio Score</h3>
            <ScoreRing score={result.overallScore} size={180} strokeWidth={10} />
            <p className="text-xs text-muted-foreground mt-4 text-center max-w-[200px]">
              Weighted score based on 9 recruiter-focused dimensions
            </p>
          </motion.div>

          <div className="lg:col-span-2">
            <ScoreBreakdownCard scores={result.scores} />
          </div>
        </div>

        {/* Radar Chart + Recruiter Lenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RadarChart scores={result.scores} />
          <RecruiterLensCard lenses={result.recruiterLenses} />
        </div>

        {/* Engineering Structure + Commit Quality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RepoStructureCard structures={result.repoStructures} />
          <CommitQualityCard quality={result.commitQuality} />
        </div>

        {/* Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <SignalsCard title="✅ Strengths" signals={result.strengths} type="strength" />
          <SignalsCard title="🚩 Red Flags" signals={result.redFlags} type="red-flag" />
        </div>

        {/* Career Alignment */}
        <div className="mt-6">
          <CareerAlignmentCard alignments={result.careerAlignments} />
        </div>

        {/* Discoverability + README Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <DiscoverabilityCard discoverability={result.discoverability} />
          <ReadmeAnalysisCard readmes={result.readmeAnalyses} />
        </div>

        {/* Recommendations + Simulator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecommendationsCard recommendations={result.recommendations} />
          <BeforeAfterSimulator currentScore={result.overallScore} simulations={result.simulations} />
        </div>

        {/* Repos & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <TopReposCard repos={result.repos} />
          <LanguageChart distribution={result.languageDistribution} />
        </div>

        {/* Footer + Disclaimers */}
        <div className="mt-12 pb-8 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50">
            <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">
              Private repos not included • GitHub API rate: 60 req/hr unauthenticated • Analysis is heuristic-based
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            GitHub Portfolio Analyzer — Recruiter Signal Engine v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
