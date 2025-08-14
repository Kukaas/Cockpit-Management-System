import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

const CustomAlertDialog = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  actions,
  cancelText = "Cancel",
  onCancel,
  maxHeight = "max-h-96",
  className,
  contentClassName,
  ...props
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} {...props}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}

      <AlertDialogContent
        className={cn(
          "flex flex-col p-0 overflow-hidden",
          maxHeight,
          className
        )}
        {...props}
      >
        {/* Fixed Header */}
        <AlertDialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>

        {/* Scrollable Content */}
        <div className={cn(
          "flex-1 overflow-y-auto p-6 pt-4",
          contentClassName
        )}>
          {children}
        </div>

        {/* Fixed Footer */}
        <AlertDialogFooter className="flex-shrink-0 p-6 pt-4 border-t bg-muted/30">
          {actions ? (
            actions
          ) : (
            <>
              <AlertDialogCancel onClick={onCancel}>
                {cancelText}
              </AlertDialogCancel>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CustomAlertDialog
