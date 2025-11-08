'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';

// This is a mock implementation. In a real app, you'd use Firebase Auth.
// To keep the scaffold simple, we're using a mock user.
const mockUser: User = {
  uid: 'mock-user-id',
  email: 'user@example.com',
  displayName: 'Alex Doe',
  photoURL: 'https://picsum.photos/seed/1/100/100',
  // Add other required User properties with mock data
  providerId: 'password',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    claims: {},
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: 'password',
    signInSecondFactor: null,
    expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
  }),
  reload: async () => {},
  toJSON: () => ({}),
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd use onAuthStateChanged here.
    // For this mock, we'll simulate a logged-in user after a delay.
    const timer = setTimeout(() => {
      // Set to `null` to test the login flow.
      // Set to `mockUser` to test the app as a logged-in user.
      setUser(mockUser); 
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    console.log('Logging in with:', email, pass);
    await new Promise(res => setTimeout(res, 1000)); // Simulate API call
    setUser(mockUser);
    setLoading(false);
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    console.log('Signing up with:', email, pass);
    await new Promise(res => setTimeout(res, 1000)); // Simulate API call
    setUser(mockUser);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500)); // Simulate API call
    setUser(null);
    setLoading(false);
  };

  const value = { user, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
