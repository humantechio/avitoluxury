import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Aesthetic Attars | A V I T O   S C E N T S',
  description: 'Experience our premium aesthetic attars crafted with the finest natural ingredients for a rich and lasting fragrance.',
};

export default function PremiumAestheticAttarsPage() {
  return (
    <ProductListing 
      productType="Aesthetic Attars"
      category="Premium Attars"
      title="Premium Aesthetic Attars"
      description="Experience our premium aesthetic attars crafted with the finest natural ingredients for a rich and lasting fragrance."
    />
  );
} 