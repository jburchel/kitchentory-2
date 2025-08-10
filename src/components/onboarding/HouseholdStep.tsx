import React from 'react';
import { Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormField } from './FormField';
import { HouseholdFormData } from '@/types/onboarding';

export interface HouseholdStepProps {
  data: HouseholdFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<HouseholdFormData>) => void;
  onFieldTouch: (field: string) => void;
}

export function HouseholdStep({ 
  data, 
  errors, 
  onChange, 
  onFieldTouch,
}: HouseholdStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Create your household
        </h2>
        <p className="text-gray-600 mt-2">
          Set up your kitchen management space
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Household Name */}
        <FormField
          label="Household Name"
          required
          error={errors.name}
          helpText="Choose a name that helps identify your household"
        >
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            onBlur={() => onFieldTouch('name')}
            placeholder="e.g., Smith Family Kitchen, Our Home, Apartment 3B"
            className={errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          />
        </FormField>

        {/* Description */}
        <FormField
          label="Description"
          error={errors.description}
          helpText="Optional: Add a brief description of your household"
        >
          <Input
            value={data.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            onBlur={() => onFieldTouch('description')}
            placeholder="e.g., Family of 4 with shared cooking responsibilities"
            className={errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          />
        </FormField>
      </div>

      {/* Information Panel */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-amber-900 mb-2">
          Why do we ask this?
        </h4>
        <p className="text-sm text-amber-700">
          Different household types have different needs. This helps us suggest 
          relevant features and customize your experience.
        </p>
      </div>
    </div>
  );
}