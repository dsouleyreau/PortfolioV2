var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

var userSchema = mongoose.Schema({
  auth_id: String,
  token: String,
  email: String,
  name: String,
  password: String,
  auth: String,
  image: String
});

userSchema.methods.generateHash = function(password){       // Generer un nouveau hash à partir du mot de passe du compte local
  return bcrypt.hashSync(password, bcrypt.genSaltSync(13)); // Conflexite 2^13 du hashage pour ralentir un "brut force" eventuel
}

userSchema.methods.validPassword = function(password){      // Valider le mot de passe du compte local
  return bcrypt.compareSync(password, this.password);       // Comparaison des hash
}

userSchema.methods.generateId = function(){                 // Generer l'ID du compte local
                                                            // Genere un nombre aléatoire de 18 caracteres
  return Math.random().toString().slice(2, 16) + Math.random().toString().slice(2, 6);
}

userSchema.methods.generateToken = function(){              // Genere un token d'acces du compte local (fonctionnalites a venir)
  return crypto.randomBytes(48).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}

module.exports = mongoose.model('User', userSchema);