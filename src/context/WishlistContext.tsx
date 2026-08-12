import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Product } from '../data/products';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
  clearWishlist: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate after mount so server and client render the same initial markup.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p._id === product._id);
      if (exists) return prev.filter(p => p._id !== product._id);
      return [...prev, product];
    });
  };

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.some(p => p._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(p => p._id !== id));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const isInWishlist = (id: string) => wishlist.some(p => p._id === id);
  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      toggleWishlist, 
      isInWishlist, 
      wishlistCount,
      clearWishlist,
      addToWishlist,
      removeFromWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}