import { AddProductForm } from "@/components/merchandise/add-product-form";

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Add New Product</h1>
        <p className="text-muted-foreground">
          Fill out the form below to add a new product to your store.
        </p>
      </div>
      <AddProductForm />
    </div>
  );
}
