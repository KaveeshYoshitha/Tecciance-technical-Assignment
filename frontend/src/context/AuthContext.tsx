import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import axiosClient from "../api/axiosClient";

export type AuthUser = {
  id?: number | string;
  name?: string;
  email?: string;
} | null;

type AuthContextValue = {
  user: AuthUser;
  setUser: React.Dispatch<React.SetStateAction<AuthUser>>;
  loadingUser: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    // Backend doesn't implement /auth/me yet.
    // Preserve any user set during login and hydrate from localStorage.
    const token = window.localStorage.getItem("token");
    const email = window.localStorage.getItem("userEmail");
    const name = window.localStorage.getItem("userName");

    if (token && (email || name)) {
      setUser({ email: email || undefined, name: name || undefined });
    }

    setLoadingUser(false);
  }, []);

  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout", {});
    } catch (err) {
      // keep console log behavior from prior version
      // eslint-disable-next-line no-console
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, setUser, loadingUser, logout }),
    [user, loadingUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
