// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Nav from '../components/Nav';
// import Footer from '../components/Footer';
// import ShopNowButton from '../components/ui/ShopNowButton';
// import ProductCard from '../components/store/ProductCard';
// import { FiPackage, FiCheck, FiTruck } from 'react-icons/fi';

// // Define product type
// interface Product {
//   _id: string;
//   name: string;
//   description: string;
//   price: number;
//   discountedPrice: number;
//   category: string;
//   images: { url: string }[];
//   rating?: number;
// }

// export default function DiscoverySetPage() {
//   const [sets, setSets] = useState<Product[]>([]);

//   useEffect(() => {
//     // In a real app, fetch discovery sets from API
//     // For now, use mock data
//     const mockDiscoverySets = [
//       {
//         _id: 'disc-1',
//         name: 'Signature Collection Set',
//         description: 'Experience our top 3 bestselling fragrances in this travel-friendly discovery set',
//         price: 999,
//         discountedPrice: 799,
//         category: 'Discovery Set',
//         images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Signature+Set' }],
//         rating: 4.8
//       },
//       {
//         _id: 'disc-2',
//         name: 'Floral Collection Set',
//         description: 'Explore our beautiful floral fragrances with this curated selection of 4 mini perfumes',
//         price: 1299,
//         discountedPrice: 0,
//         category: 'Discovery Set',
//         images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Floral+Set' }],
//         rating: 4.6
//       },
//       {
//         _id: 'disc-3',
//         name: 'Woody Collection Set',
//         description: 'Discover our premium woody fragrances with this luxury set of 3 travel-sized scents',
//         price: 1499,
//         discountedPrice: 1199,
//         category: 'Discovery Set',
//         images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Woody+Set' }],
//         rating: 4.7
//       },
//       {
//         _id: 'disc-4',
//         name: 'Seasonal Collection Set',
//         description: 'Limited edition seasonal fragrances in a beautiful gift-ready package',
//         price: 1699,
//         discountedPrice: 1499,
//         category: 'Discovery Set',
//         images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Seasonal+Set' }],
//         rating: 4.9
//       }
//     ];
    
//     setSets(mockDiscoverySets);
//   }, []);

//   return (
//     <>
//       <Nav />
      
//       {/* Hero Section */}
//       <div className="relative">
//         <div className="w-full h-[40vh] bg-gray-100 flex items-center justify-center">
//           <div className="text-center px-4">
//             <h1 className="text-3xl md:text-4xl font-bold mb-4">Discovery Sets</h1>
//             <p className="text-gray-600 max-w-lg mx-auto">
//               Explore our curated collections in smaller, travel-friendly sizes. The perfect way to 
//               discover your signature scent.
//             </p>
//           </div>
//         </div>
//       </div>
      
//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-12">
//         {/* Introduction */}
//         <div className="max-w-3xl mx-auto text-center mb-12">
//           <h2 className="text-2xl font-bold mb-4">Experience Before You Commit</h2>
//           <p className="text-gray-600">
//             Our discovery sets allow you to explore multiple fragrances at once, making it easier to find 
//             your perfect match. Each set comes with beautifully packaged mini bottles of our signature scents.
//           </p>
//         </div>
        
//         {/* Featured Set */}
//         <div className="bg-gray-50 p-6 md:p-12 rounded-lg mb-16">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//             <div>
//               <div className="bg-white p-6 rounded-lg shadow-md">
//                 <img 
//                   src="https://placehold.co/600x600/272420/FFFFFF?text=Premium+Discovery+Box" 
//                   alt="Premium Discovery Set"
//                   className="w-full h-auto object-cover"
//                 />
//               </div>
//             </div>
//             <div>
//               <span className="text-sm text-gray-500 uppercase tracking-wider">Most Popular</span>
//               <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-4">Premium Discovery Box</h2>
//               <p className="text-gray-600 mb-6">
//                 Our flagship discovery set features 5 of our most beloved fragrances in a luxurious presentation box. 
//                 Perfect as a gift or to treat yourself to a variety of our signature scents.
//               </p>
              
