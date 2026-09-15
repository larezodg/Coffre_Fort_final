export function formatDisplayDate(value: unknown): string {
    if (value == null || value === '') return '—';
    if (typeof value === 'string') {
        const t = Date.parse(value);
        if (!Number.isNaN(t)) return new Date(t).toLocaleString('fr-FR');
        return value;
    }
    return String(value);
}
