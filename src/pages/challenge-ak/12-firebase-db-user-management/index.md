---
title: "User management in Firebase"
path: "/challenge-app/user-management-firebase"
date: "2018-06-11T01:01:01.001Z"
---

Currently Firebase is only being used internally to store passwords and other information about users. The users are not yet available for the application to track and use for itself.

First step is to make a file for the Firebase realtime database API in the new _src/firebase/db_ directory called `user.js`.

```javascript
import { db } from '../firebase';

// User API

export const doCreateUser = (id, username, email) =>
  db.ref(`users/${id}`).set({
    username,
    email,
  });

export const onceGetUsers = () =>
  db.ref('users').once('value');
```

The first function saves the user under a unique id, something to keep in mind for later use.

The second function retrieves all users from the general `users` entity resource path.

In _src/firebase/firebase.js_ there is a need to get reference to the db.

```javascript
import 'firebase/database';

const db = firebase.database();
const auth = firebase.auth();

export {
  db,
  auth,
};
```

and in _src/firebase/index.js_ there needs to be reference to `user.js` to make it accessible.

```javascript
import * as auth from './auth';
import * as firebase from './firebase';
import * as user from './db/user';

export {
  auth,
  user,
  firebase,
};
```
Now to put them to use in the components themselves.

In the SignUp component.
```javascript
import { user } from '../firebase';

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

         // Create a user in own accessible Firebase db
        user.doCreateUser(authUser.user.uid, username, email)
          .then(() => {
            this.setState(() => ({ ...INITIAL_STATE }));
            history.push(routes.HOME);
          })
          .catch(error => {
            this.setState(byPropKey('error', error));
          });

      })
      .catch(error => {
        this.setState(byPropKey('error', error));
      });

    event.preventDefault();
}
```
To make sure the database is actually saving the users, they will be listed out in the Home component.

```javascript
import { user } from '../firebase';

class HomePage extends Component {
  constructor(props) {
    super();

    this.state = {
      users: null,
    };
  }

  componentDidMount() {
    user.onceGetUsers().then(snapshot =>
      this.setState(() => ({ users: snapshot.val() }))
    );
  }

  render() {
    const { users } = this.state;
      
    return (
      <div>
        <h1>Home</h1>
        <p>The Home Page is accessible by every signed in user.</p>

        { !!users && <UserList users={users} /> }
      </div>
    );
  }

  const UserList = ({ users }) =>
  <div>
    <h2>List of Usernames of Users</h2>
    <p>(Saved on Sign Up in Firebase Database)</p>

    {Object.keys(users).map(key =>
      <div key={key}>{users[key].username}</div>
    )}
  </div>
}
```

This rendered list will eventually be changed to something more useful, but at least it shows the Firebase db is working as it should.