"use client";

import React, { createContext, useState } from "react";
import type { User } from "firebase/auth";
import {
  useFirebase,
  useUser,
  setDocumentNonBlocking,
} from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, pass: string, isAdmin?: boolean) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, firestore, isUserLoading } = useFirebase();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return userCredential;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: error.message || "Verifique suas credenciais e tente novamente.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string, isAdmin = false) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const { user } = userCredential;

      // Create user profile
      const userProfileRef = doc(firestore, "userProfiles", user.uid);
      const userProfileData = {
        id: user.uid,
        firebaseAuthUid: user.uid,
        name,
        email: user.email,
        role: isAdmin ? 'admin' : 'mechanic',
      };
      setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });

      if (isAdmin) {
        // Create admin role
        const adminRoleRef = doc(firestore, "admin_roles", user.uid);
        setDocumentNonBlocking(adminRoleRef, { createdAt: new Date() }, { merge: true });
      }

      return userCredential;
    } catch (error: any) {
      if (error.code !== 'auth/email-already-in-use') {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message || "Ocorreu um problema ao criar a sua conta.",
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message || "Ocorreu um problema ao tentar sair.",
      });
    } finally {
        setLoading(false);
    }
  };

  const value = {
    user,
    loading: isUserLoading || loading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
