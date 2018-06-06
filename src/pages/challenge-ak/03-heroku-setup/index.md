---
title: "Heroku Setup"
path: "/challenge-app/heroku-setup"
date: "2018-05-22T01:01:01.001Z"
---

The Heroku CLI has everything needed to get pushing files up to deployment. I have a Mac, and install it with [Homebrew](https://brew.sh/).

`brew install heroku`

Then log into Heroku via the command line.

`heroku login`

The remote git repo is added with the command.

`git remote add heroku https://git.heroku.com/challenge-ak.git`

Then given the standard commands to push it up to heroku.

```
git add .
git commit -m "initial commit"
git push heroku master
```

And voila! It's up on the internets!

As this will be an application that might see many people using it during peaks, I set up a staging and production pipeline within Heroku to be able to test new features and identify bugs before commiting to production.