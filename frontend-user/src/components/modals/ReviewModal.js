import React, { useState } from 'react';
import axiosInstance from '../../services/axiosConfig';
import './Modals.scss';

const ReviewModal = ({ isOpen, onClose, orderDetail, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await axiosInstance.post(`/reviews/product/${orderDetail.product_id}/user-review`, {
                rating,
                comment
            });
            onReviewSubmitted();
            onClose();
        } catch (error) {
            setError(error.response?.data?.detail || 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-content">
                <div className="review-modal-header">
                    <h3 className="review-modal-title">Đánh giá sản phẩm</h3>
                    <button onClick={onClose} className="review-modal-close">×</button>
                </div>

                <div className="review-modal-body">
                    <h4 className="product-name">{orderDetail.product_name}</h4>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Đánh giá</label>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={star <= rating ? 'star active' : 'star'}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Nhận xét</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
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
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;