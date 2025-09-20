
class PostAndUpdateDeleteResponse{
    message: string;
    code: string;
    data: any;
    constructor( data: any, code: string = 'success', message: string = 'Request success!'){
        this.message = message;
        this.code = code;
        this.data = data;
    }
}

class GetResponse {
    code: string;
    message: string;
    recordTotal: number;
    recordFiltered: number;
    data: any;
    constructor( recordTotal: number, recordFiltered: number, data: any, code: string = 'success', message: string = 'Request success!'){
        this.code = code;
        this.message = message;
        this.recordTotal = recordTotal;
        this.recordFiltered = recordFiltered;
        this.data = data;
    }
}

export {
    GetResponse,
    PostAndUpdateDeleteResponse
}