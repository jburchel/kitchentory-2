'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  ShoppingCart, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  MapPin,
  Users,
  Copy,
  Archive,
  Search,
  Filter,
  Grid3X3,
  List,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package
} from 'lucide-react'
import { formatDistanceToNow, format, isBefore, addDays } from 'date-fns'
import {
  ShoppingList,
  LIST_STATUS,
  ListStatus,
  ListFilter,
  ListSort
} from '@/schemas/shoppingListSchemas'
import { toast } from 'sonner'

export interface ShoppingListGridProps {
  lists: ShoppingList[]
  onEditList?: (list: ShoppingList) => void
  onDeleteList?: (listId: string) => void
  onDuplicateList?: (listId: string) => void
  onViewList?: (listId: string) => void
  onArchiveList?: (listId: string) => void
  loading?: boolean
  className?: string
}

type ViewMode = 'grid' | 'list'

const getStatusBadge = (status: ListStatus) => {
  const statusConfig = LIST_STATUS[status]
  return (
    <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1`}>
      <span>{statusConfig.icon}</span>
      {statusConfig.label}
    </Badge>
  )
}

const getDueDateBadge = (dueDate?: Date) => {
  if (!dueDate) return null
  
  const now = new Date()
  const isOverdue = isBefore(dueDate, now)
  const isDueSoon = isBefore(dueDate, addDays(now, 3))
  
  if (isOverdue) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Overdue
      </Badge>
    )
  }
  
  if (isDueSoon) {
    return (
      <Badge className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
        <Clock className="w-3 h-3" />
        Due {formatDistanceToNow(dueDate, { addSuffix: true })}
      </Badge>
    )
  }
  
  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Calendar className="w-3 h-3" />
      Due {format(dueDate, 'MMM d')}
    </Badge>
  )
}

const getListProgress = (list: ShoppingList) => {
  const totalItems = list.items.length
  if (totalItems === 0) return { percentage: 0, completed: 0, total: 0 }
  
  const completed = list.items.filter(item => item.isCompleted).length
  const percentage = (completed / totalItems) * 100
  
  return { percentage, completed, total: totalItems }
}

export function ShoppingListGrid({
  lists,
  onEditList,
  onDeleteList,
  onDuplicateList,
  onViewList,
  onArchiveList,
  loading = false,
  className
}: ShoppingListGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<ListFilter['status']>('all')
  const [sortBy, setSortBy] = useState<ListSort['field']>('createdAt')
  const [sortDirection, setSortDirection] = useState<ListSort['direction']>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Filter lists based on search and filter criteria
  const filteredLists = lists.filter(list => {
    // Search filter
    const matchesSearch = list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.store?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (!matchesSearch) return false

    // Status filter
    if (filterBy !== 'all' && list.status !== filterBy) return false
    
    return true
  })

  // Sort lists
  const sortedLists = [...filteredLists].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0
        else if (!a.dueDate) comparison = 1
        else if (!b.dueDate) comparison = -1
        else comparison = a.dueDate.getTime() - b.dueDate.getTime()
        break
      case 'itemCount':
        comparison = a.items.length - b.items.length
        break
      case 'estimatedBudget':
        comparison = (a.estimatedBudget || 0) - (b.estimatedBudget || 0)
        break
      case 'createdAt':
      default:
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
        break
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handleDeleteList = async (listId: string, listName: string) => {
    if (window.confirm(`Are you sure you want to delete "${listName}"?`)) {
      try {
        await onDeleteList?.(listId)
        toast.success(`"${listName}" has been deleted`)
      } catch (error) {
        toast.error('Failed to delete shopping list')
      }
    }
  }

  const handleDuplicateList = async (listId: string, listName: string) => {
    try {
      await onDuplicateList?.(listId)
      toast.success(`"${listName}" has been duplicated`)
    } catch (error) {
      toast.error('Failed to duplicate shopping list')
    }
  }

  const handleArchiveList = async (listId: string, listName: string) => {
    try {
      await onArchiveList?.(listId)
      toast.success(`"${listName}" has been archived`)
    } catch (error) {
      toast.error('Failed to archive shopping list')
    }
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search shopping lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterBy} onValueChange={(value: ListFilter['status']) => setFilterBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lists</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={`${sortBy}-${sortDirection}`} 
            onValueChange={(value) => {
              const [field, direction] = value.split('-') as [ListSort['field'], ListSort['direction']]
              setSortBy(field)
              setSortDirection(direction)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="dueDate-asc">Due Date</SelectItem>
              <SelectItem value="itemCount-desc">Most Items</SelectItem>
              <SelectItem value="estimatedBudget-desc">Highest Budget</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex rounded-md border border-input">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none border-l"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {sortedLists.length} of {lists.length} lists
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        {filterBy !== 'all' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterBy('all')}
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Lists Grid/List */}
      {sortedLists.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || filterBy !== 'all' ? 'No lists match your search' : 'No shopping lists yet'}
              </h3>
              <p className="text-sm">
                {searchQuery || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first shopping list to get started'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {sortedLists.map((list) => {
            const progress = getListProgress(list)
            const isOverdue = list.dueDate && isBefore(list.dueDate, new Date())

            return (
              <Card 
                key={list.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  isOverdue ? 'border-red-200 bg-red-50/30' : ''
                }`}
                onClick={() => onViewList?.(list.id!)}
              >
                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                  {/* List Icon/Avatar */}
                  <Avatar className={`${viewMode === 'list' ? 'w-12 h-12' : 'w-10 h-10 mb-3'}`}>
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {LIST_STATUS[list.status]?.icon || '📋'}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                    {/* List Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className={`${viewMode === 'list' ? 'flex items-center gap-3' : ''}`}>
                        <div>
                          <h3 className="font-medium text-sm leading-tight mb-1">
                            {list.name}
                          </h3>
                          {list.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {list.description}
                            </p>
                          )}
                        </div>
                        {viewMode === 'list' && (
                          <div className="flex items-center gap-2">
                            {getStatusBadge(list.status)}
                            {getDueDateBadge(list.dueDate)}
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditList?.(list) }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit List
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateList(list.id!, list.name) }}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {list.status === 'completed' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleArchiveList(list.id!, list.name) }}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id!, list.name) }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status and Due Date (Grid view only) */}
                    {viewMode === 'grid' && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getStatusBadge(list.status)}
                        {getDueDateBadge(list.dueDate)}
                      </div>
                    )}

                    {/* Progress Bar */}
                    {progress.total > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{progress.completed} of {progress.total} items</span>
                          <span>{Math.round(progress.percentage)}%</span>
                        </div>
                        <Progress value={progress.percentage} className="h-2" />
                      </div>
                    )}

                    {/* List Details */}
                    <div className={`space-y-2 text-xs text-muted-foreground ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                      {/* Item Count */}
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{list.items.length} items</span>
                      </div>

                      {/* Store */}
                      {list.store && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{list.store}</span>
                        </div>
                      )}

                      {/* Budget */}
                      {list.estimatedBudget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>${list.estimatedBudget.toFixed(2)}</span>
                          {list.actualTotal && (
                            <span className="text-green-600">
                              (spent: ${list.actualTotal.toFixed(2)})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Assignees */}
                      {list.assignedTo.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{list.assignedTo.length} assigned</span>
                        </div>
                      )}

                      {/* Created */}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Created {formatDistanceToNow(list.createdAt)} ago</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {list.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {list.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {list.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{list.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Template Badge */}
                    {list.isTemplate && (
                      <div className="mt-3">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          📋 Template
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}