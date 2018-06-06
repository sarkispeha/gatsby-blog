---
title: "Authentication Setup"
path: "/challenge-app/firebase-setup"
date: "2018-05-29T01:01:01.001Z"
---

I created an account and went through steps for email/password authentication provided by firebase. (https://firebase.google.com/)

I grabbed the keys within the config but set things up in a way where I can have both a development and production database. It feels strange to have API keys that are pushed up to a public repo, but with Firebase, the control comes from the administrator's permissions set within the Firebase Security Rules.

The config setup for the keys:
/config
 - dev.js
 - prod.js
 - keys.js

dev.js and prod.js with different keys for each
```
module.exports = {
    firebaseApiKey: "",
    firebaseAuthDomain: "",
    firebaseDatabaseURL: "",
    firebaseProjectId: "",
    firebaseStorageBucket: "",
    firebaseMessagingSenderId: ""
};
```

and then within keys.js
```
if(process.env.NODE_ENV === 'production'){
    //return prod keys
    module.exports = require('./prod');
}else{
    //return dev keys
    module.exports = require('./dev');
}
```

/firebase
 - index.js
 - firebase.js
 - auth.js

The keys are then used within firebase.js

```
import keys from '../config/keys';

const config = {
    apiKey: keys.firebaseApiKey,
    authDomain: keys.firebaseAuthDomain,
    databaseURL: keys.firebaseDatabaseURL,
    projectId: keys.firebaseProjectId,
    storageBucket: keys.firebaseStorageBucket,
    messagingSenderId: keys.firebaseMessagingSenderId,
};
```

Then it's time to import the firebase authorization object and methods.

```
import firebase from 'firebase/app';
import 'firebase/auth';

const config = {
  apiKey: YOUR_API_KEY,
  authDomain: YOUR_AUTH_DOMAIN,
  databaseURL: YOUR_DATABASE_URL,
  projectId: YOUR_PROJECT_ID,
  storageBucket: '',
  messagingSenderId: YOUR_MESSAGING_SENDER_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const auth = firebase.auth();

export {
  auth
};
```

Now for the src/firebase/auth.js file to implement the authentication API.


THESE ARE ASYNC TRY TO REFACTOR LATER
```
import { auth } from './firebase';

// Sign Up
export const doCreateUserWithEmailAndPassword = (email, password) =>
    auth.createUserWithEmailAndPassword(email, password);

// Sign In
export const doSignInWithEmailAndPassword = (email, password) =>
    auth.signInWithEmailAndPassword(email, password);

// Sign out
export const doSignOut = () =>
    auth.signOut();

// Password Reset
export const doPasswordReset = (email) =>
    auth.sendPasswordResetEmail(email);

// Password Change
export const doPasswordUpdate = (password) =>
    auth.currentUser.updatePassword(password);
```

Next is to aggregate the firebase/auth and files within the index and components will not have to access the actual firebase files to work.

```
import * as auth from './auth';
import * as firebase from './firebase';

export {
  auth,
  firebase,
};
```

Now the application is ready to begin signing up users, so it's on to the signup component.