// src/services/MainService.ts
import { GetResponse, PostUpdateDeleteResponse } from '@interfaces/response.interface';
import db from '../db/config.db';

import fs from 'fs';
import path from 'path';

export class MainService {
    
    static normalizeStatus(status: any): string {
        const s = (status || '').toString().trim().toUpperCase();
        if (s === 'PAID') return 'PAID';
        if (s === 'PENDING') return 'PENDING';
        return 'UNPAID';
    }
    
    static async createRecord(table: string, data: any): Promise<PostUpdateDeleteResponse> {
        if (table === 'fees') {
            if (data.status !== undefined) {
                data.status = this.normalizeStatus(data.status);
            }
            if (data.status === 'PAID' && !data.paid_date) {
                data.paid_date = db.raw('CURRENT_DATE');
            }
            // Auto-calculate due_date if class_id is provided and due_date missing
            if (data.class_id && !data.due_date) {
                const classObj = await db('classes').where({ id: data.class_id }).first();
                if (!classObj || !classObj.start_date || classObj.start_date <= '1900-01-01') {
                    throw new Error(`Class ${data.class_id} must have a valid start_date before creating fee.`);
                }
                const startDate = new Date(classObj.start_date);
                data.due_date = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            }
        }

        const [id] = await db(table).insert(data);

        // System Hook: Auto-create fee record when a student is assigned to a class
        if (table === 'class_students' && data.student_id && data.class_id) {
            try {
                const classObj = await db('classes').where({ id: data.class_id }).first();
                if (classObj && classObj.course_id) {
                    const courseObj = await db('courses').where({ id: classObj.course_id }).first();
                    if (courseObj) {
                        // Calculate due_date = start_date + 7 days
                        if (!classObj.start_date || classObj.start_date <= '1900-01-01') {
                            throw new Error(`Class ${data.class_id} must have a valid start_date before creating fee record.`);
                        }
                        
                        const startDate = new Date(classObj.start_date);
                        const dueDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

                        // ignore duplicate error if re-enrolled
                        await db('fees').insert({
                            student_id: data.student_id,
                            class_id: data.class_id,
                            course_id: classObj.course_id,
                            amount: courseObj.tuition_fee || 0,
                            status: 'UNPAID',
                            due_date: dueDate,
                            created_at: new Date()
                        }).onConflict(['student_id', 'class_id']).ignore();
                    }
                }
            } catch (err) {
                console.error('Error auto-creating fee record:', err);
            }
        }

        return {
            message: 'inserted successfully',
            code: 'success',
            data: id,
        };
    }

    static async updateRecord(table: string, id: number, data: any): Promise<PostUpdateDeleteResponse> {
        if (table === 'fees') {
            if (data.status !== undefined) {
                data.status = this.normalizeStatus(data.status);
            }
            if (data.status === 'PAID' && !data.paid_date) {
                data.paid_date = db.raw('CURRENT_DATE');
            }
        }

        const affectedRows = await db(table).where({ id }).update(data);
        if (affectedRows) {
            return {
                message: 'inserted successfully',
                code: 'success',
                data: id,
            };
        }
        throw new Error('Không tìm thấy bản ghi');
    }

    static async softDeleteRecord(table: string, id: number): Promise<PostUpdateDeleteResponse> {
        const columnsInfo = await db.raw(`SHOW COLUMNS FROM ??`, [table]);
        const hasIsDeleted = columnsInfo[0].some((col: any) => col.Field === 'is_deleted');

        let affectedRows = 0;

        if (hasIsDeleted) {
            affectedRows = await db(table).where({ id }).update({ is_deleted: 1 });
        } else {
            affectedRows = await db(table).where({ id }).del();
        }

        if (affectedRows) {
            return {
                message: hasIsDeleted ? 'soft deleted successfully' : 'hard deleted successfully',
                code: 'success',
                data: id,
            };
        }
        throw new Error('Không tìm thấy bản ghi');
    }

