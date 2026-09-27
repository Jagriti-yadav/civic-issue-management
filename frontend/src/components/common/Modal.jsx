import { useEffect } from 'react';
import { X } from 'lucide-react';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
  closeOnOverlay = true,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape' && closeOnOverlay) onClose?.();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnOverlay]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={() => closeOnOverlay && onClose?.()}
      />
      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-xl shadow-elevated animate-scale-in max-h-[90vh] flex flex-col`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-civic-border">
            <h2 id="modal-title" className="text-lg font-semibold text-civic-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-civic-text-secondary hover:bg-civic-hover hover:text-civic-text-primary transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="px-6 py-5 overflow-y-auto scrollbar-thin flex-1">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-civic-border flex items-center justify-end gap-3 bg-civic-bg/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
