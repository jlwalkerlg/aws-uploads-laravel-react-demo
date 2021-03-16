import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

class Navbar extends Component {
  constructor() {
    super();

    this.state = {
      isExpanded: false,
    };
  }

  toggleExpanded = () => {
    this.setState(state => ({
      isExpanded: !state.isExpanded,
    }));
  };

  logout = async () => {
    const { context } = this.props;

    try {
      await axios.post('/logout');
      context.logout();
    } catch (error) {}
  };

  render() {
    const { isExpanded } = this.state;
    const { isLoggedIn } = this.props.context;

    return (
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <NavLink className="navbar-item" to="/">
              <img
                src="https://bulma.io/images/bulma-logo.png"
                alt="logo"
                width="112"
                height="28"
              />
            </NavLink>

            <span
              role="button"
              className={
                'navbar-burger burger' + (isExpanded ? ' is-active' : '')
              }
              aria-label="menu"
              aria-expanded="false"
              data-target="navbarBasicExample"
              onClick={this.toggleExpanded}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </span>
          </div>

          <div
            id="navbarBasicExample"
            className={'navbar-menu' + (isExpanded ? ' is-active' : '')}
          >
            <div className="navbar-start">
              {isLoggedIn && (
                <>
                  <NavLink to="/gallery" className="navbar-item">
                    Gallery
                  </NavLink>
                  <NavLink to="/videos" className="navbar-item">
                    Videos
                  </NavLink>
                </>
              )}
            </div>

            <div className="navbar-end">
              <div className="navbar-item">
                <div className="buttons">
                  {isLoggedIn && (
                    <div className="button is-primary" onClick={this.logout}>
                      Logout
                    </div>
                  )}
                  {!isLoggedIn && (
                    <NavLink to="/login" className="button is-primary">
                      Login
                    </NavLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
