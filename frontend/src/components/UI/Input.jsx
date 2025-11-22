import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  description,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3 py-2
          bg-white dark:bg-slate-800
          border rounded-lg
          text-slate-900 dark:text-white
          border-slate-300 dark:border-slate-600
          focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
          focus:outline-none
          transition duration-150 ease-in-out
          disabled:opacity-50
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {description && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
