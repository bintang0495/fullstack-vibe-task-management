require('dotenv').config({ path: '../.env' }); // Load .env from root

const isSSL = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('sslmode=require') || 
  process.env.DATABASE_URL.includes('neon.tech') || 
  process.env.NODE_ENV === 'production'
);

const connection = isSSL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : process.env.DATABASE_URL;

module.exports = {
  development: {
    client: 'pg',
    connection,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    }
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: './migrations',
    }
  }
};