    static async getRecordById(table: string, id: number): Promise<any> {
        const record = await db(table).where({ id }).first();
        if (!record) {
            throw new Error('Không tìm thấy bản ghi');
        }
        return record;
    }

    static async deleteRecord(table: string, id: number): Promise<PostUpdateDeleteResponse> {
        const affectedRows = await db(table).where({ id }).del();
        if (affectedRows) {
            return {
                message: 'deleted successfully',
                code: 'success',
                data: id,
            };
        }
        throw new Error('Không tìm thấy bản ghi');
    }

    static async getRecords(
        table: string,
        conditions: any[],
        include: string | undefined,
        includeBy: string | undefined,
        order: string | undefined,
        orderBy: string | undefined,
        limit: number,
        page: number,
        searchKeyword?: string
    ): Promise<GetResponse> {
        // console.log('hello world');
        
        const columnsInfo = await db.raw(`SHOW COLUMNS FROM ??`, [table]);
        const columnsMap: any = {};
        columnsInfo[0].forEach((column: any) => {
            columnsMap[column.Field] = column.Type;
        });

        // Nếu bảng có is_deleted thì tự động where is_deleted = 0
        // Trừ khi có parameter include_deleted = true
        let query = db(table).select('*');
        if (columnsMap['is_deleted']) {
            // Check if we should include deleted records
            const includeDeleted = conditions.some((condition: any) => 
                condition.key === 'include_deleted' && condition.value === 'true'
            );
            
            if (!includeDeleted) {
                query = query.where({ is_deleted: 0 });
            }
        }
        // console.log(query.toSQL());
        // console.log(conditions);
        
        

        if (Array.isArray(conditions)) {
            conditions.forEach((condition: any) => {
                const key = condition.key;
                let value: any;
                try {
                    value = decodeURIComponent(condition.value).toString();
                } catch (e) {
                    console.error(`Error decoding value: ${condition.value}`, e);
                    value = condition.value;  // Nếu có lỗi, giữ nguyên giá trị ban đầu
                }
                
                const compare = condition.compare || '=';
                const orWhere = condition.orWhere || 'and';

                const columnType = columnsMap[key];

                // Helper to apply where/orWhere with optional IN/BETWEEN but without type casting
                const applyRawCondition = () => {
                    if (orWhere === 'or') {
                        if (compare.toLowerCase() === 'like') {
                            const likeValue = value;
                            query = query.orWhere(key, 'LIKE', `%${likeValue}%`);
                        } else if (compare.toLowerCase() === 'not like') {
                            const likeValue = value;
                            query = query.orWhere(key, 'notLike', `%${likeValue}%`);
                        } else if (compare.toLowerCase() === 'lesslike') {
                            const likeValue = value;
                            query = query.orWhere(key, 'LIKE', `%${likeValue}`);
                        } else if (compare.toLowerCase() === 'rightlike') {
                            const likeValue = value;
                            query = query.orWhere(key, 'LIKE', `${likeValue}%`);
                        } else if (compare.toLowerCase() === 'in') {
                            const valueStr = typeof value === 'string' ? value : value.toString();
                            const values = valueStr.split(',');
                            query = query.orWhereIn(key, values);
                        } else if (compare.toLowerCase() === 'between') {
                            const valueStr = typeof value === 'string' ? value : value.toString();
                            const values = valueStr.split(',');
                            query = query.orWhereBetween(key, [values[0], values[1]]);
                        } else if (['>', '>=', '<', '<=', '=', '!=', '<>'].includes(compare)) {
                            query = query.orWhere(key, compare, value);
                        }
                    } else {
                        if (compare.toLowerCase() === 'like') {
                            const likeValue = value;
                            query = query.where(key, 'LIKE', `%${likeValue}%`);
                        } else if (compare.toLowerCase() === 'not like') {
                            const likeValue = value;
                            query = query.where(key, 'notLike', `%${likeValue}%`);
                        } else if (compare.toLowerCase() === 'lesslike') {
                            const likeValue = value;
                            query = query.where(key, 'LIKE', `%${likeValue}`);
                        } else if (compare.toLowerCase() === 'rightlike') {
                            const likeValue = value;
                            query = query.where(key, 'LIKE', `${likeValue}%`);
                        } else if (compare.toLowerCase() === 'in') {
                            const valueStr = typeof value === 'string' ? value : value.toString();
                            const values = valueStr.split(',');
                            query = query.whereIn(key, values);
                        } else if (compare.toLowerCase() === 'between') {
                            const valueStr = typeof value === 'string' ? value : value.toString();
                            const values = valueStr.split(',');
                            query = query.whereBetween(key, [values[0], values[1]]);
                        } else if (['>', '>=', '<', '<=', '=', '!=', '<>'].includes(compare)) {
                            query = query.where(key, compare, value);
                        }
                    }
                };

                // Nếu key không tồn tại trong columnsMap nhưng là fully-qualified (vd: study_results.student_id)
                // thì áp dụng điều kiện thô, không cố gắng ép kiểu theo columnsMap
                if (!columnType) {
                    if (typeof key === 'string' && key.includes('.')) {
                        applyRawCondition();
                    }
                    return;
                }
                
                if (columnType) {
                    if (columnType.includes('int')) {
                        // Don't parse to int if using 'in' operator with comma-separated values
                        if (compare.toLowerCase() !== 'in') {
                            value = parseInt(value, 10);
                        }
                    } else if (columnType.includes('decimal') || columnType.includes('float') || columnType.includes('double')) {
                        value = parseFloat(value);
                    } else if (columnType.includes('date') || columnType.includes('datetime') || columnType.includes('timestamp')) {
                        // Handle date conversion properly to avoid timezone issues
                        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                            // For date-only strings (YYYY-MM-DD), parse manually to avoid timezone conversion
                            const [year, month, day] = value.split('-').map(Number);
                            value = new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid DST issues
                        } else {
                            value = new Date(value);
                        }
                    } else if (columnType.includes('varchar') || columnType.includes('text')) {
                        value = value.toString();
                    }

                    applyRawCondition();
                }
            });
        }

