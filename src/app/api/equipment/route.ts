import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alltalent_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute queries
async function query(sql: string, params: any[] = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error: any) {
    console.error('Database query error:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Initialize database table if not exists
async function initializeDatabase() {
  try {
    const [tables] = await query("SHOW TABLES LIKE 'equipment'") as any[];
    
    if (!tables || tables.length === 0) {
      await query(`
        CREATE TABLE IF NOT EXISTS equipment (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          assigned_to VARCHAR(255),
          location VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'In Storage',
          maintenance_due DATE,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Transform database results to camelCase
function transformToCamelCase(dbData: any) {
  if (Array.isArray(dbData)) {
    return dbData.map(item => transformToCamelCase(item));
  }
  
  if (dbData && typeof dbData === 'object') {
    const result: any = {};
    
    for (const [key, value] of Object.entries(dbData)) {
      let camelKey = key;
      if (key.includes('_')) {
        camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      }
      result[camelKey] = value;
    }
    
    return result;
  }
  
  return dbData;
}

// GET all equipment
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    
    let sql = 'SELECT * FROM equipment WHERE 1=1';
    const params: any[] = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    if (location) {
      sql += ' AND location = ?';
      params.push(location);
    }
    
    sql += ' ORDER BY name';
    
    const equipment = await query(sql, params);
    const transformedEquipment = transformToCamelCase(equipment);
    
    return NextResponse.json({
      success: true,
      data: {
        equipment: transformedEquipment,
        count: transformedEquipment.length
      }
    });
    
  } catch (error: any) {
    console.error('GET equipment error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch equipment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Create new equipment
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const data = await request.json();
    console.log('📦 POST /api/equipment - Received data:', data);
    
    // Validate required fields
    if (!data.name || !data.category || !data.location) {
      return NextResponse.json({
        success: false,
        error: 'Name, category, and location are required'
      }, { status: 400 });
    }
    
    // Validate status
    const validStatuses = ['In Use', 'In Storage', 'Maintenance', 'Damaged'];
    if (data.status && !validStatuses.includes(data.status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be one of: In Use, In Storage, Maintenance, Damaged'
      }, { status: 400 });
    }
    
    const sql = `
      INSERT INTO equipment (name, category, assigned_to, location, status, maintenance_due, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      data.name.trim(),
      data.category.trim(),
      data.assignedTo?.trim() || null,
      data.location.trim(),
      data.status || 'In Storage',
      data.maintenanceDue || null,
      data.description?.trim() || null
    ];
    
    const result = await query(sql, params) as any;
    const insertId = result.insertId;
    
    // Fetch the newly created equipment
    const [newEquipment] = await query(
      'SELECT * FROM equipment WHERE id = ?',
      [insertId]
    ) as any[];
    
    const transformedEquipment = transformToCamelCase(newEquipment);
    
    console.log('✅ POST /api/equipment - Created equipment ID:', insertId);
    
    return NextResponse.json({
      success: true,
      data: {
        equipment: transformedEquipment,
        message: 'Equipment added successfully'
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ POST equipment error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to add equipment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT - Update existing equipment
export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const data = await request.json();
    console.log('📦 PUT /api/equipment - Received data:', data);
    
    // Validate ID
    if (!data.id) {
      return NextResponse.json({
        success: false,
        error: 'Equipment ID is required for update'
      }, { status: 400 });
    }
    
    // Check if equipment exists
    const [existing] = await query(
      'SELECT * FROM equipment WHERE id = ?',
      [data.id]
    ) as any[];
    
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Equipment not found'
      }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.name || !data.category || !data.location) {
      return NextResponse.json({
        success: false,
        error: 'Name, category, and location are required'
      }, { status: 400 });
    }
    
    // Validate status
    const validStatuses = ['In Use', 'In Storage', 'Maintenance', 'Damaged'];
    if (data.status && !validStatuses.includes(data.status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be one of: In Use, In Storage, Maintenance, Damaged'
      }, { status: 400 });
    }
    
    const sql = `
      UPDATE equipment 
      SET name = ?, category = ?, assigned_to = ?, location = ?, 
          status = ?, maintenance_due = ?, description = ?
      WHERE id = ?
    `;
    
    const params = [
      data.name.trim(),
      data.category.trim(),
      data.assignedTo?.trim() || null,
      data.location.trim(),
      data.status || 'In Storage',
      data.maintenanceDue || null,
      data.description?.trim() || null,
      data.id
    ];
    
    await query(sql, params);
    
    // Fetch updated equipment
    const [updatedEquipment] = await query(
      'SELECT * FROM equipment WHERE id = ?',
      [data.id]
    ) as any[];
    
    const transformedEquipment = transformToCamelCase(updatedEquipment);
    
    console.log('✅ PUT /api/equipment - Updated equipment ID:', data.id);
    
    return NextResponse.json({
      success: true,
      data: {
        equipment: transformedEquipment,
        message: 'Equipment updated successfully'
      }
    });
    
  } catch (error: any) {
    console.error('❌ PUT equipment error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to update equipment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Remove equipment
export async function DELETE(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('🗑️ DELETE /api/equipment - ID:', id);
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Equipment ID is required'
      }, { status: 400 });
    }
    
    // Check if equipment exists
    const [existing] = await query(
      'SELECT * FROM equipment WHERE id = ?',
      [id]
    ) as any[];
    
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Equipment not found'
      }, { status: 404 });
    }
    
    // Delete the equipment
    await query(
      'DELETE FROM equipment WHERE id = ?',
      [id]
    );
    
    console.log('✅ DELETE /api/equipment - Deleted equipment ID:', id);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Equipment deleted successfully',
        deletedId: id
      }
    });
    
  } catch (error: any) {
    console.error('❌ DELETE equipment error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete equipment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PATCH - Update specific fields
export async function PATCH(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const data = await request.json();
    const id = data.id;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Equipment ID is required'
      }, { status: 400 });
    }
    
    // Check if equipment exists
    const [existing] = await query(
      'SELECT * FROM equipment WHERE id = ?',
      [id]
    ) as any[];
    
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Equipment not found'
      }, { status: 404 });
    }
    
    // Build dynamic update query
    const fields = [];
    const params = [];
    
    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name.trim());
    }
    
    if (data.category !== undefined) {
      fields.push('category = ?');
      params.push(data.category.trim());
    }
    
    if (data.assignedTo !== undefined) {
      fields.push('assigned_to = ?');
      params.push(data.assignedTo?.trim() || null);
    }
    
    if (data.location !== undefined) {
      fields.push('location = ?');
      params.push(data.location.trim());
    }
    
    if (data.status !== undefined) {
      const validStatuses = ['In Use', 'In Storage', 'Maintenance', 'Damaged'];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid status value'
        }, { status: 400 });
      }
      fields.push('status = ?');
      params.push(data.status);
    }
    
    if (data.maintenanceDue !== undefined) {
      fields.push('maintenance_due = ?');
      params.push(data.maintenanceDue);
    }
    
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description?.trim() || null);
    }
    
    if (fields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }
    
    params.push(id);
    
    const sql = `
      UPDATE equipment 
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    await query(sql, params);
    
    // Fetch updated equipment
    const [updatedEquipment] = await query(
      'SELECT * FROM equipment WHERE id = ?',
      [id]
    ) as any[];
    
    const transformedEquipment = transformToCamelCase(updatedEquipment);
    
    return NextResponse.json({
      success: true,
      data: {
        equipment: transformedEquipment,
        message: 'Equipment updated successfully'
      }
    });
    
  } catch (error: any) {
    console.error('❌ PATCH equipment error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to update equipment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}