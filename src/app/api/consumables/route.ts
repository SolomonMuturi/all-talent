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
      
      // Check table structure and fix if needed
      await checkAndFixTableStructure();
    }
  } catch (error) {
    console.error('❌ Error initializing consumables table:', error);
    throw error;
  }
}

// Check and fix table structure
async function checkAndFixTableStructure() {
  try {
    console.log('🔍 Checking table structure...');
    
    // Get table information
    const tableInfo = await query(`
      SHOW CREATE TABLE consumables
    `) as any[];
    
    const createTableSQL = tableInfo[0]?.['Create Table'];
    console.log('📊 Table structure:', createTableSQL);
    
    // Check if id has AUTO_INCREMENT
    if (!createTableSQL.includes('AUTO_INCREMENT')) {
      console.log('⚠️  Table does not have AUTO_INCREMENT on id, fixing...');
      
      try {
        // First, check if we can add auto increment
        await query(`
          ALTER TABLE consumables 
          MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY
        `);
        console.log('✅ Added AUTO_INCREMENT to id column');
      } catch (alterError: any) {
        console.log('⚠️  Could not modify id column, trying alternative approach...');
        
        // If there's existing data, we need to handle it differently
        const existingData = await query('SELECT COUNT(*) as count FROM consumables') as any[];
        const count = existingData[0]?.count || 0;
        
        if (count === 0) {
          // If table is empty, drop and recreate
          console.log('📋 Table is empty, recreating with proper structure...');
          await query('DROP TABLE consumables');
          await initializeConsumablesTable();
        } else {
          // If table has data, create a new table with correct structure and copy data
          console.log('📋 Creating new table with correct structure...');
          await query(`
            CREATE TABLE IF NOT EXISTS consumables_new (
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
          
          // Copy data from old table
          await query(`
            INSERT INTO consumables_new (name, category, unit, current_stock, low_stock_threshold, min_order_quantity, price_per_unit, supplier, last_restocked, next_restock_date, location, notes, created_at, updated_at)
            SELECT name, category, unit, current_stock, low_stock_threshold, COALESCE(min_order_quantity, 5), price_per_unit, supplier, last_restocked, next_restock_date, location, notes, created_at, updated_at
            FROM consumables
          `);
          
          // Rename tables
          await query('RENAME TABLE consumables TO consumables_old, consumables_new TO consumables');
          console.log('✅ Table structure fixed');
        }
      }
    }
    
    // Check for missing columns
    await addMissingColumns();
    
    console.log('✅ Table structure is up to date');
    
  } catch (error) {
    console.error('❌ Error checking/fixing table structure:', error);
  }
}

// Add missing columns
async function addMissingColumns() {
  try {
    const columns = await query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'consumables' 
      AND TABLE_SCHEMA = DATABASE()
    `) as any[];
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('📊 Existing columns:', existingColumns);
    
    // Define required columns
    const requiredColumns = [
      { name: 'min_order_quantity', type: 'DECIMAL(10,2)', nullable: 'NOT NULL', defaultValue: 'DEFAULT 5' },
      { name: 'price_per_unit', type: 'DECIMAL(10,2)', nullable: 'NULL', defaultValue: 'DEFAULT NULL' },
      { name: 'supplier', type: 'VARCHAR(255)', nullable: 'NULL', defaultValue: 'DEFAULT NULL' },
      { name: 'last_restocked', type: 'DATE', nullable: 'NULL', defaultValue: 'DEFAULT NULL' },
      { name: 'next_restock_date', type: 'DATE', nullable: 'NULL', defaultValue: 'DEFAULT NULL' },
      { name: 'location', type: 'VARCHAR(100)', nullable: 'NOT NULL', defaultValue: "DEFAULT 'Storage Room A'" },
      { name: 'notes', type: 'TEXT', nullable: 'NULL', defaultValue: 'DEFAULT NULL' }
    ];
    
    // Add missing columns
    for (const requiredCol of requiredColumns) {
      if (!existingColumns.includes(requiredCol.name)) {
        console.log(`➕ Adding missing column: ${requiredCol.name}`);
        await query(`
          ALTER TABLE consumables 
          ADD COLUMN ${requiredCol.name} ${requiredCol.type} ${requiredCol.nullable} ${requiredCol.defaultValue}
        `);
        console.log(`✅ Added column: ${requiredCol.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error adding missing columns:', error);
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
      try {
        // Check if min_order_quantity column exists
        const columns = await query(`
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'consumables' 
          AND TABLE_SCHEMA = DATABASE()
          AND COLUMN_NAME = 'min_order_quantity'
        `) as any[];
        
        if (columns.length > 0) {
          // Column exists, use full insert
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
        } else {
          // Column doesn't exist, use insert without it
          const sql = `
            INSERT INTO consumables (
              name, category, unit, current_stock, low_stock_threshold,
              price_per_unit, supplier, location, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          await query(sql, [
            item.name,
            item.category,
            item.unit,
            item.current_stock,
            item.low_stock_threshold,
            item.price_per_unit,
            item.supplier,
            item.location,
            item.notes || null
          ]);
        }
      } catch (insertError: any) {
        console.error(`❌ Error inserting sample item ${item.name}:`, insertError.message);
      }
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
    
    // First, check what columns exist
    const columns = await query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'consumables' 
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `) as any[];
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('📊 Available columns:', existingColumns);
    
    // Build SELECT query with only existing columns
    const selectColumns = existingColumns.join(', ');
    
    let sql = `SELECT ${selectColumns} FROM consumables WHERE 1=1`;
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
        progress: stockData.progress,
        // Ensure required fields exist
        minOrderQuantity: item.minOrderQuantity || 5,
        pricePerUnit: item.pricePerUnit || 0,
        supplier: item.supplier || '',
        location: item.location || 'Storage Room A',
        notes: item.notes || ''
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
  let connection: any = null;
  
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
    
    // Check what columns exist in the database
    const columns = await query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'consumables' 
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `) as any[];
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('📊 Existing columns for INSERT:', existingColumns);
    
    // Check if id column exists and if it's auto_increment
    const idColumnInfo = await query(`
      SELECT COLUMN_NAME, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'consumables' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'id'
    `) as any[];
    
    const hasAutoIncrementId = idColumnInfo.length > 0 && 
                               idColumnInfo[0].EXTRA.includes('auto_increment');
    
    // Build INSERT query based on existing columns
    const insertColumns = [];
    const placeholders = [];
    const insertValues = [];
    
    // Only include id if it's NOT auto_increment
    if (existingColumns.includes('id') && !hasAutoIncrementId) {
      // Generate a new ID
      const maxIdResult = await query('SELECT COALESCE(MAX(id), 0) as maxId FROM consumables') as any[];
      const nextId = (maxIdResult[0]?.maxId || 0) + 1;
      
      insertColumns.push('id');
      placeholders.push('?');
      insertValues.push(nextId);
    }
    
    // Always required columns
    if (existingColumns.includes('name')) {
      insertColumns.push('name');
      placeholders.push('?');
      insertValues.push(data.name.trim());
    }
    
    if (existingColumns.includes('category')) {
      insertColumns.push('category');
      placeholders.push('?');
      insertValues.push(data.category.trim());
    }
    
    if (existingColumns.includes('unit')) {
      insertColumns.push('unit');
      placeholders.push('?');
      insertValues.push(data.unit.trim());
    }
    
    if (existingColumns.includes('current_stock')) {
      insertColumns.push('current_stock');
      placeholders.push('?');
      insertValues.push(Number(data.currentStock));
    }
    
    if (existingColumns.includes('low_stock_threshold')) {
      insertColumns.push('low_stock_threshold');
      placeholders.push('?');
      insertValues.push(Number(data.lowStockThreshold));
    }
    
    // Optional columns - only include if they exist in the table
    if (existingColumns.includes('min_order_quantity')) {
      insertColumns.push('min_order_quantity');
      placeholders.push('?');
      insertValues.push(Number(data.minOrderQuantity));
    }
    
    if (existingColumns.includes('price_per_unit')) {
      insertColumns.push('price_per_unit');
      placeholders.push('?');
      insertValues.push(data.pricePerUnit ? Number(data.pricePerUnit) : null);
    }
    
    if (existingColumns.includes('supplier')) {
      insertColumns.push('supplier');
      placeholders.push('?');
      insertValues.push(data.supplier?.trim() || null);
    }
    
    if (existingColumns.includes('last_restocked')) {
      insertColumns.push('last_restocked');
      placeholders.push('?');
      insertValues.push(data.lastRestocked || null);
    }
    
    if (existingColumns.includes('next_restock_date')) {
      insertColumns.push('next_restock_date');
      placeholders.push('?');
      insertValues.push(data.nextRestockDate || null);
    }
    
    if (existingColumns.includes('location')) {
      insertColumns.push('location');
      placeholders.push('?');
      insertValues.push(data.location?.trim() || 'Storage Room A');
    }
    
    if (existingColumns.includes('notes')) {
      insertColumns.push('notes');
      placeholders.push('?');
      insertValues.push(data.notes?.trim() || null);
    }
    
    const sql = `
      INSERT INTO consumables (
        ${insertColumns.join(', ')}
      ) VALUES (${placeholders.join(', ')})
    `;
    
    console.log('💾 Executing INSERT:', sql);
    console.log('💾 With values:', insertValues);
    
    // Get a connection to handle the insert
    const pool = require('@/lib/db').default;
    connection = await pool.getConnection();
    
    const [result] = await connection.execute(sql, insertValues);
    const insertId = (result as any).insertId;
    
    console.log(`✅ Insert result:`, result);
    
    // If no insertId returned (non-auto_increment), use the ID we generated
    const finalId = insertId || (existingColumns.includes('id') && !hasAutoIncrementId ? insertValues[0] : null);
    
    // Fetch the created consumable
    let newConsumable;
    if (finalId) {
      [newConsumable] = await connection.execute(
        `SELECT * FROM consumables WHERE id = ?`,
        [finalId]
      ) as any[];
    } else {
      // If we can't fetch by ID, get the last inserted item
      [newConsumable] = await connection.execute(
        `SELECT * FROM consumables ORDER BY id DESC LIMIT 1`
      ) as any[];
    }
    
    const transformedConsumable = toCamelCase(newConsumable?.[0] || {});
    const stockData = getStockStatus(
      Number(transformedConsumable.currentStock) || 0,
      Number(transformedConsumable.lowStockThreshold) || 10
    );
    
    console.log(`✅ Consumable created with ID: ${finalId || 'unknown'}`);
    
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
    console.error('❌ POST consumables error:', error);
    console.error('❌ Full error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    
    // Special handling for id field error
    if (error.code === 'ER_NO_DEFAULT_FOR_FIELD' && error.message.includes("Field 'id'")) {
      return NextResponse.json({
        success: false,
        error: 'Database configuration issue',
        details: 'The database table needs to be recreated with proper structure. Please restart the application.',
        fix: 'The system will attempt to fix this automatically on next request.'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create consumable',
      details: error.message,
      sqlError: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      } : undefined
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
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
    
    // Check what columns exist
    const columns = await query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'consumables' 
      AND TABLE_SCHEMA = DATABASE()
    `) as any[];
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    // Build UPDATE query based on existing columns
    const updateFields = [];
    const updateValues = [];
    
    // Always include these if they exist
    if (existingColumns.includes('name')) {
      updateFields.push('name = ?');
      updateValues.push(data.name.trim());
    }
    
    if (existingColumns.includes('category')) {
      updateFields.push('category = ?');
      updateValues.push(data.category.trim());
    }
    
    if (existingColumns.includes('unit')) {
      updateFields.push('unit = ?');
      updateValues.push(data.unit.trim());
    }
    
    if (existingColumns.includes('current_stock')) {
      updateFields.push('current_stock = ?');
      updateValues.push(Number(data.currentStock));
    }
    
    if (existingColumns.includes('low_stock_threshold')) {
      updateFields.push('low_stock_threshold = ?');
      updateValues.push(Number(data.lowStockThreshold));
    }
    
    // Optional columns
    if (existingColumns.includes('min_order_quantity')) {
      updateFields.push('min_order_quantity = ?');
      updateValues.push(Number(data.minOrderQuantity));
    }
    
    if (existingColumns.includes('price_per_unit')) {
      updateFields.push('price_per_unit = ?');
      updateValues.push(data.pricePerUnit ? Number(data.pricePerUnit) : null);
    }
    
    if (existingColumns.includes('supplier')) {
      updateFields.push('supplier = ?');
      updateValues.push(data.supplier?.trim() || null);
    }
    
    if (existingColumns.includes('last_restocked')) {
      updateFields.push('last_restocked = ?');
      updateValues.push(data.lastRestocked || null);
    }
    
    if (existingColumns.includes('next_restock_date')) {
      updateFields.push('next_restock_date = ?');
      updateValues.push(data.nextRestockDate || null);
    }
    
    if (existingColumns.includes('location')) {
      updateFields.push('location = ?');
      updateValues.push(data.location?.trim() || 'Storage Room A');
    }
    
    if (existingColumns.includes('notes')) {
      updateFields.push('notes = ?');
      updateValues.push(data.notes?.trim() || null);
    }
    
    // Always update the updated_at timestamp
    updateFields.push('updated_at = NOW()');
    
    // Add the WHERE condition
    updateValues.push(data.id);
    
    const sql = `UPDATE consumables SET ${updateFields.join(', ')} WHERE id = ?`;
    
    console.log('✏️ Executing UPDATE:', sql);
    console.log('✏️ With values:', updateValues);
    
    const result = await query(sql, updateValues) as any;
    
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
    
    // Check what columns exist
    const columns = await query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'consumables' 
      AND TABLE_SCHEMA = DATABASE()
    `) as any[];
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    // Build dynamic update query
    const fields = [];
    const params = [];
    
    if (data.currentStock !== undefined && existingColumns.includes('current_stock')) {
      if (isNaN(Number(data.currentStock)) || Number(data.currentStock) < 0) {
        return NextResponse.json({
          success: false,
          error: 'Current stock must be a positive number'
        }, { status: 400 });
      }
      fields.push('current_stock = ?');
      params.push(Number(data.currentStock));
    }
    
    if (data.lowStockThreshold !== undefined && existingColumns.includes('low_stock_threshold')) {
      if (isNaN(Number(data.lowStockThreshold)) || Number(data.lowStockThreshold) <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Low stock threshold must be a positive number'
        }, { status: 400 });
      }
      fields.push('low_stock_threshold = ?');
      params.push(Number(data.lowStockThreshold));
    }
    
    if (data.minOrderQuantity !== undefined && existingColumns.includes('min_order_quantity')) {
      if (isNaN(Number(data.minOrderQuantity)) || Number(data.minOrderQuantity) <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Minimum order quantity must be a positive number'
        }, { status: 400 });
      }
      fields.push('min_order_quantity = ?');
      params.push(Number(data.minOrderQuantity));
    }
    
    if (data.name !== undefined && existingColumns.includes('name')) {
      fields.push('name = ?');
      params.push(data.name.trim());
    }
    
    if (data.category !== undefined && existingColumns.includes('category')) {
      fields.push('category = ?');
      params.push(data.category.trim());
    }
    
    if (data.unit !== undefined && existingColumns.includes('unit')) {
      fields.push('unit = ?');
      params.push(data.unit.trim());
    }
    
    if (data.pricePerUnit !== undefined && existingColumns.includes('price_per_unit')) {
      fields.push('price_per_unit = ?');
      params.push(data.pricePerUnit ? Number(data.pricePerUnit) : null);
    }
    
    if (data.supplier !== undefined && existingColumns.includes('supplier')) {
      fields.push('supplier = ?');
      params.push(data.supplier?.trim() || null);
    }
    
    if (data.lastRestocked !== undefined && existingColumns.includes('last_restocked')) {
      fields.push('last_restocked = ?');
      params.push(data.lastRestocked || null);
    }
    
    if (data.nextRestockDate !== undefined && existingColumns.includes('next_restock_date')) {
      fields.push('next_restock_date = ?');
      params.push(data.nextRestockDate || null);
    }
    
    if (data.location !== undefined && existingColumns.includes('location')) {
      fields.push('location = ?');
      params.push(data.location?.trim() || 'Storage Room A');
    }
    
    if (data.notes !== undefined && existingColumns.includes('notes')) {
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