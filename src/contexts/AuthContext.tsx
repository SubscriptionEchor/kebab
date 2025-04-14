import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../lib/graphql/mutations/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  savedCredentials: { email: string; password: string; timestamp: number } | null;
  userEmail: string | null;
  userId: string | null;
  userType: 'ADMIN' | 'VENDOR' | null;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = 'kebab_admin_auth';
const REMEMBER_ME_KEY = 'kebab_remember_me';

interface AuthData {
  isAuthenticated: boolean;
  email: string;
  userType: 'ADMIN' | 'VENDOR';
  userId: string;
  token: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [savedCredentials, setSavedCredentials] = useState<{ email: string; password: string; timestamp: number } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<'ADMIN' | 'VENDOR' | null>(null);
  const [loginMutation] = useMutation(LOGIN_MUTATION);

  // Clear any existing auth data if invalid
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth) {
      try {
        JSON.parse(savedAuth);
      } catch (error) {
        localStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserId(null);
        setUserType(null);
      }
    }
  }, []);

  // Load auth state from localStorage on initial mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    const savedCreds = localStorage.getItem(REMEMBER_ME_KEY);

    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth) as AuthData;
        setIsAuthenticated(true);
        setUserEmail(authData.email);
        setUserId(authData.userId);
        setUserType(authData.userType);
      } catch (error) {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    
    if (savedCreds) {
      try {
        const creds = JSON.parse(savedCreds);
        // Check if credentials are still valid (30 days)
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - creds.timestamp < thirtyDaysInMs) {
          setSavedCredentials(creds);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
      } catch (error) {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
    
    // Mark loading as complete
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const { data } = await loginMutation({
        variables: { email, password },
        errorPolicy: 'all'
      });

      if (data?.ownerLogin) {
        const { token, email, userType: responseUserType, userId } = data.ownerLogin;
        
        // Validate response data
        if (!token || !email || !responseUserType || !userId) {
          throw new Error('Invalid response from server');
        }

        // Convert userType to uppercase for consistency
        const normalizedUserType = responseUserType.toUpperCase() as 'ADMIN' | 'VENDOR';

        setIsAuthenticated(true);
        setUserEmail(email);
        setUserId(userId);
        setUserType(normalizedUserType);

        // Always store auth data for session persistence
        const authData = {
          isAuthenticated: true,
          email,
          userType: normalizedUserType,
          userId,
          token
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        
        // Store credentials only if rememberMe is true
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({ 
            email, 
            password,
            timestamp: Date.now()
          }));
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }

        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred during login');
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserId(null);
    setUserType(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading,
      userEmail, 
      userId, 
      userType, 
      signIn, 
      signOut,
      savedCredentials 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}