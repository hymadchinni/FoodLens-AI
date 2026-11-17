import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthContextValue {
  firebaseUser: User | null;
  isDemoMode: boolean;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<boolean>;
  enterDemoSession: () => void;
  signOutUser: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idTokenInMemory, setIdTokenInMemory] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdTokenInMemory(token);
          setIsDemoMode(false);
        } catch (err) {
          console.error('Error retrieving ID token:', err);
        }
      } else {
        setIdTokenInMemory(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      setIdTokenInMemory(token);
      setIsDemoMode(false);
      return true;
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      setAuthError(
        error?.message ||
          'Google Sign-In popup could not complete. You can retry or launch the interactive Demo Profile.'
      );
      return false;
    }
  };

  const enterDemoSession = () => {
    setAuthError(null);
    setIsDemoMode(true);
  };

  const signOutUser = async () => {
    setIsDemoMode(false);
    setIdTokenInMemory(null);
    if (firebaseUser) {
      await firebaseSignOut(auth);
    }
  };

  const getAuthToken = async (): Promise<string | null> => {
    if (isDemoMode) {
      return 'DEMO_MODE_SESSION_TOKEN';
    }
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return idTokenInMemory;
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        isDemoMode,
        authLoading,
        authError,
        signInWithGoogle,
        enterDemoSession,
        signOutUser,
        getAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
