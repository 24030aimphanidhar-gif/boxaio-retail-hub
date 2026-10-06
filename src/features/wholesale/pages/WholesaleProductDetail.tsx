import { DeliveryCheck } from "@/features/shared/components/DeliveryCheck";
import { ProductImage } from "@/features/shared/components/ProductImage";
import { products } from "@/data/products";
import { getReviewsForProduct } from "@/data/reviews";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Package, ShieldCheck, ShoppingBag } from "lucide-react";
import { getB2BProduct } from "@/retailer/b2b/service";
import { RetailerProductPurchase } from "@/features/wholesale/components/RetailerProductPurchase";
import { packVariants } from "@/retailer/b2b/pricing";

export function WholesaleProductDetail() {
  const { productId } = useParams({ from: "/retailer/item/$productId" });
  const search = useSearch({ from: "/retailer/item/$productId" });
  const p = getB2BProduct(productId);
  if (!p)
    return (
      <div className="wrap empty-state">
        <Package size={40} />
        <h1>Product unavailable</h1>
        <p>This product is no longer in the wholesale catalogue.</p>
        <Link to="/retailer/shop" className="solid-button">
          Browse wholesale
        </Link>
      </div>
    );
  return (
    <main className="wrap business-page wholesale-detail">
      <div className="detail-topline">
        <Link to={search.from || "/retailer/shop"} className="back-link">
          <ArrowLeft size={16} />
          Back to products
        </Link>
        <Link to="/retailer/cart" className="outline-button">
          <ShoppingBag size={16} />
          View basket
        </Link>
      </div>
      <div className="wholesale-detail-grid">
        <section>
          <div className="wholesale-detail-photo">
            <ProductImage productId={p.id} src={p.image} alt={p.name} />
            <span>BOXAIO BUSINESS</span>
          </div>
          <div className="wholesale-spec">
            <h2>About this product</h2>
            <p>{p.description}</p>
            <dl>
              <div>
                <dt>Brand</dt>
                <dd>{p.brand}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{p.category}</dd>
              </div>
              <div>
                <dt>Product code</dt>
                <dd>{p.sku}</dd>
              </div>
            </dl>
            <h3>Pack guide</h3>
            {packVariants(p).map((v) => (
              <div className="pack-guide" key={v.id}>
                <span>{v.label}</span>
                <small>
                  {v.multiplier} base {v.multiplier === 1 ? "pack" : "packs"} · min {v.moq}
                </small>
              </div>
            ))}
            <p className="detail-reassurance">
              <ShieldCheck size={18} />
              Supplier stock and pricing are checked again at checkout.
            </p>
          </div>
        </section>
        <section className="wholesale-detail-buy">
          <span className="eyebrow">{p.brand} · WHOLESALE ESSENTIALS</span>
          <h1>{p.name}</h1>
          <div className="wholesale-rating">
            ★ {products.find((x) => x._id === p.id)?.rating}{" "}
            <a href="#wholesale-reviews">Read sample reviews</a>
            <span>{p.sku}</span>
          </div>
          <p className="detail-intro">
            Choose your pack, compare distributors, and build your next restock.
          </p>
          <RetailerProductPurchase
            key={p.id + search.supplier + search.variant}
            product={p}
            preferredDistributorId={search.supplier}
            initialVariantId={search.variant}
          />
          <DeliveryCheck wholesale />
          <p className="detail-demo-note">
            Sample supplier data · Your selection is saved in the wholesale basket.
          </p>
        </section>
      </div>
      <section id="wholesale-reviews" className="wholesale-reviews">
        <h2>Product reviews</h2>
        <div>
          {getReviewsForProduct(p.id)
            .slice(0, 3)
            .map((r) => (
              <article key={r.id}>
                <strong>{r.author}</strong>
                <span>{"★".repeat(r.rating)}</span>
                <p>{r.body}</p>
                <small>Sample review · {r.date}</small>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}
