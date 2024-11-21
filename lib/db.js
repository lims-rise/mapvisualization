import knex from 'knex';

let dbInstance = null;

const createDbConnection = () => {
  // Koneksi PostgreSQL menggunakan knex
  return knex({
    client: 'pg',
    connection: {
      user: 'postgres',
      host: 'localhost',
      database: 'rise',
      password: 'password',
      port: 5432,
    },
  });
};

export const getDbConnection = () => {
  // Jika koneksi sudah ada, return instance yang sama
  if (!dbInstance) {
    dbInstance = createDbConnection();
  }
  return dbInstance;
};
