import { MerchandiseStore } from "@/components/merchandise/merchandise-store";

export default function MerchandisePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Merchandise Store</h1>
        <p className="text-muted-foreground">
          Browse and purchase official academy merchandise.
        </p>
      </div>
      <MerchandiseStore />
    </div>
  );
}
