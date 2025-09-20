import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { NextFunction, Request, Response } from 'express';

class FileService {
  private storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  private fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    // if (allowedTypes.includes(file.mimetype)) {
    //   cb(null, true);
    // } else {
    //   const error = new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
    //   cb(error as unknown as null, false);
    // }

    cb(null, true);
  };

  public uploadMiddleware = multer({
    storage: this.storage,
    fileFilter: this.fileFilter,
  });

  public uploadSingle(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = `/uploads/${req.file.originalname}`;
    console.log(req.file);
    return res.json(filePath);
  }

  public uploadMultiple(req: Request, res: Response) {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const filesPath = req.files.map((file: Express.Multer.File) => {
      const filePath = `/uploads/${file.originalname}`;
      console.log(filePath);
      return filePath;
    });

    return res.json(filesPath);
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      const directoryPath = path.join(__dirname, '../public');
      const fullFilePath = path.join(directoryPath, filePath);

      await fs.unlink(fullFilePath);
      console.log('File deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting file: ${error}`);
      return false;
    }
  }

  public async handleDeleteFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filePath = req.query.filePath as string;
      if (!filePath) {
        res.status(400).json({ error: 'File path is required' });
        return;
      }
      console.log(`Deleting file: ${filePath}`);
      const result = await this.deleteFile(filePath);
      if (result) {
        res.status(200).json({ message: 'File deleted successfully' });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error: any) {
      console.error(error);
      next(error); // Pass error to Express error handler
    }
  }
}

export default new FileService();
