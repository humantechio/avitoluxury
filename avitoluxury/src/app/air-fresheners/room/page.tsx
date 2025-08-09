import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Room Air Fresheners | A V I T O   S C E N T S',
  description: 'Transform your living spaces with our premium room air fresheners that create a welcoming and refreshing atmosphere.',
};

export default async function RoomAirFreshenersPage() {
  return (
    <ProductListing 
      productType="Air Fresheners"
      category="Room Fresheners"
      title="Room Air Fresheners"
      description="Transform your living spaces with our premium room air fresheners that create a welcoming and refreshing atmosphere."
    />
  );
} 