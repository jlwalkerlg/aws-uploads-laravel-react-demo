import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Store from '../store';

const AuthRoute = ({ children, ...rest }) => {
  return (
    <Store.Consumer>
      {({ isLoggedIn }) => {
        return (
          <Route
            {...rest}
            render={({ location }) =>
              isLoggedIn ? (
                children
              ) : (
                <Redirect
                  to={{
                    pathname: '/login',
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

export default AuthRoute;
