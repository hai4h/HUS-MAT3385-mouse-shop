import React, { Component } from "react";
import authService from "../../services/authService";
import "./LoginSignup.scss";

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            error: null,
            loading: false
        };
    }

    resetForm = () => {
        this.setState({
            username: "",
            password: "",
            error: null,
            loading: false
        });
    };

    handleLogin = async (event) => {
        event.preventDefault();
        const { username, password } = this.state;
    
        if (!username || !password) {
            this.setState({ error: 'Please enter both username and password' });
            return;
        }
        
        try {
            this.setState({ loading: true, error: null });
            
            const userData = await authService.login(username, password);
            
            if (userData) {
                if (this.props.onLoginSuccess) {
                    this.props.onLoginSuccess(userData);
                }
                this.resetForm();
            }
            
        } catch (error) {
            this.setState({
                error: error.message || 'Login failed',
                loading: false
            });
        }
    };

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
            error: null
        });
    };

    render() {
        const { username, password, error, loading } = this.state;

        return (
            <div className="auth-form">
                <form className="login-signup-form" onSubmit={this.handleLogin}>
                    {error && (
                        <div className="error-message">{error}</div>
                    )}
                    
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter username"
                        value={username}
                        onChange={this.handleInputChange}
                        disabled={loading}
                    />
                    
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={this.handleInputChange}
                        disabled={loading}
                    />
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={loading ? 'loading' : ''}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        );
    }
}

export default LoginForm;