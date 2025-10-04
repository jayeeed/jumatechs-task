import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthTokens } from "@/types/auth";
import { authApi } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  logout: () => void;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load tokens from localStorage on mount
    const storedTokens = localStorage.getItem("authTokens");
    const storedUser = localStorage.getItem("user");
    
    if (storedTokens && storedUser) {
      const parsedTokens = JSON.parse(storedTokens);
      const parsedUser = JSON.parse(storedUser);
      
      // Verify token is still valid
      authApi.verifyToken(parsedTokens.access).then((isValid) => {
        if (isValid) {
          setTokens(parsedTokens);
          setUser(parsedUser);
        } else {
          // Try to refresh
          authApi
            .refreshToken(parsedTokens.refresh)
            .then((response) => {
              const newTokens = { ...parsedTokens, access: response.access };
              setTokens(newTokens);
              setUser(parsedUser);
              localStorage.setItem("authTokens", JSON.stringify(newTokens));
            })
            .catch(() => {
              // Refresh failed, clear everything
              localStorage.removeItem("authTokens");
              localStorage.removeItem("user");
            });
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const tokens = await authApi.login({ username, password });
      
      // Store tokens
      setTokens(tokens);
      localStorage.setItem("authTokens", JSON.stringify(tokens));

      // For now, we'll extract user info from token or create a placeholder
      // In a real app, you might have a /me endpoint
      const mockUser: User = {
        id: 1,
        username,
        email: `${username}@example.com`,
        first_name: "",
        last_name: "",
      };
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
  }) => {
    try {
      const response = await authApi.signup(data);
      
      toast({
        title: "Success",
        description: response.message,
      });

      // Auto-login after signup
      await login(data.username, data.password);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Signup failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    if (tokens?.refresh) {
      authApi.logout(tokens.refresh).catch(() => {
        // Ignore logout errors
      });
    }
    
    setUser(null);
    setTokens(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const getAccessToken = () => {
    return tokens?.access || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!tokens,
        isLoading,
        login,
        signup,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
