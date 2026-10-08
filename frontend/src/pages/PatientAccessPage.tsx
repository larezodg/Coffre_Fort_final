import VaultIdentity from '@/components/shared/VaultIdentity';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Heart, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientsAPI, authAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { extractTokenFromBody, mapUserDto } from '@/lib/authResponse';

const PatientAccessPage = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await patientsAPI.accessByCode(code.trim());
      const token = extractTokenFromBody(data);
      if (!token) {
        setError('Réponse serveur invalide : aucun jeton. Vérifiez POST /patients/access.');
        return;
      }
      localStorage.setItem('jwt_token', token);
      let user = mapUserDto((data as Record<string, unknown>).user);
      if (!user) {
        const me = await authAPI.me();
        user = mapUserDto(me.data);
      }
      if (!user) {
        localStorage.removeItem('jwt_token');
        setError('Profil patient introuvable après authentification.');
        return;
      }
      login(user, token);
      navigate('/my-documents');
    } catch {
      setError('Code d\'accès invalide ou serveur injoignable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <VaultIdentity />
        <h1 className="mb-8 text-center text-xl font-semibold">Accès patient</h1>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <Lock size={16} />
            <span className="font-medium">Connexion sécurisée</span>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">{error}</div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label htmlFor="access-code" className="block text-sm font-medium mb-1.5">Code d&apos;accès unique</label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="medical-input text-center text-lg font-mono"
                placeholder="PAT-XXXX-XXX"
                required
                aria-required="true"
                maxLength={32}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Ce code vous a été communiqué par votre médecin</p>
            </div>

            <Button type="submit" disabled={loading || code.length < 5} className="h-12 w-full rounded-xl">
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : (
                <>Accéder à mes documents <ArrowRight size={16} /></>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Vos données sont protégées par un chiffrement AES-256
        </p>
      </div>
    </div>
  );
};

export default PatientAccessPage;
