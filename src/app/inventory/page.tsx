import { EquipmentTable } from '@/components/inventory/equipment-table';
import { ConsumablesManagement } from '@/components/inventory/consumables-management';

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Inventory & Logistics</h1>
        <p className="text-muted-foreground">
          Track equipment and manage consumables.
        </p>
      </div>
      <EquipmentTable />
      <ConsumablesManagement />
    </div>
  );
}
