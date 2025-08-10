import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { OnboardingFormData } from '@/types/onboarding';

export interface CompletionStepProps {
  data: OnboardingFormData;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function CompletionStep({
  data,
  isLoading,
  error,
  success,
  onSubmit,
  onBack,
}: CompletionStepProps) {
  if (success) {
    return (
      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Success Message */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Kitchentory!
          </h2>
          <p className="text-lg text-gray-600">
            Your household has been created successfully.
          </p>
        </div>

        {/* Redirect Message */}
        <div className="text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" />
            <span>Redirecting to your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Ready to get started!
        </h2>
        <p className="text-gray-600 mt-2">
          Review your setup and create your household
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900">Setup Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between space-x-4 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <span>Back</span>
        </Button>

        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex items-center space-x-2 min-w-[140px] justify-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Creating...</span>
            </>
          ) : (
            <span>Create household</span>
          )}
        </Button>
      </div>
    </div>
  );
}