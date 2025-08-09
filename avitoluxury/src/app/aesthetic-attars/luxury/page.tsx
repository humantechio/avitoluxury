import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Aesthetic Attars | A V I T O   S C E N T S',
  description: 'Indulge in our exclusive collection of luxury aesthetic attars, handcrafted with rare and precious ingredients.',
};

export default function LuxuryAestheticAttarsPage() {
  return (
    <ProductListing 
      productType="Aesthetic Attars"
      category="Luxury Attars"
      title="Luxury Aesthetic Attars"
      description="Indulge in our exclusive collection of luxury aesthetic attars, handcrafted with rare and precious ingredients."
    />
  );
} 