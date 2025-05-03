'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/app/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Form validation schema
const loginSchema = z.object({
  serverUrl: z.string().url('Please enter a valid URL'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Form data type
type LoginFormData = z.infer<typeof loginSchema>;

// M3U URL schema
const m3uSchema = z.object({
  m3uUrl: z.string().url('Please enter a valid M3U URL'),
});

type M3UFormData = z.infer<typeof m3uSchema>;

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('xtream');
  
  // Xtream Codes login form
  const xtreamForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      serverUrl: '',
      username: '',
      password: '',
    },
  });
  
  // M3U URL form
  const m3uForm = useForm<M3UFormData>({
    resolver: zodResolver(m3uSchema),
    defaultValues: {
      m3uUrl: '',
    },
  });
  
  // Handle Xtream Codes login
  const handleXtreamLogin = async (data: LoginFormData) => {
    await login(data);
  };
  
  // Handle M3U URL login
  const handleM3ULogin = async (data: M3UFormData) => {
    // Extract credentials from M3U URL if it's an Xtream Codes URL
    // Example: http://domain.com:port/get.php?username=user&password=pass&type=m3u_plus
    try {
      const url = new URL(data.m3uUrl);
      const username = url.searchParams.get('username');
      const password = url.searchParams.get('password');
      
      if (username && password) {
        // Extract the base URL
        const serverUrl = `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`;
        
        // Login with extracted credentials
        await login({
          serverUrl,
          username,
          password,
        });
      } else {
        // TODO: Handle non-Xtream M3U URLs
        alert('Non-Xtream M3U URLs are not supported yet');
      }
    } catch (err) {
      console.error('Error parsing M3U URL:', err);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">IPTV Platform</CardTitle>
          <CardDescription>
            Sign in to your IPTV service
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="xtream" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="xtream">Xtream Codes</TabsTrigger>
            <TabsTrigger value="m3u">M3U URL</TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            {/* Xtream Codes Login Form */}
            <TabsContent value="xtream">
              <Form {...xtreamForm}>
                <form onSubmit={xtreamForm.handleSubmit(handleXtreamLogin)} className="space-y-4">
                  <FormField
                    control={xtreamForm.control}
                    name="serverUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="http://example.com:8080" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={xtreamForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="username" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={xtreamForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="password" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {error && (
                    <div className="text-sm font-medium text-red-500">
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            {/* M3U URL Login Form */}
            <TabsContent value="m3u">
              <Form {...m3uForm}>
                <form onSubmit={m3uForm.handleSubmit(handleM3ULogin)} className="space-y-4">
                  <FormField
                    control={m3uForm.control}
                    name="m3uUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>M3U URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="http://example.com:8080/get.php?username=user&password=pass&type=m3u_plus" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {error && (
                    <div className="text-sm font-medium text-red-500">
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex justify-center text-sm text-slate-500">
          <p>Enter your IPTV service credentials to access content</p>
        </CardFooter>
      </Card>
    </div>
  );
}