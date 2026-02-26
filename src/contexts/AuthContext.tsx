import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "@/lib/apiService";
import type { User } from "@/lib/apiService";
import { STORAGE_KEYS } from "@/lib/config";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Mock authentication - UI only, no backend authentication
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data for UI display
  const mockUser: User = {
    id: 1,
    username: "demo_user",
    email: "demo@palmastro.com",
    first_name: "Demo",
    last_name: "User",
    avatar: "",
    is_premium: false,
    subscription_status: "free",
    current_plan: "stellar_seeker",
    date_joined: new Date().toISOString(),
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - just set user for UI display, no backend call
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(mockUser);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    // Mock logout - just clear user, no backend call
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    // Mock refresh - no backend call
    if (user) {
      setUser(mockUser);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user, // Show authenticated when user is set
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
