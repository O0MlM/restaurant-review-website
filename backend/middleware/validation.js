const hasDangerousCharacters = (str) => {
    if (!str || typeof str !== 'string') return false;
    const dangerousPatterns = /<script|<iframe|javascript:|onerror=|onclick=|<\/?svg|data:text\/html/i;
    return dangerousPatterns.test(str);
  };
  
  const validateReview = (req, res, next) => {
    const { restaurantId, userName, rating, comment } = req.body;
    const errors = [];
  
    // restaurantId (ตัวอย่างเดิมให้ครบ 100%)
    if (!restaurantId && restaurantId !== 0) {
      errors.push('กรุณาระบุรหัสร้านอาหาร');
    } else if (isNaN(parseInt(restaurantId))) {
      errors.push('รหัสร้านต้องเป็นตัวเลข');
    } else if (parseInt(restaurantId) <= 0) {
      errors.push('รหัสร้านต้องมากกว่า 0');
    }
  
    // userName: ต้องมี, length 2-50, ไม่มีอักขระอันตราย
    if (!userName || !userName.toString().trim()) {
      errors.push('กรุณากรอกชื่อ');
    } else {
      const nameTrim = userName.toString().trim();
      if (nameTrim.length < 2) errors.push('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร');
      if (nameTrim.length > 50) errors.push('ชื่อต้องไม่เกิน 50 ตัวอักษร');
      if (hasDangerousCharacters(nameTrim)) errors.push('ชื่อมีอักขระที่ไม่อนุญาต');
    }
  
    // rating: ต้องมี, ตัวเลข, 1-5
    if (rating === undefined || rating === null || rating === '') {
      errors.push('กรุณาเลือกคะแนน');
    } else {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        errors.push('คะแนนต้องอยู่ระหว่าง 1-5');
      }
    }
  
    // comment: ต้องมี, length 10-500, ไม่มีอักขระอันตราย
    if (!comment || !comment.toString().trim()) {
      errors.push('กรุณากรอกความคิดเห็น');
    } else {
      const c = comment.toString().trim();
      if (c.length < 10) errors.push('ความคิดเห็นต้องมีอย่างน้อย 10 ตัวอักษร');
      if (c.length > 500) errors.push('ความคิดเห็นต้องไม่เกิน 500 ตัวอักษร');
      if (hasDangerousCharacters(c)) errors.push('ความคิดเห็นมีอักขระที่ไม่อนุญาต');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง',
        errors
      });
    }
  
    next();
  };
  
  module.exports = {
    validateReview
  };
  