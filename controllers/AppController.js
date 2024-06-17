import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    const redisStatus = await redisClient.isAlive();
    const dbStatus = await dbClient.isAlive();
    const resp = {
      redis: redisStatus,
      db: dbStatus,
    };
    return res.status(200).json(resp);
  }

  static async getStats(req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();
    const resp = {
      users: nbUsers,
      files: nbFiles,
    };
    return res.status(200).json(resp);
  }
}
export default AppController;
