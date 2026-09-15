import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Download, Eye, Lock, FileText } from 'lucide-react';
import { documentsAPI } from '@/services/api';
import { extractListPayload } from '@/lib/apiList';
import { formatDisplayDate } from '@/lib/formatDate';
import { downloadBlob, filenameFromContentDisposition } from '@/lib/downloadBlob';
import { toast } from 'sonner';

interface PatientDocRow {
  id: string;
  name: string;
  doctor: string;
  type: string;
  date: string;
  size: string;
}

function toPatientDocRow(raw: Record<string, unknown>): PatientDocRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? raw.title ?? raw.fileName ?? 'Document'),
    doctor: String(raw.doctorName ?? raw.uploadedBy ?? raw.author ?? '—'),
    type: String(raw.type ?? raw.documentType ?? ''),
    date: formatDisplayDate(raw.date ?? raw.createdAt),
    size: String(raw.size ?? raw.fileSize ?? '—'),
  };
}

const PatientDocumentsPage = () => {
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const { data: docs = [], isLoading, refetch } = useQuery({
    queryKey: ['documents', 'patient'],
    queryFn: async () => {
      const { data } = await documentsAPI.getAll();
      return extractListPayload<Record<string, unknown>>(data).map(toPatientDocRow);
    },
  });

  const columns = [
    { key: 'name', label: 'Document', render: (d: PatientDocRow) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <FileText size={14} className="text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">{d.name}</p>
          <p className="text-xs text-muted-foreground">{d.doctor}</p>
        </div>
      </div>
    ) },
    { key: 'type', label: 'Type', render: (d: PatientDocRow) => <StatusBadge status="info" label={d.type || '—'} /> },
    { key: 'date', label: 'Date' },
    { key: 'size', label: 'Taille' },
    { key: 'status', label: 'Sécurité', render: () => (
      <div className="flex items-center gap-1.5 text-accent text-xs font-medium">
        <Lock size={12} /> Chiffré
      </div>
    ) },
  ];

  const preview = async (doc: PatientDocRow) => {
    setPreviewDoc(doc.id);
    try {
      const res = await documentsAPI.preview(doc.id);
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error('Aperçu indisponible');
    } finally {
      setPreviewDoc(null);
    }
  };

  const download = async (doc: PatientDocRow) => {
    try {
      const res = await documentsAPI.download(doc.id);
      const fn = filenameFromContentDisposition(res.headers['content-disposition'] as string | undefined, `${doc.name}.pdf`);
      downloadBlob(res.data, fn);
    } catch {
      toast.error('Téléchargement impossible');
    }
  };

  return (
    <div className="space-y-6">
      <div className="medical-gradient-subtle rounded-xl p-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Mes documents médicaux</h1>
          <p className="text-sm text-muted-foreground mt-1">GET /documents (filtré côté serveur par le patient connecté)</p>
        </div>
        <button type="button" className="medical-btn-secondary text-sm" onClick={() => void refetch()}>
          Actualiser
        </button>
      </div>

      <DataTable
        columns={columns}
        data={docs}
        searchable
        searchPlaceholder="Rechercher dans mes documents..."
        loading={isLoading}
        actions={(doc) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-muted"
              disabled={previewDoc === doc.id}
              onClick={() => void preview(doc)}
              aria-label={`Aperçu ${doc.name}`}
            >
              <Eye size={15} className="text-muted-foreground" />
            </button>
            <button type="button" className="p-1.5 rounded-md hover:bg-muted" onClick={() => void download(doc)} aria-label={`Télécharger ${doc.name}`}>
              <Download size={15} className="text-primary" />
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default PatientDocumentsPage;
