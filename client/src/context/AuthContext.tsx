import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { googleLogout } from '@react-oauth/google';
import api from '../lib/api';

interface User {
    name: string;
    email: string;
    picture: string;
    role?: string;
    _id?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem('vibetext_token')
    );

    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('vibetext_user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser) as User;
            } catch {
                localStorage.removeItem('vibetext_user');
                return null;
            }
        }
        return null;
    });

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('vibetext_token');
        localStorage.removeItem('vibetext_user');
        googleLogout();
    }, []);

    const login = useCallback((newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('vibetext_token', newToken);
        localStorage.setItem('vibetext_user', JSON.stringify(newUser));
    }, []);

    // On mount (or when token changes), re-validate session from the server
    // so the user's latest role (e.g. admin) is always reflected without re-login.
    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        const verifySession = async () => {
            try {
                const res = await api.get('/user/me');
                if (!cancelled) {
                    const freshUser: User = res.data;
                    setUser(freshUser);
                    localStorage.setItem('vibetext_user', JSON.stringify(freshUser));
                }
            } catch (err: any) {
                if (!cancelled) {
                    // 401 = token expired/invalid → log out; anything else (network, 5xx) → keep session
                    if (err?.response?.status === 401) {
                        logout();
                    }
                }
            }
        };

        verifySession();
        return () => { cancelled = true; };
    }, [token, logout]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
