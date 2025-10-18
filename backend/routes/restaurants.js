const express = require('express');
const router = express.Router();
const { readJsonFile } = require('../utils/fileManager');

router.get('/', async (req, res) => {
  try {
    let restaurants = await readJsonFile('restaurants.json');
    const { search, category, minRating, priceRange } = req.query;

    // Filter by search (name OR description)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchLower = search.toLowerCase().trim();
      restaurants = restaurants.filter(r =>
        (r.name && r.name.toLowerCase().includes(searchLower)) ||
        (r.description && r.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (category && category.trim() !== '') {
      const catTrim = category.trim();
      restaurants = restaurants.filter(r => r.category === catTrim);
    }

    // Filter by minRating
    if (minRating !== undefined && minRating !== null && minRating !== '') {
      const minR = parseFloat(minRating);
      if (!isNaN(minR)) {
        restaurants = restaurants.filter(r => parseFloat(r.averageRating || 0) >= minR);
      }
    }

    // Filter by priceRange
    if (priceRange !== undefined && priceRange !== null && priceRange !== '') {
      const pr = parseInt(priceRange);
      if (!isNaN(pr)) {
        restaurants = restaurants.filter(r => parseInt(r.priceRange) === pr);
      }
    }

    res.json({
      success: true,
      data: restaurants,
      total: restaurants.length,
      filters: {
        search: search || null,
        category: category || null,
        minRating: minRating || null,
        priceRange: priceRange || null
      }
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลร้าน'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const restaurants = await readJsonFile('restaurants.json');
    const reviews = await readJsonFile('reviews.json');

    const restaurant = restaurants.find(r => r.id === parseInt(id));
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบร้านอาหารนี้'
      });
    }

    const restaurantReviews = reviews
      .filter(r => r.restaurantId === parseInt(id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: {
        ...restaurant,
        reviews: restaurantReviews
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลร้าน'
    });
  }
});

module.exports = router;
