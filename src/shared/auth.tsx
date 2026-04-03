import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
    id: number;
    nome: string;
    email: string;
    role: string;
    foto_url?: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    isPending?: boolean;
    redirectToLogin?: () => Promise<void>;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    exchangeCodeForSessionToken: (code?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/users/me');
                if (res.ok) {
                    const json = await res.json();
                    setUser(json);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async () => {
        const res = await fetch('/api/oauth/google/redirect_url');
        const data = await res.json();
        if (data?.redirectUrl) {
            window.location.href = data.redirectUrl;
        }
    };

    const exchangeCodeForSessionToken = async (code?: string) => {
        // If code not provided, try to read from URL
        let authCode = code;
        if (!authCode) {
            try {
                const params = new URLSearchParams(window.location.search);
                authCode = params.get('code') || undefined;
            } catch (e) {
                authCode = undefined;
            }
        }

        if (!authCode) throw new Error('No authorization code');

        const res = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: authCode })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error || 'Failed to exchange code');
        }

        // Refresh user state after successful session creation
        try {
            const me = await fetch('/api/users/me');
            if (me.ok) {
                const json = await me.json();
                setUser(json);
            }
        } catch (e) {
            // ignore - user will be fetched on next navigation
        }
    };

    const logout = async () => {
        await fetch('/api/logout');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, isPending: loading, login, redirectToLogin: login as any, logout, exchangeCodeForSessionToken } as any}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
