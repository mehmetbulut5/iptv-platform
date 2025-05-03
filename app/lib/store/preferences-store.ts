import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPreferences, ThemeMode, Language } from '../types/app';

interface PreferencesState {
  // User preferences
  preferences: UserPreferences;
  
  // Actions
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setParentalControl: (enabled: boolean) => void;
  setParentalControlPin: (pin: string) => void;
  setAutoPlayNextEpisode: (enabled: boolean) => void;
  setDefaultSubtitleLanguage: (language: string | null) => void;
  setDefaultAudioLanguage: (language: string | null) => void;
  setBufferSize: (size: number) => void;
  setSendAnonymousUsageData: (enabled: boolean) => void;
  resetPreferences: () => void;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  parentalControlEnabled: false,
  parentalControlPin: '0000',
  autoPlayNextEpisode: true,
  defaultSubtitleLanguage: null,
  defaultAudioLanguage: null,
  bufferSize: 30, // 30 seconds
  sendAnonymousUsageData: false,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      // Initial state
      preferences: defaultPreferences,
      
      // Actions
      setTheme: (theme: ThemeMode) => 
        set((state) => ({ 
          preferences: { 
            ...state.preferences, 
            theme 
          } 
        })),
      
      setLanguage: (language: Language) => 
        set((state) => ({ 
          preferences: { 
            ...state.preferences, 
            language 
          } 
        })),
      
      setParentalControl: (enabled: boolean) => 
        set((state) => ({ 
          preferences: { 
            ...state.preferences, 
            parentalControlEnabled: enabled 
          } 
        })),
      
      setParentalControlPin: (pin: string) => 
        set((state) => ({ 
          preferences: { 
            ...state.preferences, 
            parentalControlPin: pin 
          } 
        })),
      
      setAutoPlayNextEpisode: (enabled: boolean) => 
        set((state) => ({ 
          preferences: { 
            ...state.preferences, 
            autoPlayNextEpisode: enabled 
          } 
        })),
      
      setDefaultSubtitleLanguage: (language: string | null) => 
        set((state) => ({ 
          preferences: { 
            ...state.preferences, 
            defaultSubtitleLanguage: language 
          } 
        })),
      
      setDefaultAudioLanguage: (language: string | null) => 
        set((state) => ({ 
          preferences: { 
            ...state.preferences, 
            defaultAudioLanguage: language 
          } 
        })),
      
      setBufferSize: (size: number) => 
        set((state) => ({ 
          preferences: { 
            ...state.preferences, 
            bufferSize: size 
          } 
        })),
      
      setSendAnonymousUsageData: (enabled: boolean) => 
        set((state) => ({ 
          preferences: { 
            ...state.preferences, 
            sendAnonymousUsageData: enabled 
          } 
        })),
      
      resetPreferences: () => 
        set({ preferences: defaultPreferences }),
    }),
    {
      name: 'preferences-storage',
    }
  )
);