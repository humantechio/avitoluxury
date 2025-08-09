import { NextResponse } from 'next/server';

// GET layout products (simplified endpoint)
export async function GET() {
  try {
    // Mock products data for layout usage
    // This avoids database connectivity issues in the layout page
    const mockProducts = [
      {
        _id: 'mock-prod-1',
        name: 'Royal Oud Perfume',
        price: 2999,
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Royal+Oud' }]
      },
      {
        _id: 'mock-prod-2',
        name: 'Floral Dreams',
        price: 1899,
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Floral+Dreams' }]
      },
      {
        _id: 'mock-prod-3',
        name: 'Citrus Splash',
        price: 1599,
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Citrus+Splash' }]
      },
      {
        _id: 'mock-prod-4',
        name: 'Woody Collection',
        price: 2499,
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Woody+Collection' }]
      },
      {
        _id: 'mock-prod-5',
        name: 'Midnight Elixir',
        price: 3499,
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Midnight+Elixir' }]
      },
      {
        _id: 'mock-prod-6',
        name: 'Summer Solstice',
        price: 1799,
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Summer+Solstice' }]
      },
      {
        _id: 'mock-prod-7',
        name: 'Amber & Cashmere',
        price: 2999,
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Amber+Cashmere' }]
      },
      {
        _id: 'mock-prod-8',
        name: 'Cedar & Sage',
        price: 1999,
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Cedar+Sage' }]
      }
    ];
    
    return NextResponse.json({ success: true, products: mockProducts }, { status: 200 });
  } catch (error) {
    console.error('Error in layout products API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
} 