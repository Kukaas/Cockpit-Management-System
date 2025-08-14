import React from 'react'
import { cn } from '@/lib/utils'

const NativeSelect = React.forwardRef(({
  className,
  children,
  placeholder = "Select an option",
  ...props
}, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
})

NativeSelect.displayName = 'NativeSelect'

export default NativeSelect
