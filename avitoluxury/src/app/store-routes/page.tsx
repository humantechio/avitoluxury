'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StoreRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual store page
    router.push('/store-routes/store');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#272420]">
      <p className="text-white text-lg">Redirecting to store...</p>
    </div>
  );
} 