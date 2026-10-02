import React from 'react';
import {
  FolderGit2,
  FlaskConical,
  Activity,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ResearchProject } from '../types/research';
import { NavTab } from '../components/Sidebar';

interface DashboardPageProps {
  projects: ResearchProject[];
  activeProject: ResearchProject | null;
  onSelectProject: (p: ResearchProject) => void;
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onNavigate,
}) => {
  const totalProjects = projects.length;
  const totalExperiments = projects.reduce((acc, p) => acc + p.experiments.length, 0);
  const runningExperiments = projects.reduce(
    (acc, p) => acc + p.experiments.filter((e) => e.status === 'running').length,
    0
  );
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Research Lab Dashboard</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              System Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous scientific workflow engine for ML hypothesis formulation, benchmarking, and error analysis.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-research')}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Research Problem</span>
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Research Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{totalProjects}</span>
            <span className="text-xs text-slate-400">active labs</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span>Structured experimental pipelines</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Experiments Performed
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{totalExperiments}</span>
            <span className="text-xs text-slate-400">runs evaluated</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            <span>Baselines + SOTA models</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Experiments Running
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{runningExperiments}</span>
            <span className="text-xs text-slate-400">in cluster</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Queued or active evaluation</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Completed Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{completedProjects}</span>
            <span className="text-xs text-slate-400">reports generated</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Peer-grade technical papers</span>
          </div>
        </div>
      </div>

      {/* Active Project Highlight Banner */}
      {activeProject && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Active Research Project
                </span>
                <span className="text-xs text-slate-400">
                  Stage: <strong className="text-cyan-400 capitalize">{activeProject.currentStage}</strong>
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{activeProject.title}</h2>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {activeProject.problemDescription}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                  <strong className="text-slate-200">{activeProject.experiments.length}</strong> Experiments
                </span>
                <span>•</span>
                <span>
                  Domain: <strong className="text-slate-200">{activeProject.problemAnalysis?.domain || 'General ML'}</strong>
                </span>
                <span>•</span>
                <span>
                  Updated {new Date(activeProject.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('workspace')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('experiments')}
                className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                View Experiments
              </button>
              {activeProject.researchReport && (
                <button
                  onClick={() => onNavigate('report')}
                  className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold border border-cyan-500/30 transition"
                >
                  Read Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">All Research Projects</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {projects.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const isActive = activeProject?.id === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isActive
                    ? 'bg-slate-900/90 border-indigo-500/50 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        proj.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {proj.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      Stage: <strong className="text-slate-300">{proj.currentStage}</strong>
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {proj.problemDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 font-medium">
                      {proj.experiments.length} experiments
                    </span>
                    {proj.modelComparison?.recommendedModel && (
                      <span className="text-emerald-400 text-[11px] font-mono truncate max-w-[180px]">
                        ★ {proj.modelComparison.recommendedModel.split(':')[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-400 transition-colors font-medium">
                    <span>Open</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
