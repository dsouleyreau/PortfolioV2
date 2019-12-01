var mongoose = require('mongoose');

var heroSchema = mongoose.Schema({
  idHero: String,
  heroName: String,
  spells: [mongoose.Schema.Types.Mixed]
}); 

module.exports = mongoose.model('Hero', heroSchema);