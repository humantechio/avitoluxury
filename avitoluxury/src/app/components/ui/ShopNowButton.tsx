import Link from 'next/link';

interface ShopNowButtonProps {
  href: string;
  className?: string;
}

export default function ShopNowButton({ href, className = '' }: ShopNowButtonProps) {
  return (
    <Link href={href}>
      <div className={`bg-black text-white px-4 xs:px-6 sm:px-8 py-2 xs:py-2.5 sm:py-3 rounded-md flex items-center justify-between hover:bg-gray-800 transition-colors text-xs xs:text-sm sm:text-base ${className}`}>
        <span className="font-medium">Shop Now</span>
        <span className="ml-2">→</span>
      </div>
    </Link>
  );
} 