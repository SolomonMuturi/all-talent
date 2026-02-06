// components/EquipmentList.tsx
'use client';

import { useState, useEffect } from 'react';
import { equipmentService, Equipment } from '@/lib/equipment-service';

export function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getAllEquipment();
      
      if (response.success && response.data) {
        setEquipment(response.data.equipment);
      } else {
        setError(response.error || 'Failed to load equipment');
      }
    } catch (err) {
      setError('An error occurred while loading equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;
    
    const response = await equipmentService.deleteEquipment(id);
    
    if (response.success) {
      setEquipment(equipment.filter(item => item.id !== id));
      alert('Equipment deleted successfully');
    } else {
      alert(response.error || 'Failed to delete equipment');
    }
  };

  if (loading) return <div>Loading equipment...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Equipment List ({equipment.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map(item => (
          <div key={item.id} className="border rounded-lg p-4">
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-600">Category: {item.category}</p>
            <p className="text-sm text-gray-600">Location: {item.location}</p>
            <p className="text-sm text-gray-600">Status: {item.status}</p>
            <p className="text-sm text-gray-600">
              Assigned to: {item.assignedTo || 'Unassigned'}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}