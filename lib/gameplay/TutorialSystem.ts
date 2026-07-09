/**
 * Tutorial System
 * Event-driven tutorial system with step-by-step guidance
 * Integrates with all gameplay systems via events
 */

import type {
  Tutorial,
  TutorialStep,
  TutorialCondition,
  TutorialAction,
  GameplayEvent,
  GameplayEventListener,
  GameplayConfig,
} from './types';
import {
  GameplayEventType,
  TutorialStepStatus,
  TutorialStepType,
} from './types';

/**
 * Tutorial system class
 */
export class TutorialSystem {
  private tutorials: Map<string, Tutorial>;
  private currentTutorial: Tutorial | null = null;
  private currentStep: TutorialStep | null = null;
  private eventListeners: Map<GameplayEventType, Set<GameplayEventListener>>;
  private config: GameplayConfig;
  private conditionCheckers: Map<string, (condition: TutorialCondition, event: GameplayEvent) => boolean>;
  private actionExecutors: Map<string, (action: TutorialAction) => void>;

  constructor(config?: Partial<GameplayConfig>) {
    this.tutorials = new Map();
    this.eventListeners = new Map();
    this.conditionCheckers = new Map();
    this.actionExecutors = new Map();
    this.config = {
      enableTutorial: true,
      autoStartTutorial: null,
      enableObjectives: true,
      autoAcceptObjectives: true,
      startingCurrency: { freecoin: 100, premium: 0 },
      miningConfig: {
        baseRate: 0.1,
        rarityMultipliers: {},
        qualityMultipliers: {},
        networkEfficiencyBonus: 1.1,
        difficulty: 1.0,
        difficultyAdjustmentRate: 0.001,
      },
      startingRoomSize: { width: 10, height: 10 },
      maxRoomSize: { width: 50, height: 50 },
      enablePlacementIntegration: true,
      enableSimulationIntegration: true,
      enableNetworkIntegration: true,
      enableHardwareIntegration: true,
      ...config,
    };

    this.initializeConditionCheckers();
    this.initializeActionExecutors();
  }

  /**
   * Initialize condition checkers
   */
  private initializeConditionCheckers(): void {
    // Event-based condition checker
    this.conditionCheckers.set('event', (condition, event) => {
      return event.type === condition.eventType;
    });

    // State-based condition checker
    this.conditionCheckers.set('state', (condition, event) => {
      // In a real implementation, this would check state
      return true;
    });

    // Custom condition checker
    this.conditionCheckers.set('custom', (condition, event) => {
      const checker = this.conditionCheckers.get(condition.customCheck || '');
      if (checker) {
        return checker(condition, event);
      }
      return true;
    });
  }

  /**
   * Initialize action executors
   */
  private initializeActionExecutors(): void {
    // Event-based action executor
    this.actionExecutors.set('event', (action) => {
      if (action.eventType) {
        this.fireEvent({
          type: action.eventType as any,
          timestamp: Date.now(),
          eventData: action.eventData,
        } as any);
      }
    });

    // State-based action executor
    this.actionExecutors.set('state', (action) => {
      // In a real implementation, this would update state
      console.log(`[Tutorial System] Update state: ${action.statePath} = ${action.stateValue}`);
    });

    // Custom action executor
    this.actionExecutors.set('custom', (action) => {
      const executor = this.actionExecutors.get(action.customAction || '');
      if (executor) {
        executor(action);
      }
    });
  }

  /**
   * Register tutorial
   */
  registerTutorial(tutorial: Tutorial): void {
    this.tutorials.set(tutorial.id, tutorial);
  }

  /**
   * Get tutorial
   */
  getTutorial(tutorialId: string): Tutorial | undefined {
    return this.tutorials.get(tutorialId);
  }

  /**
   * Start tutorial
   */
  startTutorial(tutorialId: string): boolean {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) {
      return false;
    }

    this.currentTutorial = tutorial;
    tutorial.status = TutorialStepStatus.IN_PROGRESS;
    tutorial.startedAt = Date.now();

    // Fire tutorial started event
    this.fireEvent({
      type: GameplayEventType.TUTORIAL_STARTED,
      timestamp: Date.now(),
      tutorialId,
    } as any);

    // Start first step
    this.startFirstStep();

    return true;
  }

  /**
   * Start first step
   */
  private startFirstStep(): void {
    if (!this.currentTutorial) return;

    const firstStep = this.currentTutorial.steps
      .filter(step => step.order === 0)
      .sort((a, b) => a.order - b.order)[0];

    if (firstStep) {
      this.startStep(firstStep.id);
    }
  }

  /**
   * Start step
   */
  startStep(stepId: string): boolean {
    if (!this.currentTutorial) return false;

    const step = this.currentTutorial.steps.find(s => s.id === stepId);
    if (!step) return false;

    // Check start conditions
    if (step.startConditions) {
      const canStart = step.startConditions.every(condition => {
        const checker = this.conditionCheckers.get(condition.type);
        return checker ? checker(condition, { type: 'custom', timestamp: Date.now() } as any) : true;
      });

      if (!canStart) return false;
    }

    this.currentStep = step;
    step.status = TutorialStepStatus.IN_PROGRESS;
    step.startedAt = Date.now();

    // Fire step started event
    this.fireEvent({
      type: GameplayEventType.TUTORIAL_STEP_STARTED,
      timestamp: Date.now(),
      tutorialId: this.currentTutorial.id,
      stepId,
    } as any);

    return true;
  }

  /**
   * Complete step
   */
  completeStep(stepId: string): boolean {
    if (!this.currentTutorial) return false;

    const step = this.currentTutorial.steps.find(s => s.id === stepId);
    if (!step) return false;

    step.status = TutorialStepStatus.COMPLETED;
    step.completedAt = Date.now();

    // Execute completion actions
    if (step.completionActions) {
      for (const action of step.completionActions) {
        const executor = this.actionExecutors.get(action.type);
        if (executor) {
          executor(action);
        }
      }
    }

    // Fire step completed event
    this.fireEvent({
      type: GameplayEventType.TUTORIAL_STEP_COMPLETED,
      timestamp: Date.now(),
      tutorialId: this.currentTutorial.id,
      stepId,
    } as any);

    // Check if tutorial is complete
    this.checkTutorialCompletion();

    // Advance to next step
    this.advanceToNextStep();

    return true;
  }

  /**
   * Advance to next step
   */
  private advanceToNextStep(): void {
    if (!this.currentTutorial || !this.currentStep) return;

    const nextStep = this.currentTutorial.steps
      .filter(step => step.order > this.currentStep!.order)
      .sort((a, b) => a.order - b.order)[0];

    if (nextStep && this.currentTutorial.config.autoAdvance) {
      this.startStep(nextStep.id);
    }
  }

  /**
   * Check tutorial completion
   */
  private checkTutorialCompletion(): void {
    if (!this.currentTutorial) return;

    const allCompleted = this.currentTutorial.steps.every(
      step => step.status === TutorialStepStatus.COMPLETED
    );

    if (allCompleted) {
      this.completeTutorial();
    }
  }

  /**
   * Complete tutorial
   */
  completeTutorial(): boolean {
    if (!this.currentTutorial) return false;

    this.currentTutorial.status = TutorialStepStatus.COMPLETED;
    this.currentTutorial.completedAt = Date.now();

    // Fire tutorial completed event
    this.fireEvent({
      type: GameplayEventType.TUTORIAL_COMPLETED,
      timestamp: Date.now(),
      tutorialId: this.currentTutorial.id,
    } as any);

    this.currentTutorial = null;
    this.currentStep = null;

    return true;
  }

  /**
   * Skip tutorial
   */
  skipTutorial(tutorialId: string): boolean {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) return false;

    tutorial.status = TutorialStepStatus.SKIPPED;

    // Fire tutorial skipped event
    this.fireEvent({
      type: GameplayEventType.TUTORIAL_SKIPPED,
      timestamp: Date.now(),
      tutorialId,
    } as any);

    if (this.currentTutorial?.id === tutorialId) {
      this.currentTutorial = null;
      this.currentStep = null;
    }

    return true;
  }

  /**
   * Check condition
   */
  checkCondition(condition: TutorialCondition, event: GameplayEvent): boolean {
    const checker = this.conditionCheckers.get(condition.type);
    return checker ? checker(condition, event) : true;
  }

  /**
   * Handle event
   */
  handleEvent(event: GameplayEvent): void {
    if (!this.currentStep) return;

    // Check completion conditions
    for (const condition of this.currentStep.completionConditions) {
      if (this.checkCondition(condition, event)) {
        this.completeStep(this.currentStep.id);
        break;
      }
    }
  }

  /**
   * Register event listener
   */
  on(eventType: GameplayEventType, listener: GameplayEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: GameplayEventType, listener: GameplayEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: GameplayEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  /**
   * Get current tutorial
   */
  getCurrentTutorial(): Tutorial | null {
    return this.currentTutorial;
  }

  /**
   * Get current step
   */
  getCurrentStep(): TutorialStep | null {
    return this.currentStep;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GameplayConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): GameplayConfig {
    return { ...this.config };
  }
}
