import React, { useState } from 'react';
import {
  Table as TableIcon,
  Play,
  ClipboardEdit,
  Info,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  Loader2,
  AlertCircle,
  FileCheck,
  Cpu,
} from 'lucide-react';
import { ExperimentItem, ResearchProject, ActualExperimentResult } from '../types/research';
import { ManualResultModal } from '../components/ManualResultModal';
import { ExperimentDetailsModal } from '../components/ExperimentDetailsModal';
import { simulateExperimentRun } from '../services/api';

interface ExperimentsPageProps {
  project: ResearchProject;
  onUpdateProject: (updated: ResearchProject) => void;
}

export const ExperimentsPage: React.FC<ExperimentsPageProps> = ({
  project,
  onUpdateProject,
}) => {
  const [selectedExperimentForModal, setSelectedExperimentForModal] =
    useState<ExperimentItem | null>(null);
  const [editingResultExperiment, setEditingResultExperiment] =
    useState<ExperimentItem | null>(null);
  const [isSimulatingId, setIsSimulatingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'actual' | 'hypothesis'>('actual');

  const handleSaveManualResult = (
    experimentId: string,
    result: ActualExperimentResult
  ) => {
    const updatedExperiments = project.experiments.map((exp) => {
      if (exp.id === experimentId) {
        return {
          ...exp,
          actualResult: result,
          status: 'completed' as const,
        };
      }
      return exp;
    });

    const updatedProject: ResearchProject = {
      ...project,
      experiments: updatedExperiments,
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
  };

  const handleSimulateRun = async (experiment: ExperimentItem) => {
    setIsSimulatingId(experiment.id);
    try {
      const { actualResult, executionLogs } = await simulateExperimentRun(
        experiment,
        project.problemDescription
      );

      const updatedExperiments = project.experiments.map((exp) => {
        if (exp.id === experiment.id) {
          return {
            ...exp,
            actualResult,
            executionLogs,
            status: 'completed' as const,
          };
        }
        return exp;
      });

      const updatedProject: ResearchProject = {
        ...project,
        experiments: updatedExperiments,
        updatedAt: new Date().toISOString(),
      };
      onUpdateProject(updatedProject);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulatingId(null);
    }
  };

  const handleAddExperiment = () => {
    const newId = `EXP-0${project.experiments.length + 1}`;
    const newExp: ExperimentItem = {
      id: newId,
      title: `${newId}: Custom Ablation Run`,
      model: 'Custom Candidate Model / Backbone',
      approachId: 'custom',
      dataset: {
        name: project.experiments[0]?.dataset.name || 'Benchmark Dataset',
        splitStrategy: 'Stratified 70/15/15',
        sampleSize: '50,000 samples',
      },
      preprocessing: ['Standard Normalization', 'Feature Scaling'],
      architecture: 'User-specified experimental architecture',
      hyperparameters: {
        learning_rate: '1e-4',
        batch_size: 32,
        epochs: 5,
        optimizer: 'AdamW',
      },
      evaluationMetrics: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
      expectedResult: {
        accuracy: 0.86,
        precision: 0.87,
        recall: 0.84,
        f1Score: 0.855,
        latencyMs: 18,
        hypothesis: 'Custom ablation testing hyperparameter sensitivity.',
      },
      status: 'planned',
      createdAt: new Date().toISOString(),
    };

    const updatedProject: ResearchProject = {
      ...project,
      experiments: [...project.experiments, newExp],
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
    setEditingResultExperiment(newExp);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Experiment Suite</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
              {project.experiments.length} Runs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Systematic benchmarking matrix tracking Accuracy, Precision, Recall, and F1 across candidate architectures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center text-xs">
            <button
              onClick={() => setViewMode('actual')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'actual'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Actual Results
            </button>
            <button
              onClick={() => setViewMode('hypothesis')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'hypothesis'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hypotheses
            </button>
          </div>

          <button
            onClick={handleAddExperiment}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experiment</span>
          </button>
        </div>
      </div>

      {/* Legend Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <strong className="text-slate-300">Empirical Lab Result:</strong> User recorded or validated run
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <strong className="text-slate-300">Hypothesis / Expected:</strong> Theoretical prediction
          </span>
        </div>
        <span className="text-[11px] text-cyan-400 font-mono">
          Click any row to inspect full hyperparameters & logs
        </span>
      </div>

      {/* EXPERIMENT TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Experiment</th>
                <th className="py-3.5 px-4">Model</th>
                <th className="py-3.5 px-4">Dataset</th>
                <th className="py-3.5 px-4">Accuracy</th>
                <th className="py-3.5 px-4">Precision</th>
                <th className="py-3.5 px-4">Recall</th>
                <th className="py-3.5 px-4">F1 Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {project.experiments.map((exp) => {
                const hasActual = !!exp.actualResult;
                const isActualMode = viewMode === 'actual';

                // Displayed metrics based on viewMode
                const acc = isActualMode && hasActual
                  ? (exp.actualResult!.accuracy * 100).toFixed(1) + '%'
                  : (exp.expectedResult.accuracy * 100).toFixed(1) + '%';

                const prec = isActualMode && hasActual
                  ? (exp.actualResult!.precision * 100).toFixed(1) + '%'
                  : (exp.expectedResult.precision * 100).toFixed(1) + '%';

                const rec = isActualMode && hasActual
                  ? (exp.actualResult!.recall * 100).toFixed(1) + '%'
                  : (exp.expectedResult.recall * 100).toFixed(1) + '%';

                const f1 = isActualMode && hasActual
                  ? (exp.actualResult!.f1Score * 100).toFixed(1) + '%'
                  : (exp.expectedResult.f1Score * 100).toFixed(1) + '%';

                const isSimulating = isSimulatingId === exp.id;

                return (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => setSelectedExperimentForModal(exp)}
                  >
                    {/* Experiment */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {exp.id}
                        </span>
                        <div>
                          <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors block">
                            {exp.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(exp.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Model */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-medium text-slate-200 truncate">{exp.model}</div>
                      <div className="text-[10px] text-slate-400 truncate">{exp.architecture}</div>
                    </td>

                    {/* Dataset */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-slate-300 font-medium">{exp.dataset.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{exp.dataset.splitStrategy}</div>
                    </td>

                    {/* Accuracy */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono font-semibold">
                      <span className={hasActual && isActualMode ? 'text-emerald-400' : 'text-slate-300'}>
                        {acc}
                      </span>
                    </td>

                    {/* Precision */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono font-semibold">
                      <span className={hasActual && isActualMode ? 'text-emerald-400' : 'text-slate-300'}>
                        {prec}
                      </span>
                    </td>

                    {/* Recall */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono font-semibold">
                      <span className={hasActual && isActualMode ? 'text-emerald-400' : 'text-slate-300'}>
                        {rec}
                      </span>
                    </td>

                    {/* F1 Score */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono font-bold">
                      <span className={hasActual && isActualMode ? 'text-emerald-400' : 'text-amber-300'}>
                        {f1}
                      </span>
                      <span className="text-[9px] block text-slate-400 font-normal">
                        {hasActual && isActualMode ? 'Actual' : 'Hypothesis'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize flex items-center gap-1 w-fit ${
                          exp.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : exp.status === 'running'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {exp.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {exp.status === 'running' && <Activity className="w-2.5 h-2.5 animate-pulse" />}
                        {exp.status === 'planned' && <Clock className="w-2.5 h-2.5" />}
                        <span>{exp.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-4 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="Enter Manual Lab Results"
                          onClick={() => setEditingResultExperiment(exp)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                        >
                          <ClipboardEdit className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Enter Results</span>
                        </button>

                        <button
                          title="Simulate Cluster Run via AI"
                          disabled={isSimulating}
                          onClick={() => handleSimulateRun(exp)}
                          className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                        >
                          {isSimulating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                          <span>{isSimulating ? 'Simulating...' : 'Simulate'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Result Entry Modal */}
      {editingResultExperiment && (
        <ManualResultModal
          experiment={editingResultExperiment}
          isOpen={true}
          onClose={() => setEditingResultExperiment(null)}
          onSave={handleSaveManualResult}
        />
      )}

      {/* Details Modal */}
      {selectedExperimentForModal && (
        <ExperimentDetailsModal
          experiment={selectedExperimentForModal}
          isOpen={true}
          onClose={() => setSelectedExperimentForModal(null)}
        />
      )}
    </div>
  );
};
