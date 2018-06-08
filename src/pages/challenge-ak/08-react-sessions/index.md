---
title: "React Sessions"
path: "/challenge-app/react-sessions"
date: "2018-06-07T01:01:01.001Z"
---

It's time to rework some of the App component. Using the local state of App, the `authUser` prop is set to `null` initially.

```javascript
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null,
    };
  }
```

The Navigation component will need `authUser` as a prop to show what it will display, and so it is added to the render of the App component like so:

```javascript
<Navigation authUser={this.state.authUser} />
```

Using the lifecycle method `componentDidMount()` and the Firebase `onAuthStateChanged()`, the App component state can be set by checking to see if the `authUser` object exists. 

```javascript
  componentDidMount() {
    firebase.auth.onAuthStateChanged(authUser => {
      authUser
        ? this.setState(() => ({ authUser }))
        : this.setState(() => ({ authUser: null }));
    });
  }
```

This application could continue with all of the auth logic based under the App component, but (for the sake of learning) I want to continue with the use of React's higher order components to handle the business logic.