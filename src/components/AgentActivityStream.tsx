import React, { useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  SkipForward,
  Wrench,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Cpu,
  Layers,
  Search,
  FlaskConical,
  Scale,
  FileCheck2,
  Activity,
  Code2,
  TrendingUp,
} from 'lucide-react';
import { AgentActivityStep, AgentToolName } from '../types/agent';
import { ResearchProject } from '../types/research';

interface AgentActivityStreamProps {
  project: ResearchProject;
  steps: AgentActivityStep[];
  isAgentRunning: boolean;
  activeGoal: string;
  onGoalChange: (goal: string) => void;
  onStepAgent: () => void;
  onToggleAutonomousLoop: () => void;
  onExecuteToolDirectly: (tool: AgentToolName) => void;
}

const TOOL_ICONS: Record<AgentToolName, React.ElementType> = {
  research_topic: Search,
  create_experiment: FlaskConical,
  run_python_experiment: Terminal,
  evaluate_experiment: Scale,
  compare_experiments: Activity,
  analyze_errors: AlertCircle,
  propose_next_experiment: Sparkles,
  generate_report: FileCheck2,
};

const TOOL_NAMES_READABLE: Record<AgentToolName, string> = {
  research_topic: 'research_topic (Topic & SOTA Literature)',
  create_experiment: 'create_experiment (Specification)',
  run_python_experiment: 'run_python_experiment (Python 3.10 Runtime)',
  evaluate_experiment: 'evaluate_experiment (Metrics & SLA)',
  compare_experiments: 'compare_experiments (Pareto Matrix)',
  analyze_errors: 'analyze_errors (Failure Post-Mortem)',
  propose_next_experiment: 'propose_next_experiment (Iterative Sprint)',
  generate_report: 'generate_report (Publication Whitepaper)',
};

