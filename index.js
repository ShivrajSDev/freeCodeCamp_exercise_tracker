const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const MIN_DATE = -8640000000000000;
const MAX_DATE = 8640000000000000;

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

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

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
    .select({logs: false})
    .exec(function(err, data) {
      if(err) {
        res.json({error: err});
      } else {
        res.json(data);
      }
    });
});

app.get('/api/users/:_id/logs', function(req, res) {
  let { from, to, limit } = req.query;
  
  if(from === undefined || from.trim().length === 0 ) {
    from = MIN_DATE;
  }
  if(to === undefined || to.trim().length === 0 ) {
    to = MAX_DATE;
  }
  if(limit === undefined ) {
    limit = null;
  }

  User.findOne({_id: req.params._id})
    .populate({
      path: "log", 
      select: '-_id description duration date', 
      match: { 'date': { $gte: new Date(from), $lte: new Date(to) }}, 
      sort: { 'date': -1},
      limit: limit
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
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
