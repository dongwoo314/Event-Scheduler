require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  production: {
    dialect: 'sqlite',
    storage: ':memory:',  // 메모리 DB 사용 (재시작 시 초기화됨)
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
};
