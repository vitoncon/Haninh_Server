// src/controllers/MainController.ts
import { Router, Request, Response, NextFunction } from 'express';
import { MainService } from '@services/main.service';
// import fs from 'fs';
// import path from 'path';
import { Helper } from '@utils/helper/helper';
import { RouterConfigs } from 'src/configs/routerConfig.config';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';
import { BadRequestError } from 'src/core/errors/error.response';
import { PostAndUpdateDeleteResponse } from 'src/core/responses/response.response';


export class MainController {

    static async create(req: Request, res: Response): Promise<any> {
        try {
            const { router } = req.params;
            if (!router) {
                throw new BadRequestError(`Router ${router} not found`);
            }
            const table = RouterConfigs[router];
            if (!table) {
                throw new BadRequestError(`Table for router ${router} not found`);
            }
            const { decode, ...data } = req.body;
            let response = null;
            if(table.table === 'users'){
                response = await UserService.create(data);
            }else{

                response = await MainService.createRecord(table.table, data);
            }
            res.status(201).json(new PostAndUpdateDeleteResponse(response));
        } catch (error: any) {
            console.error('Error inserting data:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async put(req: Request, res: Response, next: NextFunction): Promise<any>{
        try {
            const { router, id } = req.params;
            if (!router) {
                throw new BadRequestError(`Router ${router} not found`);
            }
            const table = RouterConfigs[router];
            if (!table) {
                throw new BadRequestError(`Table for router ${router} not found`);
            }

            if(!id) {
                throw new BadRequestError('id required');
            }
            const { decode, ...data } = req.body;
            const response = await MainService.updateRecord(table.table, parseInt(id), data);
            res.status(200).json(new PostAndUpdateDeleteResponse(response));
        } catch (error: any) {
            console.error('Error updating data:', error);
            next(error);
        }
    }

    static async setIsDelete(req: Request, res: Response, next: NextFunction) : Promise<any> {
        try {
            const { router, id } = req.params;
            if (!router) {
                throw new BadRequestError(`Router ${router} not found`);
            }
            const table = RouterConfigs[router];
            if (!table) {
                // return res.status(404).json({ error: `Table for router ${router} not found` });
                throw new BadRequestError(`Table for router ${router} not found`);
            }
            if(!id) {
                throw new BadRequestError('id required');
            }
            const response = await MainService.softDeleteRecord(table.table, parseInt(id));
            res.status(200).json(new PostAndUpdateDeleteResponse(response));
        } catch (error: any) {
            console.error('Error soft deleting data:', error);
            next(error);
        }
    }

    static async delete(req: Request, res: Response) : Promise<any> {
        try {
            const { router, id } = req.params;
            if (!router) {
                return res.status(404).json({ error: `Router ${router} not found` });
            }
            const table = RouterConfigs[router];
            if (!table) {
                return res.status(404).json({ error: `Table for router ${router} not found` });
            }
            if(!id){
                return res.status(404).json({ error:'id required'});
            }
            const response = await MainService.deleteRecord(table.table, parseInt(id));
            res.status(200).json(response);
        } catch (error: any) {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async get(req: Request, res: Response) : Promise<any> {
        try {
            console.log('vo');
            
            const { router } = req.params;
            if (!router) {
                return res.status(404).json({ error: `Router ${router} not found` });
            }
            const table = RouterConfigs[router];
            if (!table) {
                return res.status(404).json({ error: `Table for router ${router} not found` });
            }
            const conditions = req.query.condition ? JSON.parse(JSON.stringify(req.query.condition)) : [];
            // console.log(req.query.condition);
            
            const include = req.query.include?.toString();
            const includeBy = req.query.include_by?.toString();
            const order = req.query.order?.toString();
            const orderBy = req.query.order_by?.toString();
            const limit = parseInt(req.query.limit?.toString() ?? '20', 10);
            const page = parseInt(req.query.page?.toString() ?? '1', 10);

            const response = await MainService.getRecords(
                table.table,
                conditions,
                include,
                includeBy,
                order,
                orderBy,
                limit,
                page
            );
            
            
            const keyType = MainService.getKeyTypeFromModule(router); // Gọi hàm để lấy keyType
            console.log('keyType:', keyType);
            if(keyType){
                const helper = new Helper();
                response.data = helper.convertDataTypeResponse(response.data, keyType);

            }

            res.status(200).json(response);
        } catch (error: any) {
            console.error('Error fetching data:', error.message);
            res.status(500).json({ error: error.message });
        }
    }


    static async getProfile(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const user_id = req.body.decode.id;
            if(!user_id) return res.status(404).json('user not found');
            const user = await UserService.getProfile(req.body.decode.id);
            return res.json({data: user}); 
        } catch (error: any) {
            console.error(error);
            next(error);
        }
    }
    
}


