import { MerchandiseStore } from "@/components/merchandise/merchandise-store";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function MerchandisePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Merchandise Store</h1>
            <p className="text-muted-foreground">
            Browse and purchase official academy merchandise.
            </p>
        </div>
        <Button asChild>
          <Link href="/merchandise/manage">
            <Settings className="mr-2 h-4 w-4" />
            Manage Products
          </Link>
        </Button>
      </div>
      <MerchandiseStore />
    </div>
  );
}
