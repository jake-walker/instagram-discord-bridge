// lastupdate.js is responsible for keeping track of when we last
// checked for Instagram messages, this is so we don't send the same
// message multiple times.

const fs = require("fs");

// File for storing the timestamp of the last time we checked
const file = "lastupdate.txt";
// Default value if we don't have a file.
const defaultVal = 1;

// A 'cached' version of the last update timestamp so that we
// don't have to load from file every time.
let lastUpdate = false;

// Function to get the latest update time.
module.exports.get = () => new Promise((resolve, reject) => {
	// If the 'cached' version of the time exists.
	if (lastUpdate !== false) {
		// Return the 'cached' time
		return resolve(lastUpdate);
	}

	// Or if we don't have a 'cached' version...
	// Check that the file exists
	fs.exists(file, function(exists) {
		// If the file exists...
		if (exists) {
			// Read the contents of the file
			fs.readFile(file, function(err, data) {
				// If there was any errors, abort
				if (err) {
					return reject(err);
				}

				// Parse the contents of the file to an integer and
				// return it.
				lastUpdate = parseInt(data);
				return resolve(lastUpdate);
			});
		} else {
			// If the file doesn't exist, SET the value to the default
			// value and return it.
			module.exports.set(defaultVal).then(() => resolve(defaultVal));
		}
	});
});

// Function for saving the new time value to a file
module.exports.set = (val) => new Promise((resolve, reject) => {
	// Write the new time (val) to the file
	fs.writeFile(file, val, function(err) {
		// If there were any errors, abort
		if (err) {
			return reject(err);
		}

		// Set the 'cached' version to the new value
		lastUpdate = val;
		return resolve();
	});
});
