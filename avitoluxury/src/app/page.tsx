'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from './lib/client-auth';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to store-routes/store
    router.push('/store-routes/store');
  }, [router]);
  
  // Return a loading state while redirecting
  return (
    <div className="flex items-center justify-center h-screen bg-[#272420]">
      <p className="text-white text-lg">Redirecting...</p>
    </div>
  );
}
