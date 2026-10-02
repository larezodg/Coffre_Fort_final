import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Filter } from 'lucide-react';
import { auditAPI } from '@/services/api';
import { extractListPayload } from '@/lib/apiList';
import { formatDisplayDate } from '@/lib/formatDate';

interface AuditRow {
  id: string;
  user: string;
  action: string;
  resource: string;
  date: string;
  ip: string;
  status: string;
}

function toAuditRow(raw: Record<string, unknown>, index: number): AuditRow {
  const st = String(raw.status ?? '').toLowerCase();
  const success = st !== 'failure' && st !== 'error' && st !== 'failed' && raw.success !== false;
  return {
    id: String(raw.id ?? `audit-${index}`),
    user: String(raw.user ?? raw.username ?? raw.actor ?? ''),
    action: String(raw.action ?? raw.event ?? ''),
    resource: String(raw.resource ?? raw.details ?? raw.message ?? ''),
    date: formatDisplayDate(raw.date ?? raw.timestamp ?? raw.createdAt),
    ip: String(raw.ip ?? raw.ipAddress ?? '—'),
    status: success ? 'success' : 'failure',
  };
}

const actionLabels: Record<string, string> = {
  DOCUMENT_UPLOAD: 'Téléversement document',
  DOCUMENT_VIEW: 'Consultation document',
  DOCUMENT_DOWNLOAD: 'Téléchargement document',
  DOCUMENT_DELETE: 'Suppression document',
  LOGIN_FAILED: 'Échec de connexion',
  USER_CREATE: 'Création utilisateur',
  USER_DEACTIVATE: 'Désactivation utilisateur',
  PATIENT_CREATE: 'Création patient',
  PASSWORD_CHANGE: 'Changement mot de passe',
  BACKUP_COMPLETE: 'Sauvegarde terminée',
  SECURITY_ALERT: 'Alerte sécurité',
};

const AuditLogPage = () => {
  const [actionFilter, setActionFilter] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data } = await auditAPI.getLogs();
      return extractListPayload<Record<string, unknown>>(data).map(toAuditRow);
    },
  });

  const filtered = actionFilter ? logs.filter((l) => l.action === actionFilter) : logs;

  const columns = [
    { key: 'date', label: 'Date & heure', render: (l: AuditRow) => <span className="text-xs font-mono">{l.date}</span> },
    { key: 'user', label: 'Utilisateur', render: (l: AuditRow) => <span className="font-medium">{l.user}</span> },
    { key: 'action', label: 'Action', render: (l: AuditRow) => (
      <StatusBadge
        status={l.action.includes('FAILED') || l.action.includes('ALERT') ? 'danger' : l.action.includes('DELETE') ? 'warning' : 'info'}
        label={actionLabels[l.action] || l.action}
      />
    ) },
    { key: 'resource', label: 'Ressource' },
    { key: 'ip', label: 'Adresse IP', render: (l: AuditRow) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{l.ip}</code> },
    { key: 'status', label: 'Résultat', render: (l: AuditRow) => (
      <StatusBadge status={l.status === 'success' ? 'success' : 'danger'} label={l.status === 'success' ? 'Succès' : 'Échec'} />
    ) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Journal d&apos;audit</h1>
        <p className="text-sm text-muted-foreground mt-1">GET /audit</p>
      </div>

      <div className="flex items-center gap-3">
        <Filter size={16} className="text-muted-foreground" />
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="medical-input w-auto" aria-label="Filtrer par action">
          <option value="">Toutes les actions</option>
          {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchable
        searchPlaceholder="Rechercher dans les logs..."
        emptyMessage="Aucun log trouvé"
        loading={isLoading}
      />
    </div>
  );
};

export default AuditLogPage;
