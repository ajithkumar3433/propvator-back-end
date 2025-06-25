// lib/db.js
import mysql from 'mysql2/promise';

const db = mysql.createPool({
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'propvator',
    host: 'sql.freedb.tech',
    user: 'freedb_propvator_root',
    password: 'RGtxz37V@bpVnKE',
    database: 'freedb_propvator',
});

export default db;
