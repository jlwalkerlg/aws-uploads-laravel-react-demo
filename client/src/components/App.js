import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import axios from 'axios';
import Store from '../store';
import GuestRoute from './GuestRoute';
import AuthRoute from './AuthRoute';
import Navbar from './Navbar';
import Login from './Login';
import Gallery from './Gallery';
import Videos from './Videos';
import Error404 from './Error404';

class App extends Component {
  constructor() {
    super();

    this.state = {
      isLoading: true,
      isLoggedIn: false,
      user: null,
      login: user =>
        this.setState({
          isLoggedIn: true,
          user,
        }),
      logout: () => {
        this.setState({
          isLoggedIn: false,
          user: null,
        });
      },
    };
  }

  async componentDidMount() {
    try {
      const response = await axios.get('/me');
      this.setState({ isLoggedIn: true, user: response.data });
    } catch (error) {
    } finally {
      this.setState({ isLoading: false });
    }
  }

  render() {
    const { isLoading, isLoggedIn } = this.state;

    if (isLoading) {
      return (
        <div className="section">
          <div className="container">
            <h1 className="title">Loading</h1>
          </div>
        </div>
      );
    }

    return (
      <Store.Provider value={this.state}>
        <Router>
          <div>
            <Navbar context={this.state} />

            <Switch>
              <Route exact path="/">
                {isLoggedIn ? (
                  <Redirect to="/gallery" />
                ) : (
                  <Redirect to="/login" />
                )}
              </Route>
              <GuestRoute path="/login" exact>
                <Login context={this.state} />
              </GuestRoute>
              <AuthRoute path="/gallery" exact>
                <Gallery context={this.state} />
              </AuthRoute>
              <AuthRoute path="/videos" exact>
                <Videos context={this.state} />
              </AuthRoute>
              <Route path="">
                <Error404 />
              </Route>
            </Switch>
          </div>
        </Router>
      </Store.Provider>
    );
  }
}

export default App;
