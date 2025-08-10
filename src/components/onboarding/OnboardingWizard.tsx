'use client'

import React, { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOnboarding } from '@/hooks/useOnboarding';

// Step Components
import { ProgressBar } from './ProgressBar';
import { StepNavigation } from './StepNavigation';
import { ProfileStep } from './ProfileStep';
import { HouseholdStep } from './HouseholdStep';
import { SettingsStep } from './SettingsStep';
import { InvitationStep } from './InvitationStep';
import { CompletionStep } from './CompletionStep';

export function OnboardingWizard() {
  const { user } = useUser();
  const { sessionClaims } = useAuth();
  const router = useRouter();
  const { state, actions, computed } = useOnboarding();

  // Check if user has already completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = (sessionClaims as any)?.publicMetadata?.onboardingCompleted;
    if (hasCompletedOnboarding) {
      router.replace('/dashboard');
    }
  }, [sessionClaims, router]);

  // Show loading if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentStepIndex = state.progress.currentStep;
  const currentStepId = state.progress.steps[currentStepIndex]?.id;

  const handleNext = async () => {
    // Validate current step before proceeding
    let isValid = false;
    
    switch (currentStepId) {
      case 'profile':
        isValid = actions.validateStep('profile');
        break;
      case 'household':
        isValid = actions.validateStep('household');
        break;
      case 'settings':
        isValid = actions.validateStep('settings');
        break;
      case 'invitations':
        isValid = true; // Invitations are optional
        break;
      case 'complete':
        // Handle submission
        try {
          await actions.submitOnboarding();
          return;
        } catch (error) {
          console.error('Onboarding submission failed:', error);
          return;
        }
    }

    if (isValid) {
      actions.nextStep();
    }
  };

  const handleFieldTouch = (step: string, field: string) => {
    // This could be enhanced to track touched fields for better UX
    console.log(`Field touched: ${step}.${field}`);
  };

  const renderCurrentStep = () => {
    switch (currentStepId) {
      case 'profile':
        return (
          <ProfileStep
            data={state.profile.data}
            errors={state.profile.validation.errors}
            onChange={actions.updateProfile}
            onFieldTouch={(field) => handleFieldTouch('profile', field)}
            navigation={{
              canGoBack: computed.isFirstStep,
              canGoNext: computed.canProceed,
              isLoading: state.profile.operation.isLoading,
              onBack: actions.previousStep,
              onNext: handleNext,
            }}
          />
        );

      case 'household':
        return (
          <HouseholdStep
            data={state.household.data}
            errors={state.household.validation.errors}
            onChange={actions.updateHousehold}
            onFieldTouch={(field) => handleFieldTouch('household', field)}
          />
        );

      case 'settings':
        return (
          <SettingsStep
            data={state.settings.data}
            errors={state.settings.validation.errors}
            onChange={actions.updateSettings}
            onFieldTouch={(field) => handleFieldTouch('settings', field)}
          />
        );

      case 'invitations':
        return (
          <InvitationStep
            data={state.invitations.data}
            errors={state.invitations.validation.errors}
            onChange={(invitations) => {
              // Handle the case where invitations might be undefined or null
              if (!invitations || !Array.isArray(invitations)) {
                return;
              }
              
              // This is a bit of a hack - ideally we'd have a cleaner way to set all invitations
              const currentInvitations = [...state.invitations.data];
              invitations.forEach((invitation, index) => {
                if (index < currentInvitations.length) {
                  actions.updateInvitation(index, invitation);
                } else {
                  actions.addInvitation(invitation);
                }
              });
              
              // Remove any excess invitations
              while (currentInvitations.length > invitations.length) {
                actions.removeInvitation(currentInvitations.length - 1);
                currentInvitations.pop();
              }
            }}
            onAdd={actions.addInvitation}
            onUpdate={actions.updateInvitation}
            onRemove={actions.removeInvitation}
          />
        );

      case 'complete':
        return (
          <CompletionStep
            data={{
              profile: state.profile.data,
              household: state.household.data,
              settings: state.settings.data,
              invitations: state.invitations.data,
            }}
            isLoading={state.completion.isLoading}
            error={state.completion.error}
            success={state.completion.success}
            onSubmit={handleNext}
            onBack={actions.previousStep}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Unknown step: {currentStepId}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-primary-gradient rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Kitchentory!
            </h1>
            <p className="text-lg text-gray-600">
              Let's set up your household and get you started
            </p>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            progress={state.progress}
            allowNavigation={false}
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            {renderCurrentStep()}
            
            {/* Step Navigation - only show if not on complete step or if complete step hasn't succeeded */}
            {(currentStepId !== 'complete' || !state.completion.success) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <StepNavigation
                  canGoBack={!computed.isFirstStep}
                  canGoNext={computed.canProceed}
                  isLoading={
                    state.profile.operation.isLoading ||
                    state.household.operation.isLoading ||
                    state.settings.operation.isLoading ||
                    state.invitations.operation.isLoading ||
                    state.completion.isLoading
                  }
                  onBack={actions.previousStep}
                  onNext={handleNext}
                  nextLabel={
                    currentStepId === 'complete'
                      ? 'Create household'
                      : computed.isLastStep
                      ? 'Review & finish'
                      : 'Continue'
                  }
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          Need help? Contact our support team or check out our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 underline">
            getting started guide
          </a>
        </div>
      </div>
    </div>
  );
}