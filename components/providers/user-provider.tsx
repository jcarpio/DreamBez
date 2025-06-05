"use client";

import { createContext, useContext, ReactNode } from 'react';

// ✅ Usar el tipo genérico del usuario que viene de getCurrentUser
interface UserContextType {
  user: any; // Será compatible con cualquier tipo de usuario
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, user }: { children: ReactNode; user: any }) {
  // ✅ Debug: Verificar que el provider reciba el usuario
  console.log('UserProvider initialized with user:', user);
  
  return (
    <UserContext.Provider value={{ user: user || null }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  
  // ✅ Debug: Verificar si el context existe
  console.log('useUser called, context:', context);
  
  if (context === undefined) {
    console.error('useUser must be used within a UserProvider');
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
