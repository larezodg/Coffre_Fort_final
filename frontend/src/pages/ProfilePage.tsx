import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Shield, KeyRound, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const roleLabels: Record<string, string> = { admin: 'Administrateur', doctor: 'Médecin', patient: 'Patient' };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await authAPI.updateProfile({ name, email });
      updateUser({ name, email });
      toast.success('Profil mis à jour');
    } catch {
      toast.error('Échec de la mise à jour (endpoint PATCH /auth/profile côté Spring).');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setPwLoading(true);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Mot de passe modifié');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Échec (POST /auth/password — vérifiez le mot de passe actuel).');
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Mon profil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      <div className="medical-card p-6 flex items-center gap-5">
        <Avatar className="w-16 h-16 text-lg">
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
            {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Shield size={14} className="text-primary" />
            <span className="text-sm text-muted-foreground">{roleLabels[user.role] || user.role}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
        </div>
      </div>

      <form onSubmit={(e) => void handleProfileSave(e)} className="medical-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <User size={18} className="text-primary" />
          <h3 className="font-semibold">Informations personnelles</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium mb-1.5">Nom complet</label>
            <input id="profile-name" type="text" className="medical-input" value={name} onChange={(e) => setName(e.target.value)} required aria-required="true" />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium mb-1.5">Adresse email</label>
            <input id="profile-email" type="email" className="medical-input" value={email} onChange={(e) => setEmail(e.target.value)} required aria-required="true" />
          </div>
        </div>

        <div>
          <label htmlFor="profile-username" className="block text-sm font-medium mb-1.5">Nom d&apos;utilisateur</label>
          <input id="profile-username" type="text" className="medical-input bg-muted" value={user.username} readOnly disabled />
          <p className="text-xs text-muted-foreground mt-1">Le nom d&apos;utilisateur ne peut pas être modifié</p>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="medical-btn-primary" disabled={profileLoading}>
            <Save size={16} /> {profileLoading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <form onSubmit={(e) => void handlePasswordChange(e)} className="medical-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={18} className="text-primary" />
          <h3 className="font-semibold">Changer le mot de passe</h3>
        </div>

        <div>
          <label htmlFor="current-pw" className="block text-sm font-medium mb-1.5">Mot de passe actuel</label>
          <div className="relative">
            <input id="current-pw" type={showCurrentPw ? 'text' : 'password'} className="medical-input pr-10" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required aria-required="true" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrentPw(!showCurrentPw)} aria-label={showCurrentPw ? 'Masquer' : 'Afficher'}>
              {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-pw" className="block text-sm font-medium mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <input id="new-pw" type={showNewPw ? 'text' : 'password'} className="medical-input pr-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required aria-required="true" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPw(!showNewPw)} aria-label={showNewPw ? 'Masquer' : 'Afficher'}>
                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-pw" className="block text-sm font-medium mb-1.5">Confirmer le mot de passe</label>
            <input id="confirm-pw" type="password" className="medical-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required aria-required="true" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Le mot de passe doit contenir au moins 8 caractères.</p>

        <div className="flex justify-end">
          <button type="submit" className="medical-btn-primary" disabled={pwLoading}>
            <KeyRound size={16} /> {pwLoading ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
