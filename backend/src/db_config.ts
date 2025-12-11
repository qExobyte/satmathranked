import 'dotenv/config'
import mysql from 'mysql2/promise';

// Cloud SQL connection configuration
const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = isProduction ? {
    // Cloud SQL connection via Unix socket (recommended for Cloud Run)
    socketPath: process.env.DB_SOCKET_PATH || `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
} : {
    // Local development configuration
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT)!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

console.log('DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '***set***' : 'MISSING',
    database: process.env.DB_NAME
});

export default pool;