import './lib/localStorage-polyfill';
import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import "./styles/cross-browser.css";
import { AuthProvider } from "./components/AuthProvider";
import { Suspense } from 'react';
import Script from "next/script";
import ClientLayout from './components/ClientLayout';
import WhatsAppPopupWrapper from './components/WhatsAppPopupWrapper';

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AVITO LUXURY | Premium Fragrances",
  description: "Discover luxury fragrances and premium perfumes at A V I T O   S C E N T S.",
  icons: {
    icon: '/avito3-12.png',
    apple: '/avito3-12.png',
  },

  formatDetection: {
    telephone: true,
    date: false,
    address: false,
    email: true,
    url: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
       {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-17157980266" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17157980266');
          `}
        </Script>
      </head>
      <body
        className={`${montserrat.variable} ${playfairDisplay.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
            <WhatsAppPopupWrapper phoneNumber="919928200900" />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
