// components/providers/user-provider.tsx
"use client";

import { createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

interface UserContextType {
  user: User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, user }: { children: ReactNode; user: User | null }) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
