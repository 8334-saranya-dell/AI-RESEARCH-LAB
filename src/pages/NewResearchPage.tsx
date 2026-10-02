import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Bot,
  Loader2,
  FileQuestion,
  Lightbulb,
  Cpu,
} from 'lucide-react';
import { analyzeProblem, runFullPipeline } from '../services/api';
import { ResearchProject } from '../types/research';

interface NewResearchPageProps {
  onProjectCreated: (project: ResearchProject) => void;
  onNavigateToWorkspace: () => void;
}

const STARTER_PROBLEMS = [
  {
    title: 'Classify Fake News & Misinformation',
    prompt:
      'Build a model to classify fake news versus verified authentic reporting, handling satirical humor, sensationalist headlines, and subtle factual manipulation across digital media.',
    domain: 'NLP / Text Classification',
  },
  {
    title: 'Financial Transaction Fraud Detection',
    prompt:
      'Detect real-time credit card transaction fraud under extreme class imbalance (1 fraudulent transaction per 5,000 legitimate) with strict latency SLA of under 15ms.',
    domain: 'Tabular / Anomaly Detection',
  },
  {
    title: 'Real-Time Drone Semantic Segmentation',
    prompt:
      'Build a lightweight computer vision model for real-time aerial semantic segmentation of urban obstacles, vegetation, and landing zones running on an embedded Jetson Orin Nano.',
    domain: 'Computer Vision / Edge AI',
  },
  {
    title: 'Multi-lingual Customer Intent Extraction',
    prompt:
      'Develop an intent classification model for customer service chat tickets across 12 languages with code-switching, spelling errors, and noisy slang.',
    domain: 'NLP / Multi-lingual',
  },
];

export const NewResearchPage: React.FC<NewResearchPageProps> = ({
  onProjectCreated,
  onNavigateToWorkspace,
}) => {
  const [problemDescription, setProblemDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunPipeline = async (autoGenerateAll: boolean) => {
    if (!problemDescription.trim()) {
      setErrorMessage('Please describe your AI/ML problem before proceeding.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let analysis = null;
      let plan = null;
      let experiments: any[] = [];

      if (autoGenerateAll) {
        setLoadingStep('Agent analyzing problem, formulating research plan & designing experiments...');
        const pipelineData = await runFullPipeline(problemDescription, constraints);
        analysis = pipelineData.analysis;
        plan = pipelineData.plan;
        experiments = pipelineData.experiments;
      } else {
        setLoadingStep('Agent analyzing problem formulation, techniques & metrics...');
        const res = await analyzeProblem(problemDescription, constraints);
        analysis = res.analysis;
      }

      // Generate clean title
      const titleWords = problemDescription
        .replace(/^(build|create|develop|design|train)\s+(a\s+)?(model\s+to\s+)?/i, '')
        .trim();
      const projectTitle =
        titleWords.charAt(0).toUpperCase() + titleWords.slice(1, 60) + (titleWords.length > 60 ? '...' : '');

      const newProject: ResearchProject = {
        id: `proj-${Date.now()}`,
        title: projectTitle,
        problemDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentStage: autoGenerateAll ? 'experiment' : 'problem',
        problemAnalysis: analysis,
        researchPlan: plan,
        experiments: experiments.map((exp, idx) => ({
          ...exp,
          id: exp.id || `EXP-0${idx + 1}`,
          createdAt: new Date().toISOString(),
        })),
        modelComparison: null,
        errorAnalysis: null,
        nextIterations: [],
        researchReport: null,
        status: 'in_progress',
        tags: [analysis.domain || 'ML', analysis.problemType || 'Classification'],
      };

      onProjectCreated(newProject);
      onNavigateToWorkspace();
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setErrorMessage(err.message || 'Failed to complete AI research planning. Please verify backend connection.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Initiate New AI Research</h1>
        </div>
        <p className="text-sm text-slate-400">
          Enter an AI or machine learning challenge. The research agent breaks down problem formulation,
          proposes viable architectural baselines, designs controlled experiments, and scaffolds the research report.
        </p>
      </div>

      {/* Main Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileQuestion className="w-4 h-4 text-cyan-400" />
            <span>Problem Statement</span>
          </label>
          <span className="text-[11px] text-slate-400">Be as specific or open-ended as needed</span>
        </div>

        <textarea
          rows={5}
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value)}
          placeholder="Describe your AI/ML problem... (e.g. 'Build a model to classify fake news articles versus verified reporting, accounting for short headlines, satire, and class imbalance.')"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
        />

        {/* Advanced Constraints Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showAdvanced ? 'Hide Constraints & Hardware Specifications' : 'Add Constraints / Compute Budget (Optional)'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-slate-400">
                Operational Constraints (Latency, Compute Budget, Dataset Availability)
              </label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. Latency < 30ms p95, 1x NVIDIA T4 GPU, training dataset limited to 10k labeled examples"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Primary Agent Action Buttons */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Structured workflow guided by Gemini 3.8</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              disabled={isLoading || !problemDescription.trim()}
              onClick={() => handleRunPipeline(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Analyze Problem</span>
            </button>

            <button
              disabled={isLoading || !problemDescription.trim()}
              onClick={() => handleRunPipeline(true)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Agent Working...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Research Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Progress Feedback */}
        {isLoading && (
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2 animate-pulse">
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{loadingStep}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              The AI Scientist is reviewing mathematical formulations, loss functions, and architectural trade-offs...
            </p>
          </div>
        )}
      </div>

      {/* Starter Templates */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Or choose a benchmark problem template:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STARTER_PROBLEMS.map((starter, idx) => (
            <div
              key={idx}
              onClick={() => setProblemDescription(starter.prompt)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {starter.title}
                </h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {starter.domain}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {starter.prompt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
