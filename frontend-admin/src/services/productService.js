import axiosInstance from './axiosConfig';

export const productService = {
  // Lấy danh sách sản phẩm với filter
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.hand_size) params.append('hand_size', filters.hand_size);
    if (filters.grip_style) params.append('grip_style', filters.grip_style);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.is_wireless !== undefined) params.append('is_wireless', filters.is_wireless);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);

    const response = await axiosInstance.get(`/products/?${params}`);
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  async getProduct(id) {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  // Tạo sản phẩm mới
  async createProduct(productData) {
    console.log('Creating product with data:', productData);
    const response = await axiosInstance.post('/products/', productData);
    return response.data;
  },

  // Cập nhật sản phẩm
  async updateProduct(id, productData) {
    console.log('Updating product with data:', productData);
    const response = await axiosInstance.put(`/products/${id}`, productData);
    return response.data;
  },

  // Upload ảnh sản phẩm
  async uploadImage(productId, imageFile, isPrimary = false) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('is_primary', isPrimary);

    const response = await axiosInstance.post(
      `/images/product/${productId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
};