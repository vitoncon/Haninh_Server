// src/controllers/student-import.controller.ts
import { Request, Response } from 'express';
import { StudentImportService, ImportRow } from '../services/student-import.service';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export class StudentImportController {
    static uploadMiddleware = upload;

    static async preview(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Không có file được tải lên' });
            }

            const data = StudentImportService.parseBuffer(req.file.buffer);
            const results = await StudentImportService.validateData(data);
            
            const summary = {
                total: results.length,
                valid: results.filter(r => r.isValid).length,
                invalid: results.filter(r => !r.isValid).length,
                duplicates: results.filter(r => r.isDuplicate).length
            };

            return res.status(200).json({ data: results, summary });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async import(req: Request, res: Response) {
        try {
            const { validRows } = req.body;
            if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
                return res.status(400).json({ error: 'Không có dữ liệu hợp lệ để import' });
            }

            const resultIds = await StudentImportService.bulkImport(validRows);
            return res.status(201).json({ 
                message: `Import thành công ${resultIds.length} học viên`,
                count: resultIds.length 
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
