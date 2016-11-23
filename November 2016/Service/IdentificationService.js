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