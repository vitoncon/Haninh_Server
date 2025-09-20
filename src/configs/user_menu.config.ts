import { Menu } from "@interfaces/menu.interface";

export const  UserMenu: Menu[] = [
    {
        id: 'product',
        title: 'Product',
        icon: 'fa fa-clipboard',
        position: 'left',
        pms: [1,1,1,1],
        child: [
            {
                id: 'product-list',
                title: 'List',
                position: 'left',
                icon: 'fa fa-list',
                pms: [1,1,1,0],
                child: []
            }
        ]
    }
]

