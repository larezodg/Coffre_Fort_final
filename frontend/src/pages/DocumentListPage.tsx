import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Download, Eye, Lock } from 'lucide-react';
import { documentsAPI } from '@/services/api';
import { extractListPayload } from '@/lib/apiList';
import { formatDisplayDate } from '@/lib/formatDate';
import { downloadBlob, filenameFromContentDisposition } from '@/lib/downloadBlob';
import { toast } from 'sonner';

export interface DocRow {
  id: string;
  name: string;
  patient: string;
  type: string;
  date: string;
  size: string;
  encrypted: boolean;
}

function toDocRow(raw: Record<string, unknown>): DocRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? raw.title ?? raw.fileName ?? 'Document'),
    patient: String(raw.patientName ?? raw.patient ?? ''),
    type: String(raw.type ?? raw.documentType ?? ''),
    date: formatDisplayDate(raw.date ?? raw.createdAt),
    size: String(raw.size ?? raw.fileSize ?? '—'),
    encrypted: Boolean(raw.encrypted ?? true),
  };
}

const DocumentListPage = () => {
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data } = await documentsAPI.getAll();
      return extractListPayload<Record<string, unknown>>(data).map(toDocRow);
    },
  });

  const columns = [
    { key: 'name', label: 'Document', render: (d: DocRow) => (
      <div className="flex items-center gap-2">
        <Lock size={14} className="text-accent flex-shrink-0" />
        <span className="font-medium">{d.name}</span>
      </div>
    ) },
    { key: 'patient', label: 'Patient' },
    { key: 'type', label: 'Type', render: (d: DocRow) => <StatusBadge status="info" label={d.type || '—'} /> },
    { key: 'date', label: 'Date' },
    { key: 'size', label: 'Taille' },
    { key: 'encrypted', label: 'Statut', render: (d: DocRow) => (
      <StatusBadge status="encrypted" label={d.encrypted ? 'Chiffré' : 'Non chiffré'} />
    ) },
  ];

  const preview = async (doc: DocRow) => {
    try {
      const res = await documentsAPI.preview(doc.id);
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error('Aperçu indisponible');
    }
  };

  const download = async (doc: DocRow) => {
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Documents médicaux</h1>
          <p className="text-sm text-muted-foreground mt-1">GET /documents</p>
        </div>
        <button type="button" className="medical-btn-secondary text-sm" onClick={() => void refetch()}>
          Actualiser
        </button>
      </div>
      <DataTable
        columns={columns}
        data={documents}
        searchable
        searchPlaceholder="Rechercher un document..."
        loading={isLoading}
        actions={(doc) => (
          <div className="flex items-center gap-1">
            <button type="button" className="p-1.5 rounded-md hover:bg-muted" aria-label={`Aperçu ${doc.name}`} onClick={() => void preview(doc)}>
              <Eye size={15} className="text-muted-foreground" />
            </button>
            <button type="button" className="p-1.5 rounded-md hover:bg-muted" aria-label={`Télécharger ${doc.name}`} onClick={() => void download(doc)}>
              <Download size={15} className="text-primary" />
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default DocumentListPage;
