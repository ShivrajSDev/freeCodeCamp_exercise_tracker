const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', function(req, res) {
  res.json({post: "user"});
})

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
})
