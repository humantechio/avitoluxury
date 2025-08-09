import { ViewportConfig } from 'next';

export const viewport: ViewportConfig = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#272420' }
  ],
  viewportFit: 'cover'
} 