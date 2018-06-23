---
title: "Calendar - Saving Lessons"
path: "/challenge-app/save-lesson-to-db"
date: "2018-06-18T01:01:01.001Z"
---

Time to clean up some of the inputs and get the lessons displaying on the calendar

Back in the _actions/index_ 
```javascript
export const saveNewLesson = (lessonDto) => async () => {

    const res = await axios.post('/api/lessons', lessonDto);
    return res.data;
}
```
In order to add the `async` to the above, `saveNewLesson` must be called as a function in itself or else redux will throw errors about passing in promises as actions, but thanks to redux-thunk, we can pass in regular functions.

I need to get the user and date. The date will have its own util helper function to manage the time formats of the app.
_utils/timeUtils.js_
```javascript
import moment from 'moment';

export const dateToUnix = (date) => {
    return moment(date).unix();
}

export const startOfDayUnix = (date) => {
    return moment(date).startOf('day').unix();
}

export const unixToCalDate = (unixNumber) => {
    return moment.unix(unixNumber).format("YYYY, MM, DD")
}
```

I want the new lesson to come back when a lesson is saved, so to get the calendar updating, the function that handles the form submittal will be passed down from the parent component LessonCalendar to NewLessonModal. It makes sense to place this logic within the parent LessonCalendar, as in the end this is what drives the display via state, closing the modal and placing the new lesson.
```javascript
    handleSaveLesson = async (values, date) => {

        const lessonDto = {
            studentName: values.student_name,
            type: values.lesson_type,
            shadowNecessary: values.shadow,
            date: timeUtil.startOfDayUnix(date),
            time:{
                AM: values.duration === "AM" ? true : false ,
                PM: values.duration === "PM" ? true : false,
                allDay: values.duration === "allDay" ? true : false
            },
            createdBy: 'Somebody'//eventually the admin currently using the app will be placed here
        }

        const newLesson = await this.props.saveNewLesson(lessonDto);
        this.setState({
            lessons: this.props.lessons.push(newLesson),
            isModalVisible: false
        })   
    }
...
//in the render() pass down the handler as a prop
<NewLessonModal
    handleSaveLesson={this.handleSaveLesson}
    isModalVisible={this.state.isModalVisible}
    modalDate={this.state.modalDate}
>
``` 
_NewLessonModal.js_
```javascript
<form onSubmit={this.props.handleSubmit(values =>this.props.handleSaveLesson(values, this.props.modalDate) )}>
```

Once the entire process runs through (NewLessonModal form is submitted, LessonCalendar `handleSaveLesson()` takes the form and sends it off to _actions_ `saveNewLesson()`, `saveNewLesson()` returns the newly saved lesson) the `newLesson` is pushed to the existing array of lessons which updates the BigCalendar component.

```javascript
<BigCalendar
    events={this.props.lessons}
>
```
The lessons still need to be tweaked to a different date format to show on the calendar however, but the data is there!