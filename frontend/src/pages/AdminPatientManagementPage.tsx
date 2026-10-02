import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import { patientsAPI, usersAPI } from '@/services/api';
import { extractListPayload } from '@/lib/apiList';
import { formatDisplayDate } from '@/lib/formatDate';
import { toast } from 'sonner';

interface AdminPatientRow {
  id: string;
  name: string;
  dateOfBirth: string;
  code: string;
  status: string;
  doctor: string;
  documents: number | string;
}

function toAdminPatientRow(raw: Record<string, unknown>): AdminPatientRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    dateOfBirth: formatDisplayDate(raw.dateOfBirth ?? raw.birthDate),
    code: String(raw.code ?? raw.accessCode ?? '—'),
    status: String(raw.status ?? 'active').toLowerCase(),
    doctor: String(raw.doctorName ?? raw.doctor ?? raw.referringPhysician ?? '—'),
    documents: raw.documents != null || raw.documentCount != null
      ? Number(raw.documents ?? raw.documentCount)
      : '—',
  };
}

const AdminPatientManagementPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', dateOfBirth: '', doctorId: '' , userId: '' });
  

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data } = await patientsAPI.getAll();
      return extractListPayload<Record<string, unknown>>(data).map(toAdminPatientRow);
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['users', 'doctors'],
    queryFn: async () => {
      const { data } = await usersAPI.getAll();
      const list = extractListPayload<Record<string, unknown>>(data);
      return list
        .map((u) => ({
          id: String(u.id),
          name: String(u.name ?? u.fullName ?? u.username),
          role: String(u.role ?? '').toLowerCase().replace(/^role_/i, ''),
        }))
        .filter((u) => u.role === 'doctor');
    },
  });
  
  const { data: users = [] } = useQuery({
    queryKey: ['users','patient'],
    queryFn: async () => {
      const { data } = await usersAPI.getAll();
      const list = extractListPayload<Record<string, unknown>>(data);
      return list
        .map((u) => ({
          id: String(u.id),
          name: String(u.name ?? u.fullName ?? u.username),
          role: String(u.role ?? '').toLowerCase().replace(/^role_/i, ''),
  
        })).filter((u) => u.role === 'patient' );
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      patientsAPI.create({
        name: form.name,
        dateOfBirth: form.dateOfBirth,
        doctorId: form.doctorId,
        userId: form.userId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient créé');
      setShowModal(false);
      setForm({ name: '', dateOfBirth: '', doctorId: '',userId: '' });
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
    { key: 'name', label: 'Patient', render: (p: AdminPatientRow) => <span className="font-medium">{p.name}</span> },
    { key: 'dateOfBirth', label: 'Date de naissance' },
    { key: 'code', label: 'Code d\'accès', render: (p: AdminPatientRow) => <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{p.code}</code> },
    { key: 'doctor', label: 'Médecin référent' },
    { key: 'documents', label: 'Documents' },
    { key: 'status', label: 'Statut', render: (p: AdminPatientRow) => (
      <StatusBadge status={p.status === 'active' ? 'active' : 'inactive'} label={p.status === 'active' ? 'Actif' : 'Inactif'} />
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestion des patients</h1>
          <p className="text-sm text-muted-foreground mt-1">GET /patients — création avec doctorId (POST /patients)</p>
        </div>
        <button type="button" className="medical-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Ajouter un patient
        </button>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        searchable
        searchPlaceholder="Rechercher un patient..."
        loading={isLoading}
        actions={(p) => (
          <div className="flex items-center gap-1">
            <button type="button" className="p-1.5 rounded-md hover:bg-muted" aria-label={`Modifier ${p.name}`}><Edit size={15} className="text-muted-foreground" /></button>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-muted"
              aria-label={`Supprimer ${p.name}`}
              onClick={() => {
                if (window.confirm(`Supprimer ${p.name} ?`)) deleteMutation.mutate(p.id);
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
            <label htmlFor="ap-doctor" className="block text-sm font-medium mb-1.5">Utilisateurs referent</label>
            <select id="ap-doctor" className="medical-input" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required aria-required="true">
              <option value="">Sélectionner (GET /users)</option>
              {users.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ap-doctor" className="block text-sm font-medium mb-1.5">Médecin référent</label>
            <select id="ap-doctor" className="medical-input" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} required aria-required="true">
              <option value="">Sélectionner (GET /users, rôle doctor)</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ap-name" className="block text-sm font-medium mb-1.5">Nom complet</label>
            <input id="ap-name" type="text" className="medical-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required aria-required="true" />
          </div>
          <div>
            <label htmlFor="ap-dob" className="block text-sm font-medium mb-1.5">Date de naissance</label>
            <input id="ap-dob" type="date" className="medical-input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required aria-required="true" />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" className="medical-btn-secondary flex-1" onClick={() => setShowModal(false)}>Annuler</button>
            <button type="submit" className="medical-btn-primary flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPatientManagementPage;
