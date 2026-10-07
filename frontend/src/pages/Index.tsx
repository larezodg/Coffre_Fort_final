import { useNavigate } from "react-router-dom";
import { Heart, LockKeyhole } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import './Welcome.css';

const Index = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const entrance = (delay: number) => ({
    initial: { opacity: 1, y: 0 },
    animate: reduced ? { opacity: 1, y: 0 } : { opacity: [0, 1], y: [16, 0] },
    transition: { duration: reduced ? 0 : 0.65, delay: reduced ? 0 : delay },
  });
  return (
    <main className="vault-welcome flex items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="flex w-full max-w-[340px] flex-col items-center text-center">
        <motion.div {...entrance(0)} className="mb-8 flex h-20 w-20 items-center justify-center">
          <div className="vault-welcome-symbol flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary text-primary-foreground">
            <Heart size={28} strokeWidth={1.8} aria-hidden="true" />
          </div>
        </motion.div>
        <motion.div {...entrance(0.1)} className="space-y-4">
          <h1 className="text-[22px] font-semibold leading-tight">Coffre-fort Numérique de Santé</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">Plateforme sécurisée de gestion des dossiers patients avec chiffrement de bout en bout</p>
        </motion.div>
        <motion.div {...entrance(0.2)} className="mt-10 w-full space-y-3">
          <motion.div whileTap={{ scale: reduced ? 1 : 0.98 }}>
            <Button className="h-12 w-full rounded-xl font-medium" onClick={() => navigate('/login')}>Se connecter</Button>
          </motion.div>
          <motion.div whileTap={{ scale: reduced ? 1 : 0.98 }}>
            <Button variant="outline" className="vault-welcome-secondary h-12 w-full rounded-xl font-medium" onClick={() => navigate('/patient-access')}>Accès patient</Button>
          </motion.div>
        </motion.div>
        <motion.div {...entrance(0.3)} className="mt-12 flex items-center gap-2 text-muted-foreground">
          <LockKeyhole size={14} aria-hidden="true" />
          <span className="text-[11px] font-medium">Chiffrement de bout en bout</span>
        </motion.div>
      </div>
    </main>
  );
};
export default Index;
