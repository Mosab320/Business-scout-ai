import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { fetchMe, loginUser, registerUser } from "../services/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("bsa_user");
    const token = localStorage.getItem("bsa_token");
    if (stored && token) {
      setUser(JSON.parse(stored));
      fetchMe()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem("bsa_user", JSON.stringify(freshUser));
        })
        .catch(() => {
          localStorage.removeItem("bsa_token");
          localStorage.removeItem("bsa_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const { access_token, user: loggedInUser } = await loginUser(email, password);
    localStorage.setItem("bsa_token", access_token);
    localStorage.setItem("bsa_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  async function register(name: string, email: string, password: string) {
    const { access_token, user: newUser } = await registerUser(name, email, password);
    localStorage.setItem("bsa_token", access_token);
    localStorage.setItem("bsa_user", JSON.stringify(newUser));
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("bsa_token");
    localStorage.removeItem("bsa_user");
    setUser(null);
  }

  async function refreshUser() {
    const freshUser = await fetchMe();
    setUser(freshUser);
    localStorage.setItem("bsa_user", JSON.stringify(freshUser));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
