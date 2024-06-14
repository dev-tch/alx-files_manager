import MongoClient from 'mongodb';

class DBClient {
  constructor() {
    const h = process.env.DB_HOST || 'localhost';
    const p = process.env.DB_PORT || '27017'
    const db = process.env.connection || 'files_manager'
    const url = `mongodb://${h}:${p}/`




