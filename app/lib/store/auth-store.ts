import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { XtreamUserInfo } from '../types/xtream';
import { UserSession } from '../types/app';

interface AuthState {
  // User session
  session: UserSession | null;
  userInfo: XtreamUserInfo | null;
  
  // Auth status
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: UserSession) => void;
  setUserInfo: (userInfo: XtreamUserInfo) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      session: null,
      userInfo: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Actions
      setSession: (session: UserSession) => 
        set({ 
          session, 
          isAuthenticated: true,
          error: null 
        }),
      
      setUserInfo: (userInfo: XtreamUserInfo) => 
        set({ userInfo }),
      
      clearSession: () => 
        set({ 
          session: null, 
          userInfo: null, 
          isAuthenticated: false,
          error: null 
        }),
      
      setLoading: (isLoading: boolean) => 
        set({ isLoading }),
      
      setError: (error: string | null) => 
        set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        session: state.session,
        userInfo: state.userInfo,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);