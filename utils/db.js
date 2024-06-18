import { MongoClient } from 'mongodb';
import { promisify } from 'util';
import sha1 from 'sha1';

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

  async findUser(email) {
    const query = {
      email,
    };
    const findOneAsync = promisify(this.db.collection('users').findOne).bind(this.db.collection('users'));
    try {
      const doc = await findOneAsync(query);
      return doc !== null;
    } catch (err) {
      console.log(`Error find user: ${err.message}`);
      return false;
    }
  }

  async createUser(email, password) {
    const hashedPwd = sha1(password);
    const user = {
      email,
      password: hashedPwd,
    };
    const insertOneAsync = promisify(this.db.collection('users').insertOne).bind(this.db.collection('users'));
    try {
      const result = await insertOneAsync(user);
      const userCreated = {
        email,
        id: result.insertedId.toString(),
      };
      return userCreated;
    } catch (err) {
      console.log(`Èrror create user: ${err.message}`);
      return null;
    }
  }
}
const dbClient = new DBClient();
export default dbClient;
