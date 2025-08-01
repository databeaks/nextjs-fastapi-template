
'use client';

import { useState, useEffect } from 'react';
import { getHello, checkHealth, fetchData, getUser } from '@/lib/fastapi';
import { ApiData } from '@/types/api';
import { LoadingState, ErrorState } from '@/types/state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, Database, User, Heart } from 'lucide-react';

export default function Home() {
  const [apiData, setApiData] = useState<ApiData>({
    hello: null,
    health: null,
    data: null,
    user: null,
  });
  
  const [loading, setLoading] = useState<LoadingState>({
    hello: true,
    health: true,
    data: true,
    user: true,
  });
  
  const [errors, setErrors] = useState<ErrorState>({
    hello: null,
    health: null,
    data: null,
    user: null,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch Hello data
      try {
        const helloResult = await getHello();
        setApiData(prev => ({ ...prev, hello: helloResult }));
      } catch (error) {
        setErrors(prev => ({ ...prev, hello: error instanceof Error ? error.message : 'Failed to fetch hello data' }));
      } finally {
        setLoading(prev => ({ ...prev, hello: false }));
      }

      // Fetch Health data
      try {
        const healthResult = await checkHealth();
        setApiData(prev => ({ ...prev, health: healthResult }));
      } catch (error) {
        setErrors(prev => ({ ...prev, health: error instanceof Error ? error.message : 'Failed to fetch health data' }));
      } finally {
        setLoading(prev => ({ ...prev, health: false }));
      }

      // Fetch Data
      try {
        const dataResult = await fetchData();
        setApiData(prev => ({ ...prev, data: dataResult }));
      } catch (error) {
        setErrors(prev => ({ ...prev, data: error instanceof Error ? error.message : 'Failed to fetch data' }));
      } finally {
        setLoading(prev => ({ ...prev, data: false }));
      }

      // Fetch User data
      try {
        const userResult = await getUser();
        setApiData(prev => ({ ...prev, user: userResult }));
      } catch (error) {
        setErrors(prev => ({ ...prev, user: error instanceof Error ? error.message : 'Failed to fetch user data' }));
      } finally {
        setLoading(prev => ({ ...prev, user: false }));
      }
    };

    fetchAllData();
  }, []);

  const getEndpointIcon = (title: string) => {
    switch (title) {
      case 'Hello Endpoint':
        return <Server className="h-5 w-5" />;
      case 'Health Check':
        return <Heart className="h-5 w-5" />;
      case 'Data Endpoint':
        return <Database className="h-5 w-5" />;
      case 'User Endpoint':
        return <User className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (isLoading: boolean, error: string | null) => {
    if (isLoading) {
      return <Badge variant="secondary">Loading</Badge>;
    }
    if (error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">Success</Badge>;
  };

  const renderSection = (title: string, data: any, isLoading: boolean, error: string | null) => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getEndpointIcon(title)}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {getStatusBadge(isLoading, error)}
        </div>
        <CardDescription>
          API endpoint: {title === 'Hello Endpoint' ? '/api/hello' : 
                       title === 'Health Check' ? '/api/health' :
                       title === 'Data Endpoint' ? '/api/data' : '/api/user'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        ) : (
          <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-64">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );

  const refreshData = () => {
    // Reset states
    setLoading({
      hello: true,
      health: true,
      data: true,
      user: true,
    });
    setErrors({
      hello: null,
      health: null,
      data: null,
      user: null,
    });
    
    // Trigger re-fetch by calling useEffect logic
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Nextjs + FastAPI Data Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            Real-time data from your FastAPI backend
          </p>
          <Button onClick={refreshData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh All Data
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {renderSection('Hello Endpoint', apiData.hello, loading.hello, errors.hello)}
          {renderSection('Health Check', apiData.health, loading.health, errors.health)}
          {renderSection('Data Endpoint', apiData.data, loading.data, errors.data)}
          {renderSection('User Endpoint', apiData.user, loading.user, errors.user)}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              API Information
            </CardTitle>
            <CardDescription>
              This dashboard displays data retrieved from the FastAPI backend using the functions defined in lib/fastapi.ts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/hello</code>
                  <span className="text-muted-foreground">→ getHello()</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/health</code>
                  <span className="text-muted-foreground">→ checkHealth()</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/data</code>
                  <span className="text-muted-foreground">→ fetchData()</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/user</code>
                  <span className="text-muted-foreground">→ getUser()</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
