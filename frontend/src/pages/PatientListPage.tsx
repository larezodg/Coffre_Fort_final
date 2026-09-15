import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import Modal from '@/components/shared/Modal';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { patientsAPI } from '@/services/api';
import { extractListPayload } from '@/lib/apiList';
import { formatDisplayDate } from '@/lib/formatDate';
import { toast } from 'sonner';

interface PatientRow {
  id: string;
  name: string;
  dateOfBirth: string;
  code: string;
  documents: number | string;
  lastVisit: string;
  status: string;
}

function toPatientRow(raw: Record<string, unknown>): PatientRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    dateOfBirth: formatDisplayDate(raw.dateOfBirth ?? raw.birthDate),
    code: String(raw.code ?? raw.accessCode ?? '—'),
    documents: raw.documents != null || raw.documentCount != null
      ? Number(raw.documents ?? raw.documentCount)
      : '—',
    lastVisit: formatDisplayDate(raw.lastVisit ?? raw.lastVisitAt),
    status: String(raw.status ?? 'active').toLowerCase(),
  };
}

const PatientListPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', dateOfBirth: '', email: '', phone: '' });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data } = await patientsAPI.getAll();
      return extractListPayload<Record<string, unknown>>(data).map(toPatientRow);
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      patientsAPI.create({
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient créé');
      setShowModal(false);
      setFormData({ name: '', dateOfBirth: '', email: '', phone: '' });
    },
    onError: () => toast.error('Échec (POST /patients)'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientsAPI.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient supprimé');
    },
    onError: () => toast.error('Suppression impossible'),
  });

  const columns = [
    { key: 'name', label: 'Nom du patient', render: (p: PatientRow) => <span className="font-medium">{p.name}</span> },
    { key: 'dateOfBirth', label: 'Date de naissance' },
    { key: 'code', label: 'Code d\'accès', render: (p: PatientRow) => <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{p.code}</code> },
    { key: 'documents', label: 'Documents' },
    { key: 'lastVisit', label: 'Dernière visite' },
    { key: 'status', label: 'Statut', render: (p: PatientRow) => (
      <StatusBadge status={p.status === 'active' ? 'active' : 'inactive'} label={p.status === 'active' ? 'Actif' : 'Inactif'} />
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dossiers Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">{patients.length} Dossiers Patiens </p>
        </div>
        <button type="button" className="medical-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nouveau patient
        </button>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        searchable
        searchPlaceholder="Rechercher un patient..."
        loading={isLoading}
        actions={(patient) => (
          <div className="flex items-center gap-1">
            <button type="button" className="p-1.5 rounded-md hover:bg-muted" aria-label={`Voir ${patient.name}`}><Eye size={15} className="text-muted-foreground" /></button>
            <button type="button" className="p-1.5 rounded-md hover:bg-muted" aria-label={`Modifier ${patient.name}`}><Edit size={15} className="text-muted-foreground" /></button>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-muted"
              aria-label={`Supprimer ${patient.name}`}
              onClick={() => {
                if (window.confirm(`Supprimer ${patient.name} ?`)) deleteMutation.mutate(patient.id);
              }}
            >
              <Trash2 size={15} className="text-destructive/60" />
            </button>
          </div>
        )}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouveau patient">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <div>
            <label htmlFor="patient-name" className="block text-sm font-medium mb-1.5">Nom complet</label>
            <input id="patient-name" type="text" className="medical-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required aria-required="true" />
          </div>
          <div>
            <label htmlFor="patient-dob" className="block text-sm font-medium mb-1.5">Date de naissance</label>
            <input id="patient-dob" type="date" className="medical-input" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required aria-required="true" />
          </div>
          <div>
            <label htmlFor="patient-email" className="block text-sm font-medium mb-1.5">Email</label>
            <input id="patient-email" type="email" className="medical-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label htmlFor="patient-phone" className="block text-sm font-medium mb-1.5">Téléphone</label>
            <input id="patient-phone" type="tel" className="medical-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="medical-btn-secondary flex-1" onClick={() => setShowModal(false)}>Annuler</button>
            <button type="submit" className="medical-btn-primary flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientListPage;
