import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  FileQuestion,
  Compass,
  Search,
  FlaskConical,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Cpu,
  Layers,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { StageProgressBar } from '../components/StageProgressBar';
import { AgentActivityStream } from '../components/AgentActivityStream';
import { AgentToolName } from '../types/agent';
import {
  ResearchProject,
  WorkflowStage,
} from '../types/research';
import {
  generateResearchPlan,
  generateExperiments,
  compareModels,
  runErrorAnalysis,
  proposeNextIteration,
  generateResearchReport,
  stepAgent,
  executeSpecificTool,
} from '../services/api';
import { NavTab } from '../components/Sidebar';

interface WorkspacePageProps {
  project: ResearchProject;
  onUpdateProject: (updated: ResearchProject) => void;
  onNavigate: (tab: NavTab) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  project,
  onUpdateProject,
  onNavigate,
}) => {
  const [activeStage, setActiveStage] = useState<WorkflowStage>(project.currentStage || 'problem');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeGoal, setActiveGoal] = useState<string>(
    project.activeGoal || `Improve ${project.title.toLowerCase()} and verify champion architecture.`
  );
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const autonomousRef = React.useRef(false);

  // Agent Loop Handler: Single Step
  const handleStepAgent = async () => {
    setIsProcessing(true);
    setProcessingMessage('Agent planning next action and selecting tool...');
    setErrorMessage(null);
    try {
      const result = await stepAgent(activeGoal, project, project.agentActivity || []);
      onUpdateProject(result.updatedProject);

      const tool = result.step.toolExecution.tool;
      if (tool === 'research_topic') setActiveStage('problem');
      else if (tool === 'create_experiment') setActiveStage('planning');
      else if (tool === 'run_python_experiment') setActiveStage('experiment');
      else if (tool === 'evaluate_experiment') setActiveStage('experiment');
      else if (tool === 'compare_experiments') setActiveStage('evaluation');
      else if (tool === 'analyze_errors') setActiveStage('improvement');
      else if (tool === 'propose_next_experiment') setActiveStage('improvement');
      else if (tool === 'generate_report') setActiveStage('report');

      return result;
    } catch (err: any) {
      setErrorMessage(err.message || 'Agent cycle error');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Agent Loop Handler: Autonomous Continuous Execution
  const handleToggleAutonomousLoop = async () => {
    if (isAgentRunning) {
      autonomousRef.current = false;
      setIsAgentRunning(false);
      return;
    }

    autonomousRef.current = true;
    setIsAgentRunning(true);
    setErrorMessage(null);

    let currentProj = project;
    while (autonomousRef.current) {
      try {
        const result = await stepAgent(activeGoal, currentProj, currentProj.agentActivity || []);
        currentProj = result.updatedProject;
        onUpdateProject(currentProj);

        const tool = result.step.toolExecution.tool;
        if (tool === 'research_topic') setActiveStage('problem');
        else if (tool === 'create_experiment') setActiveStage('planning');
        else if (tool === 'run_python_experiment') setActiveStage('experiment');
        else if (tool === 'evaluate_experiment') setActiveStage('experiment');
        else if (tool === 'compare_experiments') setActiveStage('evaluation');
        else if (tool === 'analyze_errors') setActiveStage('improvement');
        else if (tool === 'propose_next_experiment') setActiveStage('improvement');
        else if (tool === 'generate_report') setActiveStage('report');

        if (result.isGoalAchieved || !autonomousRef.current) {
          autonomousRef.current = false;
          setIsAgentRunning(false);
          break;
        }

        // Natural pause between steps
        await new Promise((res) => setTimeout(res, 1800));
      } catch (err: any) {
        setErrorMessage(err.message || 'Error in autonomous agent loop');
        autonomousRef.current = false;
        setIsAgentRunning(false);
        break;
      }
    }
    setIsAgentRunning(false);
  };

  // Execute specific tool on demand
  const handleExecuteToolDirectly = async (tool: AgentToolName) => {
    setIsProcessing(true);
    setProcessingMessage(`Agent executing tool: ${tool}...`);
    setErrorMessage(null);
    try {
      const { updatedProject } = await executeSpecificTool(tool, {}, project);
      onUpdateProject(updatedProject);
      if (tool === 'research_topic') setActiveStage('problem');
      else if (tool === 'create_experiment') setActiveStage('planning');
      else if (tool === 'run_python_experiment') setActiveStage('experiment');
      else if (tool === 'evaluate_experiment') setActiveStage('experiment');
      else if (tool === 'compare_experiments') setActiveStage('evaluation');
      else if (tool === 'analyze_errors') setActiveStage('improvement');
      else if (tool === 'propose_next_experiment') setActiveStage('improvement');
      else if (tool === 'generate_report') setActiveStage('report');
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to execute ${tool}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoalChange = (newGoal: string) => {
    setActiveGoal(newGoal);
    onUpdateProject({ ...project, activeGoal: newGoal });
  };

  // Advance Pipeline Actions
  const handleGeneratePlan = async () => {
    if (!project.problemAnalysis) return;
    setIsProcessing(true);
    setProcessingMessage('Agent formulating candidate research approaches & roadmap...');
    setErrorMessage(null);
    try {
      const { plan } = await generateResearchPlan(project.problemDescription, project.problemAnalysis);
      const updated: ResearchProject = {
        ...project,
        researchPlan: plan,
        currentStage: 'planning',
        updatedAt: new Date().toISOString(),
      };
      onUpdateProject(updated);
      setActiveStage('planning');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate research plan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateExperiments = async () => {
    if (!project.problemAnalysis || !project.researchPlan) return;
    setIsProcessing(true);
    setProcessingMessage('Agent architecting controlled experiment specifications...');
    setErrorMessage(null);
    try {
      const { experiments } = await generateExperiments(
        project.problemDescription,
        project.problemAnalysis,
        project.researchPlan
      );
      const updated: ResearchProject = {
        ...project,
        experiments: experiments.map((exp, idx) => ({
          ...exp,
          id: exp.id || `EXP-0${idx + 1}`,
          createdAt: new Date().toISOString(),
        })),
        currentStage: 'experiment',
        updatedAt: new Date().toISOString(),
      };
      onUpdateProject(updated);
      setActiveStage('experiment');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate experiments.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompareModels = async () => {
    if (project.experiments.length === 0) return;
    setIsProcessing(true);
    setProcessingMessage('Agent synthesizing multidimensional model comparison & Pareto trade-offs...');
    setErrorMessage(null);
    try {
      const { comparison } = await compareModels(project.problemDescription, project.experiments);
      const updated: ResearchProject = {
        ...project,
        modelComparison: comparison,
        currentStage: 'evaluation',
        updatedAt: new Date().toISOString(),
      };
      onUpdateProject(updated);
      setActiveStage('evaluation');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to compare models.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunErrorAnalysis = async () => {
    const candidateExp =
      project.experiments.find((e) => e.actualResult) || project.experiments[0];
    if (!candidateExp) return;

    setIsProcessing(true);
    setProcessingMessage(`Agent performing diagnostic error analysis on ${candidateExp.id}...`);
    setErrorMessage(null);
    try {
      const { errorAnalysis } = await runErrorAnalysis(
        project.problemDescription,
        candidateExp,
        candidateExp.actualResult,
        candidateExp.actualResult?.notes
      );

      // Also generate next iterations
      setProcessingMessage('Agent formulating next research iteration proposals...');
      const { iterations } = await proposeNextIteration(
        project.problemDescription,
        project.experiments,
        errorAnalysis
      );

      const updated: ResearchProject = {
        ...project,
        errorAnalysis,
        nextIterations: iterations,
        currentStage: 'improvement',
        updatedAt: new Date().toISOString(),
      };
      onUpdateProject(updated);
      setActiveStage('improvement');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to perform error analysis.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsProcessing(true);
    setProcessingMessage('Agent compiling publication-grade technical research report...');
    setErrorMessage(null);
    try {
      const { report } = await generateResearchReport(project);
      const updated: ResearchProject = {
        ...project,
        researchReport: report,
        currentStage: 'report',
        status: 'completed',
        updatedAt: new Date().toISOString(),
      };
      onUpdateProject(updated);
      setActiveStage('report');
      onNavigate('report');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate technical report.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Visual Workflow Stage Bar */}
      <StageProgressBar
        currentStage={activeStage}
        onSelectStage={(stage) => setActiveStage(stage)}
        status={project.status}
      />

      {/* Project Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Lab Session
            </span>
            <span className="text-xs text-slate-400">
              Domain: <strong className="text-slate-200">{project.problemAnalysis?.domain || 'General Machine Learning'}</strong>
            </span>
          </div>
          <h2 className="text-base font-semibold text-white mt-1 truncate">{project.title}</h2>
        </div>

        {/* Action button based on current stage */}
        <div className="flex items-center gap-2">
          {activeStage === 'problem' && (
            <button
              disabled={isProcessing}
              onClick={handleGeneratePlan}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate Research Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {activeStage === 'planning' && (
            <button
              disabled={isProcessing}
              onClick={handleGenerateExperiments}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
              <span>Architect Experiments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {activeStage === 'experiment' && (
            <button
              disabled={isProcessing}
              onClick={handleCompareModels}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
              <span>Compare Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {activeStage === 'evaluation' && (
            <button
              disabled={isProcessing}
              onClick={handleRunErrorAnalysis}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Run Error Analysis & Iterations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {activeStage === 'improvement' && (
            <button
              disabled={isProcessing}
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-teal-500/20 flex items-center gap-2 transition"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>Synthesize Final Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Processing Notice */}
      {isProcessing && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center gap-3 text-xs text-indigo-300 animate-pulse">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{processingMessage}</span>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Tool-Using Agent Activity Stream */}
      <AgentActivityStream
        project={project}
        steps={project.agentActivity || []}
        isAgentRunning={isAgentRunning}
        activeGoal={activeGoal}
        onGoalChange={handleGoalChange}
        onStepAgent={handleStepAgent}
        onToggleAutonomousLoop={handleToggleAutonomousLoop}
        onExecuteToolDirectly={handleExecuteToolDirectly}
      />

      {/* STAGE 1: PROBLEM ANALYSIS */}
      {activeStage === 'problem' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Stage 1: Problem Formulation
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Problem Statement & Requirements</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                {project.problemAnalysis?.problemType || 'Classification'}
              </span>
            </div>

            {/* Problem Overview */}
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white block mb-1 text-sm">User Brief:</span>
              "{project.problemDescription}"
            </div>

            {project.problemAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Data Characteristics */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Input Data Schema & Volume</span>
                  </h4>
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      {project.problemAnalysis.inputData.description}
                    </p>
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400 block text-[11px]">Recommended Volume:</span>
                      <span className="text-cyan-300 font-medium font-mono">
                        {project.problemAnalysis.inputData.expectedVolume}
                      </span>
                    </div>
                    {project.problemAnalysis.inputData.edgeCases.length > 0 && (
                      <div className="pt-2">
                        <span className="text-slate-400 block text-[11px] mb-1">Key Failure Modes / Edge Cases:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                          {project.problemAnalysis.inputData.edgeCases.map((ec, i) => (
                            <li key={i} className="text-[11px]">{ec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expected Output */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Expected Output & Target SLA</span>
                  </h4>
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Output Format:</span>
                      <span className="text-slate-200 font-medium">{project.problemAnalysis.expectedOutput.format}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Class Cardinality / Range:</span>
                      <span className="text-slate-200 font-medium">{project.problemAnalysis.expectedOutput.classesOrRange}</span>
                    </div>
                    {project.problemAnalysis.expectedOutput.latencyTarget && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-slate-400 block text-[11px]">Latency Target:</span>
                        <span className="text-emerald-400 font-mono font-medium">
                          {project.problemAnalysis.expectedOutput.latencyTarget}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Candidate Techniques */}
                <div className="space-y-3 md:col-span-2">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Suitable ML / NLP / CV Techniques
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {project.problemAnalysis.suitableTechniques.map((tech, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {tech.category}
                            </span>
                            <span className="text-xs font-bold text-cyan-400 font-mono">
                              {tech.suitabilityScore}% Fit
                            </span>
                          </div>
                          <h5 className="text-xs font-semibold text-white mt-1">{tech.name}</h5>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {tech.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                          <span>Complexity:</span>
                          <span
                            className={
                              tech.complexity === 'High'
                                ? 'text-amber-400'
                                : tech.complexity === 'Medium'
                                ? 'text-cyan-400'
                                : 'text-emerald-400'
                            }
                          >
                            {tech.complexity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evaluation Metrics */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Evaluation Metrics & Rationale
                  </h4>
                  <div className="space-y-2">
                    {project.problemAnalysis.evaluationMetrics.map((met, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{met.metric}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {met.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{met.formulaOrRationale}</p>
                        </div>
                        <span className="font-mono text-cyan-400 font-bold text-xs whitespace-nowrap">
                          {met.targetThreshold}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constraints & Missing Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Constraints & Missing Info Checklist
                  </h4>
                  <div className="space-y-2">
                    {project.problemAnalysis.constraints.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs flex items-center justify-between"
                      >
                        <span className="text-slate-300">{c.description}</span>
                        <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {c.type}
                        </span>
                      </div>
                    ))}

                    {project.problemAnalysis.clarifications.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-xs space-y-1"
                      >
                        <span className="text-indigo-300 font-medium block">Clarification Question:</span>
                        <p className="text-slate-300 text-[11px]">{q.question}</p>
                        <p className="text-[10px] text-slate-400">
                          Default Assumption: <em className="text-slate-300">{q.suggestedDefault}</em>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No problem analysis generated yet. Click "Analyze Problem" to begin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 2: PLANNING & ROADMAP */}
      {activeStage === 'planning' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Stage 2: Experimental Planning
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Research Strategy & Roadmap</h3>
              </div>
            </div>

            {project.researchPlan ? (
              <div className="space-y-6">
                {/* Core Hypothesis */}
                <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Central Research Hypothesis</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {project.researchPlan.coreHypothesis}
                  </p>
                </div>

                {/* Summary */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                  <span className="text-slate-400 font-semibold block mb-1">Executive Methodology Summary:</span>
                  {project.researchPlan.summary}
                </div>

                {/* Phased Roadmap */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Experimental Roadmap Milestones
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.researchPlan.suggestedRoadmap.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-3 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setActiveStage('research')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-2"
                  >
                    <span>Inspect Architectural Approaches</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No research plan available. Click "Generate Research Plan" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 3: RESEARCH CANDIDATE APPROACHES */}
      {activeStage === 'research' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Stage 3: Architectural Research
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Candidate Approaches & Feasibility</h3>
              </div>
              <span className="text-xs text-slate-400">
                {project.researchPlan?.approaches.length || 0} candidate paradigms
              </span>
            </div>

            {project.researchPlan?.approaches && project.researchPlan.approaches.length > 0 ? (
              <div className="space-y-4">
                {project.researchPlan.approaches.map((app, idx) => (
                  <div
                    key={app.id || idx}
                    className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Approach {idx + 1}
                          </span>
                          <span className="text-xs text-slate-400">{app.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{app.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          Feasibility: <strong className="text-cyan-400 font-mono">{app.estimatedFeasibility}%</strong>
                        </span>
                        <span className="text-xs text-slate-400">
                          Compute: <strong className="text-slate-200">{app.computationalCost}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block mb-1">Architecture Description:</span>
                        <p className="text-slate-300 leading-relaxed">{app.description}</p>

                        <div className="mt-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                          <span className="text-cyan-400 font-semibold block mb-1 text-[11px]">
                            Why This Approach Is Useful:
                          </span>
                          <p className="text-slate-300 leading-relaxed text-[11px]">{app.whyUseful}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-emerald-400 font-semibold text-[11px] block mb-1">Key Strengths:</span>
                          <ul className="space-y-1 pl-2">
                            {app.pros.map((p, i) => (
                              <li key={i} className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-amber-400 font-semibold text-[11px] block mb-1">Trade-offs & Risks:</span>
                          <ul className="space-y-1 pl-2">
                            {app.cons.map((c, i) => (
                              <li key={i} className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {app.inferenceFootprint && (
                          <div className="pt-2 text-[10px] text-slate-400">
                            Inference Footprint: <span className="font-mono text-slate-300">{app.inferenceFootprint}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No candidate approaches recorded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 4: EXPERIMENT PROTOCOL */}
      {activeStage === 'experiment' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Stage 4: Experiment Protocols
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Benchmarking & Empirical Runs</h3>
              </div>
              <button
                onClick={() => onNavigate('experiments')}
                className="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Full Experiment Table</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.experiments.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {exp.id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${
                        exp.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : exp.status === 'running'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {exp.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-white">{exp.title}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1 font-mono mt-0.5">{exp.model}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hypothesis F1:</span>
                      <span className="font-mono text-slate-300">
                        {(exp.expectedResult.f1Score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual Recorded F1:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {exp.actualResult ? `${(exp.actualResult.f1Score * 100).toFixed(1)}%` : 'Pending Entry'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: EVALUATION & COMPARISON */}
      {activeStage === 'evaluation' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Stage 5: Evaluation
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Model Comparison & Pareto Trade-offs</h3>
              </div>
              <button
                onClick={() => onNavigate('results')}
                className="px-3.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Interactive Charts</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {project.modelComparison ? (
              <div className="space-y-6">
                {/* Champion Banner */}
                <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-500/40 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Champion Architecture Recommended for Production</span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {project.modelComparison.recommendedModel}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {project.modelComparison.recommendationReason}
                  </p>
                </div>

                {/* Trade-off Matrix Overview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Pareto Frontier & Operational Trade-offs
                  </h4>
                  <div className="space-y-2">
                    {project.modelComparison.keyTradeoffs.map((tradeoff, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300"
                      >
                        {tradeoff}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No model comparison synthesized yet. Click "Compare Models" to evaluate all experiments.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 6: IMPROVEMENT & ERROR DIAGNOSTICS */}
      {activeStage === 'improvement' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Stage 6: Error Analysis & Iteration
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Diagnostics & Next Experiment Sprint</h3>
              </div>
            </div>

            {project.errorAnalysis ? (
              <div className="space-y-6">
                {/* Diagnostic Overview */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white block mb-1">Diagnostic Post-Mortem:</span>
                  {project.errorAnalysis.overview}
                </div>

                {/* Weak Areas Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Vulnerabilities & Weak Areas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {project.errorAnalysis.weakAreas.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{w.area}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                              w.severity === 'Critical' || w.severity === 'High'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {w.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{w.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Iteration Proposals */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Agent Recommended Next Iterations</span>
                  </h4>
                  <div className="space-y-3">
                    {project.nextIterations.map((iter) => (
                      <div
                        key={iter.id}
                        className="p-4 bg-slate-950/80 border border-indigo-900/40 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-indigo-300">{iter.title}</h5>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {iter.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{iter.motivation}</p>
                        <div className="text-[11px] text-slate-400">
                          <strong>Hypothesis:</strong> {iter.targetHypothesis}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-mono">
                          Expected Gain: {iter.expectedGain}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No error analysis run yet. Click "Run Error Analysis" to inspect bottlenecks.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 7: REPORT PREVIEW */}
      {activeStage === 'report' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Stage 7: Final Deliverable
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Publication Research Report</h3>
              </div>
              <button
                onClick={() => onNavigate('report')}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
              >
                <span>Open Full Interactive Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {project.researchReport ? (
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 text-xs text-slate-300">
                <h4 className="text-sm font-bold text-white">{project.researchReport.title}</h4>
                <p className="leading-relaxed text-slate-300">{project.researchReport.abstract}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Author: {project.researchReport.author}</span>
                  <span>Generated {new Date(project.researchReport.generatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Report not compiled yet. Click "Synthesize Final Report" above to generate.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
