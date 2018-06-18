---
title: "Calendar Component"
path: "/challenge-app/calendar-component"
date: "2018-06-15T01:01:01.001Z"
---

Switching gears back to the front-end, it's time to sketch-up the calendar component. There are many calendar libraries out there and no need to reinvent the wheel when creating my own. I chose [Big Calendar](http://intljusticemission.github.io/react-big-calendar/examples/index.html#intro), a out-of-the-box React component with a bunch of useful functionality. After saving it into my _/client_ directory (remembering that it is a front-end component after all) it was a bit of work to get it to show.

Starting with the component itself _LessonCalendar.js_
```javascript
import React, { Component } from 'react';
import { connect } from 'react-redux';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

BigCalendar.momentLocalizer(moment);

let allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k])

class LessonCalendar extends Component {
    
    render() {
        return (
            <div style={{height: '90vh'}} >
                <BigCalendar
                selectable
                events={this.props.lessons}
                views={allViews}
                step={60}
                startAccessor='start'
                endAccessor='end'
                onSelectEvent={event => alert(event.title)}
                onSelectSlot={slotInfo =>
                    alert(
                    `selected slot: \n\nstart ${slotInfo.start.toLocaleString()} ` +
                        `\nend: ${slotInfo.end.toLocaleString()}` +
                        `\naction: ${slotInfo.action}`
                    )
                }
                />
            </div> 
        )
    } 
};
```

Props are passed into `BigCaldendar` giving options to the component's functionality. One of the first quirks with BigCalendar is that it requires an array of objects passed to the events prop or else it won't render. I was hoping to simply get the calendar rendering, but it makes sense to use the routes just recently created in the API.

First step is to create an _actions_ directory to house all of the API calls and other data requests.
```javascript
import axios from 'axios';
import { FETCH_LESSONS } from './types';

export const fetchLessons = () => async dispatch => {
    
    const res = await axios.get('/api/lessons');
    dispatch({type: FETCH_LESSONS, payload: res.data});
};
```
The `axios` library was installed in the _client_ `package.json` to deal with server requests. The callback function `dispatch` will be used in `rootReducer` where the state will be set by the `lessonReducer`.

```javascript
import { combineReducers } from 'redux';
import sessionReducer from './session';
import userReducer from './user';
import lessonReducer from './lessonReducer';

const rootReducer = combineReducers({
    sessionState: sessionReducer,
    userState: userReducer,
    lessonState: lessonReducer
});

export default rootReducer;
```
_actions/types.js_
```javascript
export const FETCH_LESSONS = 'fetch_lessons';
```
_reducers/lessonReducer.js_
```javascript
import { FETCH_LESSONS } from '../actions/types';

export default function(state = [], action) {
  switch (action.type) {
      case FETCH_LESSONS :
          return action.payload;
        default:
          return state;
  }
}
```
While the `rootReducer` is simply combining all of the reducers within Redux, the `lessonReducer` is initally setting the `lessonState` to an empty array. This allows the `LessonCalendar` component to render, and once the `fetchLessons()` async API call has finished the request, the state will be changed to an array of objects.

Back in the `LessonCalendar` component, `fetchLessons` is used within the `connect` method of Redux to become accessible to the React props. The lifecycle method of `componentDidMount()` to initiates the action.
```javascript
import { fetchLessons } from '../actions';

...

    componentDidMount() {
        this.props.fetchLessons(); 
    }
```
And to connect Redux to the props of React.
```javascript
function mapStateToProps(state){
    return {lessons: state.lessonState}
}

export default connect(mapStateToProps, { fetchLessons })(LessonCalendar);
```

A few bugs popped up along the way and necessitated the following changes.

`axios` was using the base `localhost:3000` to make requests instead of `localhost:4000` which is where the API server is. To correct this in development

```json
"proxy": {
    "/api/*": {
      "target": "http://localhost:4000"
    }
  }
```
was added in the _client/package.json_. This changes requests for any path of `/api/` to have the base url pointing to `localhost:4000`.

An error stating <span class="error-code">`Actions must be plain objects. Use custom middleware for async actions.`</span> was arising within the _actions_ due to their asynchronous requests. `redux-thunk` was installed and applied as middleware to `createStore()`. `redux-thunk` allows functions to be written instead of actions. In this case the async promise is a function call. Thanks thunk!

_store/index.js_
```javascript
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';

// const store = createStore(rootReducer); //initial use
const store = createStore( rootReducer, {}, applyMiddleware(reduxThunk) );
```