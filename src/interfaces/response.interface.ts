export type GetResponse = {
    code: string;
    message: string,
    recordTotal: number;
    recordFiltered: number;
    data: any;
}

export type PostUpdateDeleteResponse = {
    message: string;
    code: string;
    data: any;
}