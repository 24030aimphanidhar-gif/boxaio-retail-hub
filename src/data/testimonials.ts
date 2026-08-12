export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    location: "Mumbai",
    rating: 5,
    text: "Boxaio has completely transformed how I stock up my small store. The bulk pricing is unbeatable and delivery is always on time.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "Priya Sharma",
    location: "Delhi",
    rating: 5,
    text: "I love the quality of fresh produce. It's so convenient to order my monthly groceries from one place.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop"
  },
  {
    id: "3",
    name: "Amit Patel",
    location: "Ahmedabad",
    rating: 4,
    text: "Great app interface and smooth checkout experience. The wholesale prices on spices saved me a lot.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop"
  },
  {
    id: "4",
    name: "Sneha Reddy",
    location: "Surat",
    rating: 5,
    text: "Excellent packaging and fresh items. The customer support team was also very helpful when I had a query.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop"
  },
  {
    id: "5",
    name: "Vikram Singh",
    location: "Pune",
    rating: 5,
    text: "As a restaurant owner, Boxaio is my go-to for bulk oil and grains. It saves me trips to the wholesale market.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop"
  },
  {
    id: "6",
    name: "Neha Gupta",
    location: "Bangalore",
    rating: 4,
    text: "Very reliable service. Wish they had more international brands, but the local selection is fantastic.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop"
  }
];
