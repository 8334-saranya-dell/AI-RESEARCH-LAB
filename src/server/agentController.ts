import { ResearchProject } from '../types/research';
import { AgentActivityStep, AgentToolName } from '../types/agent';
import {
  executeResearchTopic,
  executeCreateExperiment,
  executeRunPythonExperiment,
  executeEvaluateExperiment,
  executeCompareExperiments,
  executeAnalyzeErrors,
  executeProposeNextExperiment,
  executeGenerateReport,
} from './agentTools';

export interface AgentStepResult {
  step: AgentActivityStep;
  updatedProject: ResearchProject;
  isGoalAchieved: boolean;
}

export async function runAgentCycle(
  goal: string,
  project: ResearchProject,
  previousSteps: AgentActivityStep[]
): Promise<AgentStepResult> {
  const stepNumber = previousSteps.length + 1;
  const timestamp = new Date().toISOString();

  // 1. DYNAMIC DECISION LOGIC: GOAL -> PLAN -> SELECT TOOL
  const hasResearch = previousSteps.some((s) => s.toolExecution.tool === 'research_topic');
  const unexecutedExp = project.experiments.find((e) => !e.actualResult);
  const executedExps = project.experiments.filter((e) => !!e.actualResult);
  const hasEvaluation = previousSteps.some((s) => s.toolExecution.tool === 'evaluate_experiment');
  const hasComparison = !!project.modelComparison;
  const hasErrorAnalysis = !!project.errorAnalysis;
  const hasProposedIteration = project.nextIterations.length > 0;
  const hasReport = !!project.researchReport;

  let selectedTool: AgentToolName = 'research_topic';
  let thought = '';
  let rationale = '';
  let actionPlan = '';
  let toolArgs: Record<string, any> = {};

  if (!hasResearch) {
    selectedTool = 'research_topic';
    thought = `Initiating systematic investigation for goal: "${goal}". I must first research the mathematical domain, loss functions, and SOTA architectural baselines.`;
    rationale = 'Grounding research in verified literature prevents architectural blind spots and establishes proper benchmark metrics.';
    actionPlan = 'Execute research_topic tool to inspect domain paradigms, recommended loss functions, and data requirements.';
    toolArgs = { topic: goal, domain: project.problemAnalysis?.domain || 'Machine Learning' };
  } else if (project.experiments.length === 0) {
    selectedTool = 'create_experiment';
    thought = 'Now that domain research is synthesized, I need to configure the first controlled baseline experiment.';
    rationale = 'Controlled experimental methodology begins with establishing an empirical performance floor.';
    actionPlan = 'Execute create_experiment tool to design EXP-01 specification.';
    toolArgs = { project, title: 'EXP-01: Classical Feature Baseline' };
  } else if (unexecutedExp) {
    selectedTool = 'run_python_experiment';
    thought = `Experiment ${unexecutedExp.id} (${unexecutedExp.model}) is planned but pending empirical execution. I must run the Python experiment to obtain real test metrics.`;
    rationale = 'Research integrity requires actual execution; models cannot be evaluated or compared without recorded metrics.';
    actionPlan = `Execute run_python_experiment tool to train and evaluate ${unexecutedExp.id} via the Python 3 runtime.`;
    toolArgs = { experiment: unexecutedExp, problemDescription: project.problemDescription };
  } else if (executedExps.length === 1 && !hasEvaluation) {
    selectedTool = 'evaluate_experiment';
    const latest = executedExps[executedExps.length - 1];
    thought = `Recent execution for ${latest.id} yielded empirical results. I must evaluate these metrics against production SLAs.`;
    rationale = 'Systematic evaluation checks if accuracy, F1, and latency meet operational constraints.';
    actionPlan = `Execute evaluate_experiment tool to audit ${latest.id} performance.`;
    toolArgs = { experiment: latest };
  } else if (executedExps.length === 1 && project.experiments.length < 3) {
    selectedTool = 'create_experiment';
    const nextNum = project.experiments.length + 1;
    thought = `Baseline EXP-01 is recorded. To build a robust benchmark suite, I need to design deeper contextual transformer models.`;
    rationale = 'Evaluating multiple architectural paradigms is necessary to find the optimal Pareto frontier.';
    actionPlan = `Execute create_experiment tool to configure EXP-0${nextNum}.`;
    toolArgs = { project, title: `EXP-0${nextNum}: Contextual Transformer Encoder` };
  } else if (executedExps.length >= 2 && !hasComparison) {
    selectedTool = 'compare_experiments';
    thought = `We now have ${executedExps.length} empirically executed experiments. I should compare them across accuracy, latency, and resource costs.`;
    rationale = 'Multi-criteria comparison identifies trade-offs between execution speed and predictive accuracy.';
    actionPlan = 'Execute compare_experiments tool to synthesize the comparative matrix and Pareto ranking.';
    toolArgs = { project };
  } else if (executedExps.length >= 2 && !hasErrorAnalysis) {
    selectedTool = 'analyze_errors';
    const champion = executedExps[executedExps.length - 1];
    thought = `Before generating the final recommendation, I need to diagnose the failure modes and common prediction errors of ${champion.id}.`;
    rationale = 'Understanding false positives and boundary ambiguities informs the next iteration and reveals model vulnerabilities.';
    actionPlan = `Execute analyze_errors tool to inspect holdout failure distributions of ${champion.id}.`;
    toolArgs = { experiment: champion, problemDescription: project.problemDescription };
  } else if (hasErrorAnalysis && !hasProposedIteration) {
    selectedTool = 'propose_next_experiment';
    thought = 'Error analysis revealed specific bottlenecks around borderline satire and keyword bias. I will now propose the next iteration to directly solve these issues.';
    rationale = 'Iterative refinement based on diagnostic post-mortems drives systematic improvements.';
    actionPlan = 'Execute propose_next_experiment tool to design the next sprint with Focal Loss and adversarial augmentation.';
    toolArgs = { project, errorAnalysis: project.errorAnalysis };
  } else if (project.experiments.some((e) => !e.actualResult)) {
    // If a proposed iteration experiment was added and is unexecuted
    const unexecuted = project.experiments.find((e) => !e.actualResult)!;
    selectedTool = 'run_python_experiment';
    thought = `The next iteration experiment (${unexecuted.id}) has been specified. Now executing it via Python runtime to observe if the targeted improvements materialize.`;
    rationale = 'Empirically validate whether the proposed architectural modifications succeed in overcoming the identified error patterns.';
    actionPlan = `Execute run_python_experiment tool on ${unexecuted.id}.`;
    toolArgs = { experiment: unexecuted, problemDescription: project.problemDescription };
  } else if (!hasReport) {
    selectedTool = 'generate_report';
    thought = 'All experimental runs, comparisons, and diagnostic post-mortems are complete. I am now synthesizing the definitive technical research report.';
    rationale = 'A structured research whitepaper formally communicates problem formulation, empirical results, and production recommendations.';
    actionPlan = 'Execute generate_report tool to compile the publication-grade research report.';
    toolArgs = { project };
  } else {
    // Goal achieved
    const step: AgentActivityStep = {
      id: `step-${stepNumber}-${Date.now()}`,
      stepNumber,
      timestamp,
      goal,
      decision: {
        thought: 'All research milestones, experimental benchmarks, error post-mortems, and final technical whitepapers are fully synthesized.',
        rationale: 'The research agent loop has completed all planned investigation phases.',
        actionPlan: 'Conclude research agent loop.',
      },
      toolExecution: {
        tool: 'generate_report',
        inputArgs: {},
        status: 'completed',
        startedAt: timestamp,
        completedAt: timestamp,
        durationMs: 0,
      },
      observation: {
        summary: 'All research objectives satisfied. Research report is available for copy, download, and review.',
        data: { completed: true },
      },
      reflection: {
        assessment: 'Champion model identified and verified with empirical Python execution. Publication report generated.',
        goalProgress: 100,
        isGoalAchieved: true,
      },
      finalConclusion: `Successfully achieved research goal: "${goal}". Champion architecture verified with real empirical test metrics and comprehensive error analysis.`,
    };

    return {
      step,
      updatedProject: { ...project, status: 'completed' },
      isGoalAchieved: true,
    };
  }

  // 2. TOOL EXECUTION
  const startTime = Date.now();
  let observation: any;
  let updatedProject = { ...project };

  try {
    switch (selectedTool) {
      case 'research_topic': {
        observation = await executeResearchTopic({
          topic: toolArgs.topic || goal,
          domain: toolArgs.domain,
        });
        break;
      }
      case 'create_experiment': {
        const res = await executeCreateExperiment({
          project: updatedProject,
          title: toolArgs.title,
        });
        observation = res.observation;
        updatedProject.experiments = [...updatedProject.experiments, res.newExperiment];
        break;
      }
      case 'run_python_experiment': {
        const res = await executeRunPythonExperiment({
          experiment: toolArgs.experiment,
          problemDescription: toolArgs.problemDescription,
        });
        observation = res.observation;
        // Update the experiment with actual results and completed status
        updatedProject.experiments = updatedProject.experiments.map((e) =>
          e.id === toolArgs.experiment.id
            ? { ...e, actualResult: res.actualResult, status: 'completed' as const, executionLogs: observation.logs }
            : e
        );
        break;
      }
      case 'evaluate_experiment': {
        observation = await executeEvaluateExperiment({
          experiment: toolArgs.experiment,
        });
        break;
      }
      case 'compare_experiments': {
        const res = await executeCompareExperiments({ project: updatedProject });
        observation = res.observation;
        updatedProject.modelComparison = res.comparison;
        break;
      }
      case 'analyze_errors': {
        const res = await executeAnalyzeErrors({
          experiment: toolArgs.experiment,
          problemDescription: toolArgs.problemDescription,
        });
        observation = res.observation;
        updatedProject.errorAnalysis = res.errorAnalysis;
        break;
      }
      case 'propose_next_experiment': {
        const res = await executeProposeNextExperiment({
          project: updatedProject,
          errorAnalysis: toolArgs.errorAnalysis,
        });
        observation = res.observation;
        updatedProject.nextIterations = [...updatedProject.nextIterations, res.iteration];
        updatedProject.experiments = [...updatedProject.experiments, res.newExperiment];
        break;
      }
      case 'generate_report': {
        const res = await executeGenerateReport({ project: updatedProject });
        observation = res.observation;
        updatedProject.researchReport = res.report;
        updatedProject.status = 'completed';
        break;
      }
    }
  } catch (err: any) {
    observation = {
      summary: `Tool execution encountered an issue: ${err.message}`,
      data: { error: err.message },
      logs: [`[error] ${err.message}`],
    };
  }

  const durationMs = Date.now() - startTime;

  // 3. EVALUATION & REFLECTION: OBSERVE RESULT -> EVALUATE -> DECIDE NEXT
  const executedCount = updatedProject.experiments.filter((e) => !!e.actualResult).length;
  let progress = 10;
  if (hasResearch) progress = 20;
  if (updatedProject.experiments.length >= 1) progress = 35;
  if (executedCount >= 1) progress = 55;
  if (updatedProject.modelComparison) progress = 70;
  if (updatedProject.errorAnalysis) progress = 85;
  if (updatedProject.researchReport) progress = 100;

  const isAchieved = progress >= 100;

  const step: AgentActivityStep = {
    id: `step-${stepNumber}-${Date.now()}`,
    stepNumber,
    timestamp,
    goal,
    decision: {
      thought,
      rationale,
      actionPlan,
    },
    toolExecution: {
      tool: selectedTool,
      inputArgs: toolArgs,
      status: 'completed',
      startedAt: timestamp,
      completedAt: new Date().toISOString(),
      durationMs,
    },
    observation,
    reflection: {
      assessment: observation.summary,
      goalProgress: progress,
      isGoalAchieved: isAchieved,
    },
    finalConclusion: isAchieved
      ? `Completed research agent cycle. Champion model benchmarked and documented in final technical report.`
      : undefined,
  };

  // Append step to project's agentActivity
  updatedProject.agentActivity = [...(project.agentActivity || []), step];
  updatedProject.updatedAt = new Date().toISOString();

  return {
    step,
    updatedProject,
    isGoalAchieved: isAchieved,
  };
}
