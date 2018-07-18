---
title: "Admin Portal - Introduction"
path: "/challenge-app/admin-portal-intro"
date: "2018-07-15T01:01:01.001Z"
---

Steering away from the Calendar and its components for a moment, I'm shifting gears to the admin user portal. The thought behind this page is for admin users to be able to control and edit volunteers' data. This will call for a number of API routes to the user collection in the database... but a word on that.

At the moment, everything user related is dealt with on the Firebase side of things. The authentication is one role, but at the same time there is also the Firebase realtime db storing the `username`, `role`, and `email` of the user with a unique UID translating to the authentication UID. It was never my intent for Firebase to be doing the data storage, and the UID will be used to bridge the gap between Firebase realtime db and Mongo.

Server side setup.

_models/User.js_
```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

const userSchema = new Schema({
    externalId: String,
    username: String,
    role: String,
    email: String,
    volunteerHours: {type: Number, default: 0},
    isDeleted: { type: Boolean, default: false},
    createdTimestamp: {type: Number, default: moment().unix() } //unix
});

mongoose.model('users', userSchema);
```

_userRoutes.js_
```javascript
const mongoose = require('mongoose');
const User = mongoose.model('users');

module.exports = app => {

    //create user
    app.post('/api/users', async (req, res) => {
        
        const {uid, username, email, role} = req.body;
        const user = new User ({
            externalId: uid,
            username: username,
            email: email,
            role: role
        });

        try {
            await user.save();
            return res.send(user); 
        } catch (error) {
            return res.status(500).send(err);
        }

    });
}
```

On the client side.

_actions/index.js_

```javascript
export const saveNewUser = (userDto) => async () => {
    const res = await axios.post('/api/users', userDto);
    return res.data;
}
```

_SignUp.js_
```javascript
onSubmit = (event) => {
    const {
      username,
      email,
      passwordOne,
    } = this.state;

    const {
      history,
    } = this.props;

    auth.doCreateUserWithEmailAndPassword(email, passwordOne)
      	.then(authUser => {
			const role = 'viewer';
        	//Create User in Mongodb, will probably take place of firebase db
			this.props.saveNewUser({
				username: username,
				uid: authUser.user.uid,
				role: role,
				email: email
			})
         	// Create a user in own accessible Firebase db
        ...
```

Now that a user is created within the Mongodb, it is time to structure the Admin Home page where all of the user editing will be done.