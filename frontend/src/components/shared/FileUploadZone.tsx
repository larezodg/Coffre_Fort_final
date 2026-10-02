import { Upload, FileText, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface FileUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // MB
}

const FileUploadZone = ({ onFilesSelected, accept = '.pdf,.jpg,.jpeg,.png,.dicom', multiple = false, maxSize = 20 }: FileUploadZoneProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);

    const handleFiles = useCallback((newFiles: FileList | null) => {
        if (!newFiles) return;
        const allSelected = Array.from(newFiles);
        if (!multiple && allSelected.length > 1) toast.error('Un seul fichier peut être sélectionné');
        const selected = multiple ? allSelected : allSelected.slice(0, 1);
        const acceptedExtensions = accept.split(',').map(value => value.trim().replace(/^\./, '').toLowerCase()).filter(Boolean);
        const valid = selected.filter(file => {
            const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
            if (!acceptedExtensions.includes(extension)) {
                toast.error(`${file.name} : format non autorisé`);
                return false;
            }
            if (file.size > maxSize * 1024 * 1024) {
                toast.error(`${file.name} dépasse la limite de ${maxSize} Mo`);
                return false;
            }
            if (file.size === 0) {
                toast.error(`${file.name} est vide`);
                return false;
            }
            return true;
        });
        if (valid.length !== selected.length) {
            setFiles(valid);
            onFilesSelected(valid);
            return;
        }
        setFiles(valid);
        onFilesSelected(valid);
    }, [accept, maxSize, multiple, onFilesSelected]);

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        setFiles(updated);
        onFilesSelected(updated);
    };

    return (
        <div>
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; document.getElementById('file-upload-input')?.click(); }}
                role="button"
                tabIndex={0}
                aria-label="Zone de téléversement de fichiers"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('file-upload-input')?.click(); }}
            >
                <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">Glissez-déposez vos fichiers ici</p>
                <p className="text-xs text-muted-foreground mt-1">ou cliquez pour sélectionner • Max {maxSize}Mo</p>
                <input
                    id="file-upload-input"
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => { handleFiles(e.target.files); e.currentTarget.value = ''; }}
                    className="hidden"
                    aria-hidden="true"
                />
            </div>
            {files.length > 0 && (
                <ul className="mt-3 space-y-2" aria-label="Fichiers sélectionnés">
                    {files.map((file, i) => (
                        <li key={i} className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
                            <FileText size={16} className="text-primary" />
                            <span className="text-sm flex-1 truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} Mo</span>
                            <button type="button" onClick={() => removeFile(i)} className="p-1 hover:bg-background rounded" aria-label={`Supprimer ${file.name}`}>
                                <X size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FileUploadZone;
