import React, { Component } from "react";
import "../../views/App.scss";
import "../../../../frontend-user/src/views/App";

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      email: ""
    };
  }
  /*Các hàm*/
  handleChangeUsername = (event) => {
    this.setState({
      username: event.target.value,
    });
  };

  handleChangeEmail = (event) => {
    this.setState({
      email: event.target.value,
    });
  };
  render() {
    const { username, email} = this.state;
    return (
      <div className="signup-form">
        <form>
          <label>Username:</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(event) => this.handleChangeUsername(event)}
          />
          <label>Email:</label>
          <input
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(event) => this.handleChangeEmail(event)}
          />
          <button
              type="submit"
            >
              Send New Password
            </button>
        </form>
      </div>
    );
  }
}
export default ForgotPassword;
