lass AbstractService
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
