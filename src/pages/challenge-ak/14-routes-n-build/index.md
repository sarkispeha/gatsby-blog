---
title: "Routes n Build"
path: "/challenge-app/routes-n-build"
date: "2018-06-13T01:01:01.001Z"
---

Back to the Node server that will contain most of the API logic. The reasons why I plan to have a separate server and Mongodb are twofold: Firstly, the integrations with other APIs will be more robust if I have full control, and I would rather trade maintenance for control. Secondly, this is what I know best!

A new directory is created in _server/routes_ with a new file `core.js`. This will hold the 'foundation' routes.

```javascript
module.exports = (app) =>{
  app.get('/', (req, res) => {
    res.send({ challenge: 'AK' });
  });
}
```

And in _server/index.js_
```javascript
const express = require('express');

const app = express();

// const coreRoutes = require('./routes/core');
// coreRoutes(app);
require('./routes/core')(app);

const PORT = process.env.PORT || 4000;
console.log('Local Node server listening on port 4000');
app.listen(PORT);
```
To make things succinct the commented code can be written just as the require statement below it.


Thinking about the Heroku build, the express server should differentiate between the view routes of React Router and the API.
```javascript
require('./routes/core')(app);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'));

    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}
```
Taking advantage of the Heroku config vars, the above `app.get('*'`... statement reads: "If there is no current route matching anything from _routes/core_, no file coming from the _client/build_, then all the possibilities are exhausted and simply return the index.html file." It is the catch-all case.
___


Eventually I will need both my backend and frontend servers running at the same time, a perfect task for [concurrently](https://www.npmjs.com/package/concurrently)

`npm i concurrently`

In the `package.json` of my _/server_ directory I will set 

```json
"scripts": {
    "start": "node index.js",
    "client": "npm run start --prefix ../client",
    "server": "nodemon index.js",
    "dev": "concurrently \"npm run server\" \"npm run client\""
  },
```

For the build process to work with Heroku I will need to [customize the build process](https://devcenter.heroku.com/articles/nodejs-support#customizing-the-build-process)
adding a line to the `scripts` json `"heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix ../client && npm run build --prefix ../client"`

This allows to build production assets after npm dependencies are installed on Heroku specifically.