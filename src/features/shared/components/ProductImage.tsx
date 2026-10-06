import { useEffect, useState, type ImgHTMLAttributes } from "react";

interface ProductImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  productId: string;
}

// Vite's BASE_URL always has a trailing slash, e.g. "/Boxaio-Grocery/"
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function ProductImage({ productId, src, alt, className, ...props }: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Reset when the product or src changes
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [productId, src]);

  return (
    <img
      {...props}
      alt={alt || "Product"}
      src={
        errored
          ? `${BASE}/products/${productId}.svg`
          : src?.startsWith("/products/")
            ? BASE + src
            : src
      }
      loading="lazy"
      decoding="async"
      className={`${className ?? ""} transition-opacity duration-300 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      onLoad={() => setLoaded(true)}
      onError={() => {
        // Prevent infinite loop if the placeholder itself fails
        if (!errored) {
          setLoaded(false);
          setErrored(true);
        } else {
          setLoaded(true);
        }
      }}
    />
  );
}
