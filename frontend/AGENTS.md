# Frontend architecture
- Keep the existing Java-backed authentication, API calls, role guards and navigation unchanged when styling pages.
- Define shared visual values in src/index.css using the existing HSL token format because Tailwind 3 consumes these variables.
- Use PageMotion once per public page and around the authenticated layout outlet; this preserves the shared shell and respects reduced motion.
- Use VaultIdentity across public access screens so the medical-vault identity remains consistent.
