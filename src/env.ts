// ─── Safe Environment Accessors ─────────────────────────────────────────────────
// Works in both Node (process.env) and browser (import.meta.env.VITE_*).
// In the browser, process is undefined, so we guard against that.

function getEnv(): Record<string, string | undefined> {
    if (typeof process !== 'undefined' && process.env) {
        return process.env;
    }
    return {};
}

export const env = {
    get SUPABASE_URL(): string {
        const nodeEnv = getEnv()['SUPABASE_URL'];
        if (nodeEnv) return nodeEnv;
        // @ts-expect-error Vite env injection
        const viteEnv = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;
        return viteEnv || '';
    },
    get SUPABASE_ANON_KEY(): string {
        const nodeEnv = getEnv()['SUPABASE_ANON_KEY'];
        if (nodeEnv) return nodeEnv;
        // @ts-expect-error Vite env injection
        const viteEnv = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY;
        return viteEnv || '';
    },
};
