import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#272420] text-white">
      <div className="text-center px-4">
        <h1 className="text-6xl font-serif font-bold mb-6">404</h1>
        <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
        <p className="mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        <Link 
          href="/store"
          className="inline-block bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:from-[#a67c00] hover:to-[#b8860b] text-white py-3 px-8 rounded-full"
        >
          Back to Store
        </Link>
      </div>
    </div>
  );
} 