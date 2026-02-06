// app/api/consumables/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Initialize consumables table with proper structure
async function initializeConsumablesTable() {
  try {
    console.log('🔍 Checking consumables table structure...');
    
    const tables = await query("SHOW TABLES LIKE 'consumables'");
    
    if (!tables || (tables as any[]).length === 0) {
      console.log('📋 Creating consumables table...');
      await query(`
        CREATE TABLE IF NOT EXISTS consumables (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
          low_stock_threshold DECIMAL(10, 2) NOT NULL DEFAULT 10,
          min_order_quantity DECIMAL(10, 2) NOT NULL DEFAULT 5,
          price_per_unit DECIMAL(10, 2) DEFAULT 0,
          supplier VARCHAR(255),
          last_restocked DATE,
          next_restock_date DATE,
          location VARCHAR(100) DEFAULT 'Storage Room A',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_category (category),
          INDEX idx_stock (current_stock),
          INDEX idx_status (current_stock, low_stock_threshold),
          INDEX idx_location (location)
        )
      `);
      console.log('✅ Consumables table created');
      
      // Insert sample data if table is empty
      await insertSampleData();
    } else {
      console.log('✅ Consumables table already exists');
      
      // Check if we need to update the table structure
      try {
        await query(`
          ALTER TABLE consumables 
          MODIFY COLUMN min_order_quantity DECIMAL(10, 2) NOT NULL DEFAULT 5
        `);
        console.log('✅ Updated table structure if needed');
      } catch (alterError) {
        console.log('Table structure is up to date');
      }
    }
  } catch (error) {
    console.error('❌ Error initializing consumables table:', error);
    throw error;
  }
}

