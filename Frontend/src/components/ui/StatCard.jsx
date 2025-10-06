import { cn } from '../../utils/cn';

const StatCard = ({ title, value, icon: Icon, variant = 'default', className }) => {
  const variants = {
    default: 'bg-slate-50 dark:bg-slate-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    success: 'bg-green-50 dark:bg-green-900/20',
    error: 'bg-red-50 dark:bg-red-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20',
    gray: 'bg-gray-50 dark:bg-gray-900/20'
  };

  const iconColors = {
    default: 'text-slate-600',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    gray: 'text-gray-500'
  };

  const textColors = {
    default: 'text-slate-600 dark:text-slate-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    gray: 'text-gray-600 dark:text-gray-400'
  };

  const valueColors = {
    default: 'text-slate-900 dark:text-white',
    warning: 'text-yellow-700 dark:text-yellow-300',
    success: 'text-green-700 dark:text-green-300',
    error: 'text-red-700 dark:text-red-300',
    info: 'text-blue-700 dark:text-blue-300',
    gray: 'text-gray-700 dark:text-gray-300'
  };

  return (
    <div className={cn(variants[variant], 'rounded-xl p-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn('text-sm', textColors[variant])}>{title}</p>
          <p className={cn('text-2xl font-bold', valueColors[variant])}>{value}</p>
        </div>
        {Icon && <Icon className={cn('w-8 h-8', iconColors[variant])} />}
      </div>
    </div>
  );
};

export default StatCard;