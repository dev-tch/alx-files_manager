import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    const errorUnauth = {
      error: 'Unauthorized',
    };
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json(errorUnauth);
    }
    // extract the basic 64 encoded value
    const credBase64 = authHeader.split(' ')[1];
    if (!credBase64) {
      return res.status(401).json(errorUnauth);
    }
    const decodedCredBase64 = Buffer.from(credBase64, 'base64').toString('ascii');
    // extract email && password values
    const [email, password] = decodedCredBase64.split(':');
    if (!email || !password) {
      return res.status(401).json(errorUnauth);
    }
    const user = await dbClient.getRegistredUser(email, password);
    if (!user) {
      return res.status(401).json(errorUnauth);
    }
    // generate token
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const xTokenHeader = req.headers['x-token'];
    const errorUnauth = {
      error: 'Unauthorized',
    };
    if (!xTokenHeader) {
      return res.status(401).json(errorUnauth);
    }
    const idUser = await redisClient.get(`auth_${xTokenHeader}`);
    if (!idUser) {
      return res.status(401).json(errorUnauth);
    }
    const user = await dbClient.getUserById(idUser);
    if (!user) {
      return res.status(401).json(errorUnauth);
    }
    await redisClient.del(`auth_${xTokenHeader}`);
    return res.status(204).end();
  }
}
export default AuthController;
