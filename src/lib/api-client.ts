// lib/api-client.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `API request failed: ${response.status}`);
    }
    
    return data;
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Player API methods
export const playerApi = {
  // Get all players
  getAll: (params?: { page?: number; limit?: number; team?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.team) searchParams.set('team', params.team);
    if (params?.search) searchParams.set('search', params.search);
    
    const queryString = searchParams.toString();
    return apiFetch(`/players${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get single player
  getById: (id: number | string) => apiFetch(`/players/${id}`),
  
  // Get player book
  getBook: (id: number | string) => apiFetch(`/players/${id}/book`),
  
  // Create player
  create: (playerData: any) => 
    apiFetch('/players', {
      method: 'POST',
      body: JSON.stringify(playerData)
    }),
  
  // Update player
  update: (id: number | string, playerData: any) =>
    apiFetch(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(playerData)
    }),
  
  // Delete player
  delete: (id: number | string) =>
    apiFetch(`/players/${id}`, {
      method: 'DELETE'
    }),
  
  // Player actions
  logDisciplinary: (id: number | string, data: any) =>
    apiFetch(`/players/${id}/actions`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'log_disciplinary',
        ...data
      })
    }),
  
  logInjury: (id: number | string, data: any) =>
    apiFetch(`/players/${id}/actions`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'log_injury',
        ...data
      })
    }),
  
  addCertificate: (id: number | string, moduleName: string) =>
    apiFetch(`/players/${id}/actions`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'add_certificate',
        moduleName
      })
    })
};

// Enrollment API
export const enrollmentApi = {
  enroll: (formData: FormData) =>
    fetch(`${API_BASE_URL}/api/enroll`, {
      method: 'POST',
      body: formData
    }).then(res => res.json()),
  
  test: () => apiFetch('/enroll')
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiFetch('/dashboard/stats')
};

// Database API
export const databaseApi = {
  test: () => apiFetch('/db-test'),
  health: () => apiFetch('/db/health'),
  init: () => apiFetch('/db/init', { method: 'POST' })
};