var mongoose = require('mongoose');

var message = mongoose.Schema({
  date: Date,
  text: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}); 

module.exports = mongoose.model('Message', message);