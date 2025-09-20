export interface RouteAPI{
    id: string;
    title: string; // tables name
    pms : number[]; //[0, 0, 0, 0] <=> [canAccess,canAdd,canEdit,canDelete]

}