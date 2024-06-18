import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    const errorUnauth = {
      error: 'Unauthorized',
    };
    if (!authHeader) {
      return res.status(401).json(errorUnauth);
    }
    // extract the basic 64 encoded value
    const credBase64 = authHeader.split(' ')[1];
    const decodedCredBase64 = Buffer.from(credBase64, 'base64').toString('ascii');
    // extract email && password values
    const [email, password] = decodedCredBase64.split(':');
    const existUser = await dbClient.findRegistredUser(email, password);
    if (!existUser) {
      return res.status(401).json(errorUnauth);
    }
    // generate token
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, token, 86400);
    return res.status(200).json({ token });
  }
}
export default AuthController;
