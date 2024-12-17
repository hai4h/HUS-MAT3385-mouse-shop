import React, { Component } from "react";
import axiosInstance from "../../services/axiosConfig";
import "./LoginSignup.scss";

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    // Khởi tạo state của component quên mật khẩu
    // Chứa thông tin username, email, trạng thái lỗi, đang tải và thành công
    this.state = {
      username: "",
      email: "",
      error: null,
      loading: false,
      success: false,
    };
  }

  // Phương thức đặt lại toàn bộ form về trạng thái ban đầu
  resetForm = () => {
    this.setState({
      username: "",
      email: "",
      error: null,
      loading: false,
      success: false,
    });
  };

  // Xử lý sự kiện gửi form quên mật khẩu
  // Thực hiện validate, gửi request đặt lại mật khẩu
  handleSubmit = async (event) => {
    event.preventDefault();
    const { username, email } = this.state;

    try {
      // Bắt đầu quá trình xử lý: đặt trạng thái tải và xóa lỗi cũ
      this.setState({ loading: true, error: null, success: false });

      // Kiểm tra tính hợp lệ của thông tin nhập vào
      if (!username || !email) {
        throw new Error("Please enter both username and email");
      }

      // Gửi request đặt lại mật khẩu tới backend
      const response = await axiosInstance.post("/forgot-password", {
        username,
        email,
      });

      // Xử lý kết quả thành công
      this.setState({
        success: true,
        loading: false,
      });

      // Gọi hàm callback nếu được định nghĩa
      if (this.props.onForgotPasswordSuccess) {
        this.props.onForgotPasswordSuccess(response.data);
      }
    } catch (error) {
      // Xử lý các lỗi có thể xảy ra trong quá trình đặt lại mật khẩu
      let errorMessage = "An error occurred while resetting password";

      // Phân tích và trích xuất thông báo lỗi từ phản hồi của server
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0].msg;
        } else if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Cập nhật state với thông báo lỗi
      this.setState({
        error: errorMessage,
        loading: false,
      });
    }
  };

  // Xử lý sự kiện thay đổi giá trị của các input
  // Cập nhật state và xóa các thông báo lỗi cũ
  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      error: null,
    });
  };

  render() {
    const { username, email, error, loading, success } = this.state;

    return (
      <div className="auth-form">
        <form className="login-signup-form" onSubmit={this.handleSubmit}>
          {/* Hiển thị thông báo lỗi nếu có */}
          {error && <div className="error-message">{error}</div>}

          {/* Hiển thị thông báo thành công khi đặt lại mật khẩu thành công */}
          {success && (
            <div className="success-message">
              Password reset instructions have been sent to your email.
            </div>
          )}

          <label>Username:</label>
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={username}
            onChange={this.handleChange}
            disabled={loading}
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={email}
            onChange={this.handleChange}
            disabled={loading}
          />

          {/* Nút submit form đặt lại mật khẩu */}
          <button
            type="submit"
            disabled={loading}
            className={loading ? "loading" : ""}
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>

          {/* Nút quay lại trang đăng nhập */}
          {!loading && (
            <span
              className="forgot-password"
              onClick={(event) => {
                event.stopPropagation(); // Ngăn sự kiện lan ra document
                this.props.onCancel?.();
              }}
            >
              Back to Login
            </span>
          )}
        </form>
      </div>
    );
  }
}

export default ForgotPassword;
