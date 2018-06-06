---
title: "Initial Commit"
path: "/challenge-app/initial-commit"
date: "2018-05-21T01:01:01.001Z"
---

Going for a Node and React-Redux applicaton.

Putting together the normal express server setup.

To set up the boilerplate code, I'll get things initialized with 
`npm init` within the root directory.

And the simple Node/Express server...

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send({ challenge: 'AK' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT);
```

Eventually, this application will be hosted on Heroku, and the `PORT` variable is set to take advantage of Heroku's `process.env`. In the package.json file I'll add

```javascript
"engines":{
    "node" : "8.1.1",
    "npm" : "5.0.3"
  }
```
this tells Heroku to run these specific versions of Node and NPM. Now, to specify a start script.

```javascript
"scripts": {
    "start": "node index.js"
  }
```

It is also important to add a .gitignore file to make sure I don't accidentally commit all of the dependencies to version control when deploying.

```javascript
node_modules
```