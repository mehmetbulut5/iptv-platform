'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { useAuth } from '@/app/hooks/use-auth';
import { useContentStore } from '@/app/lib/store/content-store';
import { ContentGrid } from '@/app/(components)/cards/content-grid';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Clock, 
  Star, 
  User, 
  Calendar, 
  LogOut 
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { userInfo, checkSession, logout } = useAuth();
  const { watchHistory, favorites } = useContentStore();
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
    }
  }, [checkSession, router]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  // Get expiration date
  const getExpirationDate = () => {
    if (!userInfo?.user_info?.exp_date) return 'N/A';
    
    const expDate = new Date(parseInt(userInfo.user_info.exp_date) * 1000);
    return formatDate(expDate.toISOString());
  };
  
  // Get subscription status
  const getSubscriptionStatus = () => {
    if (!userInfo?.user_info?.exp_date) return 'Unknown';
    
    const expDate = new Date(parseInt(userInfo.user_info.exp_date) * 1000);
    const now = new Date();
    
    if (expDate < now) {
      return 'Expired';
    }
    
    const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `Active (${daysLeft} days left)`;
  };
  
  // Get subscription status color
  const getStatusColor = () => {
    if (!userInfo?.user_info?.exp_date) return 'text-muted-foreground';
    
    const expDate = new Date(parseInt(userInfo.user_info.exp_date) * 1000);
    const now = new Date();
    
    if (expDate < now) {
      return 'text-red-500';
    }
    
    const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 7) {
      return 'text-amber-500';
    }
    
    return 'text-green-500';
  };
  
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-3xl font-bold">My Profile</h1>
        
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Account Information */}
          <div className="space-y-4 rounded-lg border p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <User size={20} />
              <span>Account Information</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                <p className="text-lg">{userInfo?.user_info?.username || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className={`text-lg ${getStatusColor()}`}>
                  {getSubscriptionStatus()}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Expiration Date</h3>
                <p className="text-lg">{getExpirationDate()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Server URL</h3>
                <p className="text-lg break-all">{userInfo?.server_info?.url || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Server Info</h3>
                <p className="text-lg">
                  {userInfo?.server_info?.name || 'N/A'}
                  {userInfo?.server_info?.version && ` (v${userInfo.server_info.version})`}
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="destructive" 
                  className="gap-2"
                  onClick={() => logout()}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Viewing Statistics */}
          <div className="space-y-4 rounded-lg border p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Clock size={20} />
              <span>Viewing Statistics</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold">{watchHistory.length}</p>
                <p className="text-sm text-muted-foreground">Watched Items</p>
              </div>
              
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold">{favorites.length}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
              
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold">
                  {watchHistory.filter(item => item.type === 'movie').length}
                </p>
                <p className="text-sm text-muted-foreground">Movies Watched</p>
              </div>
              
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold">
                  {watchHistory.filter(item => item.type === 'series').length}
                </p>
                <p className="text-sm text-muted-foreground">Episodes Watched</p>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
              <p className="text-lg">
                {userInfo?.user_info?.created_at 
                  ? formatDate(new Date(parseInt(userInfo.user_info.created_at) * 1000).toISOString())
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <Clock size={16} />
              <span>Watch History</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Star size={16} />
              <span>Favorites</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <ContentGrid
              emptyMessage="Your watch history is empty. Start watching content to see it here."
            >
              {watchHistory.map(item => (
                <div key={`${item.type}-${item.id}`} className="relative">
                  {/* We'll use the ContentCard component here, but we need to adapt the data */}
                  {/* This is a simplified version for now */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs text-white">
                      Last watched: {new Date(item.lastWatched).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </ContentGrid>
          </TabsContent>
          
          <TabsContent value="favorites">
            <ContentGrid
              emptyMessage="You haven't added any favorites yet. Add content to your favorites to see it here."
            >
              {favorites.map(item => (
                <div key={`${item.type}-${item.id}`} className="relative">
                  {/* We'll use the ContentCard component here, but we need to adapt the data */}
                  {/* This is a simplified version for now */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs text-white">
                      Added: {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </ContentGrid>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}