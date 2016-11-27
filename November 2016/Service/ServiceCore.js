'use strict';

var AWS = require('aws-sdk');
var DOC = require('dynamodb-doc');
var dynamo = new DOC.DynamoDB();

class Field
{
	constructor(name, dbfield, validate, clean, isPrimaryKey) {
		this.name = name;
		this.dbfield = dbfield;
		this.validationFunction = validate;
		this.cleanFunction = clean;
		this.isPrimaryKey = isPrimaryKey === true;
	}
	
	clean(value) {
		return this.cleanFunction(value);
	}
	
	validate(errors, value) {
		errors.addError(
			this.property, 
			this.validationFunction(this.clean(value))
			);
	}
}


class AbstractService
{
	constructor(dynamo, event, context, callback) {
		//if (new.target === AbstractService) {
		//  throw new TypeError("AbstractService is an abstract class. You must inherit it for it to work correctly.");
		//}
		
		this.dynamo = dynamo;
		this.event = event;
		this.context = context;
		this.callback = callback;

		this.chaosMonkeyOdds = 0;
		if(event && event.chaosMonkey)
			this.chaosMonkeyOdds = event.chaosMonkey;
		
		this.TableName = this.getTableName();
		this.fields = this.getFields();
	}
	
	// Abstract values
	getFields() {
		var error = new Error("getFields() is an abstract method that must be overriden.");
		throw error;
	}

	getTableName() {
		var error = new Error("getTableName() is an abstract method that must be overriden.");
		throw error;
	}
	
	// Chaos Monkey!
	// Inspired by https://blog.codinghorror.com/working-with-the-chaos-monkey/
	chaosMonkey() {
		if(Math.random() >= this.chaosMonkeyOdds)
			return;
		
		function ChaosMonkeyException(message) {
			this.name = 'Chaos Monkey Exception';
			this.message = message;
			this.wtf = 'https://blog.codinghorror.com/working-with-the-chaos-monkey/';
			
			// Remove this part from the stack trace
			var stack = (new Error()).stack.split('\n');
			if(stack.length > 3)
				stack.splice(1,2);
			this.stack = stack.join('\n');
		}
		//return JSON.stringify(new ChaosMonkeyException("Chaos Monkey exception thrown! Be sure to check that your components are all working."));
		throw new ChaosMonkeyException("Chaos Monkey exception thrown! Be sure to check that your components are all working.");
	}
	
	// Helper Methods
	getProjectionExpression(omitPrimaryKeys) {
		var abc = 'abcdefghijklmnopqrstuvwxyz';
		
		var projectionExpression = [];
		var attributeNames = {};
		var updateExpression = [];

		for(var i=0;i<this.fields.length;i++) {
			var f = this.fields[i];
		    if(omitPrimaryKeys && f.isPrimaryKey)
		        continue;
		    
			var placeholder = '#' + abc[i];
			projectionExpression.push(placeholder);
			attributeNames[placeholder] = f.dbfield;
			updateExpression.push(placeholder + '=:' + f.dbfield);
		}

		return {
			ProjectionExpression: projectionExpression.join(', '),
			AttributeNames: attributeNames,
			UpdateExpression: 'SET ' + updateExpression.join(', ')
		};
	}

	buildResult(err, res) {
		return {
	        statusCode: err ? '400' : '200',
	        body: err ? err.message : JSON.stringify(res),
	        headers: {
	            'Content-Type': 'application/json',
	        },
	    };
	}
	
	// REST Methods
	get() {
		this.chaosMonkey();
		
		var projectionExpression = this.getProjectionExpression();
		console.log({
			TableName: this.TableName,
			Key: {
				id: this.event.id
			},
			ProjectionExpression: projectionExpression.ProjectionExpression,
			ExpressionAttributeNames: projectionExpression.AttributeNames
		});
		
		dynamo.getItem({
			TableName: this.TableName,
			Key: {
				id: this.event.id
			},
			ProjectionExpression: projectionExpression.ProjectionExpression,
			ExpressionAttributeNames: projectionExpression.AttributeNames
		}, (err, data) => this.callback(null, this.buildResult(err, data)));
	}
	
