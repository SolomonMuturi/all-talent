import { EquipmentTable } from '@/components/inventory/equipment-table';
import { ConsumablesManagement } from '@/components/inventory/consumables-management';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Boxes, Wrench, PackageWarning } from 'lucide-react';
import { equipment, consumables } from '@/lib/data';


export default function InventoryPage() {
    const totalItems = equipment.length;
    const maintenanceItems = equipment.filter(e => e.status === 'Maintenance').length;
    const lowStockConsumables = consumables.filter(c => c.currentStock < c.lowStockThreshold).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Inventory & Logistics</h1>
        <p className="text-muted-foreground">
          Track equipment and manage consumables.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
            title="Total Equipment Items"
            value={String(totalItems)}
            icon={<Boxes className="size-5 text-muted-foreground" />}
            description="All tracked assets"
        />
        <KpiCard
            title="Items in Maintenance"
            value={String(maintenanceItems)}
            icon={<Wrench className="size-5 text-muted-foreground" />}
            description="Currently under repair"
        />
         <KpiCard
            title="Low Stock Consumables"
            value={String(lowStockConsumables)}
            icon={<PackageWarning className="size-5 text-muted-foreground" />}
            description="Items needing restock"
        />
      </div>

      <EquipmentTable />
      <ConsumablesManagement />
    </div>
  );
}
