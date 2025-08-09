import { NextRequest, NextResponse } from 'next/server';
import Product from '@/app/models/Product';
import connectMongoDB from '@/app/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    // Parse query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'all';
    const category = url.searchParams.get('category');
    const gender = url.searchParams.get('gender');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    
    // Build filter object
    const filter: any = {};
    
    // Text search with query
    if (query) {
      if (type === 'all') {
        // Search in multiple fields
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { productType: { $regex: query, $options: 'i' } },
          { subCategories: { $regex: query, $options: 'i' } }
        ];
      } else if (type === 'category') {
        // Search by specific category
        if (category) {
          // Handle category mapping
          if (category === 'perfumes') {
            filter.productType = 'Perfumes';
          } else if (category === 'attars') {
            filter.productType = 'Aesthetic Attars';
          } else if (category === 'fresheners') {
            filter.productType = 'Air Fresheners';
          } else if (category === 'waxfume') {
            filter.productType = 'Waxfume (Solid)';
          } else {
            filter.category = category;
          }
          
          // Add text search within the category
          filter.$or = [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ];
        }
      }
    }
    
    // Additional filters
    if (gender) {
      filter.gender = gender;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    console.log('Search filter:', filter);
    
    // Execute query with filters
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products matching search query`);
    
    return NextResponse.json({ 
      success: true, 
      products,
      query,
      type,
      category,
      count: products.length
    }, { status: 200 });
  } catch (err) {
    console.error('Error searching products:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Server error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 