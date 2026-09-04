import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirebaseLive: boolean;
  registerWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  guestMode: boolean;
  setGuestMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const isFirebaseLive = isFirebaseConfigured();

  useEffect(() => {
    if (!isFirebaseLive) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [isFirebaseLive]);

  const registerWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseLive) {
      // In guest or unconfigured mode, simulate instant login
      setGuestMode(true);
      return { success: true };
    }
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseLive) {
      setGuestMode(true);
      return { success: true };
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    if (isFirebaseLive) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setGuestMode(false);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      isFirebaseLive,
      registerWithEmail,
      loginWithEmail,
      logout,
      guestMode,
      setGuestMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
