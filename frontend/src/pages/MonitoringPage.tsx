import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Server, Database, HardDrive, Wifi, Clock, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { systemAPI } from '@/services/api';
import { extractListPayload } from '@/lib/apiList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type ServiceRow = { name: string; status: string; uptime: string; latency: string; icon: typeof Server };
type AlertRow = { message: string; severity: string; time: string };

function parseServices(data: unknown): Omit<ServiceRow, 'icon'>[] {
  const list = extractListPayload<Record<string, unknown>>(data);
  if (list.length) {
    return list.map((s) => ({
      name: String(s.name ?? s.service ?? 'Service'),
      status: String(s.status ?? 'unknown').toLowerCase(),
      uptime: String(s.uptime ?? s.availability ?? '—'),
      latency: String(s.latency ?? s.responseTime ?? '—'),
    }));
  }
  if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).services)) {
    return parseServices((data as Record<string, unknown>).services);
  }
  return [];
}

function parseAlerts(data: unknown): AlertRow[] {
  const list = extractListPayload<Record<string, unknown>>(data);
  if (list.length) {
    return list.map((a) => ({
      message: String(a.message ?? a.title ?? a.description ?? ''),
      severity: String(a.severity ?? a.level ?? 'info').toLowerCase(),
      time: String(a.time ?? a.timestamp ?? a.createdAt ?? '—'),
    }));
  }
  if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).alerts)) {
    return parseAlerts((data as Record<string, unknown>).alerts);
  }
  return [];
}

function iconFor(name: string) {
  const n = name.toLowerCase();
  if (n.includes('base') || n.includes('sql')) return Database;
  if (n.includes('stockage') || n.includes('storage')) return HardDrive;
  if (n.includes('réseau') || n.includes('network')) return Wifi;
  return Server;
}

const MonitoringPage = () => {
  const statusQuery = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const { data } = await systemAPI.getStatus();
      return data;
    },
    retry: 1,
  });

  const alertsQuery = useQuery({
    queryKey: ['system-alerts'],
    queryFn: async () => {
      const { data } = await systemAPI.getAlerts();
      return data;
    },
    retry: 1,
  });

  const rawServices = statusQuery.data != null ? parseServices(statusQuery.data) : [];
  const services: ServiceRow[] = rawServices.map((s) => ({ ...s, icon: iconFor(s.name) }));

  const alerts = alertsQuery.data != null ? parseAlerts(alertsQuery.data) : [];

  const hasError = statusQuery.isError || alertsQuery.isError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Surveillance système</h1>
        <p className="text-sm text-muted-foreground mt-1">GET /system/status et GET /system/alerts</p>
      </div>

      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Données partiellement indisponibles</AlertTitle>
          <AlertDescription>
            Vérifiez les contrôleurs Spring pour /system/status et /system/alerts (listes ou objets avec clés services / alerts).
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Disponibilité" value="—" icon={Clock} trend={{ value: 'API status', positive: true }} />
        <StatCard title="Requêtes/min" value="—" icon={Server} trend={{ value: 'À brancher', positive: true }} />
        <StatCard title="Stockage utilisé" value="—" icon={HardDrive} trend={{ value: 'À brancher', positive: false }} />
        <StatCard title="Menaces bloquées" value="—" icon={Shield} trend={{ value: 'À brancher', positive: true }} />
      </div>

      <div className="medical-card">
        <h2 className="text-lg font-display font-semibold mb-4">État des services</h2>
        {statusQuery.isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Chargement…</p>
        ) : services.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Aucun service renvoyé par l&apos;API.</p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <service.icon size={20} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{service.name}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground space-y-0.5">
                  <p>Uptime: {service.uptime}</p>
                  <p>Latence: {service.latency}</p>
                </div>
                <StatusBadge
                  status={service.status === 'operational' || service.status === 'up' ? 'success' : 'warning'}
                  label={service.status === 'operational' || service.status === 'up' ? 'Opérationnel' : 'Dégradé'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="medical-card">
        <h2 className="text-lg font-display font-semibold mb-4">Alertes récentes</h2>
        {alertsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Chargement…</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Aucune alerte renvoyée par l&apos;API.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                {alert.severity === 'danger' || alert.severity === 'critical' ? <AlertTriangle size={16} className="text-destructive mt-0.5" /> :
                 alert.severity === 'warning' ? <AlertTriangle size={16} className="text-warning mt-0.5" /> :
                 <CheckCircle size={16} className="text-success mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.time}</p>
                </div>
                <StatusBadge
                  status={alert.severity === 'danger' || alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'success'}
                  label={alert.severity === 'danger' || alert.severity === 'critical' ? 'Critique' : alert.severity === 'warning' ? 'Attention' : 'Info'}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringPage;
