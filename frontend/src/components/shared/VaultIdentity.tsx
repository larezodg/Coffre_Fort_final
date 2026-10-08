import { Heart } from 'lucide-react';

export default function VaultIdentity() {
  return <div className="mb-8 flex flex-col items-center text-center">
    <div className="vault-symbol mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Heart size={28} strokeWidth={1.8} aria-hidden="true" /></div>
    <p className="max-w-xs text-lg font-semibold leading-tight">Coffre-fort Numérique de Santé</p>
  </div>;
}
