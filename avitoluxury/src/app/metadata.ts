import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s - A V I T O   S C E N T S',
    default: 'A V I T O   S C E N T S | Premium Perfumes & Fragrances'
  },
  description: 'Discover premium perfumes and fragrances at A V I T O   S C E N T S. Find luxury scents for every occasion.',
  keywords: ['perfume', 'fragrance', 'luxury scents', 'A V I T O   S C E N T S'],
  authors: [
    { name: 'A V I T O   S C E N T S Team' }
  ],
  openGraph: {
    title: 'A V I T O   S C E N T S | Premium Perfumes & Fragrances',
    description: 'Discover premium perfumes and fragrances at A V I T O   S C E N T S. Find luxury scents for every occasion.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'A V I T O   S C E N T S Logo'
      }
    ],
    type: 'website'
  }
} 