import { BaseEntity } from "./base.interface";

export interface Permission{
    id: number;
    role_id: number; 
    pms : number[]; //[1, 0, 0, 0,0] <=> [canAccess,canAdd,canEdit,canDelete,onlyGetPersonal]
    table_name: string;
}


export interface UserRole extends BaseEntity{
    id: number;
    user_id: number;
    role_id: number;

}
