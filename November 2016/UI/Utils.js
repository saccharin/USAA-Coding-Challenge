// Utils.js

var Utils = {
	// http://stackoverflow.com/a/901144/1451957
	getParameterByName: function (name, url) {
		if (!url) {
		  url = window.location.href;
		}
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	},
	
	// http://stackoverflow.com/a/1047278/1451957
	typewatch: function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout (timer);
			timer = setTimeout(callback, ms);
		}  
	}(),
	
	// http://stackoverflow.com/a/1144249/1451957
	deepCompare : function() {
	  var i, l, leftChain, rightChain;

	  function compare2Objects (x, y) {
		var p;

		// remember that NaN === NaN returns false
		// and isNaN(undefined) returns true
		if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
			 return true;
		}

		// Compare primitives and functions.     
		// Check if both arguments link to the same object.
		// Especially useful on the step where we compare prototypes
		if (x === y) {
			return true;
		}

		// Works in case when functions are created in constructor.
		// Comparing dates is a common scenario. Another built-ins?
		// We can even handle functions passed across iframes
		if ((typeof x === 'function' && typeof y === 'function') ||
		   (x instanceof Date && y instanceof Date) ||
		   (x instanceof RegExp && y instanceof RegExp) ||
		   (x instanceof String && y instanceof String) ||
		   (x instanceof Number && y instanceof Number)) {
			return x.toString() === y.toString();
		}

		// At last checking prototypes as good as we can
		if (!(x instanceof Object && y instanceof Object)) {
			return false;
		}

		if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
			return false;
		}

		if (x.constructor !== y.constructor) {
			return false;
		}

		if (x.prototype !== y.prototype) {
			return false;
		}

		// Check for infinitive linking loops
		if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
			 return false;
		}

		// Quick checking of one object being a subset of another.
		// todo: cache the structure of arguments[0] for performance
		for (p in y) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			}
			else if (typeof y[p] !== typeof x[p]) {
				return false;
			}
		}

		for (p in x) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			}
			else if (typeof y[p] !== typeof x[p]) {
				return false;
			}

			switch (typeof (x[p])) {
				case 'object':
				case 'function':

					leftChain.push(x);
					rightChain.push(y);

					if (!compare2Objects (x[p], y[p])) {
						return false;
					}

					leftChain.pop();
					rightChain.pop();
					break;

				default:
					if (x[p] !== y[p]) {
						return false;
					}
					break;
			}
		}

		return true;
	  }

	  if (arguments.length < 1) {
		return true; //Die silently? Don't know how to handle such case, please help...
		// throw "Need two or more arguments to compare";
	  }

	  for (i = 1, l = arguments.length; i < l; i++) {

		  leftChain = []; //Todo: this can be cached
		  rightChain = [];

		  if (!compare2Objects(arguments[0], arguments[i])) {
			  return false;
		  }
	  }

	  return true;
	},
	
	getCountries: function() {
		return ['United States', 'Canada', 'France', 'Germany', 'United Kingdom'];
	},
	
	// https://gist.github.com/mshafrir/2646763
	getStates : function() {
		return [{
			"name": "Alabama",
			"abbreviation": "AL"
		},
		{
			"name": "Alaska",
			"abbreviation": "AK"
		},
		{
			"name": "American Samoa",
			"abbreviation": "AS"
		},
		{
			"name": "Arizona",
			"abbreviation": "AZ"
		},
		{
			"name": "Arkansas",
			"abbreviation": "AR"
		},
		{
			"name": "California",
			"abbreviation": "CA"
		},
		{
			"name": "Colorado",
			"abbreviation": "CO"
		},
		{
			"name": "Connecticut",
			"abbreviation": "CT"
		},
		{
			"name": "Delaware",
			"abbreviation": "DE"
		},
		{
			"name": "District Of Columbia",
			"abbreviation": "DC"
		},
		{
			"name": "Federated States Of Micronesia",
			"abbreviation": "FM"
		},
		{
			"name": "Florida",
			"abbreviation": "FL"
		},
		{
			"name": "Georgia",
			"abbreviation": "GA"
		},
		{
			"name": "Guam",
			"abbreviation": "GU"
		},
		{
			"name": "Hawaii",
			"abbreviation": "HI"
		},
		{
			"name": "Idaho",
			"abbreviation": "ID"
		},
		{
			"name": "Illinois",
			"abbreviation": "IL"
		},
		{
			"name": "Indiana",
			"abbreviation": "IN"
		},
		{
			"name": "Iowa",
			"abbreviation": "IA"
		},
		{
			"name": "Kansas",
			"abbreviation": "KS"
		},
		{
			"name": "Kentucky",
			"abbreviation": "KY"
		},
		{
			"name": "Louisiana",
			"abbreviation": "LA"
		},
		{
			"name": "Maine",
			"abbreviation": "ME"
		},
		{
			"name": "Marshall Islands",
			"abbreviation": "MH"
		},
		{
			"name": "Maryland",
			"abbreviation": "MD"
		},
		{
			"name": "Massachusetts",
			"abbreviation": "MA"
		},
		{
			"name": "Michigan",
			"abbreviation": "MI"
		},
		{
			"name": "Minnesota",
			"abbreviation": "MN"
		},
		{
			"name": "Mississippi",
			"abbreviation": "MS"
		},
		{
			"name": "Missouri",
			"abbreviation": "MO"
		},
		{
			"name": "Montana",
			"abbreviation": "MT"
		},
		{
			"name": "Nebraska",
			"abbreviation": "NE"
		},
		{
			"name": "Nevada",
			"abbreviation": "NV"
		},
		{
			"name": "New Hampshire",
			"abbreviation": "NH"
		},
		{
			"name": "New Jersey",
			"abbreviation": "NJ"
		},
		{
			"name": "New Mexico",
			"abbreviation": "NM"
		},
		{
			"name": "New York",
			"abbreviation": "NY"
		},
		{
			"name": "North Carolina",
			"abbreviation": "NC"
		},
		{
			"name": "North Dakota",
			"abbreviation": "ND"
		},
		{
			"name": "Northern Mariana Islands",
			"abbreviation": "MP"
		},
		{
			"name": "Ohio",
			"abbreviation": "OH"
		},
		{
			"name": "Oklahoma",
			"abbreviation": "OK"
		},
		{
			"name": "Oregon",
			"abbreviation": "OR"
		},
		{
			"name": "Palau",
			"abbreviation": "PW"
		},
		{
			"name": "Pennsylvania",
			"abbreviation": "PA"
		},
		{
			"name": "Puerto Rico",
			"abbreviation": "PR"
		},
		{
			"name": "Rhode Island",
			"abbreviation": "RI"
		},
		{
			"name": "South Carolina",
			"abbreviation": "SC"
		},
		{
			"name": "South Dakota",
			"abbreviation": "SD"
		},
		{
			"name": "Tennessee",
			"abbreviation": "TN"
		},
		{
			"name": "Texas",
			"abbreviation": "TX"
		},
		{
			"name": "Utah",
			"abbreviation": "UT"
		},
		{
			"name": "Vermont",
			"abbreviation": "VT"
		},
		{
			"name": "Virgin Islands",
			"abbreviation": "VI"
		},
		{
			"name": "Virginia",
			"abbreviation": "VA"
		},
		{
			"name": "Washington",
			"abbreviation": "WA"
		},
		{
			"name": "West Virginia",
			"abbreviation": "WV"
		},
		{
			"name": "Wisconsin",
			"abbreviation": "WI"
		},
		{
			"name": "Wyoming",
			"abbreviation": "WY"
		}].map(function(s) { return s.abbreviation; });
	}
};