var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var noteSchema = new Schema({
	
	// name: {type: String, required: true}, // this version requires this field to exist
	// name: {type: String, unique: true}, // this version requires this field to be unique in the db
	text:String,
	url: String,
  jar:String,
	dateAdded : { type: Date, default: Date.now },
});

// export 'Jar' model so we can interact with it in other files
module.exports = mongoose.model('Jar',jarSchema);