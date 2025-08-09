import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unisex Perfumes | A V I T O   S C E N T S',
  description: 'Explore our exclusive collection of premium unisex fragrances. Find the perfect scent for every occasion.',
};

export default async function UnisexPage() {
  return (
    <ProductListing 
      gender="Unisex"
      title="Unisex Fragrances"
      description="Discover our exclusive collection of premium fragrances designed for everyone. Versatile scents that transcend traditional gender boundaries."
    />
  );
} 