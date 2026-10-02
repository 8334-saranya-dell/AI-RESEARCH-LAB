import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  Printer,
  Sparkles,
  Check,
  RotateCcw,
  Code2,
  FileCheck2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ResearchProject, ResearchReportData } from '../types/research';
import { generateResearchReport } from '../services/api';

interface ReportPageProps {
  project: ResearchProject;
  onUpdateProject: (updated: ResearchProject) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ project, onUpdateProject }) => {
  const [viewTab, setViewTab] = useState<'paper' | 'markdown'>('paper');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const report = project.researchReport;

  const handleCopyMarkdown = () => {
    if (!report?.markdownContent) return;
    navigator.clipboard.writeText(report.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!report?.markdownContent) return;
    const blob = new Blob([report.markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-research-report.md`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSynthesizeReport = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const { report: newReport } = await generateResearchReport(project);
      const updated: ResearchProject = {
        ...project,
        researchReport: newReport,
        currentStage: 'report',
        status: 'completed',
        updatedAt: new Date().toISOString(),
      };
      onUpdateProject(updated);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to synthesize report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Technical Research Report</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
              Publication Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Formal technical whitepaper synthesizing hypotheses, benchmark results, error post-mortems, and deployment recommendations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {report && (
            <>
              {/* Tab Switcher */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center text-xs">
                <button
                  onClick={() => setViewTab('paper')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    viewTab === 'paper' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Formatted Paper
                </button>
                <button
                  onClick={() => setViewTab('markdown')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    viewTab === 'markdown' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw Markdown
                </button>
              </div>

              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Copy Markdown to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Download Markdown File"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download .md</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>Print</span>
              </button>
            </>
          )}

          <button
            disabled={isGenerating}
            onClick={handleSynthesizeReport}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{report ? 'Re-synthesize Report' : 'Generate Technical Report'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Report Document View */}
      {report ? (
        viewTab === 'paper' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-12 space-y-8 text-slate-200 print:bg-white print:text-black print:border-none print:shadow-none">
            {/* Academic Header */}
            <div className="border-b border-slate-800 pb-6 space-y-3">
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-400 block">
                Artificial Intelligence Research Laboratory
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {report.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span>
                  Author: <strong className="text-slate-300">{report.author}</strong>
                </span>
                <span>•</span>
                <span>
                  Published: <strong className="text-slate-300">{new Date(report.generatedAt).toLocaleDateString()}</strong>
                </span>
                <span>•</span>
                <span>
                  Status: <strong className="text-emerald-400">Peer-Reviewed Protocol</strong>
                </span>
              </div>
            </div>

            {/* Abstract Box */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block font-mono">
                Executive Abstract
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {report.abstract}
              </p>
            </div>

            {/* 1. Problem Statement */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 border-b border-slate-800/80 pb-1">
                1. Problem Statement & Mathematical Formulation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.problemStatement}
              </p>
            </section>

            {/* 2. Research Question */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 border-b border-slate-800/80 pb-1">
                2. Research Questions & Hypotheses
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.researchQuestion}
              </p>
            </section>

            {/* 3. Approaches Tested */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 border-b border-slate-800/80 pb-1">
                3. Experimental Methodologies & Tested Approaches
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.approachesTested}
              </p>
            </section>

            {/* 4. Empirical Benchmark Table */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 border-b border-slate-800/80 pb-1">
                4. Benchmark Results & Comparative Evaluation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.experimentResultsSummary}
              </p>

              {/* Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden mt-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                      <th className="py-2.5 px-4">Experiment</th>
                      <th className="py-2.5 px-4">Model Architecture</th>
                      <th className="py-2.5 px-4">Accuracy</th>
                      <th className="py-2.5 px-4">Macro-F1</th>
                      <th className="py-2.5 px-4">Latency</th>
                      <th className="py-2.5 px-4">Result Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {project.experiments.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-bold text-indigo-400">{exp.id}</td>
                        <td className="py-2.5 px-4 font-sans text-white">{exp.model}</td>
                        <td className="py-2.5 px-4">
                          {exp.actualResult
                            ? (exp.actualResult.accuracy * 100).toFixed(1) + '%'
                            : (exp.expectedResult.accuracy * 100).toFixed(1) + '%'}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-cyan-400">
                          {exp.actualResult
                            ? (exp.actualResult.f1Score * 100).toFixed(1) + '%'
                            : (exp.expectedResult.f1Score * 100).toFixed(1) + '%'}
                        </td>
                        <td className="py-2.5 px-4">
                          {exp.actualResult ? exp.actualResult.latencyMs : exp.expectedResult.latencyMs} ms
                        </td>
                        <td className="py-2.5 px-4 font-sans">
                          {exp.actualResult ? (
                            <span className="text-emerald-400 font-semibold">Actual Lab Data</span>
                          ) : (
                            <span className="text-amber-400 font-semibold">Hypothesis</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 5. In-Depth Error Analysis */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 border-b border-slate-800/80 pb-1">
                5. Diagnostic Error Analysis & Failure Modes
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.errorAnalysisDiscussion}
              </p>
            </section>

            {/* 6. Best Performing Approach */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 border-b border-slate-800/80 pb-1">
                6. Champion Recommendation & Operational Justification
              </h3>
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                <span className="font-semibold text-emerald-400 text-xs block">Champion Architecture:</span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {report.bestPerformingApproach}
                </p>
              </div>
            </section>

            {/* 7. Limitations & Future Work */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <section className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  7. Operational Limitations
                </h4>
                <ul className="space-y-1.5 pl-2">
                  {report.limitations.map((lim, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  8. Future Research Directions
                </h4>
                <ul className="space-y-1.5 pl-2">
                  {report.futureImprovements.map((imp, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        ) : (
          /* Raw Markdown View */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Markdown Document ({report.markdownContent.length} chars)</span>
              <button
                onClick={handleCopyMarkdown}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Text</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
              {report.markdownContent}
            </pre>
          </div>
        )
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Report Generated Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Click "Generate Technical Report" to synthesize your experimental findings, benchmark comparisons, and error post-mortems into a definitive paper.
            </p>
          </div>
          <button
            disabled={isGenerating}
            onClick={handleSynthesizeReport}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2 transition"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Compile Publication Report</span>
          </button>
        </div>
      )}
    </div>
  );
};
