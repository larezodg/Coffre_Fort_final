import { Upload, FileText, X } from 'lucide-react';
import { useCallback, useState } from 'react';

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
        const valid = Array.from(newFiles).filter(f => f.size <= maxSize * 1024 * 1024);
        setFiles(valid);
        onFilesSelected(valid);
    }, [maxSize, onFilesSelected]);

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
                onClick={() => document.getElementById('file-upload-input')?.click()}
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
                    onChange={(e) => handleFiles(e.target.files)}
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
                            <button onClick={() => removeFile(i)} className="p-1 hover:bg-background rounded" aria-label={`Supprimer ${file.name}`}>
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
