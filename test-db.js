require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alltalent_db'
});

console.log('Testing MySQL connection to:', process.env.DB_NAME);

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Connected to MySQL!');
  
  // Show tables
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('❌ Failed to show tables:', err.message);
    } else {
      console.log('📊 Tables in database:', results);
    }
    
    connection.end();
    process.exit(0);
  });
});