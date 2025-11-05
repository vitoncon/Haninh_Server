import { Permission } from "@interfaces/permissions.interface";

export const  Permissions: Permission[] = [
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
    },
     {
        id: 1,
        role_id: 1,
        table_name: 'courses',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'classes',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'exams',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'exam_skills',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'exam_skills',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'exam_results',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'class_schedules',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'schedules',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'teachers',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'class_teachers',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'students',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'class_students',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'study_results',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'teaching_assignments',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'fees',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'certificates',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'student_certificates',
        pms: [1, 1, 1, 1, 0]
    },
]

