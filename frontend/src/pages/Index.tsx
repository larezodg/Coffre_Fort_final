import { useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import VaultIdentity from '@/components/shared/VaultIdentity';

export default function Index() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  return <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
    <div className="w-full max-w-[340px] text-center">
      <VaultIdentity />
      <p className="text-sm leading-relaxed text-muted-foreground">Plateforme sécurisée de gestion des dossiers patients avec chiffrement de bout en bout</p>
      <div className="mt-10 space-y-3">
        <motion.div whileTap={{ scale: reduced ? 1 : 0.98 }}><Button className="h-12 w-full rounded-xl" onClick={() => navigate('/login')}>Se connecter</Button></motion.div>
        <motion.div whileTap={{ scale: reduced ? 1 : 0.98 }}><Button variant="outline" className="h-12 w-full rounded-xl" onClick={() => navigate('/patient-access')}>Accès patient</Button></motion.div>
      </div>
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole size={14} aria-hidden="true" />Chiffrement de bout en bout</div>
    </div>
  </main>;
}
