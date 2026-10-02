import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { securityAPI } from '@/services/api';
import { extractListPayload } from '@/lib/apiList';
import type { SecurityEventDto } from '@/types/security';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function normalizeEvent(raw: Record<string, unknown>, index: number): SecurityEventDto {
  return {
    id: String(raw.id ?? `sev-${index}`),
    event: String(raw.event ?? raw.message ?? raw.title ?? ''),
    source: String(raw.source ?? raw.origin ?? '—'),
    severity: String(raw.severity ?? raw.level ?? 'low').toLowerCase(),
    date: String(raw.date ?? raw.timestamp ?? raw.createdAt ?? '—'),
    action: String(raw.action ?? raw.actionTaken ?? '—'),
  };
}

const SecurityPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data: payload } = await securityAPI.events();
      const list = extractListPayload<Record<string, unknown>>(payload);
      return list.map((row, i) => normalizeEvent(row, i));
    },
    retry: 1,
  });

  const securityEvents = data ?? [];

  const columns = [
    { key: 'event', label: 'Événement', render: (e: SecurityEventDto) => <span className="font-medium">{e.event}</span> },
    { key: 'source', label: 'Source' },
    { key: 'severity', label: 'Sévérité', render: (e: SecurityEventDto) => (
      <StatusBadge
        status={e.severity === 'critical' ? 'danger' : e.severity === 'high' ? 'warning' : e.severity === 'medium' ? 'info' : 'success'}
        label={e.severity === 'critical' ? 'Critique' : e.severity === 'high' ? 'Élevée' : e.severity === 'medium' ? 'Moyenne' : 'Faible'}
      />
    )},
    { key: 'date', label: 'Date' },
    { key: 'action', label: 'Action prise' },
  ];

  const policies = [
    { name: 'Chiffrement AES-256', status: true },
    { name: 'Authentification JWT', status: true },
    { name: 'CORS sécurisé', status: true },
    { name: 'Rate limiting', status: true },
    { name: 'Audit complet', status: true },
    { name: 'Sauvegarde chiffrée', status: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Sécurité</h1>
        <p className="text-sm text-muted-foreground mt-1">GET /security/events — politiques affichées à titre indicatif</p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Événements indisponibles</AlertTitle>
          <AlertDescription>Implémentez GET /security/events sur Spring.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="medical-card text-center">
          <Shield size={28} className="text-success mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-success">—</p>
          <p className="text-xs text-muted-foreground">Score de sécurité (API)</p>
        </div>
        <div className="medical-card text-center">
          <Lock size={28} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-display font-bold">—</p>
          <p className="text-xs text-muted-foreground">Documents chiffrés</p>
        </div>
        <div className="medical-card text-center">
          <AlertTriangle size={28} className="text-warning mx-auto mb-2" />
          <p className="text-2xl font-display font-bold">—</p>
          <p className="text-xs text-muted-foreground">Menaces (24h)</p>
        </div>
      </div>

      <div className="medical-card">
        <h2 className="text-lg font-display font-semibold mb-4">Politiques de sécurité</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {policies.map((p) => (
            <div key={p.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
              <CheckCircle size={16} className="text-success flex-shrink-0" />
              <span className="text-sm">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold mb-4">Événements de sécurité</h2>
        <DataTable columns={columns} data={securityEvents} searchable searchPlaceholder="Rechercher..." loading={isLoading} />
      </div>
    </div>
  );
};

export default SecurityPage;
