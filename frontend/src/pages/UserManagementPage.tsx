import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import Modal from '@/components/shared/Modal';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { usersAPI } from '@/services/api';
import { extractListPayload } from '@/lib/apiList';
import { formatDisplayDate } from '@/lib/formatDate';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

function toUserRow(raw: Record<string, unknown>): UserRow {
  const role = String(raw.role ?? '').toLowerCase().replace(/^role_/i, '');
  const statusRaw = String(raw.status ?? '').toLowerCase();
  const active =
    raw.enabled !== false &&
    raw.active !== false &&
    statusRaw !== 'inactive' &&
    statusRaw !== 'disabled';
  return {
    id: String(raw.id),
    name: String(raw.name ?? raw.fullName ?? raw.username ?? ''),
    email: String(raw.email ?? ''),
    role,
    status: active ? 'active' : 'inactive',
    lastLogin: formatDisplayDate(raw.lastLogin ?? raw.lastLoginAt),
  };
}

const roleLabels: Record<string, string> = { admin: 'Administrateur', doctor: 'Médecin', patient: 'Patient' };

const UserManagementPage = () => {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuppression, setShowSuppressionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [editForm, setEditForm] = useState({
  username: '',
  name: '',
  email: '',
  role: '',
});
  const [createForm, setCreateForm] = useState({
    username: '',
    name: '',
    email: '',
    role: '',
    password: '',
  });

useEffect(() => {
  if (editingUser) {
    setEditForm({
      username: editingUser.username || '',
      name: editingUser.name || '',
      email: editingUser.email || '',
      role: editingUser.role || '',
    });
  }
}, [editingUser]);


  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Validation de la longueur du mot de passe
  if (!createForm.password || createForm.password.length < 8) {
    toast.error('Le mot de passe doit contenir au moins 8 caractères');
    return; // Stop l'exécution ici
  }

  // 2. Déclenchement de la mutation si tout est valide
  createMutation.mutate();
};

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await usersAPI.getAll();
      return extractListPayload<Record<string, unknown>>(data).map(toUserRow);
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      usersAPI.create({
        username: createForm.username,
        name: createForm.name,
        email: createForm.email,
        role: createForm.role,
        password: createForm.password,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur créé');
      setShowModal(false);
      setCreateForm({ username: '', name: '', email: '', role: '', password: '' });
    },
    onError: () => toast.error('Échec (POST /users)'),

  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersAPI.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé');
    },
    onError: () => toast.error('Suppression impossible'),
  });

  const updateMutation = useMutation({
  mutationFn: () =>
    usersAPI.update(editingUser.id, {
      username: editForm.username,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
    }),
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: ['users'] });
    toast.success('Utilisateur modifié');
    setShowEditModal(false);
    setEditingUser(null);
  },
  onError: () => toast.error('Échec (PUT /users)'),
});

  const columns = [
    { key: 'name', label: 'Nom', render: (u: UserRow) => <span className="font-medium">{u.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle', render: (u: UserRow) => (
      <div className="flex items-center gap-1.5">
        {u.role === 'admin' && <Shield size={12} className="text-warning" />}
        <span className="text-sm">{roleLabels[u.role] || u.role}</span>
      </div>
    ) },
    { key: 'status', label: 'Statut', render: (u: UserRow) => (
      <StatusBadge status={u.status === 'active' ? 'active' : 'inactive'} label={u.status === 'active' ? 'Actif' : 'Inactif'} />
    ) },
    { key: 'lastLogin', label: 'Dernière connexion' },
  ];



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestion des utilisateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} utilisateur(s) — GET /users</p>
        </div>
        <button type="button" className="medical-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchable
        searchPlaceholder="Rechercher un utilisateur..."
        loading={isLoading}
        actions={(userRow) => (
          <div className="flex items-center gap-1">
            <button type="button" className="p-1.5 rounded-md hover:bg-muted" aria-label={`Modifier ${userRow.name}`}><Edit size={15} className="text-muted-foreground" onClick={() => {
              setEditingUser(userRow); // Charge les données de la ligne
              setShowEditModal(true);  // Ouvre la modale d'édition
            }}/></button>

            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-muted"
              aria-label={`Supprimer ${userRow.name}`}
              onClick={() => {
                setSelectedUser(userRow);
                setShowSuppressionModal(true);
              }}
              >
              <Trash2 size={15} className="text-destructive/60" />
            </button>
          </div>
        )}
        
      />
<Modal
      open={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setEditingUser(null);
      }}
      title="Modifier l'utilisateur"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="space-y-4 pt-2"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={editForm.username}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nom complet</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rôle</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            className="medical-btn-secondary flex-1"
            onClick={() => {
              setShowEditModal(false);
              setEditingUser(null);
            }}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="medical-btn-primary flex-1"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Modification…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
      <Modal open={showSuppression} onClose={() => {setShowSuppressionModal(false);setSelectedUser(null);}} title="Supprimer l'utilisateur">
        <p className="text-sm text-muted-foreground">Êtes-vous sûr de vouloir supprimer cet utilisateur <strong>{selectedUser?.name}</strong> ? Cette action est irréversible.</p>
        <div className="flex gap-3 pt-4">
          <button type="button" className="medical-btn-secondary flex-1" onClick={() => setShowSuppressionModal(false)}>Annuler</button>
          <button type="button" className="medical-btn-destructive flex-1" onClick={() => {
            deleteMutation.mutate(selectedUser.id);
            setShowSuppressionModal(false);
          }}>
            {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </Modal>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvel utilisateur">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
            handleSubmit(e);
          }}
        >
          <div>
            <label htmlFor="user-username" className="block text-sm font-medium mb-1.5">Nom d&apos;utilisateur</label>
            <input id="user-username" type="text" className="medical-input" placeholder="Nom d&apos;utilisateur" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} required aria-required="true" />
          </div>
          <div>
            <label htmlFor="user-name" className="block text-sm font-medium mb-1.5">Nom complet</label>
            <input id="user-name" type="text" placeholder="Nom complet" className="medical-input" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required aria-required="true" />
          </div>
          <div>
            <label htmlFor="user-email" className="block text-sm font-medium mb-1.5">Email</label>
            <input id="user-email" type="email" placeholder="123@gmail.com" className="medical-input" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required aria-required="true" />
          </div>
          <div>
            <label htmlFor="user-role" className="block text-sm font-medium mb-1.5">Rôle</label>
            <select id="user-role" className="medical-input" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} required aria-required="true">
              <option value="admin">Administrateur</option>
              <option value="doctor">Médecin</option>
              <option value="patient">Patient</option>
            </select>
          </div>
          <div>
            <label htmlFor="user-password" className="block text-sm font-medium mb-1.5">Mot de passe initial </label>
            <input id="user-password" type="password" placeholder=" MIN 8 caracters"  className="medical-input" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required aria-required="true" />
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

export default UserManagementPage;
