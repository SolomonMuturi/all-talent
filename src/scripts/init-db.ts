// src/scripts/init-db.ts
import { initDatabase, testConnection } from '../lib/db';

async function runInit() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // First test connection
    console.log('🔍 Testing connection...');
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      console.error('❌ Connection test failed:', connectionTest.error);
      process.exit(1);
    }
    
    console.log('✅ Connection test passed');
    
    // Run initialization
    const result = await initDatabase();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      process.exit(0);
    } else {
      console.error(`❌ Initialization failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Unexpected error during initialization:', error.message);
    process.exit(1);
  }
}

runInit();
