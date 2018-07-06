---
title: "Calendar - Lesson Form"
path: "/challenge-app/calendar-lesson Form"
date: "2018-06-18T01:01:01.001Z"
---

The following interaction with the lessonCalendar component will be limited to admin users only. This will mean that the click event will have to take into account the user's authorization before registering what logic to use. I'm already realizing how much more work this will create, so time to get to it!

Keeping the above in mind, I first want to start by simply creating a form that will save lessons. I'd like for it to be presented in a modal.

First I want to install `npm install --save materialize-css` as it comes with styling that I'll eventually implement and the modals are good lookin' too. In the _client/index.js_ I `import 'materialize-css/dist/css/materialize.min.css'`, webpack that comes with `create-react-app` allows CSS files to be imported just like the JS files with the only difference being the added `.css` extension needed.

It took me the entire day to figure out that React v16.4 was not compatible with react-materialize (https://recordnotfound.com/react-materialize-react-materialize-18036) and kept getting the error <span class="code-error">`TypeError: $(...).modal is not a function `</span>. I hope this helps some wayward developer some time in the future. If react-materialize modals are desired, one must stay with React v15.

In the end, I went with `react-modal-construction-kit` as it looked very minimal and easily customizible with the materialize-css... and it worked without all the headache!

The modal will be controlled by the props passed to it from the parent component and these props will set the Modal component's local state. I had previously used the lifecycle method `componentDidUpdate()`, but noticed that this depended on the child component setting its own state by passing information back to the parent component and created some strange behavior, along with inefficient rendering. 

```javascript
componentDidUpdate(prevProps) {
    if (this.props.isModalVisible !== prevProps.isModalVisible) {
        this.setState({
            isModalVisible: this.props.isModalVisible
        });
    }
}
```

Within _LessonCalendar_ I created a simple `close()` method for controlling modal behavior.
```javascript
closeModal = () => {
    this.setState({
        isNewLessonModalVisible : false
    })
}
```
Then passed this to the child component.
``` javascript
<NewLessonModal
    closeModal={this.closeModal}
>
</NewLessonModal>
```

And within _NewLessonModal_ 
```javascript
componentWillReceiveProps(nextProps) {
    this.setState({ isModalVisible: nextProps.isModalVisible });  
}
```
The above refactoring of code skirted a problem with creating an anti-pattern. Setting the `isModalVisible` initially within the constructor caused the child component to only get access to the value the first time it was rendered. This meant that if the component was re-rendered, it would still hold on to the value of the initial constructor even if the re-rendered component had a different value for the prop. It is necessary to set the `isModalVisible` state to `false` upon rendering the modal component so that it does not show, and for that reason `componentWillReceiveProps()` is necessary.

A bit of a headache for essentially nothing more than a toggle effect, but sometimes this is the game we play as developers!
___

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

_NewLessonModal_
```javascript
<h5>Enter Lesson Details</h5>
<form onSubmit={this.props.handleSubmit(values => console.log(values) )}>
    // fields
    <button type="submit">Submit</button>
</form>
```
The `handleSubmit()` will eventually want to call an ajax request to save the lesson in the db. But first it is time to get the correct form fields.

```javascript
<form onSubmit={this.props.handleSubmit() )}>
    {/* {this.renderFields()} */}
    <label>Student Name</label>
    <Field component="input" name="student_name" type="text" />
    <div className="radio-component"> 
        <label>Duration</label>                   
        <p>
        <label>
            <Field className="override-radio" component="input" name="duration" type="radio" value="AM"/>
            <span>AM</span>
        </label>
        </p>
        <p>
        <label>
            <Field className="override-radio" component="input" name="duration" type="radio" value="PM"/>
            <span>PM</span>
        </label>
        </p>
        <p>
        <label>
            <Field className="override-radio" component="input" name="duration" type="radio" value="allDay"/>
            <span>Full Day</span>
        </label>
        </p>
    </div>
    ...
```
After dealing with a multitude of unexpected issues relating to `react-form` and `materialize` not playing together well, I opted to write out much of the form longhand without any nifty rendering helper. The `{this.renderFields()}` will remain as a reminder that everything is in need of a good refactor once other tasks are taken care of.