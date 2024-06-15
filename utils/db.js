import { MongoClient } from 'mongodb';

const h = process.env.DB_HOST || 'localhost';
const p = process.env.DB_PORT || '27017';
const dbName = process.env.connection || 'files_manager';
const url = `mongodb://${h}:${p}`;

class DBClient {
  constructor() {
    this.db = null;
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.client.connect()
      .then(() => {
        this.db = this.client.db(dbName);
      })
      .catch((error) => {
        console.log(`Failed to connect to MongoDb: ${error.message}`);
        this.db = null;
      });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}
const dbClient = new DBClient();
export default dbClient;
