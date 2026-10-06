import { ShoppingCart } from "lucide-react";
import { money } from "@/lib/demo-orders";
export function MobilePurchaseBar({
  total,
  disabled,
  onAdd,
  onBuy,
}: {
  total: number;
  disabled: boolean;
  onAdd: () => void;
  onBuy: () => void;
}) {
  return (
    <div className="mobile-purchase-bar" aria-label="Quick product purchase">
      <div>
        <small>Selected total</small>
        <strong>{money(total)}</strong>
      </div>
      <button
        className="market-add"
        disabled={disabled}
        onClick={onAdd}
        aria-label="Quick add to basket"
      >
        <ShoppingCart size={15} />
        Add
      </button>
      <button className="market-buy" disabled={disabled} onClick={onBuy} aria-label="Quick buy now">
        Buy now
      </button>
    </div>
  );
}
