import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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
    login: (user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    /**
     *  isLoading: We start as "loading" because on mount we must
     * ping the server to check if the HttpOnly cookie is valid.
     * We can't just check localStorage anymore — the token is invisible to JS.
     * Until the server responds, we don't know if the user is logged in.
     */
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(async () => {
        try {
            /**
             *  We MUST call the backend to clear the cookie.
             * JavaScript cannot call document.cookie to remove an HttpOnly cookie.
             * The server clears it with res.clearCookie() — this is the only way.
             */
            await api.post('/auth/logout');
        } catch (_) {
            // Ignore network errors — still log out locally
        }
        setUser(null);
        googleLogout();
    }, []);

    const login = useCallback((newUser: User) => {
        /**
         * We no longer store the token here.
         * The backend already wrote the HttpOnly cookie in the response.
         * We only store non-sensitive user profile data in React state.
         */
        setUser(newUser);
    }, []);

    /**
     *  On every mount (page load/refresh), we check the session.
     * This replaces the old "read token from localStorage" approach.
     * If the HttpOnly cookie is valid, the backend returns user data.
     * If not, it returns 401 and we stay logged out.
     */
    useEffect(() => {
        let cancelled = false;

        const checkSession = async () => {
            try {
                const res = await api.get('/user/me');
                if (!cancelled) {
                    setUser(res.data);
                }
            } catch (err: any) {
                if (!cancelled && err?.response?.status === 401) {
                    setUser(null); // Session expired or no cookie
                }
                // For 5xx / network errors, keep existing user state (don't log out)
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        checkSession();
        return () => { cancelled = true; };
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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
