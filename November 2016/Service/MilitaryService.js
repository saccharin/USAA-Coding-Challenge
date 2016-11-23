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