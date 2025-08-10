import { useReducer, useCallback, useMemo } from 'react';
import { useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
// Note: Temporary mock API for build-time compatibility
const api = {
  households: {
    createHousehold: null,
  },
  invitations: {
    createInvitation: null,
  },
};

import {
  OnboardingState,
  OnboardingAction,
  UseOnboardingReturn,
  HouseholdCreationResult,
  ProfileFormData,
  HouseholdFormData,
  HouseholdSettingsData,
  InvitationFormData,
  defaultProfileData,
  defaultHouseholdData,
  defaultHouseholdSettings,
  ONBOARDING_STEPS,
} from '@/types/onboarding';

import {
  validateStep,
  formatValidationErrors,
  stepSchemas,
} from '@/lib/validations/household';

// Initial state
const createInitialState = (user?: any): OnboardingState => ({
  progress: {
    currentStep: 0,
    totalSteps: ONBOARDING_STEPS.length,
    steps: ONBOARDING_STEPS.map((step, index) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      completed: false,
      current: index === 0,
    })),
  },
  profile: {
    data: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
    validation: {
      isValid: false,
      errors: {},
      touched: {},
    },
    operation: {
      isLoading: false,
      error: null,
      success: false,
    },
  },
  household: {
    data: defaultHouseholdData,
    validation: {
      isValid: false,
      errors: {},
      touched: {},
    },
    operation: {
      isLoading: false,
      error: null,
      success: false,
    },
  },
  settings: {
    data: defaultHouseholdSettings,
    validation: {
      isValid: true, // Settings have defaults, so they're valid by default
      errors: {},
      touched: {},
    },
    operation: {
      isLoading: false,
      error: null,
      success: false,
    },
  },
  invitations: {
    data: [],
    validation: {
      isValid: true, // Invitations are optional
      errors: {},
      touched: {},
    },
    operation: {
      isLoading: false,
      error: null,
      success: false,
    },
  },
  completion: {
    isLoading: false,
    error: null,
    success: false,
  },
});

// Reducer function
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_CURRENT_STEP': {
      const currentStep = Math.max(0, Math.min(action.payload, state.progress.totalSteps - 1));
      return {
        ...state,
        progress: {
          ...state.progress,
          currentStep,
          steps: state.progress.steps.map((step, index) => ({
            ...step,
            current: index === currentStep,
            completed: index < currentStep,
          })),
        },
      };
    }

    case 'NEXT_STEP': {
      const nextStep = Math.min(state.progress.currentStep + 1, state.progress.totalSteps - 1);
      return onboardingReducer(state, { type: 'SET_CURRENT_STEP', payload: nextStep });
    }

    case 'PREVIOUS_STEP': {
      const prevStep = Math.max(state.progress.currentStep - 1, 0);
      return onboardingReducer(state, { type: 'SET_CURRENT_STEP', payload: prevStep });
    }

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          data: { ...state.profile.data, ...action.payload },
        },
      };

    case 'UPDATE_HOUSEHOLD':
      return {
        ...state,
        household: {
          ...state.household,
          data: { ...state.household.data, ...action.payload },
        },
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          data: { ...state.settings.data, ...action.payload },
        },
      };

    case 'ADD_INVITATION':
      return {
        ...state,
        invitations: {
          ...state.invitations,
          data: [...state.invitations.data, action.payload],
        },
      };

    case 'UPDATE_INVITATION': {
      const newInvitations = [...state.invitations.data];
      newInvitations[action.payload.index] = {
        ...newInvitations[action.payload.index],
        ...action.payload.data,
      };
      return {
        ...state,
        invitations: {
          ...state.invitations,
          data: newInvitations,
        },
      };
    }

    case 'REMOVE_INVITATION': {
      const newInvitations = state.invitations.data.filter((_, index) => index !== action.payload);
      return {
        ...state,
        invitations: {
          ...state.invitations,
          data: newInvitations,
        },
      };
    }

    case 'SET_VALIDATION_ERROR': {
      const stepKey = action.payload.step;
      if (stepKey in state && typeof state[stepKey] === 'object' && state[stepKey] !== null) {
        return {
          ...state,
          [stepKey]: {
            ...state[stepKey],
            validation: {
              ...state[stepKey].validation,
              isValid: Object.keys(action.payload.errors).length === 0,
              errors: action.payload.errors,
            },
          },
        };
      }
      return state;
    }

    case 'SET_FIELD_TOUCHED': {
      const stepKey = action.payload.step;
      if (stepKey in state && typeof state[stepKey] === 'object' && state[stepKey] !== null) {
        return {
          ...state,
          [stepKey]: {
            ...state[stepKey],
            validation: {
              ...state[stepKey].validation,
              touched: {
                ...state[stepKey].validation.touched,
                [action.payload.field]: true,
              },
            },
          },
        };
      }
      return state;
    }

    case 'START_OPERATION': {
      const stepKey = action.payload;
      if (stepKey in state && typeof state[stepKey] === 'object' && state[stepKey] !== null) {
        return {
          ...state,
          [stepKey]: {
            ...state[stepKey],
            operation: {
              isLoading: true,
              error: null,
              success: false,
            },
          },
        };
      }
      return state;
    }

    case 'OPERATION_SUCCESS': {
      const stepKey = action.payload;
      if (stepKey in state && typeof state[stepKey] === 'object' && state[stepKey] !== null) {
        return {
          ...state,
          [stepKey]: {
            ...state[stepKey],
            operation: {
              isLoading: false,
              error: null,
              success: true,
            },
          },
        };
      }
      return state;
    }

    case 'OPERATION_ERROR': {
      const stepKey = action.payload.step;
      if (stepKey in state && typeof state[stepKey] === 'object' && state[stepKey] !== null) {
        return {
          ...state,
          [stepKey]: {
            ...state[stepKey],
            operation: {
              isLoading: false,
              error: action.payload.error,
              success: false,
            },
          },
        };
      }
      return state;
    }

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        completion: {
          isLoading: false,
          error: null,
          success: true,
        },
      };

    case 'RESET_STATE':
      return createInitialState();

    default:
      return state;
  }
}

