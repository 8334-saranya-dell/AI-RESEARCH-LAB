import {
  ProblemAnalysis,
  ResearchPlan,
  ExperimentItem,
  ModelComparison,
  ErrorAnalysisResult,
  IterationProposal,
  ResearchReportData,
  ResearchProject,
  ActualExperimentResult,
} from '../types/research';
import { AgentToolName, AgentActivityStep } from '../types/agent';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new ApiError(errorMsg, res.status);
  }
  return res.json();
}

export async function runFullPipeline(
  problemDescription: string,
  constraints?: string
): Promise<{ analysis: ProblemAnalysis; plan: ResearchPlan; experiments: ExperimentItem[] }> {
  const res = await fetch('/api/research/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemDescription, constraints }),
  });
  return handleResponse<{ analysis: ProblemAnalysis; plan: ResearchPlan; experiments: ExperimentItem[] }>(res);
}

export async function analyzeProblem(
  problemDescription: string,
  constraints?: string
): Promise<{ analysis: ProblemAnalysis }> {
  const res = await fetch('/api/research/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemDescription, constraints }),
  });
  return handleResponse<{ analysis: ProblemAnalysis }>(res);
}

export async function generateResearchPlan(
  problemDescription: string,
  problemAnalysis: ProblemAnalysis
): Promise<{ plan: ResearchPlan }> {
  const res = await fetch('/api/research/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemDescription, problemAnalysis }),
  });
  return handleResponse<{ plan: ResearchPlan }>(res);
}

export async function generateExperiments(
  problemDescription: string,
  problemAnalysis: ProblemAnalysis,
  researchPlan: ResearchPlan
): Promise<{ experiments: ExperimentItem[] }> {
  const res = await fetch('/api/research/experiments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemDescription, problemAnalysis, researchPlan }),
  });
  return handleResponse<{ experiments: ExperimentItem[] }>(res);
}

export async function compareModels(
  problemDescription: string,
  experiments: ExperimentItem[]
): Promise<{ comparison: ModelComparison }> {
  const res = await fetch('/api/research/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemDescription, experiments }),
  });
  return handleResponse<{ comparison: ModelComparison }>(res);
}

export async function runErrorAnalysis(
  problemDescription: string,
  experiment: ExperimentItem,
  recordedResults?: ActualExperimentResult,
  userNotes?: string
): Promise<{ errorAnalysis: ErrorAnalysisResult }> {
  const res = await fetch('/api/research/error-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemDescription, experiment, recordedResults, userNotes }),
  });
  return handleResponse<{ errorAnalysis: ErrorAnalysisResult }>(res);
}

export async function proposeNextIteration(
  problemDescription: string,
  experiments: ExperimentItem[],
  errorAnalysis: ErrorAnalysisResult
): Promise<{ iterations: IterationProposal[] }> {
  const res = await fetch('/api/research/iterate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemDescription, experiments, errorAnalysis }),
  });
  return handleResponse<{ iterations: IterationProposal[] }>(res);
}

export async function generateResearchReport(
  project: ResearchProject
): Promise<{ report: ResearchReportData }> {
  const res = await fetch('/api/research/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project }),
  });
  return handleResponse<{ report: ResearchReportData }>(res);
}

export async function simulateExperimentRun(
  experiment: ExperimentItem,
  problemDescription: string
): Promise<{ actualResult: ActualExperimentResult; executionLogs: string[] }> {
  const res = await fetch('/api/research/simulate-run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ experiment, problemDescription }),
  });
  return handleResponse<{ actualResult: ActualExperimentResult; executionLogs: string[] }>(res);
}

export async function stepAgent(
  goal: string,
  project: ResearchProject,
  previousSteps: AgentActivityStep[]
): Promise<{ step: AgentActivityStep; updatedProject: ResearchProject; isGoalAchieved: boolean }> {
  const res = await fetch('/api/agent/step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, project, previousSteps }),
  });
  return handleResponse<{ step: AgentActivityStep; updatedProject: ResearchProject; isGoalAchieved: boolean }>(res);
}

export async function executeSpecificTool(
  tool: AgentToolName,
  inputArgs: Record<string, any>,
  project: ResearchProject
): Promise<{ observation: any; updatedProject: ResearchProject }> {
  const res = await fetch('/api/agent/execute-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, inputArgs, project }),
  });
  return handleResponse<{ observation: any; updatedProject: ResearchProject }>(res);
}

export async function checkBackendHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch {
    return { status: 'offline', hasApiKey: false };
  }
}
