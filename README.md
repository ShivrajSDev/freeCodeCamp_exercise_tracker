# freeCodeCamp - Exercise Tracker Project

## Summary

This is one of the projects that requires implementation as part of [freeCodeCamp's Back End Development and APIs Certification](https://www.freecodecamp.org/learn/back-end-development-and-apis/).

As part of the [requirements](https://www.freecodecamp.org/learn/back-end-development-and-apis/back-end-development-and-apis-projects/exercise-tracker) (including utilising the [boilerplate code provided by freeCodeCamp](https://github.com/freeCodeCamp/boilerplate-project-exercisetracker/)), this project involves implementing an application where new users can be created, exercises can be logged for current users as well as data can be retrieved relating to existing users or a specific user's exercise log history.

## Setup

As this project uses Node.js and Express in order to run this application, make sure Node.js and npm are installed beforehand.

This appliaction also uses MongoDB for database purposes. As such, alongside creating a new database in MongoDB, you will need to add a `.env` file in your project's directory that has a `MONGO_URI` variable that references your MongoDB database's URI in quotes. This should be similar to as follows:

`MONGO_URI="mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER-NAME>.prx1c.mongodb.net/<DB-NAME>?retryWrites=true&w=majority"`

Once everything is set up, run the following commands in your terminal within the project's directory:

```
npm install
npm start
```

## Usage

### POST API

#### New User

```
<YOUR_PROJECT_URL>/api/users

BODY
username - String (required)
``` 

##### Output

Example: `fcc_test` was provided as the new user's name in the input field:

```json
{
  "username": "fcc_test",
  "_id": "5fb5853f734231456ccb3b05"
}
```


#### New Exercise Log

```
<YOUR_PROJECT_URL>/api/users/:_id/exercises

PARAMS
_id - String (Existing user's _id)

BODY
description - String (required)
duration - Number (required)
date - String (yyyy-mm-dd) (optional - defaults to current date)
``` 

##### Output

Example: Referencing new user's `_id` from the above example (i.e. `<YOUR_PROJECT_URL>/api/users/5fb5853f734231456ccb3b05/exercises`), a new exercise log is saved to the database with the form's `description` set to "test", `duration` set to 60 and `date` set to "1990-01-01":

```json
{
  "username": "fcc_test",
  "description": "test",
  "duration": 60,
  "date": "Mon Jan 01 1990",
  "_id": "5fb5853f734231456ccb3b05"
}
```

### GET API

#### Users

`<YOUR_PROJECT_URL>/api/users`

##### Output

```json
[
  {
    "_id": "5fb5853f734231456ccb3b05",
    "username": "fcc_test",
    "__v": 0
  }
]
```

#### User's Logs

```
<YOUR_PROJECT_URL>/api/users/:_id/logs?[from][&to][&limit]

PARAMS
_id - String (Existing user's _id)

QUERIES (all optional)
from - String (yyyy-mm-dd) (Excludes user's logs that are before the specified date)
to - String (yyyy-mm-dd) (Excludes user's logs that are after the specified date)
limit - Number (Maximum number of exercise logs to retrieve for the given user, pending the filtered results based on "from" and/or "to" queries)
```

##### Output

Using the above examples (for creating a new user and adding a new exercise log) to reference the user's `_id` and without any queries/filters applied (i.e. `<YOUR_PROJECT_URL>/api/users/5fb5853f734231456ccb3b05/logs`):

```json
{
  "username": "fcc_test",
  "count": 1,
  "_id": "5fb5853f734231456ccb3b05",
  "log": [{
    "description": "test",
    "duration": 60,
    "date": "Mon Jan 01 1990",
  }]
}
```

## Notes

- The POST API method for adding users will always create a new user, even if there is an existing user with the same username.
- As the API calls involving exercise logs must always be associated with a user, an existing user's `_id` must be provided.
- When getting a user's logs, the `count` key indicates the number of logs that it retrieved for the user based on the filters applied.
