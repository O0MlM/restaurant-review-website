const express = require('express');
const cors = require('cors');
require('dotenv').config();

const restaurantRoutes = require('./routes/restaurants');
const reviewRoutes = require('./routes/reviews');
const { readJsonFile } = require('./utils/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root info
app.get('/', (req, res) => {
  res.json({
    message: '🍜 Restaurant Review API',
    version: '1.0.0',
    endpoints: {
      restaurants: '/api/restaurants',
      reviews: '/api/reviews',
      stats: '/api/stats'
    }
  });
});

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/stats', async (req, res) => {
  try {
    const restaurants = await readJsonFile('restaurants.json');
    const reviews = await readJsonFile('reviews.json');

    const totalRestaurants = restaurants.length;
    const totalReviews = reviews.length;

    // คำนวณ averageRating ของระบบ: ค่าเฉลี่ยของ averageRating ของร้านทั้งหมดที่มี totalReviews>0
    const ratedRestaurants = restaurants.filter(r => r.totalReviews && r.totalReviews > 0);
    let averageRating = 0;
    if (ratedRestaurants.length > 0) {
      const sumAvg = ratedRestaurants.reduce((sum, r) => sum + parseFloat(r.averageRating || 0), 0);
      averageRating = Math.round((sumAvg / ratedRestaurants.length) * 10) / 10;
    }

    // top 5 restaurants by averageRating (ถ้า tie ให้เรียง by totalReviews desc)
    const topRatedRestaurants = [...restaurants]
      .sort((a, b) => {
        const ra = parseFloat(a.averageRating || 0);
        const rb = parseFloat(b.averageRating || 0);
        if (rb === ra) {
          return (b.totalReviews || 0) - (a.totalReviews || 0);
        }
        return rb - ra;
      })
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        name: r.name,
        averageRating: r.averageRating,
        totalReviews: r.totalReviews
      }));

    res.json({
      success: true,
      data: {
        totalRestaurants,
        totalReviews,
        averageRating,
        topRatedRestaurants
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ'
    });
  }
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
