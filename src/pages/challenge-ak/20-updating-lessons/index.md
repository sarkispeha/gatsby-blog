---
title: "Calendar - Updating Lessons"
path: "/challenge-app/updating-lesson"
date: "2018-07-05T01:01:01.001Z"
---

Now that lessons are saving and displaying on the calendar, I want admin users to be able to update already saved lessons. This will be a precursor for volunteer users to be able to sign up for lessons.

First is to clear the NewLessonModal from persisting the previous lesson's input. Within _NewLessonModal_ we'll take advantage of redux-forms props.
```javascript
close = () => {
    this.props.closeModal();
    this.props.reset(); //from redux-form baked-in props
}
```

Next is to populate the modal with the selected lesson's data. With `redux-form`, a `initialValues` prop must be given and I set a global variable of `initialLessondata` to always contain this information.
_NewLessonModal_
```javascript
NewLessonModal = connect(
    state => ({
        initialValues: initialLessondata 
    })
)(NewLessonModal)
```

Back in _LessonCalendar_
```javascript
<BigCalendar
    onSelectEvent={event => this.selectEvent(event)}
>
```

`lessonDetail` will be a prop set in the `selectEvent` handler.
```javascript
selectEvent = (event) => {
    if(this.state.userPermissions === 'admin'){
        //show NewLessonModal with event data
        this.setState({
            isNewLessonModalVisible : true,
            isAdminUpdate : true,
            lessonDetail : {...event}
        })
    }
}
```

```javascript
<NewLessonModal
    isAdminUpdate={this.state.isAdminUpdate}
    lessonDetail={this.state.lessonDetail}
    handleUpdateLesson={this.handleUpdateLesson}
>
```

As it is a prop that is being set by the parent component's state, the `componentWillReceiveProps()` method will need to be used again to update the changes from one modal opening to the next.
```javascript
componentWillReceiveProps(nextProps) {

    if(nextProps !== this.props){
        this.setState({ 
            isModalVisible: nextProps.isModalVisible,
        });
        let {studentName, type, shadowNecessary, _id} = nextProps.lessonDetail;
        initialLessondata._id = _id;
        initialLessondata.student_name = studentName;
        initialLessondata.lesson_type = type;
        initialLessondata.shadow_needed = shadowNecessary !== undefined ? shadowNecessary.toString() : '';
        initialLessondata.duration = timeOfDay(nextProps.lessonDetail);
    }
}
```

Because this is the same form being used as that which creates a new lesson, I have to give some conditional rendering

```javascript
getFormProps(){
    if(this.props.isAdminUpdate){
        let lessonId = initialLessondata._id;
        this.formProps.submit = this.props.handleSubmit(values =>this.props.handleUpdateLesson(values, lessonId) );
    }else{
        this.formProps.submit = this.props.handleSubmit(values =>this.props.handleSaveLesson(values, this.props.modalDate) );
    }
}

renderNewOrUpdate(){
    if(!this.props.isAdminUpdate){ return 'Submit'}else{ return 'Update'};
}

render(){

    this.getFormProps();//run on render because isAdminUpdate is passed as a prop and cannot be changed on conponentWillRecieveProps

    return (
        ...
        <form onSubmit={this.formProps.submit}>
        ...
        <button type="submit">{this.renderNewOrUpdate()}</button>
```

`getFormProps` is run on the component render because `isAdminUpdate` is passed to _NewLessonModal_ as a prop. In react, a component cannot update its own props unless the prop is an object or an array, but it _can_ update the props of its children. `isAdminUpdate` is being set from the parent component each time the modal is rendered so that it will get the most up-to-date value.

In _LessonCalendar_ the `handleUpdateLesson` is very similar to the `handleSaveLesson` with the exception of splicing out the old lesson and updating it with the new.
```javascript
handleUpdateLesson = async (values, lessonId) => {

    const lessonDto = {
        studentName: values.student_name,
        type: values.lesson_type,
        shadowNecessary: values.shadow,
        time:{
            AM: values.duration === "AM" ? true : false ,
            PM: values.duration === "PM" ? true : false,
            allDay: values.duration === "allDay" ? true : false
        },
        createdBy: 'Updated Somebody'
    }
    
    const updatedLesson = await this.props.updateLesson(lessonDto, lessonId);
    let oldLessonIndx = _.findIndex(this.props.lessons, {_id : lessonId} );
    this.props.lessons.splice(oldLessonIndx, 1, updatedLesson);

    this.setState({
        lessons: this.props.lessons,
        isNewLessonModalVisible: false
    })
}
```

_actions/index.js_
```javascript
export const updateLesson = (lessonDto, lessonId) => async () => {

    const res = await axios.put('/api/lessons/' + lessonId, lessonDto);
    return res.data;
}
```

Upon finishing this work, I'm beginning to realize that the files are starting to lose some of their semantic worth. _NewLessonModal.js_ really isn't for a new lesson anymore, but more of an admin specific modal. I believe a good next step is to go back and tidy up some of these loose ends.