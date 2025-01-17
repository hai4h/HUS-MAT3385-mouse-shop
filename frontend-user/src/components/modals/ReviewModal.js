import React, { useState } from 'react';
import axiosInstance from '../../services/axiosConfig';
import './Modals.scss';

const ReviewModal = ({ isOpen, onClose, orderDetail, onReviewSubmitted }) => {
    const [reviews, setReviews] = useState(() => {
        const productDetails = orderDetail?.product_details || [];
        return productDetails.map(detail => ({
          product_id: detail.product_id,
          product_name: detail.product_name,
          rating: detail.hasReviewed ? detail.review.rating : 5,
          comment: detail.hasReviewed ? detail.review.comment : '',
          submitted: false,
          wasEdited: detail.wasEdited,
          review_id: detail.hasReviewed ? detail.review.review_id : null,
          order_detail_id: detail.order_detail_id
        }));
    });
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !reviews.length) return null;

    const currentReview = reviews[currentIndex];
    const totalProducts = reviews.length;

    const handleRatingChange = (rating) => {
        setReviews(prevReviews => {
            const newReviews = [...prevReviews];
            newReviews[currentIndex] = {
                ...newReviews[currentIndex],
                rating
            };
            return newReviews;
        });
    };

    const handleCommentChange = (comment) => {
        setReviews(prevReviews => {
            const newReviews = [...prevReviews];
            newReviews[currentIndex] = {
                ...newReviews[currentIndex],
                comment
            };
            return newReviews;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Get current product's review data
            const { product_id, rating, comment, review_id, order_detail_id } = currentReview;

            if (review_id) {
                // Update existing review
                await axiosInstance.put(`/reviews/user-review/${review_id}`, {
                  rating,
                  comment
                });
            } else {
                // Create new review
                await axiosInstance.post(`/reviews/product/${product_id}/user-review`, {
                  order_detail_id,
                  rating,
                  comment
                });
            }

            // Submit review for current product
            await axiosInstance.post(`/reviews/product/${product_id}/user-review`, {
                order_detail_id,
                rating,
                comment
            });

            // Mark current review as submitted
            setReviews(prevReviews => {
                const newReviews = [...prevReviews];
                newReviews[currentIndex].submitted = true;
                return newReviews;
            });

            // If there are more products to review
            if (currentIndex < totalProducts - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // All products have been reviewed
                onReviewSubmitted();
                onClose();
            }
        } catch (error) {
            setError(error.response?.data?.detail || 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-content">
                <div className="review-modal-header">
                    <h3 className="review-modal-title">
                        Đánh giá sản phẩm ({currentIndex + 1}/{totalProducts})
                    </h3>
                    <button onClick={onClose} className="review-modal-close">×</button>
                </div>

                <div className="review-modal-body">
                    <h4 className="product-name">{currentReview.product_name}</h4>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Đánh giá</label>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingChange(star)}
                                        className={`star ${star <= currentReview.rating ? 'active' : ''}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Nhận xét</label>
                            <textarea
                                value={currentReview.comment}
                                onChange={(e) => handleCommentChange(e.target.value)}
                                required
                                minLength={10}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cancel-button"
                                disabled={submitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={submitting}
                            >
                                {submitting ? 'Đang gửi...' : 
                                 currentIndex < totalProducts - 1 ? 
                                 'Tiếp tục' : 'Hoàn thành'}
                            </button>
                        </div>
                    </form>

                    <div className="progress-indicator">
                        {reviews.map((review, index) => (
                            <div 
                                key={index}
                                className={`progress-dot ${
                                    index === currentIndex ? 'active' :
                                    review.submitted ? 'completed' : ''
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;