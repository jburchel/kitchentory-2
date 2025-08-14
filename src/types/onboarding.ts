import type { Id } from "../../convex/_generated/dataModel";

/**
 * Types for the onboarding flow and household creation
 */

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
}

export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// API Response Types
export interface HouseholdCreationResult {
  householdId: Id<"households">;
  inviteCode: string;
  invitationsCount: number;
}

export interface InvitationResult {
  invitationId: Id<"invitations">;
  email: string;
  status: 'sent' | 'failed';
}

// Form Step Data Types
export interface ProfileFormData {
  firstName: string;
  lastName: string;
}

export interface HouseholdFormData {
  name: string;
  description?: string;
  type: 'single' | 'family' | 'shared';
}

export interface HouseholdSettingsData {
  currency: string;
  defaultUnit: string;
  expirationWarningDays: number;
  allowGuestView: boolean;
}

export interface InvitationFormData {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
}

// Complete onboarding form data
export interface OnboardingFormData {
  profile: ProfileFormData;
  household: HouseholdFormData;
  settings: HouseholdSettingsData;
  invitations: InvitationFormData[];
}

// Step-specific form states
export interface StepFormState<T = unknown> {
  data: T;
  validation: FormValidationState;
  operation: AsyncOperationState;
}

export interface OnboardingState {
  progress: OnboardingProgress;
  profile: StepFormState<ProfileFormData>;
  household: StepFormState<HouseholdFormData>;
  settings: StepFormState<HouseholdSettingsData>;
  invitations: StepFormState<InvitationFormData[]>;
  completion: AsyncOperationState;
}

// Action Types for state management
export type OnboardingAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<ProfileFormData> }
  | { type: 'UPDATE_HOUSEHOLD'; payload: Partial<HouseholdFormData> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<HouseholdSettingsData> }
  | { type: 'ADD_INVITATION'; payload: InvitationFormData }
  | { type: 'UPDATE_INVITATION'; payload: { index: number; data: Partial<InvitationFormData> } }
  | { type: 'REMOVE_INVITATION'; payload: number }
  | { type: 'SET_VALIDATION_ERROR'; payload: { step: keyof OnboardingState; errors: Record<string, string> } }
  | { type: 'SET_FIELD_TOUCHED'; payload: { step: keyof OnboardingState; field: string } }
  | { type: 'START_OPERATION'; payload: keyof OnboardingState }
  | { type: 'OPERATION_SUCCESS'; payload: keyof OnboardingState }
  | { type: 'OPERATION_ERROR'; payload: { step: keyof OnboardingState; error: string } }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET_STATE' };

// Hook return types
export interface UseOnboardingReturn {
  state: OnboardingState;
  actions: {
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: number) => void;
    updateProfile: (data: Partial<ProfileFormData>) => void;
    updateHousehold: (data: Partial<HouseholdFormData>) => void;
    updateSettings: (data: Partial<HouseholdSettingsData>) => void;
    addInvitation: (invitation: InvitationFormData) => void;
    updateInvitation: (index: number, data: Partial<InvitationFormData>) => void;
    removeInvitation: (index: number) => void;
    validateStep: (step: keyof typeof stepSchemas) => boolean;
    submitOnboarding: () => Promise<HouseholdCreationResult>;
    reset: () => void;
  };
  computed: {
    canProceed: boolean;
    isFirstStep: boolean;
    isLastStep: boolean;
    completionPercentage: number;
    hasUnsavedChanges: boolean;
  };
}

// Component Props Types
export interface OnboardingStepProps {
  step: OnboardingStep;
  isActive: boolean;
  isCompleted: boolean;
  onClick?: () => void;
}

export interface ProgressBarProps {
  progress: OnboardingProgress;
  className?: string;
}

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

export interface StepNavigationProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
}

// Default values
export const defaultProfileData: ProfileFormData = {
  firstName: '',
  lastName: '',
};

export const defaultHouseholdData: HouseholdFormData = {
  name: '',
  description: '',
  type: 'family',
};

export const defaultHouseholdSettings: HouseholdSettingsData = {
  currency: 'USD',
  defaultUnit: 'pieces',
  expirationWarningDays: 7,
  allowGuestView: false,
};

export const defaultInvitationData: InvitationFormData = {
  email: '',
  role: 'member',
  message: '',
};

// Constants
export const ONBOARDING_STEPS = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Tell us about yourself',
  },
  {
    id: 'household',
    title: 'Household',
    description: 'Create your household',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure preferences',
  },
  {
    id: 'invitations',
    title: 'Invitations',
    description: 'Invite household members',
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Review and finish',
  },
] as const;

export const HOUSEHOLD_TYPE_OPTIONS = [
  {
    value: 'single' as const,
    label: 'Just me',
    description: 'Personal kitchen management',
    icon: 'user',
  },
  {
    value: 'family' as const,
    label: 'Family household',
    description: 'Shared family kitchen',
    icon: 'home',
  },
  {
    value: 'shared' as const,
    label: 'Shared with roommates',
    description: 'Roommate kitchen sharing',
    icon: 'users',
  },
] as const;

export const MEMBER_ROLE_OPTIONS = [
  {
    value: 'admin' as const,
    label: 'Admin',
    description: 'Can manage settings and members',
  },
  {
    value: 'member' as const,
    label: 'Member',
    description: 'Can add and manage inventory',
  },
  {
    value: 'viewer' as const,
    label: 'Viewer',
    description: 'Can only view inventory',
  },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
] as const;

export const UNIT_OPTIONS = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'lbs', label: 'Pounds' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'oz', label: 'Ounces' },
  { value: 'g', label: 'Grams' },
  { value: 'ml', label: 'Milliliters' },
  { value: 'l', label: 'Liters' },
] as const;