	post() {
		if(!this.event)
			return this.callback("There was no event data in this request.", null);
		if(!this.event.body)
			return this.callback("There was no body data in this request.", null);
		
		var projectionExpression = this.getProjectionExpression(true);
		var ExpressionAttributeValues = {};
		var errors = new Errors(this.fields.filter(function(f) { return !f.isPrimaryKey; }).map(function(f) { return f.dbfield }));
		
		this.fields.filter(function(f) { return !f.isPrimaryKey; }).forEach((f) => {
			var value = this.event.body[f.dbfield];
			value = f.clean(value);
			f.validate(errors, value);
			ExpressionAttributeValues[':' + f.dbfield] = value;
		});
		
		if(errors.hasError)
			return this.callback(errors, null);
		
		this.chaosMonkey();
		
		console.log(projectionExpression);
		
		dynamo.updateItem({
			TableName: this.TableName,
			Key: {
				id: this.event.body.id
			}, 
			UpdateExpression: projectionExpression.UpdateExpression,
			ExpressionAttributeNames: projectionExpression.AttributeNames,
			ExpressionAttributeValues: ExpressionAttributeValues
		}, (err, data) => this.callback(null, this.buildResult(err, data)));
	}
	
	put() {
		this.callback("put() is not used", null);
	}
	
	del() {
		this.callback("del() is not used", null);
	}
	
}

class PortalMemberService extends AbstractService
{
	constructor(dynamo, event, context, callback) {
		super(dynamo, event, context, callback);
	}

	getTableName() {
		return "Portal_Members";
	}
}


class BasicInformationService extends PortalMemberService
{
	constructor(dynamo, event, context, callback) {
		super(dynamo, event, context, callback);
	}
	
