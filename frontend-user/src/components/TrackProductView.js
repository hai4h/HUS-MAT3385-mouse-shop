import axiosInstance from "../services/axiosConfig";

export const TrackProductView = async (productId) => {
  try {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', sessionId);
    }

    await axiosInstance.post('/page-views/track', {
      product_id: productId,
      session_id: sessionId
    });
  } catch (error) {
    console.error('Product view tracking error:', error);
  }
};