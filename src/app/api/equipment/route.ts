// app/api/equipment/route.ts
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
    console.log('🔌 Database connection established');
    console.log('📝 Executing SQL:', sql);
    console.log('📝 With params:', params);
    
    const [results] = await connection.execute(sql, params);
    console.log('✅ Query successful');
    return results;
  } catch (error: any) {
    console.error('❌ Database query error:', error.message);
    console.error('❌ SQL:', sql);
    console.error('❌ Params:', params);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Initialize database table if not exists
async function initializeDatabase() {
  try {
    console.log('🔍 Checking table structure...');
    
    // Check if table exists
    const [tables] = await query("SHOW TABLES LIKE 'equipment'") as any[];
    
    if (!tables || tables.length === 0) {
      console.log('📋 Creating equipment table...');
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
      console.log('✅ Equipment table created');
    } else {
      console.log('✅ Equipment table already exists');
    }
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
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
      // Convert snake_case to camelCase
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

// Validate equipment data
function validateEquipmentData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!data.category || data.category.trim() === '') {
    errors.push('Category is required');
  }
  
  if (!data.location || data.location.trim() === '') {
    errors.push('Location is required');
  }
  
  if (data.status && !['In Use', 'In Storage', 'Maintenance', 'Damaged'].includes(data.status)) {
    errors.push('Status must be one of: In Use, In Storage, Maintenance, Damaged');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// GET all equipment with optional filters
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    console.log('📋 Fetching equipment...');
    
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
    
    console.log(`✅ Found ${transformedEquipment.length} equipment items`);
    
    return NextResponse.json({
      success: true,
      data: {
        equipment: transformedEquipment,
        count: transformedEquipment.length
      }
    });
    
  } catch (error: any) {
    console.error('❌ GET equipment error:', error.message);
    
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
    
    console.log('📨 POST /api/equipment called');
    
    // Parse request data
    const data = await request.json();
    console.log('📦 Received data:', data);
    
    // Validate required fields
    const validation = validateEquipmentData(data);
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }
    
    console.log('✅ Data validation passed');
    
    // Prepare insert query
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
    
    console.log('💾 Executing INSERT:', sql);
    console.log('💾 With values:', params);
    
    const result = await query(sql, params) as any;
    const insertId = result.insertId;
    
    console.log(`🆕 Inserted equipment ID: ${insertId}`);
    
    // Fetch the newly created equipment
    const [newEquipment] = await query(
      'SELECT * FROM equipment WHERE id = ?',
      [insertId]
    ) as any[];
    
    const transformedEquipment = transformToCamelCase(newEquipment);
    
    console.log('✅ Equipment created successfully');
    
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
    
    console.log('📨 PUT /api/equipment called');
    
    // Parse request data
    const data = await request.json();
    console.log('📦 Received update data:', data);
    
    if (!data.id) {
      return NextResponse.json({
        success: false,
        error: 'Equipment ID is required for update'
      }, { status: 400 });
    }
    
    // Validate data
    const validation = validateEquipmentData(data);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }
    
    // Build update query dynamically
    const fields = [];
    const params = [];
    
    fields.push('name = ?');
    params.push(data.name.trim());
    
    fields.push('category = ?');
    params.push(data.category.trim());
    
    fields.push('assigned_to = ?');
    params.push(data.assignedTo?.trim() || null);
    
    fields.push('location = ?');
    params.push(data.location.trim());
    
    fields.push('status = ?');
    params.push(data.status || 'In Storage');
    
    if (data.maintenanceDue !== undefined) {
      fields.push('maintenance_due = ?');
      params.push(data.maintenanceDue);
    }
    
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description?.trim() || null);
    }
    
    // Add ID as last parameter
    params.push(data.id);
    
    const sql = `
      UPDATE equipment 
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    console.log('✏️ Executing UPDATE:', sql);
    console.log('✏️ With values:', params);
    
    const result = await query(sql, params) as any;
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        error: 'Equipment not found'
      }, { status: 404 });
    }
    
    // Fetch updated equipment
    const [updatedEquipment] = await query(
      'SELECT * FROM equipment WHERE id = ?',
      [data.id]
    ) as any[];
    
    const transformedEquipment = transformToCamelCase(updatedEquipment);
    
    console.log('✅ Equipment updated successfully');
    
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
    
    console.log('📨 DELETE /api/equipment called');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Equipment ID is required'
      }, { status: 400 });
    }
    
    console.log(`🗑️ Deleting equipment ID: ${id}`);
    
    // First, check if equipment exists
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
    const result = await query(
      'DELETE FROM equipment WHERE id = ?',
      [id]
    ) as any;
    
    console.log(`✅ Equipment deleted, affected rows: ${result.affectedRows}`);
    
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

// PATCH - Update specific fields (like status, assignment)
export async function PATCH(request: NextRequest) {
  try {
    await initializeDatabase();
    
    console.log('📨 PATCH /api/equipment called');
    
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
    
    // Build partial update query
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
      if (!['In Use', 'In Storage', 'Maintenance', 'Damaged'].includes(data.status)) {
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
    
    console.log('🔄 Executing PATCH:', sql);
    console.log('🔄 With values:', params);
    
    await query(sql, params);
    
    // Fetch updated equipment
    const [updatedEquipment] = await query(
      'SELECT * FROM equipment WHERE id = ?',
      [id]
    ) as any[];
    
    const transformedEquipment = transformToCamelCase(updatedEquipment);
    
    console.log('✅ Equipment patched successfully');
    
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

