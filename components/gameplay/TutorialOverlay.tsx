'use client';

/**
 * Tutorial Overlay
 * Displays tutorial steps with progress tracking
 */

import { useEffect, useState } from 'react';
import { TutorialSystem } from '@/lib/gameplay/TutorialSystem';
import type { TutorialStep } from '@/lib/gameplay/types';
import { TutorialStepStatus } from '@/lib/gameplay/types';

interface TutorialOverlayProps {
  tutorialSystem: TutorialSystem;
}

export default function TutorialOverlay({ tutorialSystem }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStep = () => {
      setCurrentStep(tutorialSystem.getCurrentStep());
      setIsVisible(!!tutorialSystem.getCurrentStep());
    };

    updateStep();

    // Subscribe to tutorial events
    tutorialSystem.on('tutorial_step_started' as any, updateStep);
    tutorialSystem.on('tutorial_step_completed' as any, updateStep);
    tutorialSystem.on('tutorial_completed' as any, updateStep);

    return () => {
      tutorialSystem.off('tutorial_step_started' as any, updateStep);
      tutorialSystem.off('tutorial_step_completed' as any, updateStep);
      tutorialSystem.off('tutorial_completed' as any, updateStep);
    };
  }, [tutorialSystem]);

  if (!isVisible || !currentStep) return null;

  const handleContinue = () => {
    if (currentStep.uiConfig?.allowSkip) {
      tutorialSystem.completeStep(currentStep.id);
    }
  };

  const getPositionClasses = () => {
    switch (currentStep.uiConfig?.position) {
      case 'top':
        return 'top-8 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-8 left-1/2 -translate-x-1/2';
      case 'left':
        return 'left-8 top-1/2 -translate-y-1/2';
      case 'right':
        return 'right-8 top-1/2 -translate-y-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`absolute ${getPositionClasses()} bg-gray-900 border border-blue-500 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl`}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
          {currentStep.uiConfig?.allowSkip && (
            <button
              onClick={handleContinue}
              className="text-gray-400 hover:text-white text-sm"
            >
              Skip
            </button>
          )}
        </div>
        <p className="text-gray-300 mb-6">{currentStep.description}</p>
        <button
          onClick={handleContinue}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
