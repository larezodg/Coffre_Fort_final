import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '@/types/user';
import { authAPI } from '@/services/api';
import { mapUserDto } from '@/lib/authResponse';

export type { User, UserRole } from '@/types/user';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => Promise<void>;
    updateUser: (partial: Partial<User>) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        if (!storedToken) {
            setLoading(false);
            return;
        }
        setToken(storedToken);
        (async () => {
            try {
                const { data } = await authAPI.me();
                const u = mapUserDto(data);
                if (!u) throw new Error('Profil invalide');
                setUser(u);
                localStorage.setItem('user', JSON.stringify(u));
            } catch {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = useCallback((nextUser: User, nextToken: string) => {
        localStorage.setItem('jwt_token', nextToken);
        localStorage.setItem('user', JSON.stringify(nextUser));
        setUser(nextUser);
        setToken(nextToken);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch {
            /* réseau ou session déjà invalide */
        } finally {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
        }
    }, []);

    const updateUser = useCallback((partial: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const next = { ...prev, ...partial };
            localStorage.setItem('user', JSON.stringify(next));
            return next;
        });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                login,
                logout,
                updateUser,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
