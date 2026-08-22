import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]',
        destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-xs hover:brightness-110 active:brightness-90',
        outline: 'border border-[var(--border-default)] bg-[var(--card)] shadow-2xs hover:bg-[var(--surface-tertiary)] text-[var(--text-secondary)]',
        secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:brightness-95',
        ghost: 'hover:bg-[var(--surface-tertiary)] text-[var(--text-secondary)]',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-10 rounded-xl px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
