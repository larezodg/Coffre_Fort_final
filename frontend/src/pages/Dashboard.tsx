import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/shared/StatCard';
import { Users, FileText, Shield, Activity, Upload, Clock, AlertTriangle, UserCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: summary, isError, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary', user?.role],
    queryFn: async () => {
      const { data } = await dashboardAPI.summary();
      return data;
    },
    retry: 1,
    enabled: !!user,
  });

  const adminStats = [
    { title: 'Utilisateurs', value: summary?.userCount ?? '—', icon: Users, trend: { value: 'API /dashboard/summary', positive: true } },
    { title: 'Documents', value: summary?.documentCount ?? '—', icon: FileText, trend: { value: 'API /dashboard/summary', positive: true } },
    { title: 'Alertes sécurité', value: summary?.securityAlerts ?? '—', icon: Shield, trend: { value: 'API /dashboard/summary', positive: true } },
    { title: 'Temps de réponse', value: summary?.responseTimeMs != null ? `${summary.responseTimeMs}ms` : '—', icon: Activity, trend: { value: 'API /dashboard/summary', positive: true } },
  ];

  const doctorStats = [
    { title: 'Mes patients', value: summary?.doctorPatientCount ?? '—', icon: Users },
    { title: 'Documents envoyés', value: summary?.doctorDocumentsSent ?? '—', icon: Upload, trend: { value: 'API /dashboard/summary', positive: true } },
    { title: 'En attente', value: summary?.doctorPending ?? '—', icon: Clock, trend: { value: 'API /dashboard/summary', positive: false } },
    { title: 'Documents consultés', value: summary?.doctorDocumentsViewed ?? '—', icon: FileText },
  ];

  const patientStats = [
    { title: 'Mes documents', value: summary?.patientDocumentCount ?? '—', icon: FileText },
    { title: 'Non lus', value: summary?.patientUnread ?? '—', icon: AlertTriangle, trend: { value: 'API /dashboard/summary', positive: false } },
  ];

  const stats = user?.role === 'admin' ? adminStats : user?.role === 'doctor' ? doctorStats : patientStats;

  const recentActivity = summary?.recentActivity?.length
    ? summary.recentActivity
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenue, {user?.name} • {user?.role === 'admin' ? 'Administration' : user?.role === 'doctor' ? 'Espace médecin' : 'Espace patient'}
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Résumé indisponible</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message || 'Implémentez GET /dashboard/summary sur Spring ou vérifiez VITE_API_URL.'}
          </AlertDescription>
        </Alert>
      )}

      <div className={`grid gap-4 ${stats.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="medical-card">
          <h2 className="text-lg font-display font-semibold mb-4">Activité récente</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Chargement…</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Aucune activité (renseignez recentActivity dans /dashboard/summary).</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    item.type === 'upload' ? 'bg-primary' : item.type === 'security' ? 'bg-warning' : 'bg-success'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {user?.role !== 'patient' && (
          <div className="medical-card">
            <h2 className="text-lg font-display font-semibold mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="medical-btn-primary flex-col h-24 rounded-xl" onClick={() => navigate('/upload')}>
                <Upload size={20} />
                <span className="text-xs">Téléverser un document</span>
              </button>
              <button type="button" className="medical-btn-secondary flex-col h-24 rounded-xl" onClick={() => navigate(user?.role === 'admin' ? '/admin/patients' : '/patients')}>
                <Users size={20} />
                <span className="text-xs">Patients</span>
              </button>
              <button type="button" className="medical-btn-secondary flex-col h-24 rounded-xl" onClick={() => navigate('/documents')}>
                <FileText size={20} />
                <span className="text-xs">Voir les documents</span>
              </button>
              <button
                type="button"
                className="medical-btn-secondary flex-col h-24 rounded-xl"
                onClick={() => navigate(user?.role === 'admin' ? '/audit' : '/profile')}
              >
                {user?.role === 'admin' ? <Shield size={20} /> : <UserCircle size={20} />}
                <span className="text-xs">{user?.role === 'admin' ? "Journal d'audit" : 'Mon profil'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
