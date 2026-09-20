"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LoginResponse } from "@/types/auth";
import { cookieStorage } from "@/utils/cookie";
import { extractRoleFromToken } from "@/utils/jwt";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  handleLoginSuccess: (data: LoginResponse, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Restore auth state from Cookies on initial load
  useEffect(() => {
    const savedToken = cookieStorage.getToken();
    const savedFullName = cookieStorage.getFullName();
    const savedRole = cookieStorage.getRole();

    if (savedToken && savedFullName) {
      const roleFromJwt = extractRoleFromToken(savedToken);
      const effectiveRole = savedRole || roleFromJwt || "Customer";

      setToken(savedToken);
      setUser({
        fullName: savedFullName,
        email: "",
        role: effectiveRole,
      });
    }
    setIsLoading(false);
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLoginSuccess = (data: LoginResponse, email: string) => {
    // 1. Extract Role from token or API response
    const roleFromToken = extractRoleFromToken(data.token);
    const userRole = data.role || roleFromToken || "Customer";

    // 2. Save token, fullName, role to Cookies
    cookieStorage.setToken(data.token);
    cookieStorage.setFullName(data.fullName);
    cookieStorage.setRole(userRole);

    // 3. Update React State
    setToken(data.token);
    setUser({
      fullName: data.fullName,
      email: email,
      role: userRole,
    });

    // 4. Close modal
    closeLoginModal();

    // 5. Role-based Navigation
    // Admin -> /admin, Customer -> /
    if (userRole.toLowerCase() === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  const logout = () => {
    cookieStorage.clearAuth();
    setToken(null);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token && !!user,
        isAdmin: user?.role?.toLowerCase() === "admin",
        isLoading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        handleLoginSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
