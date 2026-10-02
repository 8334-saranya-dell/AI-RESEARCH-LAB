import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { NewResearchPage } from './pages/NewResearchPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { ResultsPage } from './pages/ResultsPage';
import { ReportPage } from './pages/ReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { INITIAL_PROJECTS } from './data/initialProjects';
import { ResearchProject } from './types/research';
import { checkBackendHealth } from './services/api';
import { Sparkles, Activity, AlertCircle, Menu, X } from 'lucide-react';

const STORAGE_KEY = 'ai_research_lab_projects_v2';

export default function App() {
  const [projects, setProjects] = useState<ResearchProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || INITIAL_PROJECTS[0].id;
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState<{ status: string; hasApiKey: boolean } | null>(null);

  // Sync projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  // Check backend health
  useEffect(() => {
    checkBackendHealth().then((health) => {
      setBackendHealth(health);
    });
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  const handleSelectProject = (project: ResearchProject) => {
    setActiveProjectId(project.id);
  };

  const handleUpdateProject = (updated: ResearchProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleProjectCreated = (newProject: ResearchProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setCurrentTab('workspace');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          projects={projects}
          activeProject={activeProject}
          onSelectProject={handleSelectProject}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="w-64 h-full bg-slate-950 border-r border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-white text-sm">AI Research Lab</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setMobileSidebarOpen(false);
              }}
              projects={projects}
              activeProject={activeProject}
              onSelectProject={(proj) => {
                handleSelectProject(proj);
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-950/90 px-6 flex items-center justify-between flex-shrink-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
                AI Research Lab
              </span>
              <span className="text-slate-400 text-xs">/</span>
              <span className="text-xs font-semibold text-slate-200 capitalize">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Model & Agent Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-cyan-400 font-semibold">gemini-3.8-flash</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300">Agent Active</span>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardPage
              projects={projects}
              activeProject={activeProject}
              onSelectProject={(p) => {
                handleSelectProject(p);
                setCurrentTab('workspace');
              }}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'new-research' && (
            <NewResearchPage
              onProjectCreated={handleProjectCreated}
              onNavigateToWorkspace={() => setCurrentTab('workspace')}
            />
          )}

          {currentTab === 'workspace' && activeProject && (
            <WorkspacePage
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'experiments' && activeProject && (
            <ExperimentsPage
              project={activeProject}
              onUpdateProject={handleUpdateProject}
            />
          )}

          {currentTab === 'results' && activeProject && (
            <ResultsPage project={activeProject} />
          )}

          {currentTab === 'report' && activeProject && (
            <ReportPage
              project={activeProject}
              onUpdateProject={handleUpdateProject}
            />
          )}

          {currentTab === 'history' && activeProject && (
            <HistoryPage
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              onNavigateToExperiments={() => setCurrentTab('experiments')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
