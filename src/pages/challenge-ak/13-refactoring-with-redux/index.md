---
title: "Refactoring with Redux"
path: "/challenge-app/refactor-with-redux"
date: "2018-06-12T01:01:01.001Z"
---

To this point, the application has used vanilla React to manage state, but it's time to implement Redux. Other than my personal desire to better my Redux skills, I have a feeling this application will expand greatly from its initial release and I want to be sure that it's architected with a solid foundation while it is small and malleable before getting monolithic.

`npm install --save react-redux recompose`

Recompose allows for more than one higher order component to be composed upon a component.

In _src/store/index.js_ the stores and reducer logic will begin.

```javascript
import { createStore } from 'redux';
import rootReducer from '../reducers';

const store = createStore(rootReducer);

export default store;
```

_src/reducers/session.js_
This file will manage the `authUser` object which is essentially the session.

```javascript
const INITIAL_STATE = {
  authUser: null,
};

const applySetAuthUser = (state, action) => ({
  ...state,
  authUser: action.authUser
});

function sessionReducer(state = INITIAL_STATE, action) {
  switch(action.type) {
    case 'AUTH_USER_SET' : {
      return applySetAuthUser(state, action);
    }
    default : return state;
  }
}

export default sessionReducer;
```

_src/reducers/user.js_
The `users` from the db will be managed here.

```javascript
const INITIAL_STATE = {
  users: {},
};

const applySetUsers = (state, action) => ({
  ...state,
  users: action.users
});

function userReducer(state = INITIAL_STATE, action) {
  switch(action.type) {
    case 'USERS_SET' : {
      return applySetUsers(state, action);
    }
    default : return state;
  }
}

export default userReducer;
```

And to combine the two in a root reducer. _src/reducers/index.js_
```javascript
import { combineReducers } from 'redux';
import sessionReducer from './session';
import userReducer from './user';

const rootReducer = combineReducers({
  sessionState: sessionReducer,
  userState: userReducer,
});

export default rootReducer;
```

To connect the React view layer to this new Redux state layer, in the root _src/index.js_ file 

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './components/App';
import store from './store';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
```

The `Provider` component that comes from Redux is different than that which was in the React context API. This contains the entire store, part of which is the crucial authenticated user.

Now, everywhere the React context API is being used to send state to components will be replaced by Redux's state layer.

The Home component will be changed like so.
```javascript
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import withAuthorization from './withAuthorization';
import { user } from '../firebase';

class HomePage extends Component {
  componentDidMount() {
    const { onSetUsers } = this.props;

    user.onceGetUsers().then(snapshot =>
      onSetUsers(snapshot.val())
    );
  }

  render() {
    const { users } = this.props;

    return (
      <div>
        <h1>Home</h1>
        <p>The Home Page is accessible by every signed in user.</p>

        { !!users && <UserList users={users} /> }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  users: state.userState.users,
});

const mapDispatchToProps = (dispatch) => ({
  onSetUsers: (users) => dispatch({ type: 'USERS_SET', users }),
});

const authCondition = (authUser) => !!authUser;

export default compose(
  withAuthorization(authCondition),
  connect(mapStateToProps, mapDispatchToProps)
)(HomePage);
```

Here, `mapStateToProps` is connecting the Redux state to the component's props, and `mapDispatchToProps` is connecting the actions of user storage to Firebase's db.

For the session state layer it is very similar, where the React context API `Provider` and `Consumer` components will be replaced by Redux and the authenticated user is held in a Redux store. The withAuthentication higher order component will now be connected to the Redux state.
```javascript
import React from 'react';
import { connect } from 'react-redux';

import { firebase } from '../firebase';

const withAuthentication = (Component) => {
  class WithAuthentication extends React.Component {
    componentDidMount() {
      const { onSetAuthUser } = this.props;

      firebase.auth.onAuthStateChanged(authUser => {
        authUser
          ? onSetAuthUser(authUser)
          : onSetAuthUser(null);
      });
    }

    render() {
      return (
        <Component />
      );
    }
  }

  const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({ type: 'AUTH_USER_SET', authUser }),
  });

  return connect(null, mapDispatchToProps)(WithAuthentication);
}

export default withAuthentication;
```
Here we can see that `onSetAuthUser` action is mapped to and then accessed by the component's props. The `authUser` is now not available in the React context API and so all the components that rely on `withAuthentication` must be refactored.

Navigation.js
```javascript
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import SignOutButton from './SignOut';
import * as routes from '../constants/routes';

const Navigation = ({ authUser }) =>
  <div>
    { authUser
        ? <NavigationAuth />
        : <NavigationNonAuth />
    }
  </div>

const NavigationAuth = () =>
  <ul>
    <li><Link to={routes.LANDING}>Landing</Link></li>
    <li><Link to={routes.HOME}>Home</Link></li>
    <li><Link to={routes.ACCOUNT}>Account</Link></li>
    <li><SignOutButton /></li>
  </ul>

const NavigationNonAuth = () =>
  <ul>
    <li><Link to={routes.LANDING}>Landing</Link></li>
    <li><Link to={routes.SIGN_IN}>Sign In</Link></li>
  </ul>

const mapStateToProps = (state) => ({
  authUser: state.sessionState.authUser,
});

export default connect(mapStateToProps)(Navigation);
```

Account.js
```javascript
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { PasswordForgetForm } from './PasswordForget';
import PasswordChangeForm from './PasswordChange';
import withAuthorization from './Session/withAuthorization';

const AccountPage = ({ authUser }) =>
  <div>
    <h1>Account: {authUser.email}</h1>
    <PasswordForgetForm />
    <PasswordChangeForm />
  </div>

const mapStateToProps = (state) => ({
  authUser: state.sessionState.authUser,
});

const authCondition = (authUser) => !!authUser;

export default compose(
  withAuthorization(authCondition),
  connect(mapStateToProps)
)(AccountPage);
```

withAuthorization.js
```javascript
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';

import { firebase } from '../firebase';
import * as routes from '../constants/routes';

const withAuthorization = (condition) => (Component) => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      firebase.auth.onAuthStateChanged(authUser => {
        if (!condition(authUser)) {
          this.props.history.push(routes.SIGN_IN);
        }
      });
    }

    render() {
      return this.props.authUser ? <Component /> : null;
    }
  }

  const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser,
  });

  return compose(
    withRouter,
    connect(mapStateToProps),
  )(WithAuthorization);
}

export default withAuthorization;
```

And with that, Redux is finally set up to rock and roll! I stated this in the beginning but will put it here again, almost all of the React/Redux has been taken from this incredible tutorial (https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial/). I've learned tons from it and was invaluable in helping me with this foundation. 