        // Full table keyword search across string-like columns
        if (searchKeyword && searchKeyword.length > 0) {
            const keyword = `%${searchKeyword}%`;
            const stringColumns = Object.entries(columnsMap)
                .filter(([_, type]) => typeof type === 'string' && (type.includes('char') || type.includes('text'))) 
                .map(([name]) => name);

            if (stringColumns.length > 0) {
                query = query.andWhere((qb: any) => {
                    stringColumns.forEach((col, idx) => {
                        if (idx === 0) {
                            qb.where(col, 'like', keyword);
                        } else {
                            qb.orWhere(col, 'like', keyword);
                        }
                    });
                });
            }
        }

        if (include && includeBy) {
            const includeValues = include.split(',');
            query = query.whereIn(includeBy, includeValues);
        }

        if (order && orderBy) {
            const sortOrder = order.toLowerCase() === 'desc' ? 'desc' : 'asc';
            query = query.orderBy(orderBy, sortOrder);
        }

        // Debug SQL for study_results to help trace student dashboard issues
        try {
            if (table === 'study_results') {
                const sqlDebug = query.clone().toSQL();
                console.log('Study Results SQL:', sqlDebug);
            }
        } catch (e) {
            console.error('Error logging Study Results SQL:', e);
        }

        const [countResult] = await query.clone().count('* as total');
        const totalRecords = parseInt(countResult.total.toString());

        let records;
        
        if (limit === -1) {
            records = await query;
        } else {
            const offset = (page - 1) * limit;
            records = await query.limit(limit).offset(offset);
        }

