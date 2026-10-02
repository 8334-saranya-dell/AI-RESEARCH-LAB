import type { AgentActivityStep } from './agent';

export type WorkflowStage =
  | 'problem'
  | 'planning'
  | 'research'
  | 'experiment'
  | 'evaluation'
  | 'improvement'
  | 'report';

export interface ClarificationItem {
  id: string;
  question: string;
  answer?: string;
  suggestedDefault: string;
  category: 'data' | 'metric' | 'constraint' | 'objective';
}

export interface SuitableTechnique {
  name: string;
  category: string;
  description: string;
  complexity: 'Low' | 'Medium' | 'High';
  suitabilityScore: number; // 1-100
}

export interface EvaluationMetric {
  metric: string;
  formulaOrRationale: string;
  targetThreshold: string;
  priority: 'Primary' | 'Secondary';
}

export interface ProblemConstraint {
  type: 'Compute' | 'Latency' | 'Data' | 'Memory' | 'Deployment' | 'Privacy';
  description: string;
}

export interface ProblemAnalysis {
  problemType: string;
  domain: string;
  modality: string;
  inputData: {
    description: string;
    expectedVolume: string;
    featuresOrSchema: string[];
    edgeCases: string[];
  };
  expectedOutput: {
    format: string;
    classesOrRange: string;
    latencyTarget?: string;
  };
  suitableTechniques: SuitableTechnique[];
  evaluationMetrics: EvaluationMetric[];
  constraints: ProblemConstraint[];
  clarifications: ClarificationItem[];
  executiveTakeaway: string;
}

export interface ResearchApproach {
  id: string;
  title: string;
  category: string;
  paradigm: string; // e.g. "Classical Baselines", "Pretrained Transformer", "Zero-shot Prompt Ensemble", "Lightweight Edge CNN"
  description: string;
  whyUseful: string;
  pros: string[];
  cons: string[];
  estimatedFeasibility: number; // 0-100
  computationalCost: 'Low' | 'Medium' | 'High' | 'Very High';
  inferenceFootprint: string;
}

export interface ResearchPlan {
  summary: string;
  coreHypothesis: string;
  approaches: ResearchApproach[];
  suggestedRoadmap: string[];
}

export interface ExperimentDataset {
  name: string;
  splitStrategy: string;
  sampleSize?: string;
  augmentation?: string;
  userDatasetCsv?: string;
  isCustom?: boolean;
}

export interface ExperimentMetricPrediction {
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  latencyMs: number;
  r2Score?: number;
  mse?: number;
  mae?: number;
  hypothesis: string;
}

export interface ActualExperimentResult {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latencyMs: number;
  r2Score?: number;
  mse?: number;
  rmse?: number;
  mae?: number;
  trainingLoss?: number;
  validationLoss?: number;
  epochsTrained?: number;
  sampleSizeTested?: number;
  confusionMatrix?: {
    TP: number;
    FP: number;
    FN: number;
    TN: number;
    rawMatrix?: number[][];
  };
  notes?: string;
  recordedAt: string;
  isSimulated?: boolean;
}

export interface ExperimentFailureDiagnosis {
  error: string;
  likelyCause: string;
  proposedCorrection: string;
  failedCode?: string;
}

export interface ExperimentItem {
  id: string;
  experiment_id?: string;
  problem?: string;
  title: string;
  model: string;
  approachId: string;
  experimentType?: 'classification' | 'regression' | 'nlp';
  dataset: ExperimentDataset;
  preprocessing: string[];
  architecture: string;
  hyperparameters: Record<string, string | number>;
  evaluationMetrics: string[];
  expectedResult: ExperimentMetricPrediction;
  actualResult?: ActualExperimentResult;
  metrics?: ActualExperimentResult;
  status: 'planned' | 'running' | 'completed' | 'failed';
  execution_status?: 'planned' | 'running' | 'completed' | 'failed';
  timestamp?: string;
  createdAt: string;
  observations?: string;
  next_experiment?: string;
  pythonCode?: string;
  plotBase64?: string;
  stdout?: string;
  stderr?: string;
  executionError?: ExperimentFailureDiagnosis;
  executionLogs?: string[];
}

export interface ModelComparisonRow {
  experimentId: string;
  modelName: string;
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  latencyMs: number;
  memoryMb: number;
  trainingCost: 'Low' | 'Medium' | 'High';
  interpretability: 'Low' | 'Medium' | 'High';
  productionReadiness: 'Experimental' | 'Candidate' | 'Production-Ready';
  pros: string;
  cons: string;
  isActualResult: boolean;
}

export interface ModelComparison {
  overview: string;
  matrix: ModelComparisonRow[];
  recommendedModel: string;
  recommendationReason: string;
  keyTradeoffs: string[];
}

export interface ErrorWeakArea {
  area: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
}

export interface CommonErrorPattern {
  errorType: string;
  frequency: string;
  exampleSnippet: string;
  impact: string;
}

export interface ErrorRootCause {
  cause: string;
  explanation: string;
  affectedMetrics: string[];
}

export interface ErrorImprovement {
  action: string;
  expectedImpact: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedEffort: 'Easy' | 'Moderate' | 'Heavy';
}

export interface ErrorAnalysisResult {
  overview: string;
  experimentAnalyzedId: string;
  weakAreas: ErrorWeakArea[];
  commonErrors: CommonErrorPattern[];
  rootCauses: ErrorRootCause[];
  suggestedImprovements: ErrorImprovement[];
}

export interface IterationProposal {
  id: string;
  parentExperimentId: string;
  title: string;
  motivation: string;
  modifications: string[];
  hyperparameterChanges: Record<string, string | number>;
  targetHypothesis: string;
  expectedGain: string;
  priority: 'Recommended' | 'Alternative' | 'Ablation';
}

export interface ResearchReportData {
  title: string;
  generatedAt: string;
  author: string;
  abstract: string;
  problemStatement: string;
  researchQuestion: string;
  approachesTested: string;
  experimentResultsSummary: string;
  comparisonAnalysis: string;
  errorAnalysisDiscussion: string;
  bestPerformingApproach: string;
  limitations: string[];
  futureImprovements: string[];
  markdownContent: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  problemDescription: string;
  activeGoal?: string;
  agentActivity?: AgentActivityStep[];
  createdAt: string;
  updatedAt: string;
  currentStage: WorkflowStage;
  problemAnalysis: ProblemAnalysis | null;
  researchPlan: ResearchPlan | null;
  experiments: ExperimentItem[];
  modelComparison: ModelComparison | null;
  errorAnalysis: ErrorAnalysisResult | null;
  nextIterations: IterationProposal[];
  researchReport: ResearchReportData | null;
  status: 'draft' | 'in_progress' | 'completed';
  tags: string[];
}
