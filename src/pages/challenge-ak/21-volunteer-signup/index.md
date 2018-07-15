---
title: "Calendar - Volunteer Lesson Signup"
path: "/challenge-app/volunteer-lesson-signup"
date: "2018-07-14T01:01:01.001Z"
---

The volunteer interaction with the calendar will be played out in the _VolunteerLessonModal_ component. It is set up much in the same way as _AdminLessonModal_ with a few slight changes to the form processing.

The main issue was to update the lesson whether the volunteer signed up as an instructor, or shadower. My first attempt was to go about conditionally rendering two different submit buttons that carried out different logic within a single form. This proved to be difficult and really not a good idea. Between fighting native HTML form behavior and Redux-Forms, in the end it made more sense to treat each button as a submit to each form. As each form had its own specific purpose (to sign up as a lead instructor or a shadow), the code is much more readable and executes just as well.

_VolunteerLessonModal.js_

```javascript
let hiddenLessondata = {};

class VolunteerLessonModal extends Component{
    constructor(props){
        super(props);

        this.state = {
            isModalVisible: this.props.isModalVisible
          }
    }

    componentWillReceiveProps(nextProps) {
   
        if(nextProps !== this.props){
            this.setState({ 
                isModalVisible: nextProps.isModalVisible,
            });

            hiddenLessondata.instructor = nextProps.userName;
            hiddenLessondata.shadow = nextProps.userName;
        }
        
    }

    close = () => {       
        this.props.closeModal();
        // this.props.reset(); //from redux-form baked-in props
    }
    updateLessonForVolunteer(updateType, values){
        this.props.handleUpdateLesson(values, this.props.lessonDetail._id, updateType);
    }

    renderShadowButton(){
        if(this.props.lessonDetail.shadowNecessary){
            if(this.props.lessonDetail.shadow.length === 0){
                return (
                    <div>
                        <button name="shadow_submit" type="submit">Shadow this Lesson</button>
                    </div>
                );
            }else{
                return (
                    <p>{this.props.lessonDetail.shadow}</p>
                );
            }
        }
        
    }

    renderInstructorSubmit() {
        let instructor = this.props.lessonDetail.instructor;
        
        if(instructor !== undefined) {
            if(instructor.length === 0){
                return (
                        <button name="instructor_submit" type="submit">Sign Up</button>
                );
            }
        }
    }

    render(){

        return (
            <div>
                <Modal
                    onClickOutside={this.close}
                    onClosed={this.close}
                    isOpen={this.state.isModalVisible}
                >
                    <h5>Lesson Details</h5>
                    <p>
                        {this.props.modalDate}
                    </p>
                        <label>Lead Instructor</label>
                        <p>{this.props.lessonDetail.instructor}</p>
                        <label>Duration</label>                   
                        <p>{timeOfDay(this.props.lessonDetail)}</p>
                        <label >Shadow Needed</label>  
                        <p>{this.props.lessonDetail.shadowNecessary ? 'Yes' : 'No' }</p>
                        <form onSubmit={this.props.handleSubmit(values => this.updateLessonForVolunteer('shadow', values) )}>
                            <Field component="input" name="shadow" type="hidden" />
                            {this.renderShadowButton()}
                        </form>
                        <label >Lesson Type</label>
                        <p>{this.props.lessonDetail.type}</p>
                        <form onSubmit={this.props.handleSubmit(values => this.updateLessonForVolunteer('instructor', values) )}>
                            <Field component="input" name="instructor" type="hidden" />
                            {this.renderInstructorSubmit()}
                        </form>
                </Modal>
                <Overlay
                isVisible={this.state.isModalVisible} />
            </div>
        )
    }
}
VolunteerLessonModal = reduxForm({
    form: 'volunteerLessonForm'
})(VolunteerLessonModal);

VolunteerLessonModal = connect(
    state => ({
        initialValues: hiddenLessondata 
    })
)(VolunteerLessonModal)

export default VolunteerLessonModal;
```

In _LessonCalendar_ the `handleUpdateLesson()` function was given a bit of polymorphism with the parameter addition of `volunteerSignUp` that allows condition specific update payloads.

```javascript
handleUpdateLesson = async (values, lessonId, volunteerSignUp) => {

    let lessonDto;
    if(volunteerSignUp){
        if(volunteerSignUp === 'instructor'){
            lessonDto = {
                instructor: values.instructor
            }
        }else if(volunteerSignUp === 'shadow'){
            lessonDto = {
                shadow: values.shadow
            }
        }
    }else{
        
    ...
```