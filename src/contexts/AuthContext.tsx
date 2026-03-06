import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../api/services/auth.service";
import type { UserProfile } from "../api/services/auth.service";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    accessToken: string,
    refreshToken: string,
    userData: UserProfile,
  ) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const profile = await authService.getMe();
        setUser(profile);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      navigate("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [navigate]);

  const login = (
    _accessToken: string,
    _refreshToken: string,
    userData: UserProfile,
  ) => {
    // Tokens are now securely managed via HttpOnly cookies by the backend
    setUser(userData);
    navigate("/");
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getMe();
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh user profile", error);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
