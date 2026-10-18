import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/lib/banking/types";
import { authApi } from "@/lib/auth/api";
import { isOnboardingComplete } from "@/lib/onboarding";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, countryCode?: string, password?: string) => Promise<User>;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "boundingcurve.auth.userId";
const TOKEN_KEY = "token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .verifyToken(token)
      .then((res) => {
        const u = res.user;
        setUser({ ...u, id: u.id || u._id } as User);
        localStorage.setItem(STORAGE_KEY, u.id || u._id);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const u = res.user;
    setUser({ ...u, id: u.id || u._id } as User);
    localStorage.setItem(STORAGE_KEY, u.id || u._id);
    localStorage.setItem(TOKEN_KEY, res.token);

    // Auto-redirect based on role
    if (u.isAdmin || u.role === "admin") {
      navigate("/admin");
    } else if (!isOnboardingComplete(u)) {
      navigate("/dashboard/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  const register = async (name: string, email: string, countryCode = "US", password = "ChangeMe123!") => {
    // Step 1: Request verification code
    await authApi.requestRegistrationCode(email);

    // Step 2: Navigate to verification page with ALL registration data
    navigate("/verify-email", {
      state: { email, password, name, countryCode },
    });

    // Return a placeholder - actual registration happens on verify page
    return { email } as User;
  };

  const updateUser = (nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, nextUser.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("adminReturnToken");
    localStorage.removeItem("adminReturnPath");
    navigate("/login");
  };

  const value = useMemo(() => ({ user, loading, login, register, updateUser, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
