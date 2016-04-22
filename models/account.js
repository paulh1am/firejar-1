var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
     jars: [{ type: Schema.Types.ObjectId, ref: 'Jar' }],
     finds: [{ type: Schema.Types.ObjectId, ref: 'Jar' }],
     projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);