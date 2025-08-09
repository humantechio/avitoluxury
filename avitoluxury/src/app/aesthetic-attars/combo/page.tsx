import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aesthetic Attar Combo Sets | A V I T O   S C E N T S',
  description: 'Explore our curated aesthetic attar combo sets that offer a variety of traditional and modern fragrances.',
};

export default function AestheticAttarComboSetsPage() {
  return (
    <ProductListing 
      productType="Aesthetic Attars"
      category="Combo Sets"
      title="Aesthetic Attar Combo Sets"
      description="Explore our curated aesthetic attar combo sets that offer a variety of traditional and modern fragrances."
    />
  );
} 