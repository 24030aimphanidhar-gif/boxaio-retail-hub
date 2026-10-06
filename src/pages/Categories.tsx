import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Search } from "lucide-react";
import { products } from "../data/products";
const categories = [...new Set(products.map((p) => p.mainCategory))];
export function Categories() {
  const [query, setQuery] = useState("");
  return (
    <div className="wrap orders-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Categories</span>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">FIND YOUR EVERYDAY FAVOURITES</span>
          <h1>A little of everything.</h1>
          <p>Fresh produce, pantry staples and all the good things in between.</p>
        </div>
        <label className="small-search">
          <Search size={16} />
          <input
            aria-label="Search categories"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a category"
          />
        </label>
      </div>
      <div className="all-category-grid">
        {categories
          .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
          .map((c) => {
            const items = products.filter((p) => p.mainCategory === c);
            return (
              <Link
                key={c}
                href={"/products?category=" + encodeURIComponent(c)}
                className="all-category"
              >
                <img src={items[0].image} alt="" loading="lazy" />
                <div>
                  <h2>{c}</h2>
                  <span>
                    {items.length} essentials <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
      </div>
      {!categories.some((c) => c.toLowerCase().includes(query.toLowerCase())) && (
        <div className="empty-state">
          <Search size={30} />
          <h2>No categories found</h2>
          <button className="outline-button" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
