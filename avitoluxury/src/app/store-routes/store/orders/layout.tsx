'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/store/orders');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div>
      {children}
    </div>
  );
} 