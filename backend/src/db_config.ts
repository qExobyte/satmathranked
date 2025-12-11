import 'dotenv/config'
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT)!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    connectionLimit: 10,
    queueLimit: 0,
    socketPath: process.env.CLOUD_SQL_CONNECTION_NAME 
    ? `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`
    : undefined!
});

console.log('DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '***set***' : 'MISSING',
    database: process.env.DB_NAME
});

export default pool;