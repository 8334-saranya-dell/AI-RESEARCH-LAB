import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Scale,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ResearchProject, ModelComparisonRow } from '../types/research';

interface ResultsPageProps {
  project: ResearchProject;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ project }) => {
  const [selectedMetric, setSelectedMetric] = useState<'f1Score' | 'accuracy' | 'precision' | 'recall'>('f1Score');

  // Prepare data rows for comparison table and charts
  const comparisonRows: ModelComparisonRow[] = project.modelComparison?.matrix?.length
    ? project.modelComparison.matrix
    : project.experiments.map((exp) => {
        const actual = exp.actualResult;
        return {
          experimentId: exp.id,
          modelName: exp.model,
          accuracy: actual ? actual.accuracy : exp.expectedResult.accuracy,
          f1Score: actual ? actual.f1Score : exp.expectedResult.f1Score,
          precision: actual ? actual.precision : exp.expectedResult.precision,
          recall: actual ? actual.recall : exp.expectedResult.recall,
          latencyMs: actual ? actual.latencyMs : exp.expectedResult.latencyMs,
          memoryMb: 400,
          trainingCost: 'Medium',
          interpretability: 'Medium',
          productionReadiness: 'Candidate',
          pros: 'Balanced performance profile',
          cons: 'Standard operational resource footprint',
          isActualResult: !!actual,
        };
      });

  const champion = project.modelComparison?.recommendedModel || (comparisonRows[0] ? comparisonRows[0].modelName : '');

  // Maximum latency for scaling scatter plot
  const maxLatency = Math.max(...comparisonRows.map((r) => r.latencyMs), 40);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Results & Empirical Benchmarks</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Verified Evaluation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparative performance charts, latency trade-offs, and multi-dimensional architectural matrix.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center text-xs">
          {(['f1Score', 'accuracy', 'precision', 'recall'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition ${
                selectedMetric === m
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'f1Score' ? 'Macro-F1' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Champion Model Callout */}
      {project.modelComparison?.recommendedModel && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recommended Champion Model</span>
            </div>
            <h3 className="text-base font-bold text-white">{project.modelComparison.recommendedModel}</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {project.modelComparison.recommendationReason}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
              Production Candidate
            </span>
          </div>
        </div>
      )}

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metric Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                {selectedMetric === 'f1Score' ? 'Macro F1-Score' : selectedMetric.toUpperCase()} Comparison
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Scale: 0% - 100%</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {comparisonRows.map((row) => {
              const val = row[selectedMetric];
              const pct = Math.round(val * 1000) / 10;
              const isBest = pct === Math.max(...comparisonRows.map((r) => Math.round(r[selectedMetric] * 1000) / 10));

              return (
                <div key={row.experimentId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-400">
                        {row.experimentId}
                      </span>
                      <span className="text-slate-200 font-medium truncate max-w-[220px]">
                        {row.modelName}
                      </span>
                      {row.isActualResult ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Actual
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Hypothesis
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-white text-xs">
                      {pct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBest
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-sm shadow-cyan-500/50'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latency vs Accuracy Scatter / Trade-off Plot */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Latency vs F1-Score Trade-off Frontier</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Lower Latency & Higher F1 = Ideal</span>
          </div>

          {/* Scatter Matrix Canvas */}
          <div className="relative h-60 w-full bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
            {/* Ideal Region Indicator */}
            <div className="absolute top-2 left-2 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-semibold pointer-events-none">
              ★ Pareto Frontier Optimal Region
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-x-4 top-1/2 h-px bg-slate-900 pointer-events-none" />
            <div className="absolute inset-y-4 left-1/2 w-px bg-slate-900 pointer-events-none" />

            {/* Plot Points */}
            <div className="relative w-full h-full">
              {comparisonRows.map((row) => {
                // X-axis: Latency (0ms on left, maxLatency on right)
                const xPct = Math.min(90, Math.max(10, (row.latencyMs / (maxLatency * 1.1)) * 100));
                // Y-axis: F1-score (0.70 at bottom to 1.0 at top)
                const f1Min = 0.70;
                const f1Max = 1.0;
                const yPct = 100 - Math.min(90, Math.max(10, ((row.f1Score - f1Min) / (f1Max - f1Min)) * 100));

                return (
                  <div
                    key={row.experimentId}
                    className="absolute group transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                    style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-lg shadow-indigo-500/50 group-hover:scale-125 transition-transform flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg shadow-2xl text-[10px] whitespace-nowrap z-30">
                      <span className="font-bold text-white block">{row.experimentId}: {row.modelName}</span>
                      <span className="text-cyan-400 font-mono">F1: {(row.f1Score * 100).toFixed(1)}%</span>
                      <span className="text-slate-400 font-mono ml-2">Latency: {row.latencyMs}ms</span>
                    </div>

                    <span className="font-mono text-[9px] text-slate-300 font-semibold absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      {row.experimentId} ({row.latencyMs}ms)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Axis Labels */}
            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800">
              <span>0ms Latency (Fast)</span>
              <span>{Math.round(maxLatency)}ms (Heavy)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Full Model Comparison Matrix</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {comparisonRows.length} Tested Architectures
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3 px-4">Model & Architecture</th>
                <th className="py-3 px-4">F1 Score</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision / Recall</th>
                <th className="py-3 px-4">Latency (ms)</th>
                <th className="py-3 px-4">Compute Cost</th>
                <th className="py-3 px-4">Deployment Readiness</th>
                <th className="py-3 px-4">Strengths / Trade-offs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {comparisonRows.map((row) => (
                <tr key={row.experimentId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{row.modelName}</div>
                    <span className="font-mono text-[10px] text-indigo-400">{row.experimentId}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                    {(row.f1Score * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">
                    {(row.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                    {(row.precision * 100).toFixed(1)}% / {(row.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-300">
                    {row.latencyMs} ms
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] text-slate-300">{row.trainingCost}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        row.productionReadiness === 'Production-Ready'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {row.productionReadiness}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-[11px] text-slate-400">
                    <div className="text-slate-300 truncate font-medium">{row.pros}</div>
                    <div className="text-slate-400 truncate">{row.cons}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
