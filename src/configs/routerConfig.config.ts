import { RouterConfig } from "@interfaces/routerConfig.interface";

export const RouterConfigs:RouterConfig = {
    'users': {
        table: 'users',
        isPublic: false,
    },
    'courses': {
        table: 'courses',
        isPublic: false,
    },
    'classes': {
        table: 'classes',
        isPublic: false,
    },
    'schedules': {
        table: 'class_schedules',
        isPublic: false,
    },
    'teachers': {
        table: 'teachers',
        isPublic: false,
    },
    'students': {
        table: 'students',
        isPublic: false,
    },
    'class_students': {
        table: 'class_students',
        isPublic: false,
    },
    'study-results': {
        table: 'study_results',
        isPublic: false,
    },
    'teaching-assignments': {
        table: 'teaching_assignments',
        isPublic: false,
    },
    'fees': {
        table: 'fees',
        isPublic: false,
    },
    'certificates': {
        table: 'certificates',
        isPublic: false,
    },
    'student-certificates': {
        table: 'student_certificates',
        isPublic: false,
    },

};
