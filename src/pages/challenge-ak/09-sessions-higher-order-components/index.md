---
title: "Sessions with Higher Order Components"
path: "/challenge-app/sessions-with-higher-order-components"
date: "2018-06-08T01:01:01.001Z"
---

There are some benefits with higher order components. First, they keep other components lightweight by not locking logic that doesn't have any component-specific value within one certain component. By extension of this, the higher order component can then have its functionality used by many components.

In this example, the authentication is not necesarily only particular to the App component. It can be used by many other components that might be children within the App component, but not the App itself. It is here that I learned of the React context API, a concept that states props can be passed specifically to components that need them, rather than passing the prop step-by-step down through other components that might not necessarily need the prop. This means that the App component doesn't need to care about the `authUser` object, and other components can still get access to it. This has a huge benefit in case I need to create a different component heirarchy later in the application and I don't want to chase around props to be sure they are passed correctly through the new structure.

Time to refactor the App component.
```javascript
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Navigation from './Navigation';
import LandingPage from './Landing';
import SignUpPage from './SignUp';
import SignInPage from './SignIn';
import PasswordForgetPage from './PasswordForget';
import HomePage from './Home';
import AccountPage from './Account';

import * as routes from '../constants/routes';

import withAuthentication from './withAuthentication';

const App = () =>
  <Router>
    <div>
      <Navigation />

      <hr/>

      <Route exact path={routes.LANDING} component={() => <LandingPage />} />
      <Route exact path={routes.SIGN_UP} component={() => <SignUpPage />} />
      <Route exact path={routes.SIGN_IN} component={() => <SignInPage />} />
      <Route exact path={routes.PASSWORD_FORGET} component={() => <PasswordForgetPage />} />
      <Route exact path={routes.HOME} component={() => <HomePage />} />
      <Route exact path={routes.ACCOUNT} component={() => <AccountPage />} />
    </div>
  </Router>

export default withAuthentication(App);
```

Now it has a twist. By importing `withAuthentication` and exporting it, `export default withAuthentication(App);` the higher order component passes its logic to the App component.

On to the `withAuthentication.js` file. The 'with' is a naming convention used to distinguish a React component with a React higher order component.
```javascript
import React from 'react';

import AuthUserContext from './AuthUserContext';
import { firebase } from '../firebase';

const withAuthentication = (Component) =>
  class WithAuthentication extends React.Component {
    constructor(props) {
      super();

      this.state = {
        authUser: null,
      };
    }

    componentDidMount() {
      firebase.auth.onAuthStateChanged(authUser => {
        authUser
          ? this.setState(() => ({ authUser }))
          : this.setState(() => ({ authUser: null }));
      });
    }

    render() {
        const { authUser } = this.state;

        return (
            <AuthUserContext.Provider value={authUser}>
                <Component />
            </AuthUserContext.Provider>
        );
    }
  }

export default withAuthentication;
```

Here is all of the logic previously in the App component. The `Component` argument will later be returned within the `AuthUserContext` object with a `Provider` component. And the `AuthUserContext.js` file itself:

```javascript
import React from 'react';

const AuthUserContext = React.createContext(null);

export default AuthUserContext;
```

This last file allows React's context API to be initiated and a context object to be created. The `Provider` is where the magic happens and because the App component is exported within the `withAuthentication()`, any component within the App component has access to the value in `<AuthUserContext.Provider value={authUser}>`.

To get this value to the Navigation component, React's context API `Consumer` call is needed.

```javascript
import AuthUserContext from './AuthUserContext';

const Navigation = () =>
  <AuthUserContext.Consumer>
    {authUser => authUser
      ? <NavigationAuth />
      : <NavigationNonAuth />
    }
  </AuthUserContext.Consumer>
```
And now the `authUser` is available within the Navigation. In this way, the issue of 'prop drilling' has been skirted as we no longer have to pass the `authUser` down directly from the App component as a prop to the Navigation component.