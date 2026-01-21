// lib/db.ts
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alltalent_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
};

let pool: mysql.Pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ MySQL connection pool created successfully');
} catch (error) {
  console.error('❌ Failed to create MySQL pool:', error);
  // Create pool without database first for initialization
  pool = mysql.createPool({ ...dbConfig, database: undefined });
}

// Test connection
export async function testConnection() {
  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS result, NOW() as timestamp, DATABASE() as database');
    console.log('✅ Database connection successful');
    return { 
      success: true, 
      data: rows, 
      timestamp: new Date().toISOString(),
      env: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      }
    };
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      sqlState: error.sqlState
    };
  } finally {
    if (connection) connection.release();
  }
}

// Execute query helper with better error handling
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params || []);
    return rows as T;
  } catch (error: any) {
    console.error('❌ Query error:', {
      sql,
      params,
      error: error.message,
      code: error.code
    });
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Transaction support
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Get connection from pool
export async function getConnection(): Promise<mysql.PoolConnection> {
  return await pool.getConnection();
}

// Check if database exists, create if not
export async function ensureDatabaseExists() {
  try {
    const connection = await getConnection();
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'alltalent_db'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'alltalent_db'}`);
    connection.release();
    console.log(`✅ Database "${process.env.DB_NAME || 'alltalent_db'}" is ready`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to ensure database exists:', error.message);
    return false;
  }
}

// Initialize database with all TalentTrack tables
export async function initDatabase() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'alltalent_db'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'alltalent_db'}`);
    
    // Create all tables (same as your structure)
    const tables = [
      // Players Table
      `
      CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        position VARCHAR(50) NOT NULL,
        avatar_url VARCHAR(500),
        team VARCHAR(50),
        attendance INT DEFAULT 0,
        discipline_score INT DEFAULT 100,
        \`rank\` INT DEFAULT 0,
        points INT DEFAULT 0,
        stats_played INT DEFAULT 0,
        stats_wins INT DEFAULT 0,
        stats_draws INT DEFAULT 0,
        stats_losses INT DEFAULT 0,
        highlights JSON,
        gps_max_speed DECIMAL(5,2),
        gps_distance_covered DECIMAL(5,2),
        gps_player_load INT,
        physical_speed INT DEFAULT 0,
        physical_stamina INT DEFAULT 0,
        physical_strength INT DEFAULT 0,
        technical_dribbling INT DEFAULT 0,
        technical_shooting INT DEFAULT 0,
        technical_passing INT DEFAULT 0,
        tactical_positioning INT DEFAULT 0,
        tactical_game_reading INT DEFAULT 0,
        psycho_leadership INT DEFAULT 0,
        psycho_teamwork INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_team (team),
        INDEX idx_position (position),
        INDEX idx_rank (\`rank\`)
      )
      `,
      
      // Certificates Table
      `
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(50) PRIMARY KEY,
        player_id INT NOT NULL,
        module_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        INDEX idx_player_id (player_id),
        INDEX idx_date (date)
      )
      `,
      
      // Disciplinary Infractions Table
      `
      CREATE TABLE IF NOT EXISTS disciplinary_infractions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_id INT NOT NULL,
        date DATE NOT NULL,
        infraction TEXT NOT NULL,
        severity ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        sanction TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        INDEX idx_player_id (player_id),
        INDEX idx_severity (severity),
        INDEX idx_date (date)
      )
      `,
      
      // Injuries Table
      `
      CREATE TABLE IF NOT EXISTS injuries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_id INT NOT NULL,
        date DATE NOT NULL,
        injury TEXT NOT NULL,
        severity ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        rtp_status ENUM('In Treatment', 'Cleared for Light Training', 'Cleared to Play') DEFAULT 'In Treatment',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        INDEX idx_player_id (player_id),
        INDEX idx_rtp_status (rtp_status),
        INDEX idx_date (date)
      )
      `,
      
      // Transactions Table
      `
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        player_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('Completed', 'Pending', 'Failed') DEFAULT 'Pending',
        type ENUM('Fee Payment', 'Stipend', 'Expense', 'Refund') NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_type (type),
        INDEX idx_date (date),
        INDEX idx_player_name (player_name)
      )
      `,
      
      // Team Members (Staff) Table
      `
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role ENUM('Admin', 'Coach', 'Finance', 'Scout') DEFAULT 'Coach',
        avatar_url VARCHAR(500),
        hourly_rate DECIMAL(10,2) DEFAULT 0,
        hours_worked INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role),
        INDEX idx_is_active (is_active)
      )
      `,
      
      // Equipment Table
      `
      CREATE TABLE IF NOT EXISTS equipment (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        assigned_to VARCHAR(255),
        location VARCHAR(255) NOT NULL,
        status ENUM('In Use', 'In Storage', 'Maintenance') DEFAULT 'In Storage',
        maintenance_due DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_assigned_to (assigned_to)
      )
      `,
      
      // Consumables Table
      `
      CREATE TABLE IF NOT EXISTS consumables (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category ENUM('Drinks', 'Medical', 'Snacks') NOT NULL,
        current_stock INT DEFAULT 0,
        unit VARCHAR(50) NOT NULL,
        low_stock_threshold INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_low_stock (current_stock)
      )
      `,
      
      // Messages Table
      `
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        channel ENUM('In-App', 'SMS', 'WhatsApp') DEFAULT 'In-App',
        recipient_group VARCHAR(255) NOT NULL,
        status ENUM('Sent', 'Scheduled', 'Failed') DEFAULT 'Scheduled',
        timestamp DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_channel (channel),
        INDEX idx_recipient_group (recipient_group),
        INDEX idx_timestamp (timestamp)
      )
      `,
      
      // Academy Events Table
      `
      CREATE TABLE IF NOT EXISTS academy_events (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        organizer VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        category ENUM('Training', 'Match', 'Trial', 'Social', 'Tournament', 'Concert', 'Conference') NOT NULL,
        logo_url VARCHAR(500),
        country VARCHAR(100),
        location VARCHAR(255),
        venue VARCHAR(255),
        game_type VARCHAR(100),
        tournament_type ENUM('League', 'Cup', 'Friendly', 'N/A') DEFAULT 'N/A',
        team_count INT DEFAULT 0,
        lineup_formation VARCHAR(50),
        lineup_squad JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_event_date (event_date),
        INDEX idx_organizer (organizer)
      )
      `,
      
      // Event Participants Table
      `
      CREATE TABLE IF NOT EXISTS event_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(50) NOT NULL,
        player_id INT NOT NULL,
        participation_type ENUM('Player', 'Staff', 'Spectator') DEFAULT 'Player',
        role VARCHAR(100),
        status ENUM('Confirmed', 'Pending', 'Declined') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES academy_events(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        UNIQUE KEY unique_participation (event_id, player_id),
        INDEX idx_event_id (event_id),
        INDEX idx_player_id (player_id),
        INDEX idx_status (status)
      )
      `,
      
      // Users Table (for authentication)
      `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role ENUM('Super Admin', 'Admin', 'Coach', 'Staff', 'Viewer') DEFAULT 'Viewer',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_is_active (is_active)
      )
      `,
      
      // Settings Table
      `
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_setting_key (setting_key),
        INDEX idx_category (category)
      )
      `
    ];
    
    // Execute all table creation queries
    for (const tableSql of tables) {
      await connection.query(tableSql);
    }
    
    // Insert default settings
    await connection.query(`
      INSERT INTO settings (setting_key, setting_value, setting_type, category, description) VALUES
      ('app_name', 'TalentTrack Academy', 'string', 'general', 'Application name'),
      ('currency', 'KES', 'string', 'finance', 'Default currency'),
      ('low_stock_notification_threshold', '20', 'number', 'inventory', 'Threshold for low stock alerts'),
      ('default_attendance_threshold', '80', 'number', 'performance', 'Minimum acceptable attendance percentage'),
      ('enable_gps_tracking', 'true', 'boolean', 'features', 'Enable GPS tracking for players'),
      ('sms_gateway_enabled', 'false', 'boolean', 'communications', 'Enable SMS notifications'),
      ('maintenance_mode', 'false', 'boolean', 'system', 'Put system in maintenance mode')
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `);
    
    console.log('✅ All TalentTrack database tables created successfully');
    return { success: true, message: 'Database initialized successfully' };
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

// Helper functions for common operations
export const db = {
  // Player operations
  players: {
    async getAll(limit = 100, offset = 0) {
      return await query(
        `SELECT * FROM players ORDER BY \`rank\`, points DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );
    },
    
    async getById(id: number) {
      const players = await query('SELECT * FROM players WHERE id = ?', [id]);
      return players[0] || null;
    },
    
    async create(data: any) {
      const result = await query(
        `INSERT INTO players (name, age, position, team, attendance, discipline_score, \`rank\`, points) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.age,
          data.position,
          data.team || null,
          data.attendance || 0,
          data.discipline_score || 100,
          data.rank || 0,
          data.points || 0
        ]
      );
      return (result as any).insertId;
    },
    
    async update(id: number, data: any) {
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(data)) {
        if (key === 'rank') {
          fields.push('`rank` = ?');
        } else {
          fields.push(`${key} = ?`);
        }
        values.push(value);
      }
      
      if (fields.length === 0) return 0;
      
      values.push(id);
      await query(
        `UPDATE players SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      return id;
    },
    
    async delete(id: number) {
      await query('DELETE FROM players WHERE id = ?', [id]);
      return true;
    },
    
    async search(queryStr: string) {
      return await query(
        `SELECT * FROM players 
         WHERE name LIKE ? OR position LIKE ? OR team LIKE ?
         ORDER BY name`,
        [`%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`]
      );
    },
    
    async getStats(playerId: number) {
      return await query(
        `SELECT 
          COUNT(DISTINCT ep.event_id) as total_events,
          COUNT(DISTINCT c.id) as total_certificates,
          COUNT(DISTINCT di.id) as total_infractions,
          COUNT(DISTINCT i.id) as total_injuries
         FROM players p
         LEFT JOIN event_participants ep ON p.id = ep.player_id
         LEFT JOIN certificates c ON p.id = c.player_id
         LEFT JOIN disciplinary_infractions di ON p.id = di.player_id
         LEFT JOIN injuries i ON p.id = i.player_id
         WHERE p.id = ?
         GROUP BY p.id`,
        [playerId]
      );
    }
  },
  
  // Transaction operations
  transactions: {
    async getAll(filter?: { status?: string; type?: string; playerName?: string }) {
      let sql = 'SELECT * FROM transactions';
      const params: any[] = [];
      const conditions = [];
      
      if (filter?.status) {
        conditions.push('status = ?');
        params.push(filter.status);
      }
      if (filter?.type) {
        conditions.push('type = ?');
        params.push(filter.type);
      }
      if (filter?.playerName) {
        conditions.push('player_name LIKE ?');
        params.push(`%${filter.playerName}%`);
      }
      
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      
      sql += ' ORDER BY date DESC, created_at DESC';
      return await query(sql, params);
    },
    
    async getById(id: string) {
      const transactions = await query('SELECT * FROM transactions WHERE id = ?', [id]);
      return transactions[0] || null;
    },
    
    async create(data: any) {
      const result = await query(
        `INSERT INTO transactions (id, player_name, date, amount, type, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id || `TXN${Date.now()}`,
          data.player_name,
          data.date || new Date().toISOString().split('T')[0],
          data.amount,
          data.type,
          data.description || null,
          data.status || 'Pending'
        ]
      );
      return (result as any).insertId;
    },
    
    async updateStatus(id: string, status: string) {
      await query(
        'UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
      return true;
    },
    
    async getSummary() {
      return await query(`
        SELECT 
          type,
          status,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM transactions
        GROUP BY type, status
        ORDER BY type, status
      `);
    }
  },
  
  // Event operations
  events: {
    async getUpcoming(limit = 10) {
      return await query(
        `SELECT * FROM academy_events 
         WHERE event_date >= CURDATE() 
         ORDER BY event_date ASC 
         LIMIT ?`,
        [limit]
      );
    },
    
    async getPast(limit = 10) {
      return await query(
        `SELECT * FROM academy_events 
         WHERE event_date < CURDATE() 
         ORDER BY event_date DESC 
         LIMIT ?`,
        [limit]
      );
    },
    
    async getById(id: string) {
      const events = await query(
        `SELECT e.*, 
                COUNT(DISTINCT ep.player_id) as participant_count
         FROM academy_events e
         LEFT JOIN event_participants ep ON e.id = ep.event_id
         WHERE e.id = ?
         GROUP BY e.id`,
        [id]
      );
      return events[0] || null;
    },
    
    async getParticipants(eventId: string) {
      return await query(
        `SELECT ep.*, p.name as player_name, p.position, p.team
         FROM event_participants ep
         JOIN players p ON ep.player_id = p.id
         WHERE ep.event_id = ?
         ORDER BY ep.status, p.name`,
        [eventId]
      );
    }
  },
  
  // Dashboard statistics
  async getDashboardStats() {
    const [
      totalPlayers,
      totalTransactions,
      upcomingEvents,
      activeStaff,
      totalEquipment,
      lowStockItems
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM players'),
      query('SELECT SUM(amount) as total FROM transactions WHERE status = "Completed"'),
      query('SELECT COUNT(*) as count FROM academy_events WHERE event_date >= CURDATE()'),
      query('SELECT COUNT(*) as count FROM team_members WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as count FROM equipment'),
      query('SELECT COUNT(*) as count FROM consumables WHERE current_stock <= low_stock_threshold')
    ]);
    
    return {
      totalPlayers: totalPlayers[0]?.count || 0,
      totalRevenue: totalTransactions[0]?.total || 0,
      upcomingEvents: upcomingEvents[0]?.count || 0,
      activeStaff: activeStaff[0]?.count || 0,
      totalEquipment: totalEquipment[0]?.count || 0,
      lowStockItems: lowStockItems[0]?.count || 0,
      updatedAt: new Date().toISOString()
    };
  },
  
  // User authentication
  users: {
    async findByEmail(email: string) {
      const users = await query('SELECT * FROM users WHERE email = ?', [email]);
      return users[0] || null;
    },
    
    async findById(id: number) {
      const users = await query('SELECT * FROM users WHERE id = ?', [id]);
      return users[0] || null;
    },
    
    async create(data: { username: string; email: string; password_hash: string; full_name?: string; role?: string }) {
      const result = await query(
        `INSERT INTO users (username, email, password_hash, full_name, role) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          data.username,
          data.email,
          data.password_hash,
          data.full_name || null,
          data.role || 'Viewer'
        ]
      );
      return (result as any).insertId;
    },
    
    async updateLastLogin(id: number) {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
    }
  },
  
  // Settings
  settings: {
    async get(key: string) {
      const settings = await query(
        'SELECT * FROM settings WHERE setting_key = ?',
        [key]
      );
      return settings[0] || null;
    },
    
    async set(key: string, value: string, type = 'string', category = 'general', description = '') {
      await query(
        `INSERT INTO settings (setting_key, setting_value, setting_type, category, description) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           setting_value = VALUES(setting_value),
           setting_type = VALUES(setting_type),
           category = VALUES(category),
           description = VALUES(description),
           updated_at = CURRENT_TIMESTAMP`,
        [key, value, type, category, description]
      );
      return true;
    },
    
    async getAll(category?: string) {
      let sql = 'SELECT * FROM settings';
      const params: any[] = [];
      
      if (category) {
        sql += ' WHERE category = ?';
        params.push(category);
      }
      
      sql += ' ORDER BY category, setting_key';
      return await query(sql, params);
    }
  }
};

// Health check endpoint
export async function healthCheck() {
  try {
    const [dbResult] = await query('SELECT 1 as status, NOW() as timestamp');
    const tables = await query(`
      SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME, UPDATE_TIME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [process.env.DB_NAME || 'alltalent_db']);
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        name: process.env.DB_NAME || 'alltalent_db',
        tables: tables.length
      },
      environment: process.env.NODE_ENV || 'development'
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false,
        name: process.env.DB_NAME || 'alltalent_db'
      }
    };
  }
}

// Quick DB check utility for debugging
export async function quickDbCheck() {
  try {
    const [rows] = await query('SELECT 1 as ok, NOW() as now, DATABASE() as db');
    console.log('DB Check:', rows);
    return rows;
  } catch (error: any) {
    console.error('DB Check error:', error.message);
    return null;
  }
}

// Export pool as default
export default pool;