import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Store from '../store';

const GuestRoute = ({ children, ...rest }) => {
  return (
    <Store.Consumer>
      {({ isLoggedIn, user }) => {
        return (
          <Route
            {...rest}
            render={({ location }) =>
              !isLoggedIn ? (
                children
              ) : (
                <Redirect
                  to={{
                    pathname: '/',
                    state: { from: location },
                  }}
                />
              )
            }
          />
        );
      }}
    </Store.Consumer>
  );
};

export default GuestRoute;
