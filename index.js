const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let User;
let Exercise;

let userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  }
});

let exerciseSchema = mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  username: {
    type: String,
    required: true
  },
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

User = mongoose.model('User', userSchema);
Exercise = mongoose.model('Exercise', exerciseSchema);

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
  res.json({post: "exercise"});
});

app.get('/api/users', function(req, res) {
  res.json({get: "users"});
});

app.get('/api/users/:_id/logs', function(req, res) {
  let { from, to, limit } = req.query;
  res.json({get: "logs", from: from, to: to, limit: limit});
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