// Custom hook
export function useOnboarding(): UseOnboardingReturn {
  const { user } = useUser();
  const router = useRouter();
  const [state, dispatch] = useReducer(onboardingReducer, createInitialState(user));

  // Convex mutations - temporarily disabled for build compatibility
  // const createHousehold = useMutation(api.households.createHousehold);
  // const sendInvitation = useMutation(api.invitations.createInvitation);
  const createHousehold = async () => 'mock-household-id';
  const sendInvitation = async () => 'mock-invitation-id';

  // Actions
  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const previousStep = useCallback(() => {
    dispatch({ type: 'PREVIOUS_STEP' });
  }, []);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const updateProfile = useCallback((data: Partial<ProfileFormData>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
    
    // Validate immediately
    const validation = validateStep('profile', { ...state.profile.data, ...data });
    if (!validation.success) {
      dispatch({
        type: 'SET_VALIDATION_ERROR',
        payload: {
          step: 'profile',
          errors: formatValidationErrors(validation.errors),
        },
      });
    } else {
      dispatch({
        type: 'SET_VALIDATION_ERROR',
        payload: { step: 'profile', errors: {} },
      });
    }
  }, [state.profile.data]);

  const updateHousehold = useCallback((data: Partial<HouseholdFormData>) => {
    dispatch({ type: 'UPDATE_HOUSEHOLD', payload: data });
    
    // Validate immediately
    const validation = validateStep('household', { ...state.household.data, ...data });
    if (!validation.success) {
      dispatch({
        type: 'SET_VALIDATION_ERROR',
        payload: {
          step: 'household',
          errors: formatValidationErrors(validation.errors),
        },
      });
    } else {
      dispatch({
        type: 'SET_VALIDATION_ERROR',
        payload: { step: 'household', errors: {} },
      });
    }
  }, [state.household.data]);

  const updateSettings = useCallback((data: Partial<HouseholdSettingsData>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: data });
    
    // Validate immediately
    const validation = validateStep('settings', { settings: { ...state.settings.data, ...data } });
    if (!validation.success) {
      dispatch({
        type: 'SET_VALIDATION_ERROR',
        payload: {
          step: 'settings',
          errors: formatValidationErrors(validation.errors),
        },
      });
    } else {
      dispatch({
        type: 'SET_VALIDATION_ERROR',
        payload: { step: 'settings', errors: {} },
      });
    }
  }, [state.settings.data]);

  const addInvitation = useCallback((invitation: InvitationFormData) => {
    dispatch({ type: 'ADD_INVITATION', payload: invitation });
  }, []);

  const updateInvitation = useCallback((index: number, data: Partial<InvitationFormData>) => {
    dispatch({ type: 'UPDATE_INVITATION', payload: { index, data } });
  }, []);

  const removeInvitation = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_INVITATION', payload: index });
  }, []);

  const validateCurrentStep = useCallback((step: keyof typeof stepSchemas): boolean => {
    let stepData;
    
    switch (step) {
      case 'profile':
        stepData = state.profile.data;
        break;
      case 'household':
        stepData = state.household.data;
        break;
      case 'settings':
        stepData = { settings: state.settings.data };
        break;
      case 'invitations':
        stepData = { invitations: state.invitations.data };
        break;
      default:
        return false;
    }

    const validation = validateStep(step, stepData);
    if (!validation.success) {
      dispatch({
        type: 'SET_VALIDATION_ERROR',
        payload: {
          step: step as keyof OnboardingState,
          errors: formatValidationErrors(validation.errors),
        },
      });
      return false;
    }

    dispatch({
      type: 'SET_VALIDATION_ERROR',
      payload: { step: step as keyof OnboardingState, errors: {} },
    });
    return true;
  }, [state.profile.data, state.household.data, state.settings.data, state.invitations.data]);

  const submitOnboarding = useCallback(async (): Promise<HouseholdCreationResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    dispatch({ type: 'START_OPERATION', payload: 'completion' });

    try {
      // Create household
      const householdId = await createHousehold({
        name: state.household.data.name,
        description: state.household.data.description,
        settings: state.settings.data,
      });

      // Send invitations if any
      const invitationPromises = state.invitations.data.map(invitation =>
        sendInvitation({
          householdId,
          email: invitation.email,
          role: invitation.role,
          message: invitation.message,
        })
      );

      const invitationResults = await Promise.allSettled(invitationPromises);
      const successfulInvitations = invitationResults.filter(
        result => result.status === 'fulfilled'
      ).length;

      dispatch({ type: 'COMPLETE_ONBOARDING' });

      const result: HouseholdCreationResult = {
        householdId,
        inviteCode: '', // This would come from the backend
        invitationsCount: successfulInvitations,
      };

      // Navigate to dashboard
      setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';
      dispatch({
        type: 'OPERATION_ERROR',
        payload: { step: 'completion', error: errorMessage },
      });
      throw error;
    }
  }, [user, state, createHousehold, sendInvitation, router]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Computed values
  const computed = useMemo(() => {
    const currentStepIndex = state.progress.currentStep;
    const currentStepId = ONBOARDING_STEPS[currentStepIndex]?.id;
    
    let canProceed = false;
    switch (currentStepId) {
      case 'profile':
        canProceed = state.profile.validation.isValid;
        break;
      case 'household':
        canProceed = state.household.validation.isValid;
        break;
      case 'settings':
        canProceed = state.settings.validation.isValid;
        break;
      case 'invitations':
        canProceed = true; // Invitations are optional
        break;
      case 'complete':
        canProceed = true;
        break;
      default:
        canProceed = false;
    }

    return {
      canProceed,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === state.progress.totalSteps - 1,
      completionPercentage: (state.progress.steps.filter(s => s.completed).length / state.progress.totalSteps) * 100,
      hasUnsavedChanges: Boolean(
        state.profile.data.firstName ||
        state.profile.data.lastName ||
        state.household.data.name ||
        state.invitations.data.length > 0
      ),
    };
  }, [state.progress, state.profile, state.household, state.settings, state.invitations]);

  return {
    state,
    actions: {
      nextStep,
      previousStep,
      goToStep,
      updateProfile,
      updateHousehold,
      updateSettings,
      addInvitation,
      updateInvitation,
      removeInvitation,
      validateStep: validateCurrentStep,
      submitOnboarding,
      reset,
    },
    computed,
  };
}