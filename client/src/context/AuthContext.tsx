import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { googleLogout } from '@react-oauth/google';

interface User {
    name: string;
    email: string;
    picture: string;
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
    // 1. Initialize token directly from localStorage
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('vibetext_token');
    });

    // 2. Initialize user directly from localStorage with error handling
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('vibetext_user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser) as User;
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('vibetext_user'); // Clean up corrupt data
                return null;
            }
        }
        return null;
    });

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('vibetext_token', newToken);
        localStorage.setItem('vibetext_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('vibetext_token');
        localStorage.removeItem('vibetext_user');
        googleLogout();
    };

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
