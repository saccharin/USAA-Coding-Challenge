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