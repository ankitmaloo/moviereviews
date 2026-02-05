import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

const progressBucketClasses = {
  0: 'progress-value-0',
  10: 'progress-value-10',
  20: 'progress-value-20',
  30: 'progress-value-30',
  40: 'progress-value-40',
  50: 'progress-value-50',
  60: 'progress-value-60',
  70: 'progress-value-70',
  80: 'progress-value-80',
  90: 'progress-value-90',
  100: 'progress-value-100'
} as const

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => {
  const normalizedValue = value ?? 0
  const bucket = Math.min(100, Math.max(0, Math.round(normalizedValue / 10) * 10)) as keyof typeof progressBucketClasses

  return (
    <ProgressPrimitive.Root ref={ref} className={cn('progress-root', className)} {...props}>
      <ProgressPrimitive.Indicator className={cn('progress-indicator', progressBucketClasses[bucket])} />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
