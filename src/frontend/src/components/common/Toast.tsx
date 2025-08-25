import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUiStore } from '@store/ui';
import { cn } from '@utils/index';

const Toast: React.FC = () => {
  const { toast, hideToast } = useUiStore();

  if (!toast) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[toast.type];

  const colorClasses = {
    success: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/50 dark:border-success-700 dark:text-success-200',
    error: 'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/50 dark:border-error-700 dark:text-error-200',
    warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/50 dark:border-warning-700 dark:text-warning-200',
    info: 'bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-900/50 dark:border-primary-700 dark:text-primary-200',
  };

  const iconColorClasses = {
    success: 'text-success-500',
    error: 'text-error-500',
    warning: 'text-warning-500',
    info: 'text-primary-500',
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'flex items-start p-4 rounded-xl border shadow-medium backdrop-blur-sm',
            colorClasses[toast.type]
          )}
        >
          <Icon className={cn('w-5 h-5 mr-3 mt-0.5 flex-shrink-0', iconColorClasses[toast.type])} />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm">{toast.title}</h3>
            {toast.message && (
              <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            )}
            
            {toast.actions && toast.actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {toast.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                      action.variant === 'primary'
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => hideToast(toast.id)}
            className="ml-3 flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Toast;
