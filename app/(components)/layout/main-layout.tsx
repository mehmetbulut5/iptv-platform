'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/use-auth';
import { usePreferencesStore } from '@/app/lib/store/preferences-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Tv, 
  Film, 
  Clapperboard, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Search
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userInfo, logout, checkSession } = useAuth();
  const { preferences } = usePreferencesStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid && pathname !== '/auth/login') {
      router.push('/auth/login');
    }
  }, [pathname, router, checkSession]);
  
  // Get current tab value based on pathname
  const getCurrentTab = () => {
    if (pathname.startsWith('/live-tv')) return 'live-tv';
    if (pathname.startsWith('/movies')) return 'movies';
    if (pathname.startsWith('/series')) return 'series';
    return 'home';
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setIsMobileMenuOpen(false);
    router.push(`/${value === 'home' ? '' : value}`);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // Get username from user info
  const username = userInfo?.user_info?.username || 'User';
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo and mobile menu button */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">IPTV Platform</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <Tabs value={getCurrentTab()} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="home" className="flex items-center gap-1">
                  <Home size={16} />
                  <span>Home</span>
                </TabsTrigger>
                <TabsTrigger value="live-tv" className="flex items-center gap-1">
                  <Tv size={16} />
                  <span>Live TV</span>
                </TabsTrigger>
                <TabsTrigger value="movies" className="flex items-center gap-1">
                  <Film size={16} />
                  <span>Movies</span>
                </TabsTrigger>
                <TabsTrigger value="series" className="flex items-center gap-1">
                  <Clapperboard size={16} />
                  <span>Series</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Search and User Menu */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search size={20} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={username} />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 flex flex-col bg-background p-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Button 
              variant={getCurrentTab() === 'home' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => handleTabChange('home')}
            >
              <Home className="mr-2 h-5 w-5" />
              <span>Home</span>
            </Button>
            <Button 
              variant={getCurrentTab() === 'live-tv' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => handleTabChange('live-tv')}
            >
              <Tv className="mr-2 h-5 w-5" />
              <span>Live TV</span>
            </Button>
            <Button 
              variant={getCurrentTab() === 'movies' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => handleTabChange('movies')}
            >
              <Film className="mr-2 h-5 w-5" />
              <span>Movies</span>
            </Button>
            <Button 
              variant={getCurrentTab() === 'series' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => handleTabChange('series')}
            >
              <Clapperboard className="mr-2 h-5 w-5" />
              <span>Series</span>
            </Button>
          </div>
          
          <div className="mt-auto flex flex-col gap-2">
            <Button 
              variant="ghost" 
              className="justify-start" 
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push('/profile');
              }}
            >
              <User className="mr-2 h-5 w-5" />
              <span>Profile</span>
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start" 
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push('/settings');
              }}
            >
              <Settings className="mr-2 h-5 w-5" />
              <span>Settings</span>
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-red-500" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} IPTV Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-muted-foreground hover:underline">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}