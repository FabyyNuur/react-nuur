import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'CONTROLEUR' | 'CAISSIER';
    is_active?: boolean | number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('nuurgym_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('nuurgym_user');
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, [token]);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/users/login', { email, password });
            const { token, user } = response.data;
            
            localStorage.setItem('nuurgym_token', token);
            localStorage.setItem('nuurgym_user', JSON.stringify(user));
            
            setToken(token);
            setUser(user);
        } catch (error: any) {
            throw error.response?.data?.message || 'Erreur de connexion';
        }
    };

    const logout = () => {
        localStorage.removeItem('nuurgym_token');
        localStorage.removeItem('nuurgym_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
