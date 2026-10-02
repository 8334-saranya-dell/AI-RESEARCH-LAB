import React from 'react';
import { X, Layers, Database, Cpu, CheckCircle2, Terminal } from 'lucide-react';
import { ExperimentItem } from '../types/research';

interface ExperimentDetailsModalProps {
  experiment: ExperimentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExperimentDetailsModal: React.FC<ExperimentDetailsModalProps> = ({
  experiment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !experiment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {experiment.id}
              </span>
              <span className="text-xs uppercase font-semibold text-slate-400">
                Specification & Protocol
              </span>
            </div>
            <h3 className="text-base font-semibold text-white mt-1">{experiment.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Architecture & Model */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
              <Cpu className="w-4 h-4" />
              <span>Model Architecture & Backbone</span>
            </div>
            <p className="text-slate-200 font-medium">{experiment.model}</p>
            <p className="text-slate-400 mt-1">{experiment.architecture}</p>
          </div>

          {/* Dataset Configuration */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
              <Database className="w-4 h-4" />
              <span>Dataset & Partitioning</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">Benchmark Corpus:</span>
                <span className="font-medium text-white">{experiment.dataset.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Split Strategy:</span>
                <span className="font-medium text-white">{experiment.dataset.splitStrategy}</span>
              </div>
              {experiment.dataset.sampleSize && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Sample Size:</span>
                  <span className="text-white">{experiment.dataset.sampleSize}</span>
                </div>
              )}
              {experiment.dataset.augmentation && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Augmentation:</span>
                  <span className="text-white">{experiment.dataset.augmentation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Preprocessing Pipeline */}
          <div>
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Data Preprocessing Pipeline</span>
            </div>
            <ul className="space-y-1.5 pl-2">
              {experiment.preprocessing.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-purple-300 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hyperparameters Grid */}
          <div>
            <div className="text-slate-300 font-semibold mb-2">
              Hyperparameter Specification
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {Object.entries(experiment.hyperparameters).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/50">
                  <span className="font-mono text-[11px] text-slate-400">{key}:</span>
                  <span className="font-mono text-[11px] font-semibold text-cyan-300 truncate max-w-[160px]">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Expected vs Actual Results */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800/60 px-4 py-2 text-slate-200 font-semibold text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>Metric Comparison (Hypothesis vs Empirical)</span>
              <span className="text-[10px] text-slate-400">Holdout Evaluation</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 bg-slate-950/80">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-amber-400 mb-2 flex items-center gap-1">
                  <span>Initial Research Hypothesis</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exp. Accuracy:</span>
                    <span className="font-mono font-bold text-white">
                      {(experiment.expectedResult.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exp. F1 Score:</span>
                    <span className="font-mono font-bold text-white">
                      {(experiment.expectedResult.f1Score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exp. Latency:</span>
                    <span className="font-mono text-white">{experiment.expectedResult.latencyMs} ms</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic mt-2.5 pt-2 border-t border-slate-800">
                  "{experiment.expectedResult.hypothesis}"
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Actual Recorded Lab Result</span>
                </div>
                {experiment.actualResult ? (
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual Accuracy:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {(experiment.actualResult.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual F1 Score:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {(experiment.actualResult.f1Score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual Latency:</span>
                      <span className="font-mono text-emerald-400">
                        {experiment.actualResult.latencyMs} ms
                      </span>
                    </div>
                    {experiment.actualResult.notes && (
                      <p className="text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800">
                        {experiment.actualResult.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 py-4 text-center">
                    No empirical results recorded yet. Click "Enter Results" or "Simulate" to log data.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Execution Logs */}
          {experiment.executionLogs && experiment.executionLogs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Cluster Training & Checkpoint Logs</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                {experiment.executionLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
