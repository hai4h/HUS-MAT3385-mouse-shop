import React from 'react';
import "../views/App.scss";

const LoginForm = () => (
  <div className="login-form">
    <h2>Login</h2>
    <form>
      <label>Username:</label>
      <input type="text" placeholder="Enter username" />
      <label>Password:</label>
      <input type="password" placeholder="Enter password" />
      <button type="submit">Login</button>
    </form>
  </div>
);

export default LoginForm;
