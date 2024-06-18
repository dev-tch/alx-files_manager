import dbClient from '../utils/db';

class UsersController {
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
}
export default UsersController;
