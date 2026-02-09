// app/components/ui/textarea.tsx
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-xl border-2 border-gray-700 bg-gray-900 px-4 py-3 text-white text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2 focus-visible:border-green-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-gray-600 focus:shadow-lg focus:shadow-green-500/20 resize-y',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};