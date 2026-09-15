export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export function filenameFromContentDisposition(header: string | undefined, fallback: string) {
    if (!header) return fallback;
    const m = /filename\*?=(?:UTF-8'')?["']?([^;"']+)/i.exec(header);
    return m?.[1]?.trim() ? decodeURIComponent(m[1].replace(/['"]/g, '')) : fallback;
}
