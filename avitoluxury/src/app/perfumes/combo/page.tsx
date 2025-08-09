import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfume Combo Sets | A V I T O   S C E N T S',
  description: 'Explore our carefully curated perfume combo sets that offer a variety of complementary fragrances.',
};

export default async function PerfumeComboSetsPage() {
  return (
    <ProductListing 
      productType="Perfumes"
      category="Combo Sets"
      title="Perfume Combo Sets"
      description="Explore our carefully curated perfume combo sets that offer a variety of complementary fragrances."
    />
  );
} 