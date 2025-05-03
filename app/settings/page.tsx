'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { useAuth } from '@/app/hooks/use-auth';
import { usePreferencesStore } from '@/app/lib/store/preferences-store';
import { useContentStore } from '@/app/lib/store/content-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Languages, 
  Shield, 
  Volume2, 
  Subtitles, 
  Info, 
  Trash2 
} from 'lucide-react';
import { ThemeMode, Language } from '@/app/lib/types/app';

export default function SettingsPage() {
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    preferences, 
    setTheme, 
    setLanguage, 
    setParentalControl, 
    setParentalControlPin, 
    setAutoPlayNextEpisode, 
    setDefaultSubtitleLanguage, 
    setDefaultAudioLanguage, 
    setBufferSize, 
    setSendAnonymousUsageData, 
    resetPreferences 
  } = usePreferencesStore();
  const { clearWatchHistory, clearFavorites } = useContentStore();
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
    }
  }, [checkSession, router]);
  
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-3xl font-bold">Settings</h1>
        
        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="playback">Playback</TabsTrigger>
            <TabsTrigger value="parental">Parental Control</TabsTrigger>
            <TabsTrigger value="data">Data & Privacy</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
              <h2 className="text-xl font-semibold">Theme</h2>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant={preferences.theme === 'light' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  onClick={() => setTheme('light')}
                >
                  <Sun size={16} />
                  <span>Light</span>
                </Button>
                <Button
                  variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={16} />
                  <span>Dark</span>
                </Button>
                <Button
                  variant={preferences.theme === 'system' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  onClick={() => setTheme('system')}
                >
                  <Monitor size={16} />
                  <span>System</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 rounded-lg border p-4">
              <h2 className="text-xl font-semibold">Language</h2>
              <div className="flex max-w-md items-center gap-4">
                <Languages size={20} />
                <Select
                  value={preferences.language}
                  onValueChange={(value) => setLanguage(value as Language)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          {/* Playback Settings */}
          <TabsContent value="playback" className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
              <h2 className="text-xl font-semibold">Playback Options</h2>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="font-medium">Auto-play next episode</span>
                  <span className="text-sm text-muted-foreground">
                    Automatically play the next episode when the current one ends
                  </span>
                </div>
                <Switch
                  checked={preferences.autoPlayNextEpisode}
                  onCheckedChange={setAutoPlayNextEpisode}
                />
              </div>
              
              <div className="space-y-2 py-2">
                <div className="flex flex-col">
                  <span className="font-medium">Buffer size</span>
                  <span className="text-sm text-muted-foreground">
                    Adjust the buffer size for smoother playback (higher values use more memory)
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[preferences.bufferSize]}
                    min={10}
                    max={120}
                    step={10}
                    onValueChange={(value) => setBufferSize(value[0])}
                  />
                  <span className="w-12 text-right">{preferences.bufferSize}s</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 rounded-lg border p-4">
              <h2 className="text-xl font-semibold">Language Preferences</h2>
              
              <div className="flex max-w-md items-center gap-4 py-2">
                <Subtitles size={20} />
                <div className="flex-1">
                  <span className="font-medium">Default subtitle language</span>
                </div>
                <Select
                  value={preferences.defaultSubtitleLanguage || ''}
                  onValueChange={(value) => setDefaultSubtitleLanguage(value || null)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Turkish</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex max-w-md items-center gap-4 py-2">
                <Volume2 size={20} />
                <div className="flex-1">
                  <span className="font-medium">Default audio language</span>
                </div>
                <Select
                  value={preferences.defaultAudioLanguage || ''}
                  onValueChange={(value) => setDefaultAudioLanguage(value || null)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Original" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Original</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Turkish</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          {/* Parental Control Settings */}
          <TabsContent value="parental" className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
              <h2 className="text-xl font-semibold">Parental Controls</h2>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="font-medium">Enable parental controls</span>
                  <span className="text-sm text-muted-foreground">
                    Restrict access to adult content with a PIN
                  </span>
                </div>
                <Switch
                  checked={preferences.parentalControlEnabled}
                  onCheckedChange={setParentalControl}
                />
              </div>
              
              {preferences.parentalControlEnabled && (
                <div className="space-y-2 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">Parental control PIN</span>
                    <span className="text-sm text-muted-foreground">
                      Set a 4-digit PIN to protect restricted content
                    </span>
                  </div>
                  <div className="flex max-w-xs gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      className="w-full rounded-md border px-3 py-2"
                      value={preferences.parentalControlPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 4) {
                          setParentalControlPin(value);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setParentalControlPin('0000')}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Data & Privacy Settings */}
          <TabsContent value="data" className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
              <h2 className="text-xl font-semibold">Privacy</h2>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="font-medium">Send anonymous usage data</span>
                  <span className="text-sm text-muted-foreground">
                    Help improve the app by sending anonymous usage statistics
                  </span>
                </div>
                <Switch
                  checked={preferences.sendAnonymousUsageData}
                  onCheckedChange={setSendAnonymousUsageData}
                />
              </div>
            </div>
            
            <div className="space-y-4 rounded-lg border p-4">
              <h2 className="text-xl font-semibold">Data Management</h2>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="font-medium">Clear watch history</span>
                  <span className="text-sm text-muted-foreground">
                    Remove all items from your watch history
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your watch history?')) {
                      clearWatchHistory();
                    }
                  }}
                >
                  <Trash2 size={16} />
                  <span>Clear</span>
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="font-medium">Clear favorites</span>
                  <span className="text-sm text-muted-foreground">
                    Remove all items from your favorites
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your favorites?')) {
                      clearFavorites();
                    }
                  }}
                >
                  <Trash2 size={16} />
                  <span>Clear</span>
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="font-medium">Reset all settings</span>
                  <span className="text-sm text-muted-foreground">
                    Restore all settings to their default values
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all settings to default?')) {
                      resetPreferences();
                    }
                  }}
                >
                  <Trash2 size={16} />
                  <span>Reset</span>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* About Settings */}
          <TabsContent value="about" className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
              <h2 className="text-xl font-semibold">About</h2>
              
              <div className="space-y-2">
                <h3 className="font-medium">IPTV Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Version 1.0.0
                </p>
                <p className="text-sm text-muted-foreground">
                  A modern IPTV/OTT platform with live TV, movies, and series.
                </p>
              </div>
              
              <div className="space-y-2 pt-4">
                <h3 className="font-medium">Credits</h3>
                <p className="text-sm text-muted-foreground">
                  This application uses the following services and libraries:
                </p>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  <li>Next.js - React framework</li>
                  <li>Tailwind CSS - Utility-first CSS framework</li>
                  <li>shadcn/ui - UI components</li>
                  <li>Framer Motion - Animation library</li>
                  <li>HLS.js - HTTP Live Streaming</li>
                  <li>TMDB - The Movie Database API</li>
                </ul>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  className="gap-1"
                  onClick={() => window.open('https://github.com', '_blank')}
                >
                  <Info size={16} />
                  <span>More Information</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}