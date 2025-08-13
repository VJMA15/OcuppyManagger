import React from 'react';
import { cn } from '@/utils/cn';

const Textarea = React.forwardRef(({ 
  className, 
  label,
  icon: Icon,
  error,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {Icon && <Icon className="inline w-4 h-4 mr-2" />}
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200 resize-vertical min-h-[100px]',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };