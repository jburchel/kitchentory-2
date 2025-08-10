import React, { useState } from 'react';
import { UserPlus, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [newEmail, setNewEmail] = useState('');

  const handleAddEmail = () => {
    if (newEmail.trim() && isValidEmail(newEmail)) {
      onAdd({
        email: newEmail.trim(),
        role: 'member',
        message: ''
      });
      setNewEmail('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

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

      {/* Email Input */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddEmail}
            disabled={!newEmail.trim() || !isValidEmail(newEmail)}
            className="px-4"
          >
            Add
          </Button>
        </div>

        {/* Invited Email List */}
        {data && data.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              People to invite ({data.length}):
            </h4>
            {data.map((invitation, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{invitation.email}</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    {invitation.role}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}