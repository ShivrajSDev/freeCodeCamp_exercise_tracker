const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

let mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Constants used for when checking 'from' and to' filters before getting a user's logs.
// The min and max values are used as an alternative if a value was not provided for either filter.
// The RegEx is used to validate if the provided values are in the valid yyyy-mm-dd date format.
const MIN_DATE = -8640000000000000;
const MAX_DATE = 8640000000000000;
const dateRegEx = RegExp('^\\d{4}-\\d{2}-\\d{2}$');

let User;
let Log;

let logSchema = mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: Date
});

let userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  log: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Log' }]
});

User = mongoose.model('User', userSchema);
Log = mongoose.model('Log', logSchema);

// First step of the GET API workflow for getting a user's logs, where it validates the
// values provided for the API's query values.
// If all validated without issue, the final values are retained in the request before
// proceeding to the next step.
const validateGetLogsFilters = (req, res, next) => {
  let { from, to, limit } = req.query;

  if(from === undefined || from.trim().length === 0 ) {
    from = MIN_DATE;
  } else if(!from.match(dateRegEx)) {
    res.json({error: "Invalid value provided for 'from' - it must be in yyyy-mm-dd format."});
    return;
  }

  if(to === undefined || to.trim().length === 0 ) {
    to = MAX_DATE;
  } else if(!to.match(dateRegEx)) {
    res.json({error: "Invalid value provided for 'to' - it must be in yyyy-mm-dd format."});
    return;
  }

  if(limit === undefined ) {
    limit = null;
  } else if(isNaN(limit)) {
    res.json({error: "Invalid value provided for 'limit' - it must be a number."});
    return;
  }

  req.logDateFrom = from;
  req.logDateTo = to;
  req.logLimit = limit;

  next();
};

// Second step of the GET API workflow for getting a user's logs, using the values
// validated in the validateGetLogsFilters method.
const getUserLogs = (req, res) => {
  User.findOne({_id: req.params._id})
    .populate({
      path: "log", 
      select: '-_id description duration date', 
      match: { 'date': { $gte: new Date(req.logDateFrom), $lte: new Date(req.logDateTo) }}, 
      sort: { 'date': -1},
      limit: req.logLimit
    })
    .exec(function(err1, user) {
      if(err1) {
        res.json({error: err1});
      } else {
        res.json({
          username: user.username,
          count: user.log.length,
          _id: user._id,
          log: user.log.map(item => {
            return {
              description: item.description,
              duration: item.duration,
              date: item.date.toDateString()
          }})
        });
      }
    });
}

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// POST API to add a new user, regardless of whether or not
// an existing user exists with the same username.
app.post('/api/users', function(req, res) {
  let newUser = User({username: req.body.username});

  newUser.save(function(err, data) {
    if(err)
    {
      res.json({error: err});
    }
    else {
      res.json({
        username: data.username,
        _id: data._id
      });
    }
  });
});

// POST API to save a new exercise log for the corresponding user.
// This method first checks to see if the user exists based on the given _id.
// If so, then proceed to save the new log and update the user's logs to reference it.
app.post('/api/users/:_id/exercises', function(req, res) {
  User.findOne({ _id: req.params._id}, function(err1, user) {
    if(err1) {
      res.json({error: err1});
    } else {
      if (user) {
        let newExerciseLog = Log({
          description: req.body.description,
          duration: req.body.duration,
          date: req.body.date ? new Date(req.body.date) : new Date(),
        });

        newExerciseLog.save(function(err2, savedLog) {
          if(err2) {
            res.json({error: err2});
          } else {
            user.log.push(savedLog._id);
            user.save(function(err2, data){
              if(err2) {
                res.json({error: err2});
              } else {
                res.json({
                  username: data.username,
                  description: savedLog.description,
                  duration: savedLog.duration,
                  date: savedLog.date.toDateString(),
                  _id: data._id
                });
              }
            });
          }
        })
      } else {
        res.json({error: "No user found found for the given id"});
      }
    }
  });
});

app.get('/api/users', function(req, res) {
  User.find()
    .select({_id: true, username: true, __v: true})
    .exec(function(err, data) {
      if(err) {
        res.json({error: err});
      } else {
        res.json(data);
      }
    });
});

app.get('/api/users/:_id/logs', validateGetLogsFilters, getUserLogs);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
