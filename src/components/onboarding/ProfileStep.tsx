import React from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormField } from './FormField';
import { StepNavigationProps } from './StepNavigation';
import { ProfileFormData } from '@/types/onboarding';

export interface ProfileStepProps {
  data: ProfileFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<ProfileFormData>) => void;
  onFieldTouch: (field: string) => void;
  navigation: StepNavigationProps;
}

export function ProfileStep({ 
  data, 
  errors, 
  onChange, 
  onFieldTouch,
  navigation 
}: ProfileStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Tell us about yourself
        </h2>
        <p className="text-gray-600 mt-2">
          We'll use this information to personalize your experience
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <FormField
          label="First Name"
          required
          error={errors.firstName}
        >
          <Input
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            onBlur={() => onFieldTouch('firstName')}
            placeholder="Enter your first name"
            className={errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          />
        </FormField>

        <FormField
          label="Last Name"
          required
          error={errors.lastName}
        >
          <Input
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            onBlur={() => onFieldTouch('lastName')}
            placeholder="Enter your last name"
            className={errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          />
        </FormField>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Quick tip
        </h4>
        <p className="text-sm text-blue-700">
          You can always update your profile information later in your account settings.
        </p>
      </div>
    </div>
  );
}