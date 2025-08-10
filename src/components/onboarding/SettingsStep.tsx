import React from 'react';
import { Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormField } from './FormField';
import { HouseholdSettingsData } from '@/types/onboarding';

export interface SettingsStepProps {
  data: HouseholdSettingsData;
  errors: Record<string, string>;
  onChange: (data: Partial<HouseholdSettingsData>) => void;
  onFieldTouch: (field: string) => void;
}

export function SettingsStep({ 
  data, 
  errors, 
  onChange, 
  onFieldTouch,
}: SettingsStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Configure your preferences
        </h2>
        <p className="text-gray-600 mt-2">
          These settings help us provide a personalized experience
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Currency */}
        <FormField
          label="Currency"
          error={errors.currency}
          helpText="Used for tracking food costs and budgets"
        >
          <select
            value={data.currency}
            onChange={(e) => {
              onChange({ currency: e.target.value });
              onFieldTouch('currency');
            }}
            className="flex min-h-[44px] w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200"
          >
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </FormField>

        {/* Expiration Warning Days */}
        <FormField
          label="Expiration Warning"
          error={errors.expirationWarningDays?.toString()}
          helpText="How many days before expiration should we warn you?"
        >
          <Input
            type="number"
            min="1"
            max="365"
            value={data.expirationWarningDays}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value)) {
                onChange({ expirationWarningDays: value });
                onFieldTouch('expirationWarningDays');
              }
            }}
            placeholder="7"
          />
        </FormField>
      </div>

      {/* Information Panel */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-indigo-900 mb-2">
          Don't worry!
        </h4>
        <p className="text-sm text-indigo-700">
          You can change all of these settings at any time from your household settings page.
        </p>
      </div>
    </div>
  );
}