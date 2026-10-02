import {
  ExperimentItem,
  ProblemAnalysis,
  ResearchPlan,
  ModelComparison,
  ErrorAnalysisResult,
  IterationProposal,
  ResearchReportData,
  ActualExperimentResult,
} from './research';

export type AgentToolName =
  | 'research_topic'
  | 'create_experiment'
  | 'run_python_experiment'
  | 'evaluate_experiment'
  | 'compare_experiments'
  | 'analyze_errors'
  | 'propose_next_experiment'
  | 'generate_report';

export interface ToolDefinition {
  name: AgentToolName;
  description: string;
  parameters: Record<string, string>;
  category: 'Research' | 'Execution' | 'Analysis' | 'Synthesis';
}

export interface AgentDecision {
  thought: string;
  rationale: string;
  actionPlan: string;
}

export interface ToolExecutionRecord {
  tool: AgentToolName;
  inputArgs: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface ToolObservation {
  summary: string;
  data?: any;
  pythonStdout?: string;
  logs?: string[];
  metricsObtained?: Partial<ActualExperimentResult>;
}

export interface AgentReflection {
  assessment: string;
  goalProgress: number; // 0-100
  isGoalAchieved: boolean;
  nextRecommendedTool?: AgentToolName;
}

export interface AgentActivityStep {
  id: string;
  stepNumber: number;
  timestamp: string;
  goal: string;
  decision: AgentDecision;
  toolExecution: ToolExecutionRecord;
  observation?: ToolObservation;
  reflection?: AgentReflection;
  finalConclusion?: string;
}

export interface AgentState {
  currentGoal: string;
  isRunning: boolean;
  activeTool: AgentToolName | null;
  currentStepIndex: number;
  steps: AgentActivityStep[];
  goalProgressPct: number;
}
