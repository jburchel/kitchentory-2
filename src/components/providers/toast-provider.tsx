"use client"

import * as React from "react"
import { Toaster } from "sonner"
import { useTheme } from "next-themes"

export function ToastProvider() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  )
}

// Toast utilities
export const toast = {
  success: (message: string, description?: string) => {
    const { toast } = require("sonner")
    return toast.success(message, { description })
  },
  error: (message: string, description?: string) => {
    const { toast } = require("sonner")
    return toast.error(message, { description })
  },
  info: (message: string, description?: string) => {
    const { toast } = require("sonner")
    return toast.info(message, { description })
  },
  warning: (message: string, description?: string) => {
    const { toast } = require("sonner")
    return toast.warning(message, { description })
  },
  loading: (message: string) => {
    const { toast } = require("sonner")
    return toast.loading(message)
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    const { toast } = require("sonner")
    return toast.promise(promise, { loading, success, error })
  },
}

// Kitchen-specific toast messages
export const kitchenToasts = {
  itemAdded: (itemName: string) =>
    toast.success("Item added!", `${itemName} has been added to your inventory.`),
  
  itemUpdated: (itemName: string) =>
    toast.success("Item updated!", `${itemName} has been successfully updated.`),
  
  itemDeleted: (itemName: string) =>
    toast.success("Item removed", `${itemName} has been removed from your inventory.`),
  
  itemExpiring: (itemName: string, days: number) =>
    toast.warning(
      "Item expiring soon!",
      `${itemName} expires in ${days} day${days === 1 ? "" : "s"}.`
    ),
  
  itemOutOfStock: (itemName: string) =>
    toast.info("Out of stock", `${itemName} is running low. Consider restocking.`),
  
  inventorySynced: () =>
    toast.success("Inventory synced", "Your inventory has been updated successfully."),
  
  syncError: () =>
    toast.error("Sync failed", "Failed to sync your inventory. Please try again."),
  
  saveError: () =>
    toast.error("Save failed", "Your changes could not be saved. Please check your connection."),
  
  loadingInventory: () =>
    toast.loading("Loading inventory..."),
  
  importSuccess: (count: number) =>
    toast.success(
      "Import successful!",
      `${count} item${count === 1 ? "" : "s"} imported to your inventory.`
    ),
  
  exportSuccess: () =>
    toast.success("Export complete", "Your inventory has been exported successfully."),
}
