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
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
            <div ref={ref} className={`relative bg-card rounded-xl border border-border  shadow-xl ${widths[size]} w-full mx-4 animate-fade-in`}>
                <div className="flex items-center  justify-between px-6 py-4 border-b border-border">
                    <h2 id="modal-title" className="text-lg font-display font-semibold">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors" aria-label="Fermer">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6  py-4">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
