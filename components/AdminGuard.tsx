'use client';

import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

interface AdminContextType {
  token: string;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminGuard');
  }
  return context;
}

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (!storedToken) {
      router.replace('/admin/login');
    } else {
      setToken(storedToken);
    }
    setIsChecking(false);
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    router.replace('/admin/login');
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <AdminContext.Provider value={{ token, logout }}>
      {children}
    </AdminContext.Provider>
  );
}
