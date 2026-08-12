import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/retailer/components/ui-bits";
import { ProductForm } from "@/retailer/components/ProductForm";
import { createProduct } from "@/retailer/data/service";
import { useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/products/new")({
  component: NewProduct,
});

function NewProduct() {
  const { storeId } = useRetailerSession();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Add product" description="List a new product for your store." />
      <ProductForm
        submitLabel="Create product"
        onSubmit={async (values) => {
          await createProduct(storeId, values);
          toast.success("Product created");
          navigate({ to: "/retailer/products" });
        }}
      />
    </div>
  );
}
