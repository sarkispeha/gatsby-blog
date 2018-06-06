---
title: "React Route Setup"
path: "/challenge-app/react-route-setup"
date: "2018-05-27T01:01:01.001Z"
---

I want to allow users to be able to log into the application using email/password. I humbly admit I am no rockstar in app architecture and this blog is very much meant to help my own learning progress. With that in mind I followed much of what this article says (https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial/), internalized it, and put it into my own words.

To get things rolling with some boilerplate I installed

`npm install -g create-reacte-app`

and then ran

`create-react-app client`

as `client` will be the forward-facing portion of the application.

Firebase will be used for the authentication logic and the react-router for all of the front-end routes our application will use.

`npm install firebase react-router-dom`

I then created the following directories in the `/src`
`/components`
`/constants`

In `/constants` I put a `routes.js` to house all of the standard use routes.

```
export const SIGN_UP = '/signup';
export const SIGN_IN = '/signin';
export const LANDING = '/';
export const PASSWORD_FORGET = '/pw-forget';

export const HOME = '/home';
export const ACCOUNT = '/account';
```

The first four routes are publicly facing and without need for authorization.

The App.js component looks like so:

```
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Navigation from './Navigation';

const App = () =>
  <Router>
    <Navigation />
  </Router>

export default App;
```

And a Navigation component will fit like this:

```
import React from 'react';
import { Link } from 'react-router-dom';

import * as routes from '../constants/routes';

const Navigation = () =>
  <div>
    <ul>
      <li><Link to={routes.SIGN_IN}>Sign In</Link></li>
      <li><Link to={routes.LANDING}>Landing</Link></li>
      <li><Link to={routes.HOME}>Home</Link></li>
      <li><Link to={routes.ACCOUNT}>Account</Link></li>
    </ul>
  </div>

export default Navigation;
```

One thing I've never done in any react application of mine is define the routes within their own separate routes.js file. I really think the setup here is beneficial as it consolidates the places one would need to change a route in the future down to one file.

To test the react router, I import the components...

```
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

const App = () =>
  <Router>
    <div>
      <Navigation />

      <hr/>

      <Route
        exact path={routes.LANDING}
        component={() => <LandingPage />}
      />
      <Route
        exact path={routes.SIGN_UP}
        component={() => <SignUpPage />}
      />
      <Route
        exact path={routes.SIGN_IN}
        component={() => <SignInPage />}
      />
      <Route
        exact path={routes.PASSWORD_FORGET}
        component={() => <PasswordForgetPage />}
      />
      <Route
        exact path={routes.HOME}
        component={() => <HomePage />}
      />
      <Route
        exact path={routes.ACCOUNT}
        component={() => <AccountPage />}
      />
    </div>
  </Router>

export default App;
```

and add dummy content to said components.

```
importimport React from 'react';

const LandingPage = () =>
  <div>
    <h1>Landing Page</h1>
  </div>

export default LandingPage;
```
Now that the routing is more or less framed up, I sign up my application on Firebase.