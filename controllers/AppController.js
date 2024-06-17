import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const resp = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    return res.status(200).json(resp);
  }

  static getStats(req, res) {
    const resp = {
      users: dbClient.nbUsers(),
      files: dbClient.nbFiles(),
    };
    return res.status(200).json(resp);
  }
}
export default AppController;