	getFields() {
		return [
			new Field('Member ID', 'id', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s ID cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				},
				true // primary key
				),
			new Field('First Name', 'first_name', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s First Name cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Last Name', 'last_name', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s Last Name cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Date of Birth', 'dob', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s Date of Birth cannot be blank';

					if(!/^\d{2}\/\d{2}\/\d{4}$/.test(value))
						return 'Date of Birth should be written in the MM/DD/YYYY format (e.g.: 01/23/1945)';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Social Security Number', 'ssn', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s Social Security Number cannot be blank';
					if(!/^\d{3}-\d{2}-\d{4}$/.test(value))
						return 'Social Security Number should be written in the XXX-XX-XXXX format (e.g.: 123-45-6789)' ;
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Email', 'email', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s Email Address cannot be blank';
					if(!/^[-_.a-z0-9]+@[-_.a-z0-9]+\.[a-z]{2,6}$/i.test(value))
						return value + ' is not an acceptable email address. (Emails should look like john.doe@example.com)' ;
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Gender', 'gender', 
				function(value) {
					if(['', 'Male', 'Female'].indexOf(value) < 0)
						return value + ' is an unacceptable value for gender.';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Street Address', 'street_address', 
				function(value) {
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('State', 'state',
				function(value) {
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Home Phone', 'home_phone', 
				function(value) {
					if(!/^(\d{1,2}-\(\d{3}\)\d{3}-\d{4}|)$/.test(value))
						return value + ' is an invalid phone number. (Phone numbers should look like 1-(123)123-1234)';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('City', 'city', 
				function(value) {
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Country', 'country', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s Country cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Country Code', 'country_code', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s Country Code cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Marital Status', 'marital_status', 
				function(value) {
					if(['', 'Divorced', 'Single', 'Separated', 'Legal Separation', 'Married', 'Divorced Pending', 'Refused', 'None'].indexOf(value) < 0)
						return value + ' is an invalid Marital Status';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Employer', 'employer', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s Last Name cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Occupation', 'occupation', 
				function(value) {
				},
				function(value) {
					return (value || '').trim();
				}),
		];
	}
}


class IdentificationService extends PortalMemberService
{
	constructor(dynamo, event, context, callback) {
		super(dynamo, event, context, callback);
	}
	
	getFields() {
		return [
			new Field('Member ID', 'id', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s ID cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				},
				true // primary key
				),
			new Field('Identifications', 'identification', 
				function(value) {
					if(value === null)
						return 'A member\'s Identifications cannot be null. Pass in an empty array instead.';

					var errors = [];

					value.forEach(function(v) {
						if(v.number === 0)
							errors.push('You cannot submit an Identification without an ID Number');
						if(!v.type)
							errors.push('You cannot submit an Identification without a Type');
					});

					return errors;
				},
				function(value) {
					if(value === null)
						return [];

					value.forEach(function(v) {
						v.number = v.number || 0;
						v.type = (v.type || '').trim();
						v.valid = v.valid === true;
					});

					return value;
				}),
		];
	}
}

class MilitaryService extends PortalMemberService
{
	constructor(dynamo, event, context, callback) {
		super(dynamo, event, context, callback);
	}
	
	getFields() {
		return [
			new Field('Member ID', 'id', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s ID cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				},
				true // primary key
				),
			new Field('Military Service', 'military', 
				function(value) {
					if(value === null)
						return 'A member\'s Military Service cannot be null. Pass in an empty array instead.';

					var errors = [];

					value.forEach(function(v) {
						if(!v.branch)
							errors.push('You cannot submit Military History without a Branch');
						if(!v.status)
							errors.push('You cannot submit Military History without the Member\'s current status');
					});

					return errors;
				},
				function(value) {
					if(value === null)
						return [];

					value.forEach(function(v) {
						v.branch = (v.branch || '').trim();
						v.status = (v.status || '').trim();
					});

					return value;
				}),
		];
	}
}

class ProductService extends PortalMemberService
{
	constructor(dynamo, event, context, callback) {
		super(dynamo, event, context, callback);
	}
	
	getFields() {
		return [
			new Field('Member ID', 'id', 
				function(value) {
					if(value === null || value === '')
						return 'The member\'s ID cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				},
				true // primary key
				),
			new Field('Products', 'product', 
				function(value) {
					if(value === null)
						return 'A member\'s Products cannot be null. Pass in an empty array instead.';

					var errors = [];

					value.forEach(function(v) {
						if(!v.type)
							errors.push('You cannot submit a Product without specifying the type of Product');
						if(!v.number || v.number === 0)
							errors.push('You cannot submit a Product without a Number');
					});

					return errors;
				},
				function(value) {
					if(value === null)
						return [];

					value.forEach(function(v) {
						v.type = (v.type || '').trim();
						v.number = v.number || 0;
					});

					return value;
				}),
		];
	}
}


class Errors
{
	constructor(fields) {
		fields.forEach((f) => {
			this[f] = [];
		});
		this.hasError = false;
	}
	
	addError(key, err) {
		if(!this[key])
			this[key] = [];
		
		if(err === null)
			return;
		
		if(typeof err == "string" && err.length > 0) {
			this[key].push(err);
			this.hasError = true;
		}
		
		else if (typeof err == "object" && err.length > 0) {
			this[key] = this[key].concat(err);
			this.hasError = true;
		}
	}
}

exports.handler = function(event, context, callback) {
    console.log({
        event: event,
        context: context,
        callback: callback
    });
    var done = (err, res) => callback(null, {
        statusCode: err ? '500' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if(!event || !event.service || !event.httpMethod) {
    	console.error('The event.service or event.httpMethod variables were not defined. ', event);
    	done(new Error(`The event.service and event.httpMethod variables are required.`));
    }

	var service;
	switch(event.service) {
		case 'BASICINFORMATION':
			service = new BasicInformationService(dynamo, event, context, callback);
			break;
		case 'IDENTIFICATIONS':
			service = new IdentificationService(dynamo, event, context, callback);
			break;
		case 'MILITARYSERVICE':
			service = new MilitaryService(dynamo, event, context, callback);
			break;
		case 'PRODUCTS':
			service = new ProductService(dynamo, event, context, callback);
			break;
		default:
			done(new Error(`Unsupported service "${event.service}"`));
			break;
	}


	try {
        switch (event.httpMethod) {
            case 'DELETE':
            	service.del();
                break;
            case 'GET':
                service.get();
                break;
            case 'POST':
                service.post();
                break;
            case 'PUT':
                service.put();
                break;
            default:
            	throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
	} catch(x) {
		done(x);
	}
};
