var express    = require('express')
  , mongoose   = require('mongoose')
  , crypto     = require('crypto')
  , fs         = require('fs')
  , utils      = require('./utils');

var Poll = require('./models/poll');
mongoose.connect('mongodb://localhost/poll');
  
var app = express()
  , port = parseInt(process.env.PORT) || 3000;

app.use(require('body-parser')());
app.use(require('cookie-parser')());
app.use(require('evercookie').backend());
app.use(function session (req, res, next) {
  if (!req.cookies.session) {
    return crypto.randomBytes(48, function(ex, buf) {
      var str = buf.toString('base64');
      res.cookie('session', str, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
      });
      req.cookies.session = str;
      return next();
    });
  } 
  return next();
});

app.use(express.static(__dirname + '/www'));

app.get('/:id', function (req, res, next) {
  res.sendfile(__dirname + '/www/index.html');
});

app.post('/polls', function (req, res, next) {
  function makeUniqueSimpleId(done) {
    var id = utils.simpleId(5);
    Poll.findOne({ url : id }, function (err, poll) {
      if (err)  return done(err);
      if (poll) return makeUniqueSimpleId(done);
      return done(null, id);
    });
  }

  makeUniqueSimpleId(function (err, id) {
    if (err) return next(err);
    req.body.url = id;
    req.body.choices = req.body.choices.map(function (text) {
      return { text : text, votes : 0 };
    });

    var poll = Poll(req.body);
    poll.save(function (err, poll) {
      if (err) return next(err);
      return res.json(poll);
    });
  })
});

app.get('/polls/:id', function (req, res, next) {
  Poll.findOne({ url : req.params.id }, function (err, poll) {
    if (err) return next(err);
    if (!poll) return res.send(404);
    return res.json(poll);
  });
});

app.post('/polls/:id/vote/:q', function (req, res) {
  Poll.findOne({ url : req.params.id }, function (err, poll) {
    if (err) return next(err);
    if (poll.voted.indexOf(req.cookies.session) >= 0) return res.send(403);

    poll.choices[parseInt(req.params.q, 10)] ++;
    poll.voted.push(req.cookies.session);
    poll.save(function (err) {
      if (err) return next(err);
      console.log(req.url);
      res.cookie('voted', '1', {
        expires : new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        path    : '/' + poll.url
      });
      return res.send(200);
    })
  });
});

app.listen(port, function (err) {
  if (err) console.error(err);
  console.log('App server listening on :%d', port);
});

