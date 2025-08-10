import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingProgress } from '@/types/onboarding';

export interface ProgressBarProps {
  progress: OnboardingProgress;
  className?: string;
  onStepClick?: (stepIndex: number) => void;
  allowNavigation?: boolean;
}

export function ProgressBar({ 
  progress, 
  className, 
  onStepClick,
  allowNavigation = false 
}: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Progress indicators */}
      <div className="flex items-center justify-between mb-2">
        {progress.steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => allowNavigation && onStepClick?.(index)}
              disabled={!allowNavigation}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 focus:outline-none',
                step.completed
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : step.current
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-500',
                allowNavigation && 'hover:scale-105 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                !allowNavigation && 'cursor-default'
              )}
            >
              {step.completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </button>
            
            {/* Connector line */}
            {index < progress.steps.length - 1 && (
              <div
                className={cn(
                  'w-12 sm:w-16 h-1 mx-2 transition-colors duration-300',
                  step.completed ? 'bg-green-600' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Step labels */}
      <div className="flex justify-between text-xs text-gray-500 px-1">
        {progress.steps.map((step) => (
          <span
            key={step.id}
            className={cn(
              'text-center max-w-16 truncate',
              step.current && 'text-primary-600 font-medium',
              step.completed && 'text-green-600'
            )}
            title={step.description}
          >
            {step.title}
          </span>
        ))}
      </div>
      
      {/* Overall progress bar */}
      <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-500 ease-out"
          style={{
            width: `${(progress.currentStep / (progress.totalSteps - 1)) * 100}%`,
          }}
        />
      </div>
      
      {/* Progress text */}
      <div className="flex justify-between items-center mt-2 text-sm">
        <span className="text-gray-600">
          Step {progress.currentStep + 1} of {progress.totalSteps}
        </span>
        <span className="text-primary-600 font-medium">
          {Math.round((progress.currentStep / (progress.totalSteps - 1)) * 100)}% Complete
        </span>
      </div>
    </div>
  );
}