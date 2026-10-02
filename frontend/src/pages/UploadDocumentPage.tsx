import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FileUploadZone from '@/components/shared/FileUploadZone';
import { CheckCircle } from 'lucide-react';
import { patientsAPI, documentsAPI } from '@/services/api';
import { extractListPayload } from '@/lib/apiList';
import { toast } from 'sonner';

interface PatientOption {
  id: string;
  name: string;
}

function toPatientOption(raw: Record<string, unknown>): PatientOption {
  return {
    id: String(raw.id),
    name: String(raw.name ?? raw.fullName ?? 'Patient'),
  };
}

const UploadDocumentPage = () => {
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState('');
  const [docType, setDocType] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data } = await patientsAPI.getAll();
      return extractListPayload<Record<string, unknown>>(data).map(toPatientOption);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const file = files[0];
      if (!file) throw new Error('Fichier requis');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);
      formData.append('type', docType);
      formData.append('description', description);
      await documentsAPI.upload(formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      setSubmitted(true);
      toast.success('Document téléversé');
    },
    onError: () => {
      toast.error('Échec du téléversement (POST /documents/upload).');
    },
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-success" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Document téléversé avec succès</h2>
        <p className="text-sm text-muted-foreground mb-6">Le document a été enregistré côté serveur.</p>
        <button
          type="button"
          className="medical-btn-primary"
          onClick={() => {
            setSubmitted(false);
            setPatientId('');
            setDocType('');
            setDescription('');
            setFiles([]);
          }}
        >
          Téléverser un autre document
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Téléverser un document</h1>
        <p className="text-sm text-muted-foreground mt-1">POST /documents/upload (multipart : file, patientId, type, description)</p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          uploadMutation.mutate();
        }}
      >
        <div className="medical-card space-y-4">
          <div>
            <label htmlFor="patient-select" className="block text-sm font-medium mb-1.5">Patient</label>
            <select
              id="patient-select"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="medical-input"
              required
              aria-required="true"
              disabled={patientsLoading}
            >
              <option value="">{patientsLoading ? 'Chargement…' : 'Sélectionner un patient'}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc-type" className="block text-sm font-medium mb-1.5">Type de document</label>
            <select id="doc-type" value={docType} onChange={(e) => setDocType(e.target.value)} className="medical-input" required aria-required="true">
              <option value="">Sélectionner un type</option>
              <option value="ordonnance">Ordonnance</option>
              <option value="analyse">Résultat d&apos;analyse</option>
              <option value="radiologie">Radiologie</option>
              <option value="compte-rendu">Compte-rendu</option>
              <option value="certificat">Certificat médical</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="doc-desc" className="block text-sm font-medium mb-1.5">Description</label>
            <textarea id="doc-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="medical-input min-h-[80px] resize-y" placeholder="Description du document..." />
          </div>
        </div>

        <div className="medical-card">
          <h3 className="text-sm font-medium mb-3">Fichier</h3>
          <FileUploadZone onFilesSelected={setFiles} accept=".pdf,.jpg,.jpeg,.png,.dicom" />
        </div>

        <button type="submit" disabled={uploadMutation.isPending || !files.length || !patientId || !docType} className="medical-btn-primary w-full">
          {uploadMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              Téléversement…
            </div>
          ) : 'Téléverser'}
        </button>
      </form>
    </div>
  );
};

export default UploadDocumentPage;
