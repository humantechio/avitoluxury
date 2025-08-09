import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Car Diffusers | A V I T O   S C E N T S',
  description: 'Elevate your driving experience with our luxury car diffusers that provide a premium fragrance experience on the go.',
};

export default async function LuxuryCarDiffusersPage() {
  return (
    <ProductListing 
      productType="Air Fresheners"
      category="Car Diffusers"
      title="Luxury Car Diffusers"
      description="Elevate your driving experience with our luxury car diffusers that provide a premium fragrance experience on the go."
    />
  );
} 