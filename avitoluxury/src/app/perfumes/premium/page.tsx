import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Perfumes | A V I T O   S C E N T S',
  description: 'Experience our premium perfume collection that combines quality ingredients with exceptional craftsmanship.',
};

export default async function PremiumPerfumesPage() {
  return (
    <ProductListing 
      productType="Perfumes"
      category="Premium Perfumes"
      title="Premium Perfumes"
      description="Experience our premium perfume collection that combines quality ingredients with exceptional craftsmanship."
    />
  );
} 