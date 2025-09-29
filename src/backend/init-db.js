const { sequelize } = require('./models');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Force sync - 기존 테이블 삭제하고 새로 생성
    await sequelize.sync({ force: true });
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 All tables created.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
