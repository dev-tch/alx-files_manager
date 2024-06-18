import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UserController {
  static async postNew(req, res) {
    if (!req.body.email) {
      return res.status(400).json({
        error: 'Missing email',
      });
    }
    if (!req.body.password) {
      return res.status(400).json({
        error: 'Missing password',
      });
    }
    const existUser = await dbClient.findUser(req.body.email);
    if (existUser) {
      return res.status(400).json({
        error: 'Already exist',
      });
    }
    const createdUser = await dbClient.createUser(req.body.email, req.body.password);
    return res.status(201).json(createdUser);
  }

  static async getMe(req, res) {
    const errorUnauth = {
      error: 'Unauthorized',
    };
    const xTokenHeader = req.headers['x-token'];
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
    const dataUser = {
      email: user.email,
      id: user._id,
    };
    return res.status(200).json(dataUser);
  }
}
export default UserController;
