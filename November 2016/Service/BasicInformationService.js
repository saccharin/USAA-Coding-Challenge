class BasicInformationService extends PortalMemberService
{
	constructor(dynamo, event, context) {
		super(dynamo, event, context);
	}
	
	getFields() {
		return [
			new Field('First Name', 'FirstName', 'firstname', 
				function(value) {
					if(value == null || value == '')
						return 'The member\'s First Name cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				}),
			new Field('Last Name', 'LastName', 'lastname', 
				function(value) {
					if(value == null || value == '')
						return 'The member\'s Last Name cannot be blank';
				},
				function(value) {
					return (value || '').trim();
				}),
			
		];
	}
}