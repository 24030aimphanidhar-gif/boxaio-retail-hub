import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState, LoadingRows, PageHeader } from "@/retailer/components/ui-bits";
import { ProductForm } from "@/retailer/components/ProductForm";
import { fetchProduct, updateProduct } from "@/retailer/data/service";
import { useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/products/$productId")({
  component: EditProduct,
});

function EditProduct() {
  const { productId } = useParams({ from: "/retailer/products/$productId" });
  const { storeId } = useRetailerSession();
  const navigate = useNavigate();
  const { data, loading } = useAsync(() => fetchProduct(storeId, productId), [storeId, productId]);

  if (loading) return <LoadingRows rows={6} />;
  if (!data)
    return (
      <EmptyState
        title="Product not found"
        description="This product is not listed by your store."
        action={
          <Link to="/retailer/products">
            <Button variant="outline">Back to products</Button>
          </Link>
        }
      />
    );

  return (
    <div>
      <PageHeader title={`Edit ${data.name}`} description={`SKU ${data.sku}`} />
      <ProductForm
        initial={data}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await updateProduct(storeId, productId, values);
          toast.success("Product updated");
          navigate({ to: "/retailer/products" });
        }}
      />
    </div>
  );
}
