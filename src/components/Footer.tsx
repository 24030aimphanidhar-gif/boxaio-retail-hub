import { Link } from "wouter";
import { Leaf, ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <Link href="/" className="brand">
            <span className="brand-icon">
              <Leaf size={22} />
            </span>
            boxaio.
          </Link>
          <p>
            A little fresher. A little easier.
            <br />
            Your everyday essentials, all in one place.
          </p>
          <span className="demo-label">Interactive demo · mock data</span>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/products">Shop all essentials</Link>
          <Link href="/categories">Browse categories</Link>
          <Link href="/offers">Offers & savings</Link>
        </div>
        <div>
          <h3>Your Boxaio</h3>
          <Link href="/orders">Your orders</Link>
          <Link href="/saved-lists">Shopping lists</Link>
          <Link href="/schedule-orders">Scheduled orders</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link href="/contact">
            Contact us <ArrowUpRight size={13} />
          </Link>
          <Link href="/shipping-policy">Delivery information</Link>
          <Link href="/returns-refunds">Returns & refunds</Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Boxaio. Made for your everyday.</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
