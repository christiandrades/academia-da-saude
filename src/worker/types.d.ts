interface Env {
    DB: D1Database;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    JWT_SECRET: string;
}

// Minimal ambient globals for worker
declare function atob(s: string): string;
declare function btoa(s: string): string;
declare class TextEncoder { encode(input?: string): Uint8Array; }
declare const crypto: {
    subtle: SubtleCrypto;
};
declare const fetch: typeof globalThis.fetch;
declare const URLSearchParams: typeof globalThis.URLSearchParams;
// process.env for local dev fallback
declare namespace NodeJS {
    interface ProcessEnv {
        GOOGLE_CLIENT_ID?: string;
        GOOGLE_CLIENT_SECRET?: string;
        GOOGLE_REDIRECT_URI?: string;
        JWT_SECRET?: string;
    }
}
declare const process: { env: NodeJS.ProcessEnv };
