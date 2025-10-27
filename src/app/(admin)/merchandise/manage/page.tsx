import { ProductManagementTable } from "@/components/merchandise/product-management-table";

export default function ManageProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Manage Products</h1>
        <p className="text-muted-foreground">
          Add, edit, and manage all products in your store.
        </p>
      </div>
      <ProductManagementTable />
    </div>
  );
}
