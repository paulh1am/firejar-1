var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
     jars: [{type: mongoose.Schema.Types.ObjectId, ref: 'Jars'}]
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);