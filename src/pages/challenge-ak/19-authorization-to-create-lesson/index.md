---
title: "Calendar - Role Based Use"
path: "/challenge-app/authorization-to-create-lesson"
date: "2018-06-22T01:01:01.001Z"
---


Next I want to limit the access to this click event for users who are only admins, this will create a need for refactoring in other areas of the application. It currently only has General Authorization to check if a user is signed in or not, I now have to give Specific Authorization parameters for users.

The roles will be set in the firebase database and retrieved when a particular use-case is desired. The LessonCalendar component is interesting as the component will render no matter what the user, however, what that user is allowed to do with the component is specific. Within the `componentDidMount()` lifecycle method, the following code is added to set the state of the `userPermissions` role.
```javascript
firebase.auth.onAuthStateChanged(authUser => {
    if(!authUser){
        return;
    }
    user.getOneUser(authUser.uid).then(snapshot =>{
        this.setState({
            userPermissions: snapshot.val().role;
        })
    })
})
```
The above logic first gets the `uid` from the authentication of the user, then pulls in only the `role` of that user's data. The null check at the very beginning serves to test if a user is actually logged in at the moment.

With this property set, it is easy to determine whether or not the modal will be shown with a simple conditional statement.
```javascript
selectSlot = (slotInfo) => {

    if(this.state.userPermissions === 'admin'){
        //show NewLessonModal
        this.setState({
            isModalVisible: true,
            modalDate: slotInfo.start.toLocaleString()
        });
    }
}
```

To tweak a few other files and ready them for the `role` property in the database...
_components/SignUp.js_
```javascript
auth.doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {

         // Create a user in own accessible Firebase db
        let role = 'viewer';
        user.doCreateUser(authUser.user.uid, username, email, role)
        ...
```

And to update and add a query to _firebase/db/user.js_
```javascript
export const doCreateUser = async (id, username, email, role) => {
  // eslint-disable-next-line
  const saveUser = await db.ref(`users/${id}`).set({
    username,
    email,
    role
  });

};

export const getOneUser = async (uid) => {
  return await db.ref('users').child(uid).once('value');
}
```

Now the only type of user with the ability to create lessons are role of `admin`!