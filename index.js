const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let User;

let userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  logs: [{
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    date: Date
  }]
});

User = mongoose.model('User', userSchema);

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
        let newExercise = {
          description: req.body.description,
          duration: req.body.duration,
          date: req.body.date ? new Date(req.body.date) : new Date(),
        };
        
        user.logs.push(newExercise);
        user.save(function(err2, data){
          if(err2) {
            res.json({error: err2});
          } else {
            let savedExercise = data.logs.pop();
            res.json({
              username: data.username,
              description: savedExercise.description,
              duration: savedExercise.duration,
              date: savedExercise.date.toDateString(),
              _id: data._id
            });
          }
        });
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
  res.json({get: "logs", from: from, to: to, limit: limit});
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
