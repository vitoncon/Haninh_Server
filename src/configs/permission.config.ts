import { Permission } from "@interfaces/permissions.interface";

export const  Permissions: Permission[] = [
    {
        id: 1,
        role_id: 1,
        table_name: 'categories',
        pms: [1, 1,1, 1, 0] // [canAccess, canAdd, canEdit, canDelete, onlyGetPersonal]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'products',
        pms: [1, 1,1, 1, 0] // [canAccess, canAdd, canEdit, canDelete, onlyGetPersonal]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'orders',
        pms: [1, 1,1, 1, 0] // [canAccess, canAdd, canEdit, canDelete, onlyGetPersonal]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'tests',
        pms: [1, 1,1, 1, 0] // [canAccess, canAdd, canEdit, canDelete, onlyGetPersonal]
    }
    ,
    {
        id: 1,
        role_id: 2,
        table_name: 'tests',
        pms: [1, 1,1, 1, 0] // [canAccess, canAdd, canEdit, canDelete, onlyGetPersonal]
    },
    {
        id: 1,
        role_id: 2,
        table_name: 'users',
        pms: [1, 1,1, 1, 1] // [canAccess, canAdd, canEdit, canDelete, onlyGetPersonal]
    }

]

