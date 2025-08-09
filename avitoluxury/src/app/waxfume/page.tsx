import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Waxfume Collection | A V I T O   S C E N T S',
  description: 'Discover our innovative solid perfume collection that combines convenience with lasting fragrance.',
};

export default async function WaxfumePage() {
  return (
    <ProductListing 
      productType="Waxfume (Solid)"
      title="Waxfume Collection"
      description="Discover our innovative solid perfume collection that combines convenience with lasting fragrance."
    />
  );
} 