import { createContext, useContext } from "react";

/** Shared selection + quantity state for catalogue grid/list views. */
export interface CatalogueSelection {
  isSelected: (id: string) => boolean;
  toggle: (id: string, distributorId: string, variantId: string) => void;
  qty: (id: string) => number | undefined;
  setQty: (id: string, qty: number) => void;
  layout: "grid" | "list";
}
export const CatalogueSelectionContext = createContext<CatalogueSelection | null>(null);
export const useCatalogueSelection = () => useContext(CatalogueSelectionContext);
