const API_URL = 'http://localhost:3000/api';

export const getRestaurants = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.minRating) queryParams.append('minRating', filters.minRating);
    if (filters.priceRange) queryParams.append('priceRange', filters.priceRange);

    const url = `${API_URL}/restaurants?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลร้านอาหารได้');

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getRestaurantById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/restaurants/${id}`);
    if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลร้านได้');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const addReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'เพิ่มรีวิวไม่สำเร็จ');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
