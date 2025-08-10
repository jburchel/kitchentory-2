import React from 'react';
import { UserPlus } from 'lucide-react';
import { InvitationFormData } from '@/types/onboarding';

export interface InvitationStepProps {
  data: InvitationFormData[];
  errors: Record<string, string>;
  onChange: (data: InvitationFormData[]) => void;
  onAdd: (invitation: InvitationFormData) => void;
  onUpdate: (index: number, invitation: Partial<InvitationFormData>) => void;
  onRemove: (index: number) => void;
}

export function InvitationStep({ 
  data, 
  errors, 
  onChange,
  onAdd,
  onUpdate,
  onRemove,
}: InvitationStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Invite household members
        </h2>
        <p className="text-gray-600 mt-2">
          Invite family members or roommates to join your household (optional)
        </p>
      </div>

      {/* Information Panel */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">
          No worries if you skip this!
        </h4>
        <p className="text-sm text-green-700">
          You can always invite people later from your household settings. 
          Invitations will be sent via email after you complete setup.
        </p>
      </div>
    </div>
  );
}