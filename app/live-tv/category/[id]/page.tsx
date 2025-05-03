'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { useAuth } from '@/app/hooks/use-auth';
import { useContentStore } from '@/app/lib/store/content-store';
import { xtreamService } from '@/app/lib/api/xtream';
import { ContentGrid } from '@/app/(components)/cards/content-grid';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { EnhancedLiveStream } from '@/app/lib/types/app';

export default function LiveTVCategoryPage({ params }: { params: { id: string } }) {
  // Access params directly for now, but in a way that's compatible with future Next.js versions
  const categoryId = params.id;
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    liveCategories, 
    liveStreams,
    setLiveStreams,
    isLoadingLiveStreams,
    setLoadingLiveStreams,
    favorites
  } = useContentStore();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredStreams, setFilteredStreams] = useState<EnhancedLiveStream[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
      return;
    }
    
    // Find category name
    const category = liveCategories.find(c => c.category_id.toString() === categoryId);
    if (category) {
      setCategoryName(category.category_name);
    }
    
    // Load streams for this category
    const loadStreams = async () => {
      try {
        setLoadingLiveStreams(true);
        const catId = parseInt(categoryId);
        const streams = await xtreamService.getLiveStreamsByCategory(catId);
        
        // Enhance streams with favorite status
        const enhancedStreams: EnhancedLiveStream[] = streams.map(stream => ({
          ...stream,
          isFavorite: favorites.some(fav => 
            fav.id === stream.stream_id.toString() && fav.type === 'live'
          ),
          // We'll add EPG data later
          currentProgram: null,
          nextProgram: null,
        }));
        
        setLiveStreams(categoryId, enhancedStreams);
        setFilteredStreams(enhancedStreams);
        setLoadingLiveStreams(false);
      } catch (error) {
        console.error('Error loading live streams for category:', error);
        setLoadingLiveStreams(false);
      }
    };
    
    // Check if we already have streams for this category
    if (!liveStreams[categoryId]) {
      loadStreams();
    } else {
      setFilteredStreams(liveStreams[categoryId] as EnhancedLiveStream[]);
    }
  }, [
    checkSession, 
    router, 
    categoryId, 
    liveCategories, 
    liveStreams,
    setLiveStreams, 
    setLoadingLiveStreams,
    favorites
  ]);
  
  // Filter streams based on search query
  useEffect(() => {
    if (!liveStreams[categoryId]) return;
    
    if (searchQuery.trim() === '') {
      setFilteredStreams(liveStreams[categoryId] as EnhancedLiveStream[]);
    } else {
      const query = searchQuery.toLowerCase();
      const streams = liveStreams[categoryId] as EnhancedLiveStream[];
      const filtered = streams.filter(stream => 
        stream.name.toLowerCase().includes(query)
      );
      setFilteredStreams(filtered);
    }
  }, [searchQuery, liveStreams, categoryId]);
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-3xl font-bold">{categoryName || 'Live TV Category'}</h1>
        
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        {/* Content Grid */}
        <ContentGrid
          liveStreams={filteredStreams}
          isLoading={isLoadingLiveStreams}
          emptyMessage={
            searchQuery.trim() !== '' 
              ? `No channels found matching "${searchQuery}"` 
              : 'No channels found in this category'
          }
        />
      </div>
    </MainLayout>
  );
}