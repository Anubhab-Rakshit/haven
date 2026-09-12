// ─── API Configuration ─────────────────────────────────────────────────────────
// Points to the Haven API server running on localhost:3001

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiFetch(path: string, options?: RequestInit) {
    const url = `${API_URL}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || `API error ${res.status}`);
    }

    return res.json();
}
