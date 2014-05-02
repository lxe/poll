var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;  

var PollSchema = new Schema({
  url       : String,
  question  : String,
  choices : [{
    text  : String,
    votes : { type : Number, default : 0 }
  }],
  voted : [ String ]
});

module.exports = mongoose.model('Poll', PollSchema);
