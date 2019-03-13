var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

var userSchema = mongoose.Schema({
	local: {
        id: String,
        token: String,
		email: String,
        name: String,
        password: String,
	},
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	}
});

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
}

userSchema.methods.generateId = function(){
	return Math.random().toString().slice(2,18);
}

userSchema.methods.generateToken = function(){
	return crypto.randomBytes(48).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}

module.exports = mongoose.model('User', userSchema);