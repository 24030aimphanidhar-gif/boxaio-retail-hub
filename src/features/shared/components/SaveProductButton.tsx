import { Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { useSaveLists } from "@/context/SaveListsContext";
export function SaveProductButton({ product }: { product: Product }) {
  const { addToSaveList, isInSaveList } = useSaveLists();
  const saved = isInSaveList(product._id);
  return (
    <button
      className={"save-catalogue-action " + (saved ? "is-saved" : "")}
      aria-label={(saved ? "Saved " : "Save ") + product.name + " to my catalogue"}
      onClick={() => {
        addToSaveList(product);
        toast.success("Saved to My catalogue");
      }}
    >
      {saved ? <Check size={14} /> : <Bookmark size={14} />}
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
