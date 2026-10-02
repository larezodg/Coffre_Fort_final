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
      <div className="hidden lg:flex lg:w-1/2 medical-gradient-bg flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-current" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full border border-current" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-current" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Heart size={28} />
            <span className="text-xl font-display font-bold">Coffre-fort Numérique</span>
          </div>
          <p className="text-sm opacity-80">Dossier Patient Souverain</p>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold leading-tight mb-4">
            Protégez les données<br />médicales de vos patients
          </h2>
          <p className="text-sm opacity-80 max-w-md">
            Une plateforme sécurisée pour le stockage, le partage et la traçabilité des documents médicaux. Conforme aux normes de santé en vigueur.
          </p>
        </div>
        <div className="relative z-10 flex gap-8 text-sm">
          <div>
            <p className="text-2xl font-display font-bold">256-bit</p>
            <p className="opacity-70">Chiffrement AES</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold">100%</p>
            <p className="opacity-70">Traçabilité</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold">RGPD</p>
            <p className="opacity-70">Conforme</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Heart size={24} className="text-primary" />
            <span className="text-lg font-display font-bold">Coffre-fort Numérique</span>
          </div>

          <h1 className="text-2xl font-display font-bold mb-1">Connexion</h1>
          <p className="text-sm text-muted-foreground mb-8">Accédez à votre espace sécurisé (API Spring : POST /auth/login)</p>

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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="medical-btn-primary w-full">
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : 'Se connecter'}
            </button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground text-center">
            Front sur le port 5173 par défaut — API sur <code className="text-foreground">VITE_API_URL</code> (ex. http://localhost:8080/api).
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