// Insert sample data
async function insertSampleData() {
  try {
    console.log('📝 Inserting sample data...');
    
    const sampleData = [
      {
        name: 'Bottled Water',
        category: 'Beverages',
        unit: 'bottles',
        current_stock: 50,
        low_stock_threshold: 100,
        min_order_quantity: 50,
        price_per_unit: 0.5,
        supplier: 'AquaPure Supplies',
        location: 'Storage Room A',
        notes: 'For training sessions'
      },
      {
        name: 'Energy Bars',
        category: 'Snacks',
        unit: 'boxes',
        current_stock: 5,
        low_stock_threshold: 20,
        min_order_quantity: 10,
        price_per_unit: 1.2,
        supplier: 'NutriBoost Foods',
        location: 'Storage Room B',
        notes: 'Post-training snacks'
      },
      {
        name: 'Sports Tape',
        category: 'Medical Supplies',
        unit: 'rolls',
        current_stock: 0,
        low_stock_threshold: 15,
        min_order_quantity: 10,
        price_per_unit: 3.5,
        supplier: 'MediPro Supplies',
        location: 'First Aid Room',
        notes: 'For injury prevention'
      },
      {
        name: 'Isotonic Drink',
        category: 'Beverages',
        unit: 'bottles',
        current_stock: 120,
        low_stock_threshold: 50,
        min_order_quantity: 30,
        price_per_unit: 1.0,
        supplier: 'Sports Supply Co.',
        location: 'Storage Room A'
      },
      {
        name: 'Protein Shakes',
        category: 'Supplements',
        unit: 'bottles',
        current_stock: 25,
        low_stock_threshold: 30,
        min_order_quantity: 24,
        price_per_unit: 2.5,
        supplier: 'MuscleFuel Inc.',
        location: 'Storage Room C',
        notes: 'Post-workout recovery'
      }
    ];

    for (const item of sampleData) {
      const sql = `
        INSERT INTO consumables (
          name, category, unit, current_stock, low_stock_threshold,
          min_order_quantity, price_per_unit, supplier, location, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await query(sql, [
        item.name,
        item.category,
        item.unit,
        item.current_stock,
        item.low_stock_threshold,
        item.min_order_quantity,
        item.price_per_unit,
        item.supplier,
        item.location,
        item.notes || null
      ]);
    }
    
    console.log('✅ Sample data inserted');
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
}

// Transform snake_case to camelCase
function toCamelCase(data: any) {
  if (Array.isArray(data)) {
    return data.map(item => toCamelCase(item));
  }
  
  if (data && typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = value;
    }
    return result;
  }
  
  return data;
}

// Transform camelCase to snake_case for database
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = value;
    }
    return result;
  }
  
  return obj;
}

// Validate consumable data
function validateConsumableData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (!data.category?.trim()) {
    errors.push('Category is required');
  }
  
  if (!data.unit?.trim()) {
    errors.push('Unit is required');
  }
  
  if (data.currentStock === undefined || data.currentStock === null) {
    errors.push('Current stock is required');
  } else if (isNaN(Number(data.currentStock)) || Number(data.currentStock) < 0) {
    errors.push('Current stock must be a positive number');
  }
  
  if (data.lowStockThreshold === undefined || data.lowStockThreshold === null) {
    errors.push('Low stock threshold is required');
  } else if (isNaN(Number(data.lowStockThreshold)) || Number(data.lowStockThreshold) <= 0) {
    errors.push('Low stock threshold must be a positive number');
  }
  
  if (data.minOrderQuantity === undefined || data.minOrderQuantity === null) {
    errors.push('Minimum order quantity is required');
  } else if (isNaN(Number(data.minOrderQuantity)) || Number(data.minOrderQuantity) <= 0) {
    errors.push('Minimum order quantity must be a positive number');
  }
  
  if (data.pricePerUnit !== undefined && data.pricePerUnit !== null) {
    if (isNaN(Number(data.pricePerUnit)) || Number(data.pricePerUnit) < 0) {
      errors.push('Price per unit must be a positive number');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

// Calculate stock status
function getStockStatus(currentStock: number, lowStockThreshold: number): {
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  needsRestock: boolean;
  progress: number;
} {
  let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
  let needsRestock = false;
  
  if (currentStock <= 0) {
    status = 'Out of Stock';
    needsRestock = true;
  } else if (currentStock <= lowStockThreshold) {
    status = 'Low Stock';
    needsRestock = true;
  }
  
  // Calculate progress based on reaching 150% of threshold
  const targetStock = lowStockThreshold * 1.5;
  const progress = Math.min((currentStock / targetStock) * 100, 100);
  
  return { status, needsRestock, progress };
}

// GET all consumables with filtering
export async function GET(request: NextRequest) {
  try {
    await initializeConsumablesTable();
    
    console.log('📋 Fetching consumables...');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    
    let sql = 'SELECT * FROM consumables WHERE 1=1';
    const params: any[] = [];
    
    if (id) {
      sql += ' AND id = ?';
      params.push(id);
    }
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (location) {
      sql += ' AND location = ?';
      params.push(location);
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR category LIKE ? OR supplier LIKE ? OR notes LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY category, name';
    
    console.log('📝 Executing SQL:', sql);
    console.log('📝 With params:', params);
    
    const consumables = await query(sql, params);
    const transformedConsumables = toCamelCase(consumables);
    
    // Calculate stock status for each item
    const enhancedConsumables = (transformedConsumables as any[]).map(item => {
      const stockData = getStockStatus(
        Number(item.currentStock) || 0,
        Number(item.lowStockThreshold) || 10
      );
      return {
        ...item,
        stockStatus: stockData.status,
        needsRestock: stockData.needsRestock,
        progress: stockData.progress
      };
    });
    
    // Apply status filter if needed
    let filteredConsumables = enhancedConsumables;
    if (status && !id) {
      filteredConsumables = enhancedConsumables.filter(item => {
        if (status === 'low-stock') return item.stockStatus === 'Low Stock';
        if (status === 'out-of-stock') return item.stockStatus === 'Out of Stock';
        if (status === 'in-stock') return item.stockStatus === 'In Stock';
        return true;
      });
    }
    
    console.log(`✅ Found ${filteredConsumables.length} consumables`);
    
    // Calculate statistics
    const categories = [...new Set(enhancedConsumables.map(item => item.category))];
    const lowStockCount = enhancedConsumables.filter(item => item.stockStatus === 'Low Stock').length;
    const outOfStockCount = enhancedConsumables.filter(item => item.stockStatus === 'Out of Stock').length;
    const totalStockValue = enhancedConsumables.reduce((sum, item) => {
      const price = Number(item.pricePerUnit) || 0;
      const stock = Number(item.currentStock) || 0;
      return sum + (price * stock);
    }, 0);
    
    // If fetching single item by ID
    if (id) {
      if (filteredConsumables.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Consumable not found'
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: {
          consumable: filteredConsumables[0]
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        consumables: filteredConsumables,
        count: filteredConsumables.length,
        categories,
        statistics: {
          total: filteredConsumables.length,
          lowStockCount,
          outOfStockCount,
          totalStockValue,
          averageStockValue: totalStockValue / (filteredConsumables.length || 1)
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ GET consumables error:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch consumables',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Create new consumable
export async function POST(request: NextRequest) {
  try {
    await initializeConsumablesTable();
    
    console.log('📨 POST /api/consumables called');
    
    const data = await request.json();
    console.log('📦 Received data:', data);
    
    const validation = validateConsumableData(data);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }
    
    // Prepare SQL
    const sql = `
      INSERT INTO consumables (
        name, category, unit, current_stock, low_stock_threshold,
        min_order_quantity, price_per_unit, supplier, last_restocked,
        next_restock_date, location, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      data.name.trim(),
      data.category.trim(),
      data.unit.trim(),
      Number(data.currentStock),
      Number(data.lowStockThreshold),
      Number(data.minOrderQuantity),
      data.pricePerUnit ? Number(data.pricePerUnit) : null,
      data.supplier?.trim() || null,
      data.lastRestocked || null,
      data.nextRestockDate || null,
      data.location?.trim() || 'Storage Room A',
      data.notes?.trim() || null
    ];
    
    console.log('💾 Executing INSERT:', sql);
    console.log('💾 With values:', params);
    
    const result = await query(sql, params) as any;
    const insertId = result.insertId;
    
    // Fetch the created consumable
    const [newConsumable] = await query(
      'SELECT * FROM consumables WHERE id = ?',
      [insertId]
    ) as any[];
    
    const transformedConsumable = toCamelCase(newConsumable);
    const stockData = getStockStatus(
      Number(transformedConsumable.currentStock),
      Number(transformedConsumable.lowStockThreshold)
    );
    
    console.log(`✅ Consumable created with ID: ${insertId}`);
    
    return NextResponse.json({
      success: true,
      data: {
        consumable: {
          ...transformedConsumable,
          stockStatus: stockData.status,
          needsRestock: stockData.needsRestock,
          progress: stockData.progress
        },
        message: 'Consumable created successfully'
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ POST consumables error:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({
      success: false,
      error: 'Failed to create consumable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT - Update consumable (full update)
export async function PUT(request: NextRequest) {
  try {
    await initializeConsumablesTable();
    
    console.log('📨 PUT /api/consumables called');
    
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({
        success: false,
        error: 'Consumable ID is required'
      }, { status: 400 });
    }
    
    const validation = validateConsumableData(data);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }
    
    // Check if exists
    const [existing] = await query(
      'SELECT id FROM consumables WHERE id = ?',
      [data.id]
    ) as any[];
    
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Consumable not found'
      }, { status: 404 });
    }
    
    const sql = `
      UPDATE consumables SET
        name = ?, category = ?, unit = ?, current_stock = ?,
        low_stock_threshold = ?, min_order_quantity = ?,
        price_per_unit = ?, supplier = ?, last_restocked = ?,
        next_restock_date = ?, location = ?, notes = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    
    const params = [
      data.name.trim(),
      data.category.trim(),
      data.unit.trim(),
      Number(data.currentStock),
      Number(data.lowStockThreshold),
      Number(data.minOrderQuantity),
      data.pricePerUnit ? Number(data.pricePerUnit) : null,
      data.supplier?.trim() || null,
      data.lastRestocked || null,
      data.nextRestockDate || null,
      data.location?.trim() || 'Storage Room A',
      data.notes?.trim() || null,
      data.id
    ];
    
    console.log('✏️ Executing UPDATE:', sql);
    console.log('✏️ With values:', params);
    
    const result = await query(sql, params) as any;
    
    // Fetch updated consumable
    const [updatedConsumable] = await query(
      'SELECT * FROM consumables WHERE id = ?',
      [data.id]
    ) as any[];
    
    const transformedConsumable = toCamelCase(updatedConsumable);
    const stockData = getStockStatus(
      Number(transformedConsumable.currentStock),
      Number(transformedConsumable.lowStockThreshold)
    );
    
    console.log(`✅ Consumable updated: ${result.affectedRows} rows affected`);
    
    return NextResponse.json({
      success: true,
      data: {
        consumable: {
          ...transformedConsumable,
          stockStatus: stockData.status,
          needsRestock: stockData.needsRestock,
          progress: stockData.progress
        },
        message: 'Consumable updated successfully'
      }
    });
    
  } catch (error: any) {
    console.error('❌ PUT consumables error:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({
      success: false,
      error: 'Failed to update consumable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PATCH - Partial update (for stock adjustments)
export async function PATCH(request: NextRequest) {
  try {
    await initializeConsumablesTable();
    
    console.log('📨 PATCH /api/consumables called');
    
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({
        success: false,
        error: 'Consumable ID is required'
      }, { status: 400 });
    }
    
    // Check if exists
    const [existing] = await query(
      'SELECT * FROM consumables WHERE id = ?',
      [data.id]
    ) as any[];
    
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Consumable not found'
      }, { status: 404 });
    }
    
    // Build dynamic update query
    const fields = [];
    const params = [];
    
    if (data.currentStock !== undefined) {
      if (isNaN(Number(data.currentStock)) || Number(data.currentStock) < 0) {
        return NextResponse.json({
          success: false,
          error: 'Current stock must be a positive number'
        }, { status: 400 });
      }
      fields.push('current_stock = ?');
      params.push(Number(data.currentStock));
    }
    
    if (data.lowStockThreshold !== undefined) {
      if (isNaN(Number(data.lowStockThreshold)) || Number(data.lowStockThreshold) <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Low stock threshold must be a positive number'
        }, { status: 400 });
      }
      fields.push('low_stock_threshold = ?');
      params.push(Number(data.lowStockThreshold));
    }
    
    if (data.minOrderQuantity !== undefined) {
      if (isNaN(Number(data.minOrderQuantity)) || Number(data.minOrderQuantity) <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Minimum order quantity must be a positive number'
        }, { status: 400 });
      }
      fields.push('min_order_quantity = ?');
      params.push(Number(data.minOrderQuantity));
    }
    
    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name.trim());
    }
    
    if (data.category !== undefined) {
      fields.push('category = ?');
      params.push(data.category.trim());
    }
    
    if (data.unit !== undefined) {
      fields.push('unit = ?');
      params.push(data.unit.trim());
    }
    
    if (data.pricePerUnit !== undefined) {
      fields.push('price_per_unit = ?');
      params.push(data.pricePerUnit ? Number(data.pricePerUnit) : null);
    }
    
    if (data.supplier !== undefined) {
      fields.push('supplier = ?');
      params.push(data.supplier?.trim() || null);
    }
    
    if (data.lastRestocked !== undefined) {
      fields.push('last_restocked = ?');
      params.push(data.lastRestocked || null);
    }
    
    if (data.nextRestockDate !== undefined) {
      fields.push('next_restock_date = ?');
      params.push(data.nextRestockDate || null);
    }
    
    if (data.location !== undefined) {
      fields.push('location = ?');
      params.push(data.location?.trim() || 'Storage Room A');
    }
    
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      params.push(data.notes?.trim() || null);
    }
    
    if (fields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }
    
    fields.push('updated_at = NOW()');
    params.push(data.id);
    
    const sql = `UPDATE consumables SET ${fields.join(', ')} WHERE id = ?`;
    
    console.log('🔄 Executing PATCH:', sql);
    console.log('🔄 With values:', params);
    
    const result = await query(sql, params) as any;
    
    // Fetch updated consumable
    const [updatedConsumable] = await query(
      'SELECT * FROM consumables WHERE id = ?',
      [data.id]
    ) as any[];
    
    const transformedConsumable = toCamelCase(updatedConsumable);
    const stockData = getStockStatus(
      Number(transformedConsumable.currentStock),
      Number(transformedConsumable.lowStockThreshold)
    );
    
    console.log(`✅ Consumable patched: ${result.affectedRows} rows affected`);
    
    return NextResponse.json({
      success: true,
      data: {
        consumable: {
          ...transformedConsumable,
          stockStatus: stockData.status,
          needsRestock: stockData.needsRestock,
          progress: stockData.progress
        },
        message: 'Consumable updated successfully'
      }
    });
    
  } catch (error: any) {
    console.error('❌ PATCH consumables error:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({
      success: false,
      error: 'Failed to update consumable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Remove consumable
export async function DELETE(request: NextRequest) {
  try {
    await initializeConsumablesTable();
    
    console.log('📨 DELETE /api/consumables called');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Consumable ID is required'
      }, { status: 400 });
    }
    
    // Check if exists
    const [existing] = await query(
      'SELECT id FROM consumables WHERE id = ?',
      [id]
    ) as any[];
    
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Consumable not found'
      }, { status: 404 });
    }
    
    const result = await query(
      'DELETE FROM consumables WHERE id = ?',
      [id]
    ) as any;
    
    console.log(`✅ Consumable deleted: ${result.affectedRows} rows affected`);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Consumable deleted successfully',
        deletedId: id
      }
    });
    
  } catch (error: any) {
    console.error('❌ DELETE consumables error:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete consumable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// OPTIONS - CORS
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