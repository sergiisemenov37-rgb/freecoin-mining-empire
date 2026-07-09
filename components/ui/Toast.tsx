import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  const icons = {
    success: <CheckCircle className="text-green-400" size={20} />,
    error: <XCircle className="text-red-400" size={20} />,
    warning: <AlertCircle className="text-yellow-400" size={20} />,
    info: <Info className="text-cyan-400" size={20} />,
  };

  const colors = {
    success: 'border-green-500/50',
    error: 'border-red-500/50',
    warning: 'border-yellow-500/50',
    info: 'border-cyan-500/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 border ${colors[type]} rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 min-w-[300px]`}
    >
      {icons[type]}
      <span className="text-white text-sm flex-1">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white">
        <X size={16} />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; type: ToastType; message: string }>;
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto mt-4">
            <Toast type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
