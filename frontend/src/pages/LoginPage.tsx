import VaultIdentity from '@/components/shared/VaultIdentity';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authAPI } from '@/services/api';
import { extractTokenFromBody, mapUserDto } from '@/lib/authResponse';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login({ username, password });
      const token = extractTokenFromBody(data);
      if (!token) {
        setError('Réponse serveur invalide : aucun jeton d\'authentification.');
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
        setError('Impossible de charger le profil utilisateur (vérifiez /auth/me).');
        return;
      }
      login(user, token);
      navigate('/dashboard');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      const serverMsg = ax.response?.data?.message;
      setError(typeof serverMsg === 'string' ? serverMsg : 'Identifiants incorrects ou serveur injoignable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" role="main">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-sm">
          <VaultIdentity />
          <h1 className="text-xl font-semibold mb-2 text-center">Connexion</h1>
          <p className="text-sm text-muted-foreground mb-8 text-center">Accédez à votre espace sécurisé</p>

          {error && (
            <div className="flex items-start gap-2 p-3 mb-6 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1.5">Identifiant</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="medical-input pl-9"
                  placeholder="Votre identifiant"
                  required
                  autoComplete="username"
                  aria-required="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="medical-input pl-9 pr-10"
                  placeholder="Votre mot de passe"
                  required
                  autoComplete="current-password"
                  aria-required="true"
                />
                <Button
                  variant="ghost" size="icon" type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl">
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : 'Se connecter'}
            </Button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default LoginPage;
