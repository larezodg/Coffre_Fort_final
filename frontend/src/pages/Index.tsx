import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-16 h-16 rounded-2xl medical-gradient-bg flex items-center justify-center mb-6">
        <Heart size={28} className="text-primary-foreground" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">Coffre-fort Numérique de Santé</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Plateforme sécurisée de gestion des dossiers patients avec chiffrement de bout en bout
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <button className="medical-btn-primary" onClick={() => navigate('/login')}>
          Se connecter
        </button>
        <button className="medical-btn-secondary" onClick={() => navigate('/patient-access')}>
          Accès patient
        </button>
      </div>
    </div>
  );
};

export default Index;
