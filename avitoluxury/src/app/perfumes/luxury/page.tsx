import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Perfumes | A V I T O   S C E N T S',
  description: 'Indulge in our collection of luxury perfumes crafted with the finest ingredients for the discerning individual.',
};

export default async function LuxuryPerfumesPage() {
  return (
    <ProductListing 
      productType="Perfumes"
      category="Luxury Perfumes"
      title="Luxury Perfumes"
      description="Indulge in our collection of luxury perfumes crafted with the finest ingredients for the discerning individual."
    />
  );
} 