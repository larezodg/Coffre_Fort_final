/** Normalise les réponses Spring (liste brute, Page `content`, ou enveloppe `data`). */
export function extractListPayload<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === 'object') {
        const o = payload as Record<string, unknown>;
        if (Array.isArray(o.content)) return o.content as T[];
        if (Array.isArray(o.data)) return o.data as T[];
        if (Array.isArray(o.items)) return o.items as T[];
    }
    return [];
}
