import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discovery Sets - Coming Soon',
  description: 'Explore our curated discovery sets',
};

export default function DiscoverySetPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Discovery Sets</h1>
        <p className="text-gray-600">Coming Soon</p>
      </div>
    </div>
  );
}
