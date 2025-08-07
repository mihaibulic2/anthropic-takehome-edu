import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, style, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md bg-white px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      style={{
        border: '0.5px solid rgba(20, 20, 19, 0.5)',
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.border = '0.5px solid rgba(20, 20, 19, 0.5)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.border = '0.5px solid rgba(20, 20, 19, 0.2)';
        props.onBlur?.(e);
      }}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
