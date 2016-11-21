class AbstractService
{
	constructor(dynamo, event, context) {
		if (new.target === AbstractService) {
		  throw new TypeError("AbstractService is an abstract class. You must inherit it for it to work correctly.");
		}
		
		this.dynamo = dynamo;
		this.event = event;
		this.context = context;
		this.chaosMonkeyOdds = 0;
		
		if(event.body && event.body.chaosMonkey)
			this.chaosMonkeyOdds = event.body.chaosMonkey;
		
		this.TableName = this.getTableName();
		this.fields = this.getFields();
	}
	
	// Abstract values
	getFields() {
		error = new Error("getFields() is an abstract method that must be overriden.");
		throw error;
	}

	getTableName() {
		error = new Error("getTableName() is an abstract method that must be overriden.");
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
		throw new ChaosMonkeyException("Chaos Monkey exception thrown! Be sure to check that your components are all working.");
	}
	
	// Helper Methods
	getProjectionExpression() {
		return this.fields.map(function(f) { return f.dbfield; }).join(',');
	}

	getUpdateExpression() {
		return "set " + this.fields.map(function(f) { return "obj." + f.dbfield + "=:" + f.dbfield; }).join(', ');
	}
	
	// REST Methods
	get() {
		this.chaosMonkey();
		
		dynamo.getItem({
			TableName: this.TableName,
			Key: {
				memberid: this.event.memberid
			},
			ProjectionExpression: this.getProjectionExpression()
		}, (err, data) => {
			if(err) {
				console.log('Error within ' + this.constructor.name, err);
				this.context.done('Unable to retrieve Information from the ' 
				+ this.constructor.name
				+ ' service.', null);
			} else {
				this.context.done(null, data.Item || {});
			}
		});
	}
	
	post() {
		if(!this.event)
			throw new Error("There was no event data in this request.");
		if(!this.event.body)
			throw new Error("There was no body data in this request.");
		
		var ExpressionAttributeValues = {};
		var errors = new Errors(this.fields.map(function(f) { return f.property }));
		
		this.fields.forEach((f) => {
			var value = this.event.body[f.property];
			value = f.clean(value);
			f.validate(errors, value);
			ExpressionAttributeValues[f.dbfield] = value;
		});
		
		if(errors.hasError)
			throw new Error(JSON.stringify(errors));
		
		this.chaosMonkey();
		
		dynamo.update({
			TableName: this.TableName,
			Key: {
				memberid: this.event.body.memberid
			}, 
			UpdateExpression: this.getUpdateExpression(),
			ExpressionAttributeValues: ExpressionAttributeValues
		}, (err, data) => {
			if (err) {
				console.error('Unable to update item within ' + this.constructor.name, err);
			} else {
				this.context.done(null, data.Item || {});
			}
		});
	}
	
	put() {
		error = new Error("put() is not used");
		throw error;
	}
	
	del() {
		error = new Error("del() is not used");
		throw error;
	}
	
}