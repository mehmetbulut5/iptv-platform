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
  // Deliberately omit checkSession from dependencies to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, router]);
  
  /**
   * Login with Xtream Codes credentials
   */
  const login = async (credentials: XtreamCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In development mode, always use mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for authentication in development mode');
        
        // Create a mock user info response
        const mockUserInfo = {
          user_info: {
            username: credentials.username,
            password: credentials.password,
            message: 'Welcome to IPTV Platform',
            auth: 1,
            status: 'Active',
            exp_date: '2025-12-31',
            is_trial: 0,
            active_cons: 1,
            created_at: '2023-01-01',
            max_connections: 1,
            allowed_output_formats: ['m3u8', 'ts', 'rtmp']
          },
          server_info: {
            url: credentials.serverUrl,
            port: '8080',
            https_port: '443',
            server_protocol: 'http',
            rtmp_port: '1935',
            timezone: 'Europe/London',
            timestamp_now: Math.floor(Date.now() / 1000),
            time_now: new Date().toISOString()
          }
        };
        
        // Create session
        const newSession: UserSession = {
          serverUrl: credentials.serverUrl,
          username: credentials.username,
          password: credentials.password,
          expiresAt: '2025-12-31',
          isActive: true,
        };
        
        // Set credentials in the service (this will use the mock API)
        xtreamService.setCredentials({
          serverUrl: '/api/mock', // Use our mock API
          username: credentials.username,
          password: credentials.password,
        });
        
        // Store session and user info
        setSession(newSession);
        setUserInfo(mockUserInfo);
        
        // Redirect to home page
        router.push('/');
        
        return true;
      } else {
        // Production mode - use real API
        // Set credentials in the service
        xtreamService.setCredentials(credentials);
        
        // Authenticate with the API
        const userInfoResponse = await xtreamService.authenticate();
        
        // Check if authentication was successful
        if (userInfoResponse.user_info.auth !== 1) {
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
      }
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
    
    // In development mode, always use mock API
    if (process.env.NODE_ENV === 'development') {
      xtreamService.setCredentials({
        serverUrl: '/api/mock', // Use our mock API
        username: session.username,
        password: session.password,
      });
    } else {
      // Production mode - use real API
      xtreamService.setCredentials({
        serverUrl: session.serverUrl,
        username: session.username,
        password: session.password,
      });
    }
    
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