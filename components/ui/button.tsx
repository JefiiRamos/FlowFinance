import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-primary/30 focus-visible:ring-0 aria-invalid:border-destructive hover:-translate-y-0.5 active:translate-y-0",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm shadow-black/20 hover:bg-[#7E8BFF]',
        destructive:
          'bg-destructive text-white shadow-sm shadow-black/20 hover:bg-destructive/90',
        outline:
          'border border-white/5 bg-white/5 text-foreground shadow-sm shadow-black/20 hover:bg-white/[0.08] hover:text-foreground',
        secondary:
          'bg-white/5 text-secondary-foreground shadow-sm shadow-black/20 hover:bg-white/[0.08]',
        ghost:
          'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 rounded-xl gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-12 rounded-xl px-6 has-[>svg]:px-4',
        icon: 'size-11',
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
