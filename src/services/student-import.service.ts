// src/services/student-import.service.ts
import db from '../db/config.db';
import * as xlsx from 'xlsx';

export interface ImportRow {
    name: string;
    email: string;
    phone: string;
    class_id: number;
    date_of_birth?: string;
    [key: string]: any;
}

export interface ValidationResult {
    row: ImportRow;
    isValid: boolean;
    errors: string[];
    isDuplicate: boolean;
}

export class StudentImportService {
    static async validateData(data: ImportRow[]): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];
        const emails = data.map(d => d.email).filter(e => !!e);
        const phones = data.map(d => d.phone).filter(p => !!p);

        // Fetch existing students with these emails or phones
        const existingStudents = await db('students')
            .whereIn('email', emails)
            .orWhereIn('phone', phones)
            .select('email', 'phone');

        const existingEmails = new Set(existingStudents.map(s => s.email));
        const existingPhones = new Set(existingStudents.map(s => s.phone));

        // Fetch valid class IDs
        const classIds = data.map(d => d.class_id).filter(id => !!id);
        const validClasses = await db('classes').whereIn('id', classIds).select('id');
        const validClassSet = new Set(validClasses.map(c => c.id));

        for (const row of data) {
            const errors: string[] = [];
            let isDuplicate = false;

            if (!row.name) errors.push('Tên không được để trống');
            if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push('Email không hợp lệ');
            if (!row.phone || !/^\d{10,11}$/.test(row.phone)) errors.push('Số điện thoại không hợp lệ');
            if (!row.class_id || !validClassSet.has(Number(row.class_id))) errors.push('Mã lớp không tồn tại');

            if (existingEmails.has(row.email) || existingPhones.has(row.phone)) {
                isDuplicate = true;
                errors.push('Học viên đã tồn tại (Email hoặc Số điện thoại trùng lặp)');
            }

            results.push({
                row,
                isValid: errors.length === 0,
                errors,
                isDuplicate
            });
        }

        return results;
    }

    static async bulkImport(validData: ImportRow[]) {
        return await db.transaction(async (trx) => {
            // Insert students
            const studentsToInsert = validData.map(d => ({
                full_name: d.name,
                email: d.email,
                phone: d.phone,
                date_of_birth: d.date_of_birth || null,
                created_at: new Date(),
                updated_at: new Date()
            }));

            // batchInsert and get IDs if needed, but students table might use auto-inc
            // MySQL batchInsert doesn't return all IDs easily in Knex sometimes
            // We'll insert one by one or use a trick to get IDs for class_students
            
            const results = [];
            for (const student of studentsToInsert) {
                const [studentId] = await trx('students').insert(student);
                const classId = validData.find(d => d.email === student.email)?.class_id;
                
                if (classId) {
                    await trx('class_students').insert({
                        class_id: classId,
                        student_id: studentId,
                        join_date: new Date(),
                        status: 'active',
                        created_at: new Date()
                    });
                }
                results.push(studentId);
            }
            return results;
        });
    }

    static parseBuffer(buffer: Buffer): ImportRow[] {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet) as any[];

        return data.map(item => ({
            name: item.name || item['Họ tên'] || item['Full Name'],
            email: item.email || item['Email'],
            phone: item.phone?.toString() || item['Số điện thoại']?.toString() || item['Phone']?.toString(),
            class_id: Number(item.class_id || item['Mã lớp'] || item['Class ID']),
            date_of_birth: item.date_of_birth || item['Ngày sinh'] || item['DOB']
        }));
    }
}
