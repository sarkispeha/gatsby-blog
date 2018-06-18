---
title: "Calendar - Lesson Form"
path: "/challenge-app/calendar-lesson Form"
date: "2018-06-16T01:01:01.001Z"
---

The following interaction with the lessonCalendar component will be limited to admin users only. This will mean that the click event will have to take into account the user's authorization before registering what logic to use. I'm already realizing how much more work this will create, so time to get to it!

Keeping the above in mind, I first want to start by simply creating a form that will save lessons. I'd like for it to be presented in a modal.

First I want to install `npm install --save materialize-css` as it comes with styling that I'll eventually implement and the modals are good lookin' too. In the _client/index.js_ I `import 'materialize-css/dist/css/materialize.min.css'`, webpack that comes with `create-react-app` allows CSS files to be imported just like the JS files with the only difference being the added `.css` extension needed.

It took me the entire day to figure out that React v16.4 was not compatible with react-materialize (https://recordnotfound.com/react-materialize-react-materialize-18036) and kept getting the error <span class="code-error">`TypeError: $(...).modal is not a function `</span>. I hope this helps some wayward developer some time in the future. If react-materialize modals are desired, one must stay with React v15.

In the end, I went with `react-modal-construction-kit` as it looked very minimal and easily customizible with the materialize-css... and it worked without all the headache!

The modal will be controlled by the props passed to it from the parent component and these props will set the Modal component's local state. The lifecycle method `componentDidUpdate()` is used.
```javascript
componentDidUpdate(prevProps) {
    if (this.props.isModalVisible !== prevProps.isModalVisible) {
        this.setState({
            isModalVisible: this.props.isModalVisible
        });
    }
}
```
The question might be asked as to why I don't use the prop itself to control the show and hide of the modal. To keep things semantic I prefer to attach this to the component's state as to show/hide a modal seems intrinsically more of a state-driven process than prop-driven.
 The specific calendar information passed down to it


I will use redux-form
redux-form comes with its own reducer that can then be hooked up to the store.
_reducers/index_
```javascript
import { reducer as reduxForm } from 'redux-form';

const rootReducer = combineReducers({
    sessionState: sessionReducer,
    userState: userReducer,
    lessonState: lessonReducer,
    formState: reduxForm
});
```

In _NewLessonModal_ `redux-form` is imported and acts like the `connect` method from Redux. It takes a simple object as an argument.
```javascript
export default reduxForm({
    form: 'newLessonForm'
})(NewLessonModal);
```

The above code automatically comes pre-loaded with a bunch of props, one of which is `handleSubmit()` and what will be used to hook up to the form.

Next I want to limit the access to this click event for users who are only admins, this will create a need for refactoring in other areas of the application. It currently only has General Authorization to check if a user is signed in or not, I now have to give Specific Authorization parameters for users.