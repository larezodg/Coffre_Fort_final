import VaultIdentity from '@/components/shared/VaultIdentity';
import { Button } from '@/components/ui/button';
import React, { useState, ChangeEvent, FormEvent } from 'react';

// 1. Interfaces TypeScript correspondant exactement aux DTO Spring Boot
export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}

export interface UserResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  enabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ApiErrorResponse {
  status?: number;
  message?: string;
  timestamp?: string;
  fields?: Record<string, string> | null;
}

const CreateUserPage: React.FC = () => {
  // État du formulaire typé
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'DOCTOR',
  });

  // États UI typés
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Saisie dans le formulaire
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Soumission vers Spring Boot (POST /users)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const token = localStorage.getItem('token');

    if (!token) {
      setErrorMessage("Vous n'êtes pas authentifié. Veuillez vous connecter.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok || response.status === 201) {
        const createdUser: UserResponse = await response.json();
        setSuccessMessage(`Utilisateur "${createdUser.username}" créé avec succès !`);
        
        // Réinitialisation du formulaire
        setFormData({
          username: '',
          password: '',
          name: '',
          email: '',
          role: 'DOCTOR',
        });
      } else {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));

        if (response.status === 403) {
          setErrorMessage("Accès refusé (403) : Seuls les Administrateurs peuvent créer un utilisateur.");
        } else if (errorData.message) {
          setErrorMessage(errorData.message);
        } else {
          setErrorMessage(`Erreur ${response.status}: Impossible de créer l'utilisateur.`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du POST /users :', error);
      setErrorMessage('Impossible de contacter le serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <VaultIdentity />
        <h2 className="mb-2 text-center text-xl font-semibold">Créer un utilisateur</h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">Formulaire d'inscription (Accès Admin)</p>

        {errorMessage && (
          <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</div>
        )}
        {successMessage && (
          <div role="status" className="mb-4 rounded-lg bg-success/10 p-3 text-sm text-success">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Nom complet :</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="ex: Dr. Nguemo"
              maxLength={150}
              required
              className="medical-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Nom d'utilisateur (Username) :</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="ex: dr.nguemo"
              maxLength={50}
              required
              className="medical-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Adresse Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ex: nguemo@coffrefort.com"
              maxLength={255}
              required
              className="medical-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Mot de passe (Min. 8 caractères) :</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={8}
              required
              className="medical-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Rôle :</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="medical-input"
            >
              <option value="DOCTOR">Médecin (DOCTOR)</option>
              <option value="PATIENT">Patient (PATIENT)</option>
              <option value="ADMIN">Administrateur (ADMIN)</option>
            </select>
          </div>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl">
            {loading ? 'Création en cours...' : 'Inscrire l\'utilisateur'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;
