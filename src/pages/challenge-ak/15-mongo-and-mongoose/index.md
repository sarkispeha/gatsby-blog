---
title: "Mongo and Mongoose"
path: "/challenge-app/mongo-and-mongoose"
date: "2018-06-14T01:01:01.001Z"
---

It's about time to start thinking about the lesson events that should be persisted in the database.

There will be a _config/dev.js_ file on the server side that will not be pushed up to github, and also a _prod.js_ for storing environment config variables. After `npm install --save mongoose` and creating a db account on mLab, the database is connected using

```javascript
const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI);
```

And now to think a bit about the model. First to create a `models` directory under _/server_ and `Lesson.js` within that. Lessons will need to be displayed on a calendar and viewed by anyone. However, users with admin permissions should be able to view and edit and users that are volunteers should be able to view and schedule themselves on the lesson.

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

const lessonSchema = new Schema({
    name: String,
    type: String, //ski, snowboard, sitski
    instructor: {type: String, default: ''}, //volunteer user name
    shadow: {type: String, default: ''}, //volunteer user name
    date: Number, //unix
    createdTimestamp: {type: Number, default: moment().unix() }, //unix
    createdBy: String, //admin user
});

mongoose.model('lessons', lessonSchema);
```
As with most models, this one is subject to change.

Meanwhile... back in _server/index.js_ The app will need to use the `body-parser` module to read the POST request's body, `lessonRoutes` to gain access to the route logic, and the `Lesson` model for the mongoose schema.

```javascript
require('./models/Lesson');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

require('./routes/core')(app);
require('./routes/api/lessonRoutes')(app);
```

And time to create a new route in the API that will save a lesson. _server/routes/api/lessonRoutes.js_
```javascript
const mongoose = require('mongoose');
const Lesson = mongoose.model('lessons');
const moment = require('moment');

module.exports = app => {

    //create lesson
    app.post('/api/lessons', async (req, res) => {
        
        const {studentName , type, date, createdBy} = req.body;
        const lesson = new Lesson ({
            studentName,
            type,
            date,
            createdTimestamp: moment().unix(),
            createdBy
        });

        try {
            await lesson.save();
            res.send(lesson); 
        } catch (error) {
            res.status(422).send(err);
        }

    });
};
```
The `async/await` syntax is used here to make use of promises with the asynchronous request call to the database in `lesson.save()`. `async` is used in front of the function that contains the asynchronous request, `await` is used in front of each promise within the function. 

A quick `POST` route check confirms that everything is saving on the mLab database. Time to create a few more routes before switching back to the front end!

```javascript
    app.get('/api/lessons/:lessonId', (req, res) => {
                
        const { lessonId } = req.params;
        Lesson.findById(
            lessonId,
            (err, item) => {
                if(err) return res.status(500).send(err)
                res.send(item);
            }
        )
    });

    //get all lessons
    app.get('/api/lessons', (req, res) => {
                
        Lesson.find(
            {},
            (err, items) => {
                if(err) return res.status(500).send(err)
                res.send(items);
            }
        )
    });

    app.put('/api/lessons/:lessonId', (req, res) => {
        
        const { lessonId } = req.params;
        Lesson.findByIdAndUpdate(
            lessonId,
            req.body,
            {new: true},
            (err, item) => {
                if (err) return res.status(500).send(err);
                return res.send(item);
            }
        )
    });

    app.delete('/api/lessons/:lessonId', (req, res) => {
        
        const { lessonId } = req.params;
        Lesson.findByIdAndRemove(lessonId, (err, item) =>{
            if (err) return res.status(500).send(err);
            const response = { 
                msg : `Deleted ${item._id}`
            };
            return res.status(200).send(response);
        });
    });
```
The first `GET` request could use the Mongoose standard `findOne()` method however newer versions of the package have `findById()`. I used the latter method as `findOne({_id: undefined})` would return an arbitrary document from the db, while `findById(undefined)` equates to `findOne({ _id: null })` and throws an error, making it easier to debug if necessary.

The `PUT` and `DELETE` requests use similar `findByIdAndUpdate()` and `findByIdAndRemove()` methods.