        return {
            code: 'success',
            message: 'Request success!',
            recordTotal: totalRecords,
            recordFiltered: records.length,
            data: records,
        };
    }

    /**
     * Specialized query for study-results endpoint:
     * Returns exam_results joined with exam_skills, exams, and classes
     * so the frontend can display class_code, class_name, exam_name, exam_date, etc.
     */
    static async getExamResultsWithDetails(
        conditions: any[],
        limit: number,
        page: number,
        searchKeyword?: string
    ): Promise<GetResponse> {
        let query = db('exam_results as er')
            .join('exam_skills as es', 'er.exam_skill_id', 'es.id')
            .join('exams as e', 'es.exam_id', 'e.id')
            .join('classes as c', 'e.class_id', 'c.id')
            .select(
                'er.*',
                'es.skill_type',
                'e.exam_name',
                'e.exam_date',
                'c.class_code',
                'c.class_name'
            );

        // Apply basic conditions for RBAC (currently supports student_id and class_id)
        if (Array.isArray(conditions)) {
            conditions.forEach((condition: any) => {
                const key = condition.key;
                let value: any = condition.value;
                const compare = (condition.compare || '=').toString().toLowerCase();
                const orWhere = (condition.orWhere || 'and').toString().toLowerCase();

                // Map logical keys to joined table columns
                let column: string | null = null;
                if (key === 'student_id') {
                    column = 'er.student_id';
                } else if (key === 'class_id') {
                    // Class scoping from exams/classes
                    column = 'c.id';
                } else {
                    // Ignore unsupported keys to avoid breaking the query
                    return;
                }

                const apply = (builder: any) => {
                    if (compare === 'in') {
                        const valueStr = typeof value === 'string' ? value : value.toString();
                        const values = valueStr.split(',').filter((v: string) => v !== '');
                        builder.whereIn(column!, values);
                    } else {
                        builder.where(column!, compare, value);
                    }
                };

                if (orWhere === 'or') {
                    query = query.orWhere((qb: any) => apply(qb));
                } else {
                    query = query.andWhere((qb: any) => apply(qb));
                }
            });
        }

        // Optional simple search on exam_name / class_name
        if (searchKeyword && searchKeyword.length > 0) {
            const keyword = `%${searchKeyword}%`;
            query = query.andWhere((qb: any) => {
                qb.where('e.exam_name', 'like', keyword)
                  .orWhere('c.class_name', 'like', keyword)
                  .orWhere('c.class_code', 'like', keyword);
            });
        }

        // Debug SQL for study-results
        try {
            const sqlDebug = query.clone().toSQL();
            console.log('Study Results (joined) SQL:', sqlDebug);
        } catch (e) {
            console.error('Error logging Study Results (joined) SQL:', e);
        }

        const [countResult] = await query.clone().count('* as total');
        const totalRecords = parseInt(countResult.total.toString());

        let records;
        if (limit === -1) {
            records = await query;
        } else {
            const offset = (page - 1) * limit;
            records = await query.limit(limit).offset(offset);
        }

        return {
            code: 'success',
            message: 'Request success!',
            recordTotal: totalRecords,
            recordFiltered: records.length,
            data: records,
        };
    }

    static getKeyTypeFromModule(table: string): any {
        try {
            const modulesDir = path.join(process.cwd(), 'src', 'router', 'modules');
            console.log('Modules Directory:', modulesDir);

            if (fs.existsSync(modulesDir)) {
                const modulePath = path.join(modulesDir, `${table}.ts`);
                console.log('Module Path:', modulePath);

                if (fs.existsSync(modulePath)) {
                    const mod = require(modulePath);
                    console.log('Module loaded successfully.');
                    return mod.keyType || null;
                } else {
                    console.log(`Module file ${table}.ts does not exist.`);
                }
            } else {
                console.log('Modules directory does not exist.');
            }
        } catch (error: any) {
            console.error('Error loading module:', error.message);
        }
        return null; // Trả về null nếu không tìm thấy module hoặc có lỗi
    }
    
}
