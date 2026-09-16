const fetch = require('node-fetch');
const env = require('../../config/env');

async function searchImage(query) {
  try {
    const provider = env.IMAGE_SEARCH_PROVIDER || 'unsplash';

    if (provider === 'google' && env.IMAGE_SEARCH_API_KEY && env.IMAGE_SEARCH_ENGINE_ID) {
      const url = `https://www.googleapis.com/customsearch/v1?key=${env.IMAGE_SEARCH_API_KEY}&cx=${env.IMAGE_SEARCH_ENGINE_ID}&searchType=image&num=1&q=${encodeURIComponent(query + ' food dish')}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      return data.items?.[0]?.link || null;
    }

    if (provider === 'pexels' && env.IMAGE_SEARCH_API_KEY) {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + ' food')}&per_page=1`;
      const response = await fetch(url, {
        headers: { Authorization: env.IMAGE_SEARCH_API_KEY }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.photos?.[0]?.src?.medium || null;
    }

    if (provider === 'unsplash' && env.IMAGE_SEARCH_API_KEY) {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' food')}&per_page=1&client_id=${env.IMAGE_SEARCH_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      return data.results?.[0]?.urls?.regular || null;
    }

    // Default safe food image placeholder provider (Unsplash Source food keyword)
    const encoded = encodeURIComponent(query.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'food');
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80`;
  } catch (err) {
    console.error('Image search failed:', err.message);
    return null;
  }
}

module.exports = { searchImage };