export const AgentActivityStream: React.FC<AgentActivityStreamProps> = ({
  project,
  steps,
  isAgentRunning,
  activeGoal,
  onGoalChange,
  onStepAgent,
  onToggleAutonomousLoop,
  onExecuteToolDirectly,
}) => {
  const [expandedStdoutStepId, setExpandedStdoutStepId] = useState<string | null>(null);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const [goalEditing, setGoalEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(activeGoal);

  const latestStep = steps[steps.length - 1];
  const goalProgress = latestStep?.reflection?.goalProgress || (project.researchReport ? 100 : project.experiments.some(e => e.actualResult) ? 60 : 20);

  const handleSaveGoal = () => {
    if (tempGoal.trim()) {
      onGoalChange(tempGoal.trim());
      setGoalEditing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-0">
      {/* Agent Controller Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Goal Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Bot className="w-3 h-3 text-cyan-400" />
              <span>Tool-Using Agent Loop</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Progress: <strong className="text-cyan-400 font-bold">{goalProgress}%</strong>
            </span>
          </div>

          {goalEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                placeholder="Specify research goal... (e.g. Improve fake-news classification to >92% F1)"
                className="w-full max-w-xl bg-slate-900 border border-indigo-500/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSaveGoal}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTempGoal(activeGoal);
                  setGoalEditing(false);
                }}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setGoalEditing(true)}>
              <span className="text-xs font-semibold text-slate-400">Goal:</span>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                {activeGoal || project.problemDescription}
              </h3>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300 underline">
                Edit
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Step 1 Cycle */}
          <button
            disabled={isAgentRunning}
            onClick={onStepAgent}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            title="Execute 1 agent cycle: Plan -> Select Tool -> Execute -> Observe -> Evaluate"
          >
            <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>Step Agent</span>
          </button>

          {/* Autonomous Loop Run/Pause */}
          <button
            onClick={onToggleAutonomousLoop}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg ${
              isAgentRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25 animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-indigo-500/25'
            }`}
          >
            {isAgentRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Agent</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Agent Loop</span>
              </>
            )}
          </button>

          {/* Manual Tool Trigger Dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolMenuOpen(!toolMenuOpen)}
              className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Manually trigger any tool"
            >
              <Wrench className="w-3.5 h-3.5 text-purple-400" />
              <span>Select Tool</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {toolMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Execute Specific Tool
                </div>
                {(Object.keys(TOOL_ICONS) as AgentToolName[]).map((toolKey) => {
                  const ToolIcon = TOOL_ICONS[toolKey];
                  return (
                    <button
                      key={toolKey}
                      onClick={() => {
                        onExecuteToolDirectly(toolKey);
                        setToolMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800/80 flex items-center gap-2.5 text-slate-200 transition"
                    >
                      <ToolIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="font-mono text-[11px] truncate">{toolKey}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Activity Terminal Feed */}
      <div className="p-5 space-y-6 max-h-[640px] overflow-y-auto bg-slate-950/40">
        {steps.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Agent Ready for Action</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Click <strong>"Step Agent"</strong> to execute a single cycle or <strong>"Run Agent Loop"</strong> to autonomously plan, execute Python experiments, analyze errors, and generate the final report.
              </p>
            </div>
          </div>
        ) : (
          steps.map((step) => {
            const ToolIcon = TOOL_ICONS[step.toolExecution.tool] || Wrench;
            const isPythonTool = step.toolExecution.tool === 'run_python_experiment';
            const isStdoutExpanded = expandedStdoutStepId === step.id;

            return (
              <div
                key={step.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 transition-all"
              >
                {/* Step Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold font-mono">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs font-bold text-white tracking-tight">
                      Cycle Step {step.stepNumber}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-sm">
                      {step.goal}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
                    {step.toolExecution.durationMs ? (
                      <span>({step.toolExecution.durationMs}ms)</span>
                    ) : null}
                  </div>
                </div>

                {/* 1. AGENT DECISION (Thought, Rationale, Action Plan) */}
                <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider text-[10px]">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Agent Decision & Planning</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    "{step.decision.thought}"
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-indigo-900/40 text-slate-400">
                    <div>
                      <strong className="text-indigo-300">Rationale:</strong> {step.decision.rationale}
                    </div>
                    <div>
                      <strong className="text-cyan-300">Action Plan:</strong> {step.decision.actionPlan}
                    </div>
                  </div>
                </div>

                {/* 2. TOOL EXECUTION */}
                <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
                      <ToolIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-purple-300 font-mono">
                          Selected Tool:
                        </span>
                        <span className="font-mono font-bold text-white text-xs">
                          {step.toolExecution.tool}
                        </span>
                        {isPythonTool && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold font-mono">
                            Python 3.10 Runtime
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-lg">
                        {JSON.stringify(step.toolExecution.inputArgs || {})}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize font-semibold">
                    {step.toolExecution.status}
                  </span>
                </div>

                {/* 3. TOOL RESULT / OBSERVATION */}
                {step.observation && (
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tool Result & Observation</span>
                      </div>
                      {step.observation.pythonStdout && (
                        <button
                          onClick={() => setExpandedStdoutStepId(isStdoutExpanded ? null : step.id)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>{isStdoutExpanded ? 'Hide Python Stdout' : 'View Python Stdout'}</span>
                        </button>
                      )}
                    </div>

                    <p className="text-slate-200 leading-relaxed">
                      {step.observation.summary}
                    </p>

                    {/* Verified Metrics Badge if Python tool executed */}
                    {step.observation.metricsObtained && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Accuracy:</span>
                          <span className="font-bold text-emerald-400">
                            {((step.observation.metricsObtained.accuracy || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Macro-F1:</span>
                          <span className="font-bold text-cyan-400">
                            {((step.observation.metricsObtained.f1Score || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Precision:</span>
                          <span className="font-bold text-white">
                            {((step.observation.metricsObtained.precision || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Latency:</span>
                          <span className="font-bold text-amber-300">
                            {step.observation.metricsObtained.latencyMs} ms
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Expandable Python Stdout Terminal */}
                    {isStdoutExpanded && step.observation.pythonStdout && (
                      <div className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                        <div className="text-[10px] text-cyan-400 font-bold mb-1">$ python3 execution output:</div>
                        {step.observation.pythonStdout}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. EVALUATION & NEXT ACTION */}
                {step.reflection && (
                  <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-300">{step.reflection.assessment}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {step.reflection.goalProgress}% Goal Progress
                    </span>
                  </div>
                )}

                {/* Final Conclusion Card */}
                {step.finalConclusion && (
                  <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-500/40 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Final Conclusion</span>
                    </span>
                    <p className="text-slate-200 font-medium leading-relaxed">
                      {step.finalConclusion}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
