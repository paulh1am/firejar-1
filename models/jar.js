var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var jarSchema = new Schema({
	
	// name: {type: String, required: true}, // this version requires this field to exist
	// name: {type: String, unique: true}, // this version requires this field to be unique in the db
	title: String,
	tags: [String],
	GPS: {
		lat: Number,
		lon: Number
	},
	SSID:String,
	UDID:String,
	url: String,
	// owner: { type: Number, ref: 'Account' },
	owner:[{type: mongoose.Schema.Types.ObjectId, ref: 'Account'}],
  project:String,
	dateAdded : { type: Date, default: Date.now },
});

// export 'Jar' model so we can interact with it in other files
module.exports = mongoose.model('Jar',jarSchema);