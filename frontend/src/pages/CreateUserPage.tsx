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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Créer un utilisateur</h2>
        <p style={styles.subtitle}>Formulaire d'inscription (Accès Admin)</p>

        {errorMessage && (
          <div style={{ ...styles.alert, ...styles.alertDanger }}>{errorMessage}</div>
        )}
        {successMessage && (
          <div style={{ ...styles.alert, ...styles.alertSuccess }}>{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom complet :</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="ex: Dr. Nguemo"
              maxLength={150}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nom d'utilisateur (Username) :</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="ex: dr.nguemo"
              maxLength={50}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Adresse Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ex: nguemo@coffrefort.com"
              maxLength={255}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe (Min. 8 caractères) :</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={8}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Rôle :</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="DOCTOR">Médecin (DOCTOR)</option>
              <option value="PATIENT">Patient (PATIENT)</option>
              <option value="ADMIN">Administrateur (ADMIN)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Création en cours...' : 'Inscrire l\'utilisateur'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Objets de styles fortement typés avec React.CSSProperties
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '480px',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '22px',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
  },
  button: {
    marginTop: '10px',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  alert: {
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '15px',
  },
  alertDanger: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
};

export default CreateUserPage;