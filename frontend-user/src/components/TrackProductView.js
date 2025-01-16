import axiosInstance from "../services/axiosConfig";

export const TrackProductView = async (productId) => {
  try {
    // Validate productId
    if (!productId || isNaN(productId)) {
      console.error('Invalid product ID for tracking');
      return;
    }

    // Get or generate session ID
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', sessionId);
    }

    // Track the view
    await axiosInstance.post('/page-views/track', {
      product_id: Number(productId),
      session_id: sessionId
    });
    
  } catch (error) {
    // Log error but don't throw - view tracking should fail silently
    console.error('Product view tracking error:', error);
    
    // Log additional details if available
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
};