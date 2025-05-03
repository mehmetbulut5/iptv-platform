import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/auth-store';
import { useContentStore } from '@/app/lib/store/content-store';
import { xtreamService } from '@/app/lib/api/xtream';
import { XtreamCredentials } from '@/app/lib/types/xtream';
import { UserSession } from '@/app/lib/types/app';

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Auth store
  const { 
    session, 
    userInfo, 
    isAuthenticated, 
    setSession, 
    setUserInfo, 
    clearSession 
  } = useAuthStore();
  
  // Content store
  const { clearAllContent } = useContentStore();
  
  // Check for existing session on initialization
  useEffect(() => {
    if (!isInitialized) {
      // Check if we should auto-login with environment variables
      const useEnvCredentials = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' && 
                               process.env.NEXT_PUBLIC_XTREAM_URL && 
                               process.env.NEXT_PUBLIC_XTREAM_USERNAME && 
                               process.env.NEXT_PUBLIC_XTREAM_PASSWORD;
      
      // Force login in development mode if configured
      const forceDevelopmentLogin = false; // Set to true to force login in development
      
      if ((process.env.NODE_ENV === 'development' && forceDevelopmentLogin) || 
          (useEnvCredentials && !isAuthenticated)) {
        
        console.log('Auto-login with environment credentials');
        
        if (useEnvCredentials) {
          // Auto-login with environment variables
          login({
            serverUrl: process.env.NEXT_PUBLIC_XTREAM_URL || '',
            username: process.env.NEXT_PUBLIC_XTREAM_USERNAME || '',
            password: process.env.NEXT_PUBLIC_XTREAM_PASSWORD || ''
          });
        } else {
          // Just clear session and redirect to login
          clearSession();
        }
        
        setIsInitialized(true);
        
        if (!window.location.pathname.includes('/auth/login')) {
          router.push('/auth/login');
        }
      } else {
        // Normal session check
        const isValid = checkSession();
        setIsInitialized(true);
        
        // If we're on the login page but have a valid session, redirect to home
        if (isValid && window.location.pathname.includes('/auth/login')) {
          router.push('/');
        }
        
        // If we're not on the login page and don't have a valid session, redirect to login
        if (!isValid && !window.location.pathname.includes('/auth/login')) {
          router.push('/auth/login');
        }
      }
    }
  // Deliberately omit checkSession and login from dependencies to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, router, isAuthenticated]);
  
  /**
   * Login with Xtream Codes credentials
   */
  const login = async (credentials: XtreamCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Set credentials in the service
      // The service will handle whether to use mock API or real API
      xtreamService.setCredentials(credentials);
      
      // Authenticate with the API
      const userInfoResponse = await xtreamService.authenticate();
      
      // Check if authentication was successful
      if (!userInfoResponse.user_info || userInfoResponse.user_info.auth !== 1) {
        throw new Error('Authentication failed: Invalid credentials');
      }
      
      // Create session
      const newSession: UserSession = {
        serverUrl: credentials.serverUrl,
        username: credentials.username,
        password: credentials.password,
        expiresAt: userInfoResponse.user_info.exp_date,
        isActive: true,
      };
      
      // Store session and user info
      setSession(newSession);
      setUserInfo(userInfoResponse);
      
      // Redirect to home page
      router.push('/');
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Logout and clear session
   */
  const logout = () => {
    clearSession();
    clearAllContent();
    router.push('/auth/login');
  };
  
  /**
   * Check if the session is valid
   */
  const checkSession = (): boolean => {
    if (!session || !isAuthenticated) {
      return false;
    }
    
    // Check if session is expired
    if (session.expiresAt) {
      const expiryDate = new Date(session.expiresAt);
      if (expiryDate < new Date()) {
        // Session expired
        clearSession();
        return false;
      }
    }
    
    // Set credentials in the service
    // The service will handle whether to use mock API or real API
    xtreamService.setCredentials({
      serverUrl: session.serverUrl,
      username: session.username,
      password: session.password,
    });
    
    return true;
  };
  
  return {
    session,
    userInfo,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkSession,
  };
}