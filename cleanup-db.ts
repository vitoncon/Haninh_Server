import db from './src/db/config.db';

async function cleanupFees() {
  console.log('Bắt đầu chuẩn hóa trạng thái học phí...');
  
  try {
    // Chuẩn hóa: Chỉ giữ 'paid' hoặc 'debt'
    // Những bản ghi không phải 'paid' thì chuyển về 'debt'
    const affected = await db('fees')
      .whereNotIn('payment_status', ['paid', 'debt'])
      .orWhereNull('payment_status')
      .update({ 
        payment_status: 'debt'
      });
      
    console.log(`Đã chuẩn hóa ${affected} bản ghi.`);
    
    // Đảm bảo tất cả chữ thường và không khoảng trắng
    await db.raw("UPDATE fees SET payment_status = LOWER(TRIM(payment_status))");
    
    console.log('Dọn dẹp database HOÀN TẤT.');
  } catch (error) {
    console.error('Lỗi khi dọn dẹp database:', error);
  } finally {
    process.exit(0);
  }
}

cleanupFees();
