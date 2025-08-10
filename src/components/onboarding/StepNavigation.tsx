import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface StepNavigationProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
}

export function StepNavigation({
  canGoBack,
  canGoNext,
  isLoading = false,
  onBack,
  onNext,
  nextLabel = 'Continue',
  backLabel = 'Back',
  className,
}: StepNavigationProps) {
  return (
    <div className={`flex items-center justify-between space-x-4 ${className || ''}`}>
      {canGoBack ? (
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </Button>
      ) : (
        <div /> /* Spacer to maintain layout */
      )}

      <Button
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        className="flex items-center space-x-2 min-w-[120px] justify-center"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <span>{nextLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}