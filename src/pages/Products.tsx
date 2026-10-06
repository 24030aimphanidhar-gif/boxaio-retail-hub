import { useMemo, useState } from "react";
import { Link, useSearchParams } from "wouter";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import { products } from "../data/products";
import { ProductCard } from "@/features/consumer/components/ProductCard";
import { useWishlist } from "../context/WishlistContext";
const categories = [...new Set(products.map((p) => p.mainCategory))];
export function Products() {
  const params = useSearchParams();
  const query = params.get("search") || "";
  const category = params.get("category") || "";
  const [sort, setSort] = useState("featured");
  const [organic, setOrganic] = useState(false);
  const [stock, setStock] = useState(false);
  const [budget, setBudget] = useState(2000);
  const [page, setPage] = useState(1);
  const [mobile, setMobile] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const filtered = useMemo(() => {
    const rows = products.filter(
      (p) =>
        (!category || p.mainCategory === category) &&
        (!query ||
          (p.name + " " + p.brand + " " + p.subCategory)
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        (!organic || p.isOrganic) &&
        (!stock || p.inStock) &&
        p.normalPrice <= budget
    );
    return rows.sort((a, b) =>
      sort === "low"
        ? a.normalPrice - b.normalPrice
        : sort === "high"
          ? b.normalPrice - a.normalPrice
          : sort === "rating"
            ? b.rating - a.rating
            : sort === "savings"
              ? 1 - b.normalPrice / b.mrp - (1 - a.normalPrice / a.mrp)
              : 0
    );
  }, [query, category, organic, stock, budget, sort]);
  const filterKey = [query, category, organic, stock, budget, sort].join("|");
  const [lastKey, setLastKey] = useState(filterKey);
  if (filterKey !== lastKey) {
    setLastKey(filterKey);
    setPage(1);
  }
  return (
    <div className="wrap shop-catalog">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Shop essentials</span>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR DAILY GOOD THINGS</span>
          <h1>{query ? "Results for “" + query + "”" : category || "Everyday essentials"}</h1>
          <p>Good quality. Fair prices. Find your next favourite.</p>
        </div>
        <span className="demo-label">{products.length} products to explore</span>
      </div>
      <div className="catalog-layout">
        <aside className={"catalog-filters " + (mobile ? "open" : "")}>
          <div className="filter-title">
            Filters{" "}
            <button
              onClick={() => {
                setOrganic(false);
                setStock(false);
                setBudget(2000);
                setSort("featured");
              }}
            >
              Reset
            </button>
          </div>
          <h3>Shop by category</h3>
          <Link
            className={!category ? "chosen" : ""}
            href={"/products" + (query ? "?search=" + encodeURIComponent(query) : "")}
          >
            All essentials <span>{products.length}</span>
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              className={category === c ? "chosen" : ""}
              href={"/products?category=" + encodeURIComponent(c)}
            >
              {c}
              <span>{products.filter((p) => p.mainCategory === c).length}</span>
            </Link>
          ))}
          <div className="filter-block">
            <h3>Your preferences</h3>
            <label>
              <input
                type="checkbox"
                checked={organic}
                onChange={(e) => setOrganic(e.target.checked)}
              />{" "}
              Organic only
            </label>
            <label>
              <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} />{" "}
              In stock only
            </label>
          </div>
          <div className="filter-block">
            <h3>Price up to ₹{budget}</h3>
            <input
              aria-label="Maximum price"
              type="range"
              min="50"
              max="2000"
              step="50"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>₹50</span>
              <span>₹2,000</span>
            </div>
          </div>
        </aside>
        <section className="catalog-results">
          <div className="catalog-toolbar">
            <span>
              <strong>{filtered.length}</strong> products found
            </span>
            <button className="filter-toggle" onClick={() => setMobile(!mobile)}>
              <SlidersHorizontal size={15} /> Filters
            </button>
            <label>
              Sort by{" "}
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">Recommended</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="rating">Top rated</option>
                <option value="savings">Biggest savings</option>
              </select>
            </label>
          </div>
          {category && (
            <Link className="category-chip" href="/products">
              {category}
              <X size={12} />
            </Link>
          )}
          {filtered.length ? (
            <>
              <div className="catalog-product-grid">
                {filtered.slice(0, page * 12).map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onToggleWishlist={() => toggleWishlist(p)}
                    isWishlisted={isInWishlist(p._id)}
                  />
                ))}
              </div>
              <div className="load-more">
                <p>
                  Showing {Math.min(page * 12, filtered.length)} of {filtered.length} products
                </p>
                {page * 12 < filtered.length && (
                  <button className="outline-button" onClick={() => setPage(page + 1)}>
                    Explore more <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Search size={35} />
              <h2>No essentials found</h2>
              <p>Try another search or reset your filters.</p>
              <Link
                href="/products"
                className="solid-button"
                onClick={() => {
                  setOrganic(false);
                  setStock(false);
                  setBudget(2000);
                }}
              >
                Browse all products
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
