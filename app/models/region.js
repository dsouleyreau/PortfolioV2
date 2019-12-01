var mongoose = require('mongoose');

var regionSchema = mongoose.Schema({
  idRegion: String,
  regionName: String,
  enemies: [mongoose.Schema.Types.Mixed]
}); 

module.exports = mongoose.model('Region', regionSchema);