import React from 'react';

const WarrantyDetailsModal = ({ warrantyDetails, onClose, openClaimModal }) => {
  if (!Array.isArray(warrantyDetails) || warrantyDetails.length === 0) {
    return null;
  }

  return (
    <div className="warranty-details-modal-overlay">
      <div className="warranty-details-modal">
        <div className="modal-header">
          <h4>Thông tin bảo hành</h4>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {warrantyDetails.map(({ productId, warrantyInfo, status, orderDetailId }) => (
            <div key={`warranty-${productId}-${orderDetailId}`} className="warranty-card">
              {warrantyInfo ? (
                <>
                  <div className="warranty-header">
                    <div className="product-info">
                      <h5 className="product-name">{warrantyInfo.product_name}</h5>
                      <p className="warranty-type">{warrantyInfo.warranty_type}</p>
                    </div>
                    <span className={`warranty-status ${status.isValid ? 'valid' : 'expired'}`}>
                      {status.isValid ? 'Còn bảo hành' : 'Hết bảo hành'}
                    </span>
                  </div>
                  <div className="warranty-details">
                    <div className="detail-row">
                      <span className="label">Thời hạn:</span>
                      <span className="value">{warrantyInfo.warranty_period} tháng</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Ngày hết hạn:</span>
                      <span className="value">{status.endDate}</span>
                    </div>
                  </div>
                  {warrantyInfo.warranty_conditions && (
                    <div className="warranty-conditions">
                      <p className="conditions-title">Điều kiện bảo hành:</p>
                      <p className="conditions-content">{warrantyInfo.warranty_conditions}</p>
                    </div>
                  )}
                  <div className="warranty-actions">
                    <button
                      className={`warranty-button ${status.isValid ? '' : 'disabled'}`}
                      disabled={!status.isValid}
                      onClick={() => openClaimModal({
                        productId,
                        orderDetailId,
                        productName: warrantyInfo.product_name
                      })}
                    >
                      Yêu cầu bảo hành
                    </button>
                  </div>
                </>
              ) : (
                <div className="warranty-header no-warranty">
                  <div className="product-info">
                    <h5 className="product-name">
                      {warrantyInfo?.product_name || 'Không tìm thấy thông tin'}
                    </h5>
                    <p className="warranty-message">Sản phẩm chưa được kích hoạt bảo hành</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarrantyDetailsModal;