export class Helper {
    /**
     * Chuyển đổi kiểu dữ liệu của response.data dựa trên keyType.
     * @param data Dữ liệu cần chuyển đổi (response.data).
     * @param keyType Định nghĩa kiểu dữ liệu cho từng key.
     * @returns Dữ liệu đã được chuyển đổi.
     */
    convertDataTypeResponse(data: any[], keyType: Record<string, string>): any[] {
        try {
            return data.map((record) => {
                const convertedRecord: Record<string, any> = {};

                // Chỉ xử lý các key được định nghĩa trong keyType
                for (const key in keyType) {
                    if (record[key] !== undefined) {
                        switch (keyType[key]) {
                            case 'date':
                                // Chuyển đổi sang đối tượng Date
                                convertedRecord[key] = new Date(record[key]);
                                break;
                            case 'json':
                                // Chuyển đổi chuỗi JSON thành object
                                try {
                                    convertedRecord[key] = record[key]
                                        ? JSON.parse(record[key])
                                        : null;
                                } catch {
                                    convertedRecord[key] = null; // Nếu parse thất bại, trả về null
                                }
                                break;
                            default:
                                // Giữ nguyên các kiểu dữ liệu khác
                                convertedRecord[key] = record[key];
                        }
                    }
                }

                // Bỏ qua các key không có trong keyType
                return convertedRecord;
            });
        } catch (error) {
            console.error('Error converting data types:', error);
            return data; // Trả về dữ liệu gốc nếu có lỗi
        }
    }
}
