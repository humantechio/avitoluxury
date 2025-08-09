import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Buy Products | A V I T O   S C E N T S',
  description: 'Explore our best value products that offer exceptional quality at competitive prices.',
};

export default async function BestBuyPage() {
  return (
    <ProductListing 
      tag="best-buy"
      title="Best Buy Products"
      description="Explore our best value products that offer exceptional quality at competitive prices."
    />
  );
} 