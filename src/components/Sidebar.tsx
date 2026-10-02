import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FlaskConical,
  Table,
  BarChart3,
  FileText,
  History,
  FolderGit2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ResearchProject } from '../types/research';

export type NavTab =
  | 'dashboard'
  | 'new-research'
  | 'workspace'
  | 'experiments'
  | 'results'
  | 'report'
  | 'history';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  projects: ResearchProject[];
  activeProject: ResearchProject | null;
  onSelectProject: (project: ResearchProject) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  projects,
  activeProject,
  onSelectProject,
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-research' as NavTab, label: 'New Research', icon: PlusCircle, badge: 'Agent' },
    { id: 'workspace' as NavTab, label: 'Research Workspace', icon: FlaskConical },
    { id: 'experiments' as NavTab, label: 'Experiments', icon: Table, count: activeProject?.experiments.length },
    { id: 'results' as NavTab, label: 'Results & Benchmarks', icon: BarChart3 },
    { id: 'report' as NavTab, label: 'Research Report', icon: FileText },
    { id: 'history' as NavTab, label: 'Experiment History', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white tracking-tight text-sm">AI Research Lab</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Structured ML Lab Assistant</p>
          </div>
        </div>
      </div>

      {/* Active Project Selector */}
      <div className="p-3 border-b border-slate-800/60 relative">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1 mb-1 block">
          Active Research Project
        </label>
        <button
          onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
          className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FolderGit2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-200 truncate">
              {activeProject ? activeProject.title : 'Select a Project...'}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform ${
              projectDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {projectDropdownOpen && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl z-50 py-1 max-h-56 overflow-y-auto">
            <div className="px-2.5 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Recent Projects ({projects.length})
            </div>
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj);
                  setProjectDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-slate-800/80 transition ${
                  activeProject?.id === proj.id ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-300'
                }`}
              >
                <span className="font-medium truncate">{proj.title}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span>{proj.experiments.length} exps</span>
                  <span>•</span>
                  <span className="capitalize">{proj.status.replace('_', ' ')}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
          Lab Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Lab Agent Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/70">
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Gemini 3.8 Agent</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">Ready for experiment planning</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
