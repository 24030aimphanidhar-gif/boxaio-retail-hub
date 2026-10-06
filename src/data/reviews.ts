import {mockData} from '@/api/bootstrap-data';
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

export const allReviews=mockData.reviews as Review[];
export function getReviewsForProduct(productId: string): Review[] {
  return allReviews.filter(r => r.productId === productId);
}
