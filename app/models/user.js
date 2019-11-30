var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

var userSchema = mongoose.Schema({
    user_id: String,
    token: String,
    email: String,
    name: String,
    password: String,
    auth: String,
    image: String,
});

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(13));
}

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
}

userSchema.methods.generateId = function(){
	return Math.random().toString().slice(2,25);
}

userSchema.methods.generateToken = function(){
	return crypto.randomBytes(48).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}

module.exports = mongoose.model('User', userSchema);