//               <div className="mb-6">
//                 <h3 className="font-medium mb-3">What's Included:</h3>
//                 <ul className="space-y-2">
//                   <li className="flex items-center">
//                     <FiCheck className="text-green-500 mr-2" /> 5 × 10ml travel sprays
//                   </li>
//                   <li className="flex items-center">
//                     <FiCheck className="text-green-500 mr-2" /> Beautiful presentation box
//                   </li>
//                   <li className="flex items-center">
//                     <FiCheck className="text-green-500 mr-2" /> Scent description cards
//                   </li>
//                   <li className="flex items-center">
//                     <FiCheck className="text-green-500 mr-2" /> ₹500 voucher toward full-size purchase
//                   </li>
//                 </ul>
//               </div>
              
//               <div className="flex items-center mb-6">
//                 <span className="text-2xl font-bold">₹1,999</span>
//                 <span className="ml-2 text-sm text-gray-500 line-through">₹2,499</span>
//                 <span className="ml-3 bg-black text-white text-xs px-2 py-1">Save 20%</span>
//               </div>
              
//               <ShopNowButton href="/product/premium-discovery" />
//             </div>
//           </div>
//         </div>
        
//         {/* Discovery Set Collection */}
//         <div className="mb-16">
//           <h2 className="text-2xl font-bold mb-8 text-center">Explore Our Discovery Sets</h2>
          
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {sets.map(set => (
//               <ProductCard key={set._id} product={set} />
//             ))}
//           </div>
//         </div>
        
//         {/* Benefits Section */}
//         <div className="mb-16">
//           <h2 className="text-2xl font-bold mb-8 text-center">Why Choose Our Discovery Sets?</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="text-center p-6 bg-gray-50 rounded-lg">
//               <div className="flex justify-center mb-4">
//                 <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
//                   <FiPackage className="text-white text-2xl" />
//                 </div>
//               </div>
//               <h3 className="text-xl font-bold mb-2">Try Before You Buy</h3>
//               <p className="text-gray-600">
//                 Experience our full fragrance collection without committing to a full-size bottle.
//               </p>
//             </div>
            
//             <div className="text-center p-6 bg-gray-50 rounded-lg">
//               <div className="flex justify-center mb-4">
//                 <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
//                   <FiTruck className="text-white text-2xl" />
//                 </div>
//               </div>
//               <h3 className="text-xl font-bold mb-2">Travel Friendly</h3>
//               <p className="text-gray-600">
//                 Each mini bottle is perfectly sized for travel, so you can take your favorite scents anywhere.
//               </p>
//             </div>
            
//             <div className="text-center p-6 bg-gray-50 rounded-lg">
//               <div className="flex justify-center mb-4">
//                 <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
//                   <FiCheck className="text-white text-2xl" />
//                 </div>
//               </div>
//               <h3 className="text-xl font-bold mb-2">Value for Money</h3>
//               <p className="text-gray-600">
//                 Enjoy great savings while experiencing multiple fragrances in our curated collections.
//               </p>
//             </div>
//           </div>
//         </div>
        
//         {/* FAQ Section */}
//         <div className="max-w-3xl mx-auto">
//           <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-lg font-medium mb-2">How many fragrances are in each discovery set?</h3>
//               <p className="text-gray-600">
//                 Our discovery sets typically contain between 3-5 fragrances, depending on the collection.
//               </p>
//             </div>
            
//             <div>
//               <h3 className="text-lg font-medium mb-2">What size are the bottles in the discovery sets?</h3>
//               <p className="text-gray-600">
//                 Each fragrance comes in a 10ml travel spray bottle, which provides approximately 120 sprays.
//               </p>
//             </div>
            
//             <div>
//               <h3 className="text-lg font-medium mb-2">Can I apply the cost of a discovery set toward a full bottle?</h3>
//               <p className="text-gray-600">
//                 Yes! Each discovery set includes a voucher that can be applied toward the purchase of a full-size bottle.
//               </p>
//             </div>
            
//             <div>
//               <h3 className="text-lg font-medium mb-2">Are discovery sets eligible for returns?</h3>
//               <p className="text-gray-600">
//                 Due to the nature of fragrances, discovery sets are not eligible for return once opened. Unopened sets can be returned within 30 days.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <Footer />
//     </>
//   );
// } 