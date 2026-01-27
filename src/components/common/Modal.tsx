import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - higher z-index to cover header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          {/* Modal container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pt-20 pb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button - sticky at top */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-secondary-100 hover:bg-secondary-200 text-secondary-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {title && (
                <div className="px-6 py-4 border-b border-secondary-200 flex-shrink-0">
                  <h2 className="text-xl font-bold text-secondary-800 pr-8">{title}</h2>
                </div>
              )}
              {/* Scrollable content area */}
              <div className="p-6 overflow-y-auto flex-1">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
