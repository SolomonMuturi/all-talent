// lib/equipment-service.ts
export interface Equipment {
  id: number;
  name: string;
  category: string;
  assignedTo: string | null;
  location: string;
  status: 'In Use' | 'In Storage' | 'Maintenance' | 'Damaged';
  maintenanceDue: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  details?: string;
}

export interface EquipmentListResponse {
  equipment: Equipment[];
  count: number;
}

class EquipmentService {
  private baseUrl = '/api/equipment';

  // GET all equipment
  async getAllEquipment(filters?: {
    category?: string;
    status?: string;
    location?: string;
  }): Promise<ApiResponse<EquipmentListResponse>> {
    try {
      const url = new URL(this.baseUrl, window.location.origin);
      
      if (filters) {
        if (filters.category) url.searchParams.append('category', filters.category);
        if (filters.status) url.searchParams.append('status', filters.status);
        if (filters.location) url.searchParams.append('location', filters.location);
      }

      const response = await fetch(url.toString());
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to fetch equipment'
      };
    }
  }

  // GET single equipment by ID
  async getEquipmentById(id: number): Promise<ApiResponse<{ equipment: Equipment }>> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`);
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to fetch equipment'
      };
    }
  }

  // POST - Create new equipment
  async createEquipment(data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ equipment: Equipment; message: string }>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to create equipment'
      };
    }
  }

  // PUT - Update equipment
  async updateEquipment(id: number, data: Partial<Equipment>): Promise<ApiResponse<{ equipment: Equipment; message: string }>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to update equipment'
      };
    }
  }

  // DELETE - Remove equipment
  async deleteEquipment(id: number): Promise<ApiResponse<{ message: string; deletedId: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to delete equipment'
      };
    }
  }

  // PATCH - Quick update (like status change)
  async quickUpdate(id: number, updates: Partial<Equipment>): Promise<ApiResponse<{ equipment: Equipment; message: string }>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to update equipment'
      };
    }
  }

  // Get equipment categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await this.getAllEquipment();
      if (response.success && response.data) {
        const categories = [...new Set(response.data.equipment.map(item => item.category))];
        return categories.sort();
      }
      return [];
    } catch {
      return [];
    }
  }

  // Get equipment locations
  async getLocations(): Promise<string[]> {
    try {
      const response = await this.getAllEquipment();
      if (response.success && response.data) {
        const locations = [...new Set(response.data.equipment.map(item => item.location))];
        return locations.sort();
      }
      return [];
    } catch {
      return [];
    }
  }

  // Get equipment statistics
  async getStatistics(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byLocation: Record<string, number>;
  }> {
    try {
      const response = await this.getAllEquipment();
      if (!response.success || !response.data) {
        return { total: 0, byCategory: {}, byStatus: {}, byLocation: {} };
      }

      const equipment = response.data.equipment;
      const byCategory: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      const byLocation: Record<string, number> = {};

      equipment.forEach(item => {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
        byStatus[item.status] = (byStatus[item.status] || 0) + 1;
        byLocation[item.location] = (byLocation[item.location] || 0) + 1;
      });

      return {
        total: equipment.length,
        byCategory,
        byStatus,
        byLocation,
      };
    } catch {
      return { total: 0, byCategory: {}, byStatus: {}, byLocation: {} };
    }
  }
}

export const equipmentService = new EquipmentService();