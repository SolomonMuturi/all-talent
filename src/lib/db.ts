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
};

let pool: mysql.Pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ MySQL connection pool created');
} catch (error) {
  console.error('❌ Failed to create MySQL pool:', error);
  pool = mysql.createPool({ ...dbConfig, database: undefined });
}

// Test connection
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 + 1 AS result');
    conn.release();
    console.log('✅ Database connection successful');
    return { success: true, result: rows };
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Initialize database with all TalentTrack tables
export async function initDatabase() {
  const connection = await pool.getConnection();
  
  try {
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'alltalent_db'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'alltalent_db'}`);
    
    // Players Table
    await connection.query(`
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
    `);
    
    // Certificates Table
    await connection.query(`
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
    `);
    
    // Disciplinary Infractions Table
    await connection.query(`
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
    `);
    
    // Injuries Table
    await connection.query(`
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
    `);
    
    // Transactions Table
    await connection.query(`
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
    `);
    
    // Team Members (Staff) Table
    await connection.query(`
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
    `);
    
    // Equipment Table
    await connection.query(`
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
    `);
    
    // Consumables Table
    await connection.query(`
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
    `);
    
    // Messages Table
    await connection.query(`
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
    `);
    
    // Academy Events Table
    await connection.query(`
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
    `);
    
    // Event Participants Table
    await connection.query(`
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
    `);
    
    // Users Table (for authentication)
    await connection.query(`
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
    `);
    
    // Settings Table
    await connection.query(`
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
    `);
    
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
    return { success: true };
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

// Execute query helper
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params || []);
  return rows as T;
}

// Get connection from pool
export async function getConnection() {
  return await pool.getConnection();
}

// Helper functions for common operations
export const dbHelpers = {
  // Player operations
  async getAllPlayers(limit = 100, offset = 0) {
    return await query(
      `SELECT * FROM players ORDER BY \`rank\`, points DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  },
  
  async getPlayerById(id: number) {
    const [players] = await query('SELECT * FROM players WHERE id = ?', [id]);
    return players[0] || null;
  },
  
  async createPlayer(playerData: any) {
    const result = await query(
      `INSERT INTO players (name, age, position, team, attendance, discipline_score, \`rank\`, points) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        playerData.name,
        playerData.age,
        playerData.position,
        playerData.team,
        playerData.attendance || 0,
        playerData.discipline_score || 100,
        playerData.rank || 0,
        playerData.points || 0
      ]
    );
    return (result as any).insertId;
  },
  
  // Transaction operations
  async getTransactions(filter?: { status?: string; type?: string }) {
    let sql = 'SELECT * FROM transactions';
    const params: any[] = [];
    
    if (filter?.status || filter?.type) {
      const conditions = [];
      if (filter.status) {
        conditions.push('status = ?');
        params.push(filter.status);
      }
      if (filter.type) {
        conditions.push('type = ?');
        params.push(filter.type);
      }
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY date DESC';
    return await query(sql, params);
  },
  
  // Event operations
  async getUpcomingEvents(limit = 10) {
    return await query(
      `SELECT * FROM academy_events 
       WHERE event_date >= CURDATE() 
       ORDER BY event_date ASC 
       LIMIT ?`,
      [limit]
    );
  },
  
  // Dashboard statistics
  async getDashboardStats() {
    const [totalPlayers] = await query('SELECT COUNT(*) as count FROM players');
    const [totalTransactions] = await query('SELECT SUM(amount) as total FROM transactions WHERE status = "Completed"');
    const [upcomingEvents] = await query('SELECT COUNT(*) as count FROM academy_events WHERE event_date >= CURDATE()');
    const [activeStaff] = await query('SELECT COUNT(*) as count FROM team_members WHERE is_active = TRUE');
    
    return {
      totalPlayers: totalPlayers[0]?.count || 0,
      totalRevenue: totalTransactions[0]?.total || 0,
      upcomingEvents: upcomingEvents[0]?.count || 0,
      activeStaff: activeStaff[0]?.count || 0,
    };
  }
};

// Export pool as default
export default pool;