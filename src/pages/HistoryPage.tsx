import React from 'react';
import {
  History,
  TrendingUp,
  GitCommit,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  FlaskConical,
} from 'lucide-react';
import { ResearchProject, ExperimentItem } from '../types/research';

interface HistoryPageProps {
  project: ResearchProject;
  onUpdateProject: (updated: ResearchProject) => void;
  onNavigateToExperiments: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  project,
  onUpdateProject,
  onNavigateToExperiments,
}) => {
  const sortedExperiments = [...project.experiments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const handleApplyNextIteration = (title: string, hypothesis: string) => {
    const newId = `EXP-0${project.experiments.length + 1}`;
    const newExp: ExperimentItem = {
      id: newId,
      title,
      model: `${title.split(':')[1]?.trim() || 'Next Iteration Model'}`,
      approachId: 'iteration',
      dataset: {
        name: project.experiments[0]?.dataset.name || 'Benchmark Dataset',
        splitStrategy: 'Stratified 70/15/15',
        sampleSize: '50,000 samples',
      },
      preprocessing: ['Feature Calibration', 'Adversarial Augmentation'],
      architecture: 'Iterative refinement based on diagnostic post-mortem',
      hyperparameters: {
        learning_rate: '1.2e-5',
        batch_size: 24,
        epochs: 5,
        optimizer: 'AdamW with Cosine Annealing',
      },
      evaluationMetrics: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
      expectedResult: {
        accuracy: 0.945,
        precision: 0.955,
        recall: 0.932,
        f1Score: 0.943,
        latencyMs: 33,
        hypothesis,
      },
      status: 'planned',
      createdAt: new Date().toISOString(),
    };

    const updated: ResearchProject = {
      ...project,
      experiments: [...project.experiments, newExp],
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updated);
    onNavigateToExperiments();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Experiment Evolution & History</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
              Timeline Audit
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chronological audit log tracking hyperparameter changes, architectural iterations, and milestone improvements.
          </p>
        </div>
      </div>

      {/* Progression Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Empirical Milestone Trajectory</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {sortedExperiments.length} Iterations Logged
          </span>
        </div>

        {/* Milestone Steps Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {sortedExperiments.map((exp, idx) => {
            const actualF1 = exp.actualResult
              ? (exp.actualResult.f1Score * 100).toFixed(1)
              : (exp.expectedResult.f1Score * 100).toFixed(1);

            return (
              <div
                key={exp.id}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">{exp.id}</span>
                  <span className="text-[10px] text-slate-400">Step {idx + 1}</span>
                </div>
                <h4 className="text-xs font-semibold text-white truncate">{exp.title}</h4>
                <div className="mt-3 flex items-baseline justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-[11px] text-slate-400">Macro-F1:</span>
                  <span className="font-mono text-sm font-bold text-cyan-400">{actualF1}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Next Experiment Sprint */}
      {project.nextIterations && project.nextIterations.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Recommended Next Experiment Sprint</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Agent Proposed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.nextIterations.map((iter) => (
              <div
                key={iter.id}
                className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{iter.title}</h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {iter.expectedGain}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{iter.motivation}</p>
                  <p className="text-[11px] text-slate-400 italic">"{iter.targetHypothesis}"</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Priority: {iter.priority}
                  </span>
                  <button
                    onClick={() => handleApplyNextIteration(iter.title, iter.targetHypothesis)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>Schedule Run</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chronological Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Full Experiment Chronology</h3>
        </div>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {sortedExperiments.map((exp, idx) => (
            <div key={exp.id} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{exp.id}</span>
                    <h4 className="text-xs font-bold text-white">{exp.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(exp.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">Architecture / Model:</span>
                    <p className="font-mono text-slate-200 text-[11px]">{exp.model}</p>
                    <p className="text-slate-400 text-[11px] mt-1">{exp.architecture}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Accuracy:</span>
                      <span className="font-mono text-white">
                        {exp.actualResult
                          ? `${(exp.actualResult.accuracy * 100).toFixed(1)}%`
                          : `${(exp.expectedResult.accuracy * 100).toFixed(1)}% (Hypothesis)`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Macro-F1:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {exp.actualResult
                          ? `${(exp.actualResult.f1Score * 100).toFixed(1)}% (Empirical)`
                          : `${(exp.expectedResult.f1Score * 100).toFixed(1)}%`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Latency:</span>
                      <span className="font-mono text-slate-300">
                        {exp.actualResult ? exp.actualResult.latencyMs : exp.expectedResult.latencyMs} ms
                      </span>
                    </div>
                  </div>
                </div>

                {exp.actualResult?.notes && (
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                    <strong>Lab Notes:</strong> {exp.actualResult.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
