import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FileController {
  static async postUpload(req, res) {
    const errorUnauth = {
      error: 'Unauthorized',
    };
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json(errorUnauth);
    }
    const idUser = await redisClient.get(`auth_${token}`);
    if (!idUser) {
      return res.status(401).json(errorUnauth);
    }
    const user = dbClient.getUserById(idUser);
    if (!user) {
      return res.status(401).json(errorUnauth);
    }
    const {
      name,
      type,
      parentId,
      isPublic,
      data,
    } = req.body;
    if (!name) {
      return res.status(400).json({
        error: 'Missing name',
      });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({
        error: 'Missing type',
      });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({
        error: 'Missing data',
      });
    }
    if (parentId) {
      const file = await dbClient.getFileById(parentId);
      if (!file) {
        return res.status(400).json({
          error: 'Parent not found',
        });
      }
      if (file.type !== 'folder') {
        return res.status(400).json({
          error: 'Parent is not a folder',
        });
      }
    }
    const newFile = {
      userId: user._id,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || '0',
    };
    if (type === 'folder') {
      const insertedFile = await dbClient.insertFile(newFile);
      return res.status(201).json(insertedFile);
    }
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const fileUuid = uuidv4();
    const filePath = path.join(folderPath, fileUuid);
    const fileData = Buffer.from(data, 'base64');
    fs.writeFileSync(filePath, fileData);
    newFile.localPath = filePath;
    const insertedFile = await dbClient.insertFile(newFile);
    return res.status(201).json(insertedFile);
  }
}
export default FileController;
