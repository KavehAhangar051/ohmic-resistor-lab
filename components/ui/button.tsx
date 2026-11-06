'use client';

import * as React from 'react';
import { ark } from '@ark-ui/react/factory';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.96]',
  {
    variants: {
      variant: {
        solid:
          'bg-zinc-100 text-zinc-950 font-semibold shadow-xs hover:bg-white active:bg-zinc-200 border border-transparent',
        outline:
          'border border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 active:bg-zinc-800/80 shadow-2xs',
        ghost:
          'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:bg-zinc-800/80',
        subtle:
          'bg-zinc-900 border border-zinc-800/60 text-zinc-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 active:bg-zinc-800/80',
        danger:
          'border border-red-950/80 bg-red-950/30 text-red-400 hover:bg-red-950/60 hover:text-red-200 hover:border-red-900 active:bg-red-900/40',
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-md',
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-9 px-3.5 text-sm rounded-lg',
        lg: 'h-10 px-4 text-sm rounded-lg font-semibold',
        xl: 'h-11 px-5 text-base rounded-lg font-semibold',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof ark.button>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  static?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, static: isStatic, ...props }, ref) => {
    return (
      <ark.button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), isStatic && 'active:scale-100', className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
