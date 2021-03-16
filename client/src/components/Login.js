import React, { Component } from 'react';
import axios from 'axios';

class Login extends Component {
  constructor() {
    super();

    this.state = {
      values: {
        email: '',
        password: '',
      },
    };
  }

  submit = async () => {
    const { context } = this.props;

    try {
      const response = await axios.post('/login', {
        ...this.state.values,
      });
      context.login(response.data);
    } catch (error) {
      alert('Login failed.');
    }
  };

  updateValue = e => {
    this.setState({
      values: { ...this.state.values, [e.target.name]: e.target.value },
    });
  };

  render() {
    const {
      values: { email, password },
    } = this.state;

    return (
      <div className="section">
        <div className="container">
          <h1 className="title">Login</h1>

          <div>
            <div className="field">
              <label className="label">Email</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={this.updateValue}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Password</label>
              <div className="control">
                <input
                  className="input"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={this.updateValue}
                />
              </div>
            </div>

            <button className="button" onClick={this.submit}>
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
