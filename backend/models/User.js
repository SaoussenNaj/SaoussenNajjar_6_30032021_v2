const mongoose = require("mongoose");
// Ajout d'un validateur pour garantir qu'on n'a pas plusieurs users connectés avec la meme adresse email
const uniqueValidator = require("mongoose-unique-validator");
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
