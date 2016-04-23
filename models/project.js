var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var projectSchema = new Schema({
	
	// name: {type: String, required: true}, // this version requires this field to exist
	// name: {type: String, unique: true}, // this version requires this field to be unique in the db
	title: String,
	tags: [String],
	
	owner:[{type: mongoose.Schema.Types.ObjectId, ref: 'Account'}],
  jars: [{ type: Schema.Types.ObjectId, ref: 'Jar' }],
	dateAdded : { type: Date, default: Date.now },
});

// export 'Jar' model so we can interact with it in other files
module.exports = mongoose.model('Project',projectSchema);