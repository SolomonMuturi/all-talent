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
    const [rows] = await connection.query('SELECT 1 + 1 AS result, NOW() AS timestamp, DATABASE() AS `database`');
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
      // Players
      `
      CREATE TABLE IF NOT EXISTS players (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        age INT,
        position VARCHAR(50),
        avatar_url VARCHAR(255),
        team VARCHAR(100),
        attendance INT DEFAULT 0,
        discipline_score INT DEFAULT 100,
        rank INT DEFAULT 0,
        points INT DEFAULT 0,
        stats_played INT DEFAULT 0,
        stats_wins INT DEFAULT 0,
        stats_draws INT DEFAULT 0,
        stats_losses INT DEFAULT 0,
        highlights TEXT,
        gps_max_speed DECIMAL(5,2),
        gps_distance_covered DECIMAL(5,2),
        gps_player_load DECIMAL(5,2),
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
        phone_number VARCHAR(50),
        email VARCHAR(255),
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
      `,
      // Certificates
      `
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(50) PRIMARY KEY,
        player_id INT NOT NULL,
        module_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      )
      `,
      // Disciplinary Infractions
      `
      CREATE TABLE IF NOT EXISTS disciplinary_infractions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        player_id INT NOT NULL,
        date DATE NOT NULL,
        infraction VARCHAR(255) NOT NULL,
        severity ENUM('Low', 'Medium', 'High') NOT NULL,
        sanction VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      )
      `,
      // Injuries
      `
      CREATE TABLE IF NOT EXISTS injuries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        player_id INT NOT NULL,
        date DATE NOT NULL,
        injury VARCHAR(255) NOT NULL,
        severity ENUM('Low', 'Medium', 'High') NOT NULL,
        rtp_status ENUM('In Treatment', 'Cleared for Light Training', 'Cleared to Play') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      )
      `,
      // Transactions
      `
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        player_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      // Team Members
      `
      CREATE TABLE IF NOT EXISTS team_members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(255),
        hourly_rate DECIMAL(10,2),
        hours_worked DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
      `,
      // Equipment
      `
      CREATE TABLE IF NOT EXISTS equipment (
        id VARCHAR(50) PRIMARY KEY,
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
      `,
      // Consumables
      `
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
      `,
      // Messages
      `
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        content TEXT NOT NULL,
        channel VARCHAR(50) NOT NULL,
        recipient_group VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        timestamp DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      // Academy Events
      `
      CREATE TABLE IF NOT EXISTS academy_events (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        organizer VARCHAR(255),
        event_date DATETIME NOT NULL,
        category VARCHAR(100) NOT NULL,
        logo_url VARCHAR(255),
        country VARCHAR(100),
        location VARCHAR(255),
        venue VARCHAR(255),
        game_type VARCHAR(100),
        tournament_type VARCHAR(100),
        team_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      // Event Participants
      `
      CREATE TABLE IF NOT EXISTS event_participants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_id VARCHAR(50) NOT NULL,
        player_id INT NOT NULL,
        participation_type VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      )
      `,
      // Tickets
      `
      CREATE TABLE IF NOT EXISTS tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_id VARCHAR(50) NOT NULL,
        ticket_type VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        available INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      // Merchandise
      `
      CREATE TABLE IF NOT EXISTS merchandise (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        sizes JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      // Clubs
      `
      CREATE TABLE IF NOT EXISTS clubs (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      
      // ADD INVITATIONS TABLE
      `
      CREATE TABLE IF NOT EXISTS invitations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        token VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        location VARCHAR(255) NOT NULL,
        user_type ENUM('player', 'coach', 'scout', 'academy') NOT NULL,
        message TEXT,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        used_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_email (email),
        INDEX idx_expires_at (expires_at),
        INDEX idx_used (used)
      )
      `,
      
      // ADD USERS TABLE (updated to use 'users' instead of 'talantatrack_users')
      `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        location VARCHAR(255),
        user_type ENUM('player', 'coach', 'scout', 'academy', 'admin') NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        invitation_token VARCHAR(64),
        trial_started_at DATETIME,
        trial_ends_at DATETIME,
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        last_login DATETIME,
        profile_image VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_invitation_token (invitation_token),
        INDEX idx_trial_ends_at (trial_ends_at),
        INDEX idx_user_type (user_type)
      )
      `,
    ];
    
    // Execute all table creation queries
    for (const tableSql of tables) {
      try {
        await connection.query(tableSql);
      } catch (error: any) {
        console.error(`Error creating table: ${error.message}`);
      }
    }
    
    console.log('✅ All database tables created successfully');
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
  // ... your existing db functions ...

  // INVITATION FUNCTIONS
  invitations: {
    // Create a new invitation
    async create(data: {
      token: string;
      name: string;
      email: string;
      phone?: string;
      location: string;
      user_type: 'player' | 'coach' | 'scout' | 'academy';
      message?: string;
      expires_at: Date;
    }) {
      const result = await query(
        `INSERT INTO invitations (
          token, name, email, phone, location, 
          user_type, message, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.token,
          data.name,
          data.email,
          data.phone || null,
          data.location,
          data.user_type,
          data.message || null,
          data.expires_at
        ]
      );
      return (result as any).insertId;
    },

    // Validate token and get invitation
    async validateToken(token: string) {
      const invitations = await query<any[]>(
        `SELECT 
          id, token, name, email, phone, location,
          user_type, message, expires_at, used, used_at
        FROM invitations 
        WHERE token = ?`,
        [token]
      );
      
      return invitations[0] || null;
    },

    // Mark invitation as used
    async markAsUsed(token: string) {
      await query(
        `UPDATE invitations 
         SET used = 1, used_at = NOW() 
         WHERE token = ?`,
        [token]
      );
      return true;
    },

    // Check if invitation is valid (not expired and not used)
    async isValid(token: string) {
      const invitation = await this.validateToken(token);
      
      if (!invitation) {
        return { valid: false, reason: 'Token not found' };
      }

      if (invitation.used) {
        return { valid: false, reason: 'Token already used' };
      }

      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      
      if (now > expiresAt) {
        return { valid: false, reason: 'Token expired' };
      }

      return { valid: true, invitation };
    },

    // Get all invitations (for admin)
    async getAll(limit = 50, offset = 0) {
      return await query(
        `SELECT 
          id, token, name, email, user_type, 
          location, expires_at, used, used_at,
          created_at
        FROM invitations 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?`,
        [limit, offset]
      );
    },

    // Get invitations by email
    async getByEmail(email: string) {
      return await query(
        `SELECT * FROM invitations 
         WHERE email = ? 
         ORDER BY created_at DESC`,
        [email]
      );
    },

    // Clean up expired invitations (cron job)
    async cleanupExpired() {
      const result = await query(
        `DELETE FROM invitations 
         WHERE expires_at < NOW() 
         AND used = 0`,
        []
      );
      return (result as any).affectedRows || 0;
    }
  },

  // USERS FUNCTIONS (updated to use 'users' table)
  users: {
    // Create new user from invitation
    async create(data: {
      name: string;
      email: string;
      password_hash: string;
      phone?: string;
      location?: string;
      user_type: 'player' | 'coach' | 'scout' | 'academy';
      invitation_token: string;
    }) {
      // Calculate trial dates
      const trialStartedAt = new Date();
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      const result = await query(
        `INSERT INTO users (
          name, email, password_hash, phone, location,
          user_type, invitation_token, trial_started_at, trial_ends_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.email,
          data.password_hash,
          data.phone || null,
          data.location || null,
          data.user_type,
          data.invitation_token,
          trialStartedAt,
          trialEndsAt,
          true
        ]
      );
      return (result as any).insertId;
    },

    // Check if email already exists
    async emailExists(email: string) {
      const users = await query<any[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      return users.length > 0;
    },

    // Get user by email
    async findByEmail(email: string) {
      const users = await query<any[]>(
        `SELECT * FROM users WHERE email = ?`,
        [email]
      );
      return users[0] || null;
    },

    // Get user by ID
    async findById(id: number) {
      const users = await query<any[]>(
        `SELECT * FROM users WHERE id = ?`,
        [id]
      );
      return users[0] || null;
    },

    // Get user by invitation token
    async findByInvitationToken(token: string) {
      const users = await query<any[]>(
        `SELECT * FROM users WHERE invitation_token = ?`,
        [token]
      );
      return users[0] || null;
    },

    // Update user profile
    async update(id: number, data: Partial<{
      name: string;
      phone: string;
      location: string;
      profile_image: string;
    }>) {
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (updates.length === 0) return false;

      values.push(id);
      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await query(sql, values);
      return true;
    },

    // Verify email
    async verifyEmail(id: number) {
      await query(
        `UPDATE users SET email_verified = TRUE WHERE id = ?`,
        [id]
      );
      return true;
    },

    // Update last login
    async updateLastLogin(id: number) {
      await query(
        `UPDATE users SET last_login = NOW() WHERE id = ?`,
        [id]
      );
      return true;
    }
  },

  // ... rest of your existing db functions (players, transactions, events, etc.) ...
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
    const [rows] = await query('SELECT 1 as ok, NOW() AS now, DATABASE() AS `db`');
    console.log('DB Check:', rows);
    return rows;
  } catch (error: any) {
    console.error('DB Check error:', error.message);
    return null;
  }
}

// Export pool as default
export default pool;