import React, { useState } from 'react';
import { X, CheckCircle2, ClipboardEdit, AlertCircle } from 'lucide-react';
import { ExperimentItem, ActualExperimentResult } from '../types/research';

interface ManualResultModalProps {
  experiment: ExperimentItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (experimentId: string, result: ActualExperimentResult) => void;
}

export const ManualResultModal: React.FC<ManualResultModalProps> = ({
  experiment,
  isOpen,
  onClose,
  onSave,
}) => {
  const existing = experiment.actualResult;

  const [accuracy, setAccuracy] = useState<string>(
    existing?.accuracy ? (existing.accuracy * 100).toFixed(1) : ((experiment.expectedResult?.accuracy || 0.85) * 100).toFixed(1)
  );
  const [precision, setPrecision] = useState<string>(
    existing?.precision ? (existing.precision * 100).toFixed(1) : ((experiment.expectedResult?.precision || 0.85) * 100).toFixed(1)
  );
  const [recall, setRecall] = useState<string>(
    existing?.recall ? (existing.recall * 100).toFixed(1) : ((experiment.expectedResult?.recall || 0.82) * 100).toFixed(1)
  );
  const [f1Score, setF1Score] = useState<string>(
    existing?.f1Score ? (existing.f1Score * 100).toFixed(1) : ((experiment.expectedResult?.f1Score || 0.83) * 100).toFixed(1)
  );
  const [latencyMs, setLatencyMs] = useState<string>(
    existing?.latencyMs ? existing.latencyMs.toString() : (experiment.expectedResult?.latencyMs || 25).toString()
  );
  const [trainingLoss, setTrainingLoss] = useState<string>(
    existing?.trainingLoss ? existing.trainingLoss.toString() : '0.21'
  );
  const [validationLoss, setValidationLoss] = useState<string>(
    existing?.validationLoss ? existing.validationLoss.toString() : '0.28'
  );
  const [epochsTrained, setEpochsTrained] = useState<string>(
    existing?.epochsTrained ? existing.epochsTrained.toString() : '5'
  );
  const [sampleSizeTested, setSampleSizeTested] = useState<string>(
    existing?.sampleSizeTested ? existing.sampleSizeTested.toString() : '5000'
  );
  const [notes, setNotes] = useState<string>(
    existing?.notes || 'Lab test run completed. Recorded on holdout test split.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsePct = (val: string) => {
      const num = parseFloat(val);
      if (isNaN(num)) return 0;
      return num > 1 ? num / 100 : num;
    };

    const actualResult: ActualExperimentResult = {
      accuracy: parsePct(accuracy),
      precision: parsePct(precision),
      recall: parsePct(recall),
      f1Score: parsePct(f1Score),
      latencyMs: parseFloat(latencyMs) || 0,
      trainingLoss: parseFloat(trainingLoss) || undefined,
      validationLoss: parseFloat(validationLoss) || undefined,
      epochsTrained: parseInt(epochsTrained, 10) || undefined,
      sampleSizeTested: parseInt(sampleSizeTested, 10) || undefined,
      notes,
      recordedAt: new Date().toISOString(),
      isSimulated: false,
    };

    onSave(experiment.id, actualResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ClipboardEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Record Empirical Lab Results</h3>
              <p className="text-xs text-slate-400">
                {experiment.id} — <span className="text-slate-300 font-mono">{experiment.model}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="bg-indigo-950/40 border-b border-indigo-900/40 px-6 py-2.5 flex items-center gap-2 text-xs text-indigo-300">
          <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>
            These entries will be recorded as <strong>Actual Empirical Results</strong>, clearly distinguished from initial research hypotheses.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Primary Metric Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Accuracy (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={accuracy}
                onChange={(e) => setAccuracy(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Hypothesis: {(experiment.expectedResult.accuracy * 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                F1 Score (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={f1Score}
                onChange={(e) => setF1Score(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Hypothesis: {(experiment.expectedResult.f1Score * 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Precision (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={precision}
                onChange={(e) => setPrecision(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Hypothesis: {(experiment.expectedResult.precision * 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Recall (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={recall}
                onChange={(e) => setRecall(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Hypothesis: {(experiment.expectedResult.recall * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Latency (ms)
              </label>
              <input
                type="number"
                step="0.1"
                value={latencyMs}
                onChange={(e) => setLatencyMs(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Training Loss
              </label>
              <input
                type="number"
                step="0.001"
                value={trainingLoss}
                onChange={(e) => setTrainingLoss(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Validation Loss
              </label>
              <input
                type="number"
                step="0.001"
                value={validationLoss}
                onChange={(e) => setValidationLoss(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Epochs Trained
              </label>
              <input
                type="number"
                value={epochsTrained}
                onChange={(e) => setEpochsTrained(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Holdout Sample Size
              </label>
              <input
                type="number"
                value={sampleSizeTested}
                onChange={(e) => setSampleSizeTested(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Lab Observations & Diagnostics
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Convergence achieved at epoch 4. Model exhibited vulnerability on short texts."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Actual Lab Results</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
