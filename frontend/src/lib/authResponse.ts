import type { User, UserRole } from '@/types/user';

function normalizeRole(raw: unknown): UserRole {
    if (Array.isArray(raw)) {
        const first = raw.find((r) => typeof r === 'string') ?? raw[0];
        return normalizeRole(first);
    }
    if (typeof raw !== 'string') return 'patient';
    const x = raw.replace(/^ROLE_/i, '').toLowerCase();
    if (x === 'admin' || x === 'doctor' || x === 'patient') return x;
    if (x === 'administrator') return 'admin';
    return 'patient';
}

/** Interprète un objet utilisateur renvoyé par Spring (`/auth/me` ou corps de login). */
export function mapUserDto(data: unknown): User | null {
    if (!data || typeof data !== 'object') return null;
    const d = data as Record<string, unknown>;
    const id = String(d.id ?? d.userId ?? '');
    const username = String(d.username ?? d.login ?? '');
    const name = String(d.name ?? d.fullName ?? d.displayName ?? username);
    const email = String(d.email ?? '');
    const role = normalizeRole(d.role ?? d.roles ?? d.authorities);
    if (!id || !username) return null;
    return { id, username, name, email, role };
}

/** Extrait le JWT depuis une réponse de login Spring (champs usuels). */
export function extractTokenFromBody(data: unknown): string | null {
    if (!data || typeof data !== 'object') return null;
    const d = data as Record<string, unknown>;
    const t = d.token ?? d.accessToken ?? d.access_token ?? d.jwt ?? d.idToken;
    return typeof t === 'string' && t.length > 0 ? t : null;
}
