import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth, UserProfile, UserRole } from '@/hooks/useSupabaseAuth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  role: UserRole | null;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useSupabaseAuth();

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await auth.signIn(email, password);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    await auth.signOut();
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'parent'): Promise<{ success: boolean; error?: string }> => {
    const { error } = await auth.signUp(email, password, fullName, role);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await auth.resetPassword(email);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await auth.updatePassword(newPassword);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth.profile,
        isAuthenticated: auth.isAuthenticated,
        loading: auth.loading,
        login,
        logout,
        role: auth.role,
        signUp,
        resetPassword,
        updatePassword,
      }}
    >
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
