const express = require('express');
const router = express.Router();
const { readJsonFile, writeJsonFile } = require('../utils/fileManager');
const { validateReview } = require('../middleware/validation');

router.get('/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const reviews = await readJsonFile('reviews.json');
    const restaurantReviews = reviews
      .filter(r => r.restaurantId === parseInt(restaurantId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: restaurantReviews,
      total: restaurantReviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรีวิว'
    });
  }
});

router.post('/', validateReview, async (req, res) => {
  try {
    const { restaurantId, userName, rating, comment, visitDate } = req.body;

    // อ่านข้อมูลปัจจุบัน
    const reviews = await readJsonFile('reviews.json');
    const restaurants = await readJsonFile('restaurants.json');

    // ตรวจสอบว่าร้านมีอยู่จริง
    const restaurantIndex = restaurants.findIndex(r => r.id === parseInt(restaurantId));
    if (restaurantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบร้านอาหารนี้'
      });
    }

    // สร้างรีวิวใหม่
    const newReview = {
      id: Date.now(), // unique id แบบง่าย
      restaurantId: parseInt(restaurantId),
      userName: userName.toString().trim(),
      rating: parseInt(rating),
      comment: comment.toString().trim(),
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    // เพิ่มรีวิวและบันทึก
    reviews.push(newReview);
    const writeReviewsOk = await writeJsonFile('reviews.json', reviews);
    if (!writeReviewsOk) {
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการบันทึกรีวิว'
      });
    }

    // อัพเดท averageRating และ totalReviews ของร้าน (คำนวณจากรีวิวทั้งหมดที่มี)
    const restaurantReviews = reviews.filter(r => r.restaurantId === parseInt(restaurantId));
    const totalRating = restaurantReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAverageRating = restaurantReviews.length > 0 ? totalRating / restaurantReviews.length : 0;

    // อัพเดทใน array restaurants โดยแก้ที่ index
    restaurants[restaurantIndex].averageRating = Math.round(newAverageRating * 10) / 10; // 1 ตำแหน่งทศนิยม
    restaurants[restaurantIndex].totalReviews = restaurantReviews.length;

    const writeRestaurantsOk = await writeJsonFile('restaurants.json', restaurants);
    if (!writeRestaurantsOk) {
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลร้าน'
      });
    }

    // ส่งผลลัพธ์กลับ
    res.status(201).json({
      success: true,
      message: 'เพิ่มรีวิวสำเร็จ',
      data: newReview,
      restaurant: {
        id: restaurants[restaurantIndex].id,
        name: restaurants[restaurantIndex].name,
        averageRating: restaurants[restaurantIndex].averageRating,
        totalReviews: restaurants[restaurantIndex].totalReviews
      }
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มรีวิว'
    });
  }
});

module.exports = router;
