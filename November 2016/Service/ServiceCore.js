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
			this.dbfield, 
			this.validationFunction(this.clean(value))
			);
	}

	static mandatoryField(errorMessage) {
		return function(value) {
			if(value === null || value === '')
				return errorMessage;
		};
	}
	
	static blankify(value) {
		return (value || '').trim();
	}
}

var Fields = {

	memberId: new Field('Member ID', 'id', 
		Field.mandatoryField('The member\'s ID cannot be blank'),
		Field.blankify,
		true // primary key
		),
	firstName: new Field('First Name', 'first_name', 
		Field.mandatoryField('The member\'s First Name cannot be blank'),
		Field.blankify),
	lastName: new Field('Last Name', 'last_name', 
		Field.mandatoryField('The member\'s Last Name cannot be blank'),
		Field.blankify),
	dateOfBirth: new Field('Date of Birth', 'dob', 
		function(value) {
			if(value === null || value === '')
				return 'The member\'s Date of Birth cannot be blank';

			if(!/^\d{2}\/\d{2}\/\d{4}$/.test(value))
				return 'Date of Birth should be written in the MM/DD/YYYY format (e.g.: 01/23/1945)';
		},
		Field.blankify),
		
	socialSecurityNumber: new Field(
	    'Social Security Number', 
	    'ssn', 
		function(value) {
			if(value === null || value === '')
				return 'The member\'s Social Security Number cannot be blank';
			if(!/^\d{3}-\d{2}-\d{4}$/.test(value))
				return 'Social Security Number should be written in the XXX-XX-XXXX format (e.g.: 123-45-6789)' ;
		},
		Field.blankify),
		
	email: new Field('Email', 'email', 
		function(value) {
			if(value === null || value === '')
				return 'The member\'s Email Address cannot be blank';
			if(!/^[-_.a-z0-9]+@[-_.a-z0-9]+\.[a-z]{2,6}$/i.test(value))
				return value + ' is not an acceptable email address. (Emails should look like john.doe@example.com)' ;
		},
		Field.blankify),
	gender: new Field('Gender', 'gender', 
		function(value) {
			if(['', 'Male', 'Female'].indexOf(value) < 0)
				return value + ' is an unacceptable value for gender.';
		},
		Field.blankify),
	streetAddress: new Field('Street Address', 'street_address', 
		function(value) { },
		Field.blankify),
	state: new Field('State', 'state',
		function(value) { },
		Field.blankify),
	homePhone: new Field('Home Phone', 'home_phone', 
		function(value) {
			if(!/^(\d{1,2}-\(\d{3}\)\d{3}-\d{4}|)$/.test(value))
				return value + ' is an invalid phone number. (Phone numbers should look like 1-(123)123-1234)';
		},
		Field.blankify),
	city: new Field('City', 'city', 
		function(value) { },
		Field.blankify),
	country: new Field('Country', 'country', 
		Field.mandatoryField('The member\'s Country cannot be blank'),
		Field.blankify),
	countryCode: new Field('Country Code', 'country_code', 
		Field.mandatoryField('The member\'s Country Code cannot be blank'),
		Field.blankify),
	maritalStatus: new Field('Marital Status', 'marital_status', 
		function(value) {
			if(['', 'Divorced', 'Single', 'Separated', 'Legal Separation', 'Married', 'Divorced Pending', 'Refused', 'None'].indexOf(value) < 0)
				return value + ' is an invalid Marital Status';
		},
		Field.blankify),
	employer: new Field('Employer', 'employer', 
		Field.mandatoryField('The member\'s Employer cannot be blank'),
		Field.blankify),
	occupation: new Field('Occupation', 'occupation', 
		function(value) { },
		Field.blankify),
	identifications: new Field('Identifications', 'identification', 
		function(value) {
			if(value === null)
				return 'A member\'s Identifications cannot be null. Pass in an empty array instead.';

			var errors = [];

			value.forEach(function(v) {
			    var suberrors = [];
				if(v.number === 0)
					suberrors.push('You cannot submit an Identification without an ID Number');
				if(!v.type)
					suberrors.push('You cannot submit an Identification without a Type');
					
				errors.push(suberrors);
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
	military: new Field('Military Service', 'military', 
		function(value) {
			if(value === null)
				return 'A member\'s Military Service cannot be null. Pass in an empty array instead.';

			var errors = [];

			value.forEach(function(v) {
			    var suberrors = [];
			    
				if(!v.branch)
					suberrors.push('You cannot submit Military History without a Branch');
				if(!v.status)
					suberrors.push('You cannot submit Military History without the Member\'s current status');
					
				errors.push(suberrors);
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
	products: new Field('Products', 'product', 
		function(value) {
			if(value === null)
				return 'A member\'s Products cannot be null. Pass in an empty array instead.';

			var errors = [];

			value.forEach(function(v) {
			    var suberrors = [];
			    
				if(!v.type)
					suberrors.push('You cannot submit a Product without specifying the type of Product');
				if(!v.number || v.number === 0)
					suberrors.push('You cannot submit a Product without a Number');
				
				errors.push(suberrors);
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
};


class ChaosMonkeyException {
    constructor(message) {
    	this.name = 'Chaos Monkey Exception';
    	this.message = message;
    	this.wtf = 'https://blog.codinghorror.com/working-with-the-chaos-monkey/';
    	
    	// Remove this part from the stack trace
    	var stack = (new Error()).stack.split('\n');
    	if(stack.length > 3)
    		stack.splice(1,2);
    	this.stack = stack.join('\n');
    }
}

class AbstractService
{
	constructor(dynamo, event, context, callback, fields) {
		//if (new.target === AbstractService) {
		//  throw new TypeError("AbstractService is an abstract class. You must inherit it for it to work correctly.");
		//}
		
		this.dynamo = dynamo;
		this.event = event;
		this.context = context;
		this.callback = callback;
		this.fields = fields;

		this.chaosMonkeyOdds = 0;
		if(event && event.chaosMonkey)
			this.chaosMonkeyOdds = event.chaosMonkey;
		
		this.TableName = this.getTableName();
	}
	
	// Abstract values
	getTableName() {
		var error = new Error("getTableName() is an abstract method that must be overriden.");
		throw error;
	}
	
	// Chaos Monkey!
	// Inspired by https://blog.codinghorror.com/working-with-the-chaos-monkey/
	chaosMonkey() {
		if(Math.random() >= this.chaosMonkeyOdds)
			return;
		
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

	// REST Methods
	get() {
		this.chaosMonkey();
		
		var projectionExpression = this.getProjectionExpression();

		dynamo.getItem({
			TableName: this.TableName,
			Key: {
				id: this.event.id
			},
			ProjectionExpression: projectionExpression.ProjectionExpression,
			ExpressionAttributeNames: projectionExpression.AttributeNames
		}, (err, data) => this.callback(err, data));
	}
	
	put() {
		if(!this.event)
			return this.callback("There was no event data in this request.", null, '400');
		if(!this.event.body)
			return this.callback("There was no body data in this request.", null, '400');
		
		console.log(this.event.body);
		
		var projectionExpression = this.getProjectionExpression(true);
		var ExpressionAttributeValues = {};
		var errors = new Errors(this.fields.filter(function(f) { return !f.isPrimaryKey; }).map(function(f) { return f.dbfield }));
		
		this.fields.filter(function(f) { return !f.isPrimaryKey; }).forEach((f) => {
			var value = this.event.body[f.dbfield];
			value = f.clean(value);
			f.validate(errors, value);
			ExpressionAttributeValues[':' + f.dbfield] = (value === '' ? null : value);
		});
		
		if(errors.hasError)
			return this.callback(errors, null, '400');
		
		this.chaosMonkey();
		
 		console.log({
 		    projectionExpression: projectionExpression,
 		    ExpressionAttributeValues: ExpressionAttributeValues
 	    });
		
		dynamo.updateItem({
			TableName: this.TableName,
			Key: {
				id: this.event.body.id
			}, 
			UpdateExpression: projectionExpression.UpdateExpression,
			ExpressionAttributeNames: projectionExpression.AttributeNames,
			ExpressionAttributeValues: ExpressionAttributeValues
		}, (err, data) => this.callback(err, data));
	}
	
	post() {
		this.callback("post() is not used", null, '501');
	}
	
	del() {
		this.callback("del() is not used", null, '501');
	}
	
}

class PortalMemberService extends AbstractService
{
	constructor(dynamo, event, context, callback, fields) {
		super(dynamo, event, context, callback, fields);
	}

	getTableName() {
		return "Portal_Members";
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
		
		else if (Array.isArray(err)) {
		    this[key] = this[key].concat(err);
		    
		    var detectError = function(e) {
                if(typeof e == 'string')
                    return e.length > 0;
            
                if(Array.isArray(e)) {
                	if(e.length === 0)
                		return false;
            
                	return Math.max.apply(null, e.map(function(error) { 
                		return detectError(error);
            		})) > 0;
                }
            
                if(typeof e == 'object')
                	return true;
                
                return detectError(e);
            };
		    
		    if(!this.hasError)
		        this.hasError = detectError(err);
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
    var done = (err, res, code) => {
        var body = err ? err : res;
        if(err instanceof ChaosMonkeyException) {
            body = {}; 
            body.message = err.message;
            body.details = JSON.stringify(err.wtf);
        }
        else if(err instanceof Error) {
            body = {}; //JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
            body.message = err.message;
            body.details = null;
        }
        else if(err instanceof Errors) {
            body = {};
            body.message = "Your data did not pass validation.";
            body.details = JSON.stringify(err);
        }
        
        var data = {
            statusCode: code ? code : (err ? '500' : '200'),
            body: body,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if(err) {
             callback(JSON.stringify(data));
        }
        
        callback(null, data);
    };

    if(!event || !event.service || !event.httpMethod) {
    	console.error('The event.service or event.httpMethod variables were not defined. ', event);
    	done(new Error(`The event.service and event.httpMethod variables are required.`));
    	return;
    }

	try {
    	var fields;
    	var name = (event.service || '').toUpperCase();

    	switch(name) {
    		case 'BASICINFORMATION':
    			fields = [
    				Fields.memberId, Fields.firstName, Fields.lastName, Fields.dateOfBirth,
    				Fields.socialSecurityNumber, Fields.email, Fields.gender, Fields.streetAddress,
    				Fields.state, Fields.homePhone, Fields.city, Fields.country, Fields.countryCode,
    				Fields.maritalStatus, Fields.employer, Fields.occupation
    			];
    			break;
    		case 'IDENTIFICATIONS':
    			fields = [
    				Fields.memberId, Fields.identifications
    			];
    			break;
    		case 'MILITARYSERVICE':
    			fields = [
    				Fields.memberId, Fields.military
    			];
    			break;
    		case 'PRODUCTS':
    			fields = [
    				Fields.memberId, Fields.products
    			];
    			break;
    		case 'CONTACTINFORMATION':
    			fields = [
    				Fields.memberId, Fields.email, Fields.streetAddress, Fields.state,
    				Fields.homePhone, Fields.city, Fields.country, Fields.countryCode
    			];
    			break;
    		case 'EMPLOYMENTINFORMATION':
    			fields = [
    				Fields.memberId, Fields.employer, Fields.occupation
    			];
    			break;
    		case 'PERSONALINFORMATION':
    			fields = [
    				Fields.memberId, Fields.firstName, Fields.lastName, Fields.dateOfBirth, 
    				Fields.socialSecurityNumber, Fields.gender, Fields.maritalStatus
    			];
    			break;
    		default:
    			done(new Error("The service parameter that you provided, '" 
        			+ name 
        			+ "', is not currently supported by this API."), null, '501');
    			return;
    	}
    	
    	var service = new PortalMemberService(dynamo, event, context, done, fields);
        
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
                done(new Error("The method parameter that you provided, '" 
        			+ event.httpMethod 
        			+ "', is not currently supported by this API."), null, '501');
                return;
        }
	} catch(x) {
		done(x);
	}
};