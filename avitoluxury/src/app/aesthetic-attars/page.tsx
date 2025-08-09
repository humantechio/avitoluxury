import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aesthetic Attars Collection | A V I T O   S C E N T S',
  description: 'Discover our collection of traditional and modern aesthetic attars crafted with natural ingredients.',
};

export default async function AestheticAttarsPage() {
  return (
    <ProductListing 
      productType="Aesthetic Attars"
      title="Aesthetic Attars Collection"
      description="Discover our collection of traditional and modern aesthetic attars crafted with natural ingredients."
    />
  );
} 