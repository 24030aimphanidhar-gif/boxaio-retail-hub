import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

/**
 * BOXAIO role model.
 * - customer  -> the existing shopping experience (legacy value: "consumer")
 * - retailer  -> the retailer dashboard at /retailer
 * - admin     -> reserved for administrators (not granted by this client)
 * - guest     -> browse-only session
 */
export type UserRole = "customer" | "retailer" | "admin" | "guest";
export type UserType = "consumer" | "retailer" | "admin" | "guest";

export interface UserProfile {
  name: string;
  phone?: string;
  businessName?: string;
  gstNumber?: string;
}

export interface User {
  email: string;
  /** Canonical role used for routing and access control. */
  role: UserRole;
  /** Legacy alias kept so existing customer pages keep working. */
  userType: UserType;
  /** Store the retailer is bound to (retailer role only). */
  storeId?: string;
  profile: UserProfile;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => User;
  guestLogin: () => void;
  register: (data: any, type: UserType | UserRole) => User;
  updateUser: (patch: Partial<Omit<User, "profile">> & { profile?: Partial<UserProfile> }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isGuest: boolean;
  isConsumer: boolean;
  isCustomer: boolean;
  isRetailer: boolean;
  isAdmin: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "boxaio_user";

/** Demo directory used until the backend auth service is wired up. */
const KNOWN_ACCOUNTS: Record<string, { role: UserRole; name: string; storeId?: string }> = {
  "retailer@boxaio.com": { role: "retailer", name: "Vijayawada Fresh Mart", storeId: "store-vja-01" },
  "retailer2@boxaio.com": { role: "retailer", name: "Hyderabad Daily Needs", storeId: "store-hyd-01" },
  "admin@boxaio.com": { role: "admin", name: "BOXAIO Admin" },
};

function roleToUserType(role: UserRole): UserType {
  return role === "customer" ? "consumer" : role;
}

function normalizeRole(value: UserType | UserRole | undefined): UserRole {
  if (value === "consumer" || value === undefined) return "customer";
  return value as UserRole;
}

/** Resolve the role for an email. Replace with a backend lookup when available. */
export function resolveRoleForEmail(email: string): UserRole {
  const known = KNOWN_ACCOUNTS[email.trim().toLowerCase()];
  if (known) return known.role;
  if (/^retailer[.+@]/i.test(email) || email.toLowerCase().includes("+retailer")) return "retailer";
  return "customer";
}

/** Landing route for a role after a successful sign in. */
export function homeRouteForRole(role: UserRole): string {
  if (role === "retailer") return "/retailer";
  if (role === "admin") return "/dashboard";
  return "/";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Read persisted session after hydration to keep SSR output stable.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as User;
      const role = normalizeRole(parsed.role ?? parsed.userType);
      setUser({ ...parsed, role, userType: roleToUserType(role) });
    } catch {
      /* ignore malformed session */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = (email: string) => {
    const key = email.trim().toLowerCase();
    const known = KNOWN_ACCOUNTS[key];
    const role = known?.role ?? resolveRoleForEmail(key);
    const next: User = {
      email,
      role,
      userType: roleToUserType(role),
      ...(known?.storeId ? { storeId: known.storeId } : {}),
      profile: {
        name: known?.name ?? email.split("@")[0],
        ...(role === "retailer" ? { businessName: known?.name ?? "My BOXAIO Store" } : {}),
      },
    };
    setUser(next);
    return next;
  };

  const guestLogin = () => {
    setUser({
      email: "guest@boxaio.com",
      role: "guest",
      userType: "guest",
      profile: { name: "Guest" },
    });
  };

  const register = (data: any, type: UserType | UserRole) => {
    const role = normalizeRole(type);
    const next: User = {
      email: data.email,
      role,
      userType: roleToUserType(role),
      ...(role === "retailer" ? { storeId: `store-${Date.now()}` } : {}),
      profile: {
        name: data.name || data.businessName || data.email,
        ...(data.businessName ? { businessName: data.businessName } : {}),
        ...(data.gstNumber ? { gstNumber: data.gstNumber } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
      },
    };
    setUser(next);
    return next;
  };

  const updateUser: AuthContextType["updateUser"] = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const role = patch.role ? normalizeRole(patch.role) : prev.role;
      return {
        ...prev,
        ...patch,
        role,
        userType: roleToUserType(role),
        profile: { ...prev.profile, ...(patch.profile ?? {}) },
      };
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        guestLogin,
        register,
        updateUser,
        logout,
        isAuthenticated: !!user,
        isGuest: user?.role === "guest",
        isConsumer: user?.role === "customer",
        isCustomer: user?.role === "customer",
        isRetailer: user?.role === "retailer",
        isAdmin: user?.role === "admin",
        role: user?.role ?? null,
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
