import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signIn,
  signOut,
  signUp,
  resetPassword,
  updateProfile,
  AuthUser,
  AuthContextType,
} from "../lib/auth";
import { supabase, isSupabaseMockMode } from "../lib/supabase";

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Auto-enable test mode if Supabase is not configured
  const [isTestMode, setIsTestMode] = useState(isSupabaseMockMode);

  // Initialize auth state
  useEffect(() => {
    if (isTestMode || isSupabaseMockMode) {
      // Set a test user in test/mock mode
      setUser({
        id: "test-user",
        email: "test@example.com",
        role: "admin",
        display_name: "Test User",
      });
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single();

          setUser({
            id: data.session.user.id,
            email: data.session.user.email || "",
            ...profileData,
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            ...profileData,
          });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      },
    );

    // Cleanup subscription
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [isTestMode]);

  // Auth methods
  const handleSignIn = async (email: string, password: string) => {
    if (isTestMode || isSupabaseMockMode) {
      setUser({
        id: "test-user",
        email,
        role: "admin",
        display_name: "Test User",
      });
      return { error: null, data: { user: { id: "test-user", email } } };
    }

    setLoading(true);
    setError(null);
    const { error, data } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return { error, data: null };
    }
    return { error: null, data };
  };

  const handleSignUp = async (email: string, password: string) => {
    if (isTestMode || isSupabaseMockMode) {
      return { error: null, data: { user: { id: "test-user", email } } };
    }

    setLoading(true);
    setError(null);
    const { error, data } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return { error, data: null };
    }
    return { error: null, data };
  };

  const handleSignOut = async () => {
    if (isTestMode || isSupabaseMockMode) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);
    await signOut();
    setUser(null);
    setLoading(false);
  };

  const handleResetPassword = async (email: string) => {
    if (isTestMode || isSupabaseMockMode) {
      return {
        error: null,
        data: { message: "Password reset email sent (test mode)" },
      };
    }

    setLoading(true);
    setError(null);
    const { error, data } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
      return { error, data: null };
    }
    return { error: null, data };
  };

  const handleUpdateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) {
      return { error: new Error("User not authenticated"), data: null };
    }

    if (isTestMode || isSupabaseMockMode) {
      setUser({ ...user, ...updates });
      return { error: null, data: updates };
    }

    setLoading(true);
    setError(null);
    const { error, data } = await updateProfile(user, updates);
    setLoading(false);
    if (error) {
      setError(error);
      return { error, data: null };
    }
    setUser({ ...user, ...updates });
    return { error: null, data };
  };

  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    isTestMode,
    toggleTestMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
