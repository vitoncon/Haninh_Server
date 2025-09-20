// src/services/MainService.ts
import { GetResponse, PostUpdateDeleteResponse } from '@interfaces/response.interface';
import db from '../db/config.db';

import fs from 'fs';
import path from 'path';

export class MainService {
    
    static async createRecord(table: string, data: any): Promise<PostUpdateDeleteResponse> {
        const [id] = await db(table).insert(data);
        return {
            message: 'inserted successfully',
            code: 'success',
            data: id,
        };
    }

    static async updateRecord(table: string, id: number, data: any): Promise<PostUpdateDeleteResponse> {
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
        const affectedRows = await db(table).where({ id }).update({ is_deleted: 1 });
        if (affectedRows) {
            return {
                message: 'inserted successfully',
                code: 'success',
                data: id,
            };
        }
        throw new Error('Không tìm thấy bản ghi');
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
        page: number
    ): Promise<GetResponse> {
        // console.log('hello world');
        
        const columnsInfo = await db.raw(`SHOW COLUMNS FROM ??`, [table]);
        const columnsMap: any = {};
        columnsInfo[0].forEach((column: any) => {
            columnsMap[column.Field] = column.Type;
        });

        let query = db(table).select('*');

        // console.log(query.toSQL());
        // console.log(conditions);
        

        if (Array.isArray(conditions)) {
            conditions.forEach((condition: any) => {
                const key = condition.key;
                // let value = decodeURI(condition.value).toString();
                // console.log(value);
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
                
                if (columnType) {
                    if (columnType.includes('int')) {
                        value = parseInt(value, 10);
                    } else if (columnType.includes('decimal') || columnType.includes('float') || columnType.includes('double')) {
                        value = parseFloat(value);
                    } else if (columnType.includes('date') || columnType.includes('datetime') || columnType.includes('timestamp')) {
                        value = new Date(value);
                    } else if (columnType.includes('varchar') || columnType.includes('text')) {
                        // console.log(value);
                        
                        value = value.toString();
                    }
                    // console.log(value);
                    
                    if(orWhere === 'or'){

                        if (compare.toLowerCase() === 'like') {
                            const likeValue = value;
                            query = query.orWhere(key, 'LIKE', `%${likeValue}%`);
                        }if (compare.toLowerCase() === 'NOT LIKE') {
                            const likeValue = value;
                            query = query.orWhere(key, 'notLike', `%${likeValue}%`);
                        } else if (compare.toLowerCase() === 'lessLike') {
                            const likeValue = value;
                            query = query.orWhere(key, 'LIKE', `%${likeValue}`);
                        } else if (compare.toLowerCase() === 'rightLike') {
                            const likeValue = value;
                            query = query.orWhere(key, 'LIKE', `${likeValue}%`);
                        } else if (compare.toLowerCase() === 'in') {
                            const values = value.split(',');
                            query = query.orWhereIn(key, values);
                        } else if (compare.toLowerCase() === 'between') {
                            const values = value.split(',');
                            query = query.orWhereBetween(key, [values[0], values[1]]);
                        } else if (['>', '>=', '<', '<=', '=', '!=', '<>'].includes(compare)) {
                            query = query.orWhere(key, compare, value);
                        }
                    }else if(orWhere === 'and'){
                        if (compare.toLowerCase() === 'like') {
                            const likeValue = value;
                            query = query.where(key, 'LIKE', `%${likeValue}%`);
                        }if (compare.toLowerCase() === 'NOT LIKE') {
                            const likeValue = value;
                            query = query.where(key, 'notLike', `%${likeValue}%`);
                        } else if (compare.toLowerCase() === 'lessLike') {
                            const likeValue = value;
                            query = query.where(key, 'LIKE', `%${likeValue}`);
                        } else if (compare.toLowerCase() === 'rightLike') {
                            const likeValue = value;
                            query = query.where(key, 'LIKE', `${likeValue}%`);
                        } else if (compare.toLowerCase() === 'in') {
                            const values = value.split(',');
                            query = query.whereIn(key, values);
                        } else if (compare.toLowerCase() === 'between') {
                            const values = value.split(',');
                            query = query.whereBetween(key, [values[0], values[1]]);
                        } else if (['>', '>=', '<', '<=', '=', '!=', '<>'].includes(compare)) {
                            query = query.where(key, compare, value);
                        }
                    }
                    
                }
            });
        }

        if (include && includeBy) {
            const includeValues = include.split(',');
            query = query.whereIn(includeBy, includeValues);
        }

        if (order && orderBy) {
            const sortOrder = order.toLowerCase() === 'desc' ? 'desc' : 'asc';
            query = query.orderBy(orderBy, sortOrder);
        }

        const [countResult] = await query.clone().count('* as total');
        const totalRecords = parseInt(countResult.total.toString());

        let records;
        
        console.log(query.toQuery());
        
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
