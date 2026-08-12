export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

const avatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=60&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop',
];

function makeReviews(productId: string): Review[] {
  return [
    {
      id: `${productId}_r1`,
      productId,
      author: 'Priya Sharma',
      avatar: avatars[0],
      rating: 5,
      title: 'Excellent quality, fast delivery!',
      body: 'Absolutely love this product. The quality is top-notch and exactly as described. Delivery was within 2 days and packaging was secure. Will definitely order again.',
      date: 'Apr 28, 2025',
      verified: true,
      helpful: 24,
    },
    {
      id: `${productId}_r2`,
      productId,
      author: 'Rajan Mehta',
      avatar: avatars[1],
      rating: 4,
      title: 'Good value for money',
      body: 'Really good product for the price. The bulk pack is especially great — I saved quite a bit compared to buying from local stores. Quality is consistent and fresh.',
      date: 'May 2, 2025',
      verified: true,
      helpful: 18,
    },
    {
      id: `${productId}_r3`,
      productId,
      author: 'Anita Nair',
      avatar: avatars[2],
      rating: 5,
      title: 'Highly recommended!',
      body: 'I have been ordering from Boxaio for 3 months now. The quality never disappoints. The MRP savings are real and the product is always fresh.',
      date: 'May 5, 2025',
      verified: true,
      helpful: 31,
    },
    {
      id: `${productId}_r4`,
      productId,
      author: 'Suresh Pillai',
      avatar: avatars[3],
      rating: 3,
      title: 'Decent, but expected better packaging',
      body: 'The product quality is good but the inner packaging could be better. The contents were fine though and delivery was on time. Overall an okay experience.',
      date: 'May 8, 2025',
      verified: false,
      helpful: 6,
    },
    {
      id: `${productId}_r5`,
      productId,
      author: 'Kavitha Reddy',
      avatar: avatars[4],
      rating: 5,
      title: 'My family absolutely loves it',
      body: 'This has become a household staple for us. Ordered the bulk pack and it lasts us 3 months. The freshness is guaranteed and the taste is authentic. Boxaio never lets me down.',
      date: 'May 10, 2025',
      verified: true,
      helpful: 42,
    },
  ];
}

// Generate reviews for all 20 products
const productIds = [
  'prod_001', 'prod_002', 'prod_003', 'prod_004', 'prod_005',
  'prod_006', 'prod_007', 'prod_008', 'prod_009', 'prod_010',
  'prod_011', 'prod_012', 'prod_013', 'prod_014', 'prod_015',
  'prod_016', 'prod_017', 'prod_018', 'prod_019', 'prod_020',
];

export const allReviews: Review[] = productIds.flatMap(makeReviews);

export function getReviewsForProduct(productId: string): Review[] {
  return allReviews.filter(r => r.productId === productId);
}
