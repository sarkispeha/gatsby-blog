---
title: "Firebase Signup"
path: "/challenge-app/signing-up"
date: "2018-06-05T01:01:01.001Z"
---

The SignUpPage component itself is really just a container for the SignupForm. SignUpPage is a functional component without a need for a state at the moment.

The SignUpForm component will be designated as a class component as it will eventually have to manage the React local state and will need the `this` keyword. `super()` is called rather than simply `super(props)` in the constructor because `this.props` won't eventually be called within the constructor.

The SignUpLink is a placeholder for now as obviously a user needs to Sign Up before being able to sign in.

```javascript
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as routes from '../constants/routes';

const SignUpPage = () =>
  <div>
    <h1>SignUp</h1>
    <SignUpForm />
  </div>

class SignUpForm extends Component {
  constructor(props) {
    super();
  }

  onSubmit = (event) => {

  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>

      </form>
    );
  }
}

const SignUpLink = () =>
  <p>
    Don't have an account?
    {' '}
    <Link to={routes.SIGN_UP}>Sign Up</Link>
  </p>

export default SignUpPage;

export {
  SignUpForm,
  SignUpLink,
};
```

The component's state is initialized like so:
```javascript
const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
};
```

and `this.state = { ...INITIAL_STATE };` is added to the SignUpForm constructor. The `...` is the spread syntax that essentially clones the `INITIAL_STATE`;

Now to put the input fields into effect.

A small helper function:
```javascript
const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value,
});
```

and alteration to the render.
```javascript
render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <form onSubmit={this.onSubmit}>
        <input
          value={username}
          onChange={event => this.setState(byPropKey('username', event.target.value))}
          type="text"
          placeholder="Full Name"
        />
        <input
          value={email}
          onChange={event => this.setState(byPropKey('email', event.target.value))}
          type="text"
          placeholder="Email Address"
        />
        <input
          value={passwordOne}
          onChange={event => this.setState(byPropKey('passwordOne', event.target.value))}
          type="password"
          placeholder="Password"
        />
        <input
          value={passwordTwo}
          onChange={event => this.setState(byPropKey('passwordTwo', event.target.value))}
          type="password"
          placeholder="Confirm Password"
        />

        <button disabled={isInvalid} type="submit">
          Sign Up
        </button>

        { error && <p>{error.message}</p> }
      </form>
    );
  }
```
Here, each input is tied into the local state of the component and updated whenever a change happens.

The button is checked with a very simple validation `isInvalid` condition.

At the bottom of the form is where Firebase's error will conditionally show if it exists.

Now for the details of the `onSubmit` handler for the form.

First access to a few more things are needed `withRouter`, `auth`, and `routes`.
```javascript
import React, { Component } from 'react';
import {
  Link,
  withRouter,
} from 'react-router-dom';

import { auth } from '../firebase';
import * as routes from '../constants/routes';

```
```javascript
const SignUpPage = ({ history }) =>
  <div>
    <h1>SignUp</h1>
    <SignUpForm history={history} />
  </div>

onSubmit = (event) => {
    const {
      username,
      email,
      passwordOne,
    } = this.state;

    const {
      history,
    } = this.props;

    auth.doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        this.setState(() => ({ ...INITIAL_STATE }));
        history.push(routes.HOME);
      })
      .catch(error => {
        this.setState(byPropKey('error', error));
      });

    event.preventDefault();
  }

  export default withRouter(SignUpPage);
```

Here the input information collected by the component's local state is rounded up and passed into the `auth.doCreateUserWithEmailAndPassword` method from Firebase's API.

The promise will either execute without issues and reset the component's initial state, or if there is an error the `error` state property will be set and appear on the component with the message.

If the promise executes without a hitch, the `history` from react-router gives the ability to programmatically route to the Home page. `withRouter()` is a higher order component, and `history` is a prop brought in from the router.

There is now the ability to sign up within the application!