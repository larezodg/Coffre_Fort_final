import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const Modal = ({ open, onClose, title, children, size = 'md' }: ModalProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
            return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
        }
    }, [open, onClose]);

    if (!open) return null;

    const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
            <div ref={ref} className={`relative bg-card rounded-xl border border-border  shadow-xl ${widths[size]} w-full max-h-[92vh] flex flex-col rounded-b-none sm:rounded-xl animate-fade-in`}>
                <div className="flex items-center  justify-between px-4 sm:px-6 py-4 border-b border-border shrink-0">
                    <h2 id="modal-title" className="text-lg font-display font-semibold">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors" aria-label="Fermer">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-4 sm:px-6 py-4 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
