'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, ShoppingCart, Users, Calendar, DollarSign, MapPin, Tag, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { formatISO } from 'date-fns'
import {
  CreateShoppingListData,
  createShoppingListSchema,
  LIST_STATUS,
  ListStatus
} from '@/schemas/shoppingListSchemas'

export interface ShoppingListCreationFormProps {
  householdId: string
  currentUserId: string
  householdMembers?: Array<{ id: string; name: string; avatar?: string }>
  onSuccess?: (list: CreateShoppingListData) => void
  onCancel?: () => void
  initialData?: Partial<CreateShoppingListData>
  className?: string
}

// Common stores for quick selection
const COMMON_STORES = [
  'Whole Foods Market',
  'Kroger',
  'Walmart',
  'Target',
  'Trader Joe\'s',
  'Costco',
  'Sam\'s Club',
  'Safeway',
  'Publix',
  'H-E-B'
]

// Common tags for organization
const COMMON_TAGS = [
  'groceries',
  'weekly',
  'bulk',
  'organic',
  'party',
  'holiday',
  'emergency',
  'meal-prep',
  'household',
  'pharmacy'
]

export function ShoppingListCreationForm({
  householdId,
  currentUserId,
  householdMembers = [],
  onSuccess,
  onCancel,
  initialData,
  className
}: ShoppingListCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || [])
  const [customTag, setCustomTag] = useState('')
  const [showTemplateOptions, setShowTemplateOptions] = useState(false)

  const form = useForm<CreateShoppingListData>({
    resolver: zodResolver(createShoppingListSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      householdId,
      createdBy: currentUserId,
      assignedTo: [currentUserId],
      dueDate: undefined,
      estimatedBudget: undefined,
      store: '',
      isTemplate: false,
      templateName: '',
      tags: [],
      ...initialData
    }
  })

  const onSubmit = async (data: CreateShoppingListData) => {
    try {
      setIsSubmitting(true)

      // Include selected tags
      const formData = {
        ...data,
        tags: selectedTags,
        dueDate: data.dueDate ? new Date(data.dueDate as unknown as string) : undefined
      }

      console.log('Creating shopping list:', formData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success(`Shopping list "${data.name}" created successfully`)
      onSuccess?.(formData)
      
      // Reset form
      form.reset()
      setSelectedTags([])
      
    } catch (error) {
      toast.error('Failed to create shopping list')
      console.error('Error creating shopping list:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleCustomTagAdd = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()])
      setCustomTag('')
    }
  }

  const handleAssigneeToggle = (memberId: string, checked: boolean) => {
    const currentAssignees = form.getValues('assignedTo')
    if (checked) {
      form.setValue('assignedTo', [...currentAssignees, memberId])
    } else {
      form.setValue('assignedTo', currentAssignees.filter(id => id !== memberId))
    }
  }

  const getStatusBadge = (status: ListStatus) => {
    const statusConfig = LIST_STATUS[status]
    return (
      <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1`}>
        <span>{statusConfig.icon}</span>
        {statusConfig.label}
      </Badge>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-600" />
          Create Shopping List
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* List Name and Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">List Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Weekly Groceries, Party Supplies"
                {...form.register('name')}
                className={form.formState.errors.name ? 'border-red-500' : ''}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a brief description of this shopping list..."
                rows={2}
                {...form.register('description')}
                className="resize-none"
              />
            </div>
          </div>

          {/* Status and Store */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value: ListStatus) => form.setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <span>Draft</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <span>📋</span>
                      <span>Active</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="shopping">
                    <div className="flex items-center gap-2">
                      <span>🛒</span>
                      <span>Shopping</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {getStatusBadge(form.watch('status'))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="store">Store (Optional)</Label>
              <Select
                value={form.watch('store') || ''}
                onValueChange={(value) => form.setValue('store', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_STORES.map((store) => (
                    <SelectItem key={store} value={store}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{store}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date (Optional)
              </Label>
              <Input
                id="dueDate"
                type="date"
                {...form.register('dueDate')}
                min={formatISO(new Date(), { representation: 'date' })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedBudget" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Estimated Budget (Optional)
              </Label>
              <Input
                id="estimatedBudget"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...form.register('estimatedBudget', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assign To Household Members
            </Label>
            <div className="space-y-2">
              {householdMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`assignee-${member.id}`}
                    checked={form.watch('assignedTo').includes(member.id)}
                    onCheckedChange={(checked) => handleAssigneeToggle(member.id, checked as boolean)}
                  />
                  <Label htmlFor={`assignee-${member.id}`} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    {member.name}
                    {member.id === currentUserId && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags (Optional)
            </Label>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-red-50"
                    onClick={() => handleTagRemove(tag)}
                  >
                    {tag}
                    <span className="ml-1 text-xs">×</span>
                  </Badge>
                ))}
              </div>
            )}

            {/* Common Tags */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Common tags:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`cursor-pointer hover:bg-emerald-50 ${
                      selectedTags.includes(tag) ? 'bg-emerald-50 border-emerald-200' : ''
                    }`}
                    onClick={() => handleTagAdd(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomTagAdd())}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCustomTagAdd}
                disabled={!customTag.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Template Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTemplate"
                checked={form.watch('isTemplate')}
                onCheckedChange={(checked) => {
                  form.setValue('isTemplate', checked as boolean)
                  setShowTemplateOptions(checked as boolean)
                }}
              />
              <Label htmlFor="isTemplate" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Save as template for future use
              </Label>
            </div>

            {showTemplateOptions && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Weekly Grocery Template"
                  {...form.register('templateName')}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating List...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Create Shopping List
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