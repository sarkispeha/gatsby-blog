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