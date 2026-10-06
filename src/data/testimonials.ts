import {mockData} from '@/api/bootstrap-data';
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

export const testimonials=mockData.testimonials as Testimonial[];
