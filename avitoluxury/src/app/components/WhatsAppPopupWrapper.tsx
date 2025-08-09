'use client';

import dynamic from 'next/dynamic';

// Import WhatsAppPopup with client-side only rendering
const WhatsAppPopup = dynamic(() => import('./WhatsAppPopup'), { ssr: false });

interface WhatsAppPopupWrapperProps {
  phoneNumber: string;
  message?: string;
}

export default function WhatsAppPopupWrapper({ phoneNumber, message }: WhatsAppPopupWrapperProps) {
  return <WhatsAppPopup phoneNumber={phoneNumber} message={message} />;
} 