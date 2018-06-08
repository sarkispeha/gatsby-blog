---
title: "Protected Routes with Authorization"
path: "/challenge-app/protected-routes-with-authorization"
date: "2018-06-10T01:01:01.001Z"
---

I want to be sure that pages like Account and Home are not accessible to users that have not signed in. In this light, there should be authorization within the application to certain routes. Right now, it will start with general authorization (a check for an authenticated user) but later on there will be a need for more specific authorization based on roles, as some users (admins) will have privileges that others do not.

Another higher order component `withAuthorization` will be used in a similar manner to the `withAuthentication` component in that the React context API will be used to avoid passing a value `authCondition` as an unnecessary prop to components that don't explicitly need it.

```javascript
import React from 'react';
import { withRouter } from 'react-router-dom';

import AuthUserContext from './AuthUserContext';
import { firebase } from '../firebase';
import * as routes from '../constants/routes';

const withAuthorization = (authCondition) => (Component) => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      firebase.auth.onAuthStateChanged(authUser => {
        if (!authCondition(authUser)) {
          this.props.history.push(routes.SIGN_IN);
        }
      });
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser => authUser ? <Component /> : null}
        </AuthUserContext.Consumer>
      );
    }
  }

  return withRouter(WithAuthorization);
}

export default withAuthorization;
```

The imports used in this file tell most of the story of how this component will work. Using the `auth.onAuthStateChanged()` on the `componentDidMount()` it checks the `authUser` on the callback function `authCondition()`. If it returns false, (the user is not authenticated) then using the react router history the app will be programmatically routed to the Sign In page.

In the render statement there is also a check to see if `authUser` exists, and will not render the passed `Component` if it returns null. The `WithAuthorization` component is wrapped in the `withRouter` higher order component that comes baked into the React Router library.

Now to use this component for the routes needing authorization. In the Home component:

```javascript
import React from 'react';

import withAuthorization from './withAuthorization';

const HomePage = () =>
  <div>
    <h1>Home Page</h1>
    <p>The Home Page is accessible by every signed in user.</p>
  </div>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(HomePage);
```

`authCondition()` will eventually check to see if the object passed exists or not in the `withAuthorization` higher order component. Passing `HomePage` simply designates which component to be shown or hidden.