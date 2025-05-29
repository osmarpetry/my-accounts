'use client';

import { useEffect, useState } from 'react';

interface MSWProviderProps {
  children: React.ReactNode;
}

export function MSWProvider({ children }: MSWProviderProps) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      // Only initialize MSW in development or when explicitly enabled
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
        const { initMocks } = await import('@/lib/msw/setup');
        await initMocks();
      }
      setMswReady(true);
    };

    initMSW();
  }, []);

  // Show loading state while MSW is initializing in development
  if (!mswReady && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_API_MOCKING === 'enabled')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing API mocks...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 