'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'

// Validation schema for invitation form
const invitationSchema = z.object({
  emails: z.array(z.string().email('Invalid email address')).min(1, 'At least one email required'),
  role: z.enum(['member', 'admin'], { required_error: 'Role is required' }),
  message: z.string().optional(),
  expiresIn: z.number().min(1).max(30).default(7)
})

type InvitationFormData = z.infer<typeof invitationSchema>

export interface InvitationFormProps {
  householdId: string
  onSuccess?: (invitations: any[]) => void
  onCancel?: () => void
  className?: string
}

export function InvitationForm({ householdId, onSuccess, onCancel, className }: InvitationFormProps) {
  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      emails: [],
      role: 'member',
      message: '',
      expiresIn: 7
    }
  })

  const addEmail = () => {
    const trimmedEmail = emailInput.trim()
    if (trimmedEmail && !emails.includes(trimmedEmail)) {
      try {
        z.string().email().parse(trimmedEmail)
        const newEmails = [...emails, trimmedEmail]
        setEmails(newEmails)
        form.setValue('emails', newEmails)
        setEmailInput('')
        form.clearErrors('emails')
      } catch {
        form.setError('emails', { message: 'Invalid email address' })
      }
    }
  }

  const removeEmail = (emailToRemove: string) => {
    const newEmails = emails.filter(email => email !== emailToRemove)
    setEmails(newEmails)
    form.setValue('emails', newEmails)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmail()
    }
  }

  const onSubmit = async (data: InvitationFormData) => {
    try {
      setIsSubmitting(true)
      
      // Mock API call - will be replaced with actual Convex function
      const invitations = data.emails.map(email => ({
        id: Math.random().toString(36),
        email,
        role: data.role,
        message: data.message,
        expiresAt: new Date(Date.now() + data.expiresIn * 24 * 60 * 60 * 1000),
        status: 'pending'
      }))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success(`Successfully sent ${data.emails.length} invitation${data.emails.length > 1 ? 's' : ''}`)
      
      onSuccess?.(invitations)
      form.reset()
      setEmails([])
      
    } catch (error) {
      toast.error('Failed to send invitations')
      console.error('Error sending invitations:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-emerald-600" />
          Invite Members
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input Section */}
          <div className="space-y-3">
            <Label htmlFor="email-input">Email Addresses</Label>
            <div className="flex gap-2">
              <Input
                id="email-input"
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addEmail}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Email Tags */}
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {form.formState.errors.emails && (
              <p className="text-sm text-red-500">
                {form.formState.errors.emails.message}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Member Role</Label>
            <Select
              value={form.watch('role')}
              onValueChange={(value: 'member' | 'admin') => form.setValue('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex flex-col">
                    <span className="font-medium">Member</span>
                    <span className="text-sm text-muted-foreground">Can view and manage inventory</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-sm text-muted-foreground">Can manage members and settings</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expires">Invitation Expires In</Label>
            <Select
              value={form.watch('expiresIn').toString()}
              onValueChange={(value) => form.setValue('expiresIn', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">1 week</SelectItem>
                <SelectItem value="14">2 weeks</SelectItem>
                <SelectItem value="30">1 month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your invitation..."
              {...form.register('message')}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={emails.length === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send {emails.length} Invitation{emails.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}