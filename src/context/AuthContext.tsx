'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

const AUTH_STORAGE_KEY = 'hiskra_auth';
const SESSION_EXPIRY_DAYS = 7;

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const { user, expiry } = JSON.parse(stored);
      if (Date.now() < expiry) {
        return user;
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  } catch {
    // Ignorar erro
  }
  return null;
}

function saveUser(user: User | null) {
  if (typeof window === 'undefined') return;

  if (user) {
    const expiry = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, expiry }));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// Simulação de hash simples (em produção usar bcrypt)
function hashPassword(password: string): string {
  return btoa(password + 'hiskra_salt_2024');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUser(getInitialUser());
    setIsLoaded(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500));

      const foundUser = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!foundUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      if (!verifyPassword(password, foundUser.passwordHash)) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Remover hash antes de salvar no localStorage
      const { passwordHash, ...userWithoutHash } = foundUser;
      setUser(userWithoutHash as User);
      saveUser(userWithoutHash as User);

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Validações
      if (password.length < 8) {
        return { success: false, error: 'Senha deve ter pelo menos 8 caracteres' };
      }
      if (!/[A-Z]/.test(password)) {
        return { success: false, error: 'Senha deve ter pelo menos uma letra maiúscula' };
      }
      if (!/[0-9]/.test(password)) {
        return { success: false, error: 'Senha deve ter pelo menos um número' };
      }
      if (!/[!@#$%^&*]/.test(password)) {
        return { success: false, error: 'Senha deve ter pelo menos um caractere especial (!@#$%^&*)' };
      }

      const existingUser = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existingUser) {
        return { success: false, error: 'Email já cadastrado' };
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        name,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };

      // Adicionar ao mock (em produção seria API)
      mockUsers.push(newUser);

      const { passwordHash, ...userWithoutHash } = newUser;
      setUser(userWithoutHash as User);
      saveUser(userWithoutHash as User);

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      saveUser(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}