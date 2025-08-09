import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Value for Money Perfumes | A V I T O   S C E N T S',
  description: 'Discover quality fragrances at affordable prices with our value for money perfume collection.',
};

export default async function ValueForMoneyPerfumesPage() {
  return (
    <ProductListing 
      productType="Perfumes"
      category="Value for Money"
      title="Value for Money Perfumes"
      description="Discover quality fragrances at affordable prices with our value for money perfume collection."
    />
  );
} 