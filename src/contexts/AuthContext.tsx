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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          // Try to refresh user data from API
          try {
            const freshUserData = await apiService.getCurrentUser();
            setUser(freshUserData);
          } catch (error) {
            // If API fails, use cached data
            console.warn("Failed to refresh user data, using cached:", error);
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { user: userData } = await apiService.login(email, password);
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear local data even if API call fails
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (user) {
        const updatedUser = await apiService.getCurrentUser();
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("User refresh failed:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
