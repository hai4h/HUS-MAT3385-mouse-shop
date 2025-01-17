import React, { Component } from "react";
import authService from "../../services/authService";
import axiosInstance from "../../services/axiosConfig";
import "../../styles/desktop/LoginSignup.scss";

class SignupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email: "",
      full_name: "",
      error: null,
      loading: false
    };
  }

  resetForm = () => {
    this.setState({
      username: "",
      password: "",
      email: "",
      full_name: "",
      error: null,
      loading: false
    });
  };

  handleSignup = async (event) => {
      event.preventDefault();
      const { username, password, email, full_name } = this.state;

      try {
          this.setState({ loading: true, error: null });

          if (!username || !password || !email || !full_name) {
              throw new Error('All fields are required');
          }

          await axiosInstance.post('/users/', {
              username,
              password,
              email,
              full_name
          });

          const loginResponse = await authService.login(username, password);
          
          this.resetForm();

          if (this.props.onSignupSuccess) {
              await this.props.onSignupSuccess(loginResponse);
          }

          if (this.props.onClose) {
              this.props.onClose();
          }
      } catch (error) {
          let errorMessage = 'An error occurred during signup';
          
          // Xử lý các loại lỗi validation từ backend
          if (error.response?.data?.detail) {
              // Nếu detail là một object chứa nhiều lỗi validation
              if (Array.isArray(error.response.data.detail)) {
                  errorMessage = error.response.data.detail[0].msg;
              } 
              // Nếu detail là string thông báo lỗi trực tiếp
              else if (typeof error.response.data.detail === 'string') {
                  errorMessage = error.response.data.detail;
              }
              // Nếu detail là object với msg
              else if (error.response.data.detail.msg) {
                  errorMessage = error.response.data.detail.msg;
              }
          }
          // Xử lý lỗi từ frontend validation
          else if (error.message) {
              errorMessage = error.message;
          }
          
          this.setState({
              error: errorMessage,
              loading: false
          });
      }
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      error: null
    });
  };

  render() {
    const { username, password, email, full_name, error, loading } = this.state;

    return (
      <div className="auth-form">
        <form className="login-signup-form" onSubmit={this.handleSignup}>
          {error && <div className="error-message">{error}</div>}

          <label>Username:</label>
          <input
            type="text"
            name="username"
            placeholder="Choose a username"
            value={username}
            onChange={this.handleChange}
            disabled={loading}
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={this.handleChange}
            disabled={loading}
          />

          <label>Full Name:</label>
          <input
            type="text"
            name="full_name"
            placeholder="Enter your full name"
            value={full_name}
            onChange={this.handleChange}
            disabled={loading}
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            placeholder="Choose a password"
            value={password}
            onChange={this.handleChange}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    );
  }
}

export default SignupForm;