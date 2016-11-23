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