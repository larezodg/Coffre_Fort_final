export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function filenameFromContentDisposition(header: string | undefined, fallback: string) {
    if (!header) return fallback;
    const m = /filename\*?=(?:UTF-8'')?["']?([^;"']+)/i.exec(header);
    if (!m?.[1]?.trim()) return fallback;
    try {
        const decoded = decodeURIComponent(m[1].replace(/^["']|["']$/g, '').trim());
        return decoded.replace(/[\\/\u0000-\u001f\u007f]/g, '_').trim() || fallback;
    } catch {
        return fallback;
    }
}
