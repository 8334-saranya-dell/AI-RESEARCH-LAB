import React from 'react';
import {
  FileQuestion,
  Compass,
  Search,
  FlaskConical,
  Scale,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  CircleDot,
  Clock,
} from 'lucide-react';
import { WorkflowStage } from '../types/research';

interface StageProgressBarProps {
  currentStage: WorkflowStage;
  onSelectStage?: (stage: WorkflowStage) => void;
  status?: 'draft' | 'in_progress' | 'completed';
}

interface StageStep {
  id: WorkflowStage;
  label: string;
  icon: React.ElementType;
  shortDesc: string;
}

export const STAGES: StageStep[] = [
  { id: 'problem', label: 'Problem', icon: FileQuestion, shortDesc: 'Problem Analysis & Formulation' },
  { id: 'planning', label: 'Planning', icon: Compass, shortDesc: 'Research Strategy & Roadmap' },
  { id: 'research', label: 'Research', icon: Search, shortDesc: 'Architectural Exploration' },
  { id: 'experiment', label: 'Experiment', icon: FlaskConical, shortDesc: 'Benchmarking & Execution' },
  { id: 'evaluation', label: 'Evaluation', icon: Scale, shortDesc: 'Model Comparison & Metrics' },
  { id: 'improvement', label: 'Improvement', icon: Sparkles, shortDesc: 'Error Diagnostics & Iteration' },
  { id: 'report', label: 'Report', icon: FileCheck2, shortDesc: 'Publication Technical Report' },
];

export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  currentStage,
  onSelectStage,
  status = 'in_progress',
}) => {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Research Pipeline Workflow
            </span>
            <span className="text-[10px] text-slate-400">
              (Stage {currentIndex + 1} of {STAGES.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
              status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : status === 'in_progress'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {status === 'completed' ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : status === 'in_progress' ? (
              <CircleDot className="w-3 h-3 text-cyan-400 animate-spin" />
            ) : (
              <Clock className="w-3 h-3 text-slate-400" />
            )}
            <span className="capitalize">{status.replace('_', ' ')}</span>
          </span>
        </div>
      </div>

      {/* Horizontal Stepper */}
      <div className="relative flex items-center justify-between">
        {/* Continuous background track line */}
        <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-800 -z-0" />
        {/* Active progress fill */}
        <div
          className="absolute left-6 top-5 h-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100)}%`,
            maxWidth: 'calc(100% - 3rem)',
          }}
        />

        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage?.(stage.id)}
              className={`relative z-10 flex flex-col items-center group cursor-pointer transition-all duration-200 focus:outline-none`}
            >
              {/* Circle Icon Badge */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/30 scale-110 ring-4 ring-indigo-500/20'
                    : isPassed
                    ? 'bg-slate-900 border-indigo-500 text-indigo-400 group-hover:border-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:border-slate-700'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-xs mt-2 font-medium tracking-tight transition-colors ${
                  isCurrent
                    ? 'text-cyan-400 font-semibold'
                    : isPassed
                    ? 'text-slate-300'
                    : 'text-slate-400 group-hover:text-slate-400'
                }`}
              >
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
