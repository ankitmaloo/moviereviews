import * as React from 'react'

import { cn } from '@/lib/utils'

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('badge', className)} {...props} />
))
Badge.displayName = 'Badge'

export { Badge }
