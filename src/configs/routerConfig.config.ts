import { RouterConfig } from "@interfaces/routerConfig.interface";

export const RouterConfigs:RouterConfig = {
    'categories-1': {
        table: 'categories',
        isPublic: true,
    },
    'products': {
        table: 'products',
        isPublic: true,
    },
    'orders': {
        table: 'orders',
        isPublic: false,
    },
    'tests': {
        table: 'tests',
        isPublic: false,
    },
    'users': {
        table: 'users',
        isPublic: false,
    },
};
