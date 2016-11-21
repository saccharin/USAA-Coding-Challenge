class Field
{
	constructor(name, property, dbfield, validate, clean) {
		this.name = name;
		this.property = property;
		this.dbfield = dbfield;
		this.validationFunction = validate;
		this.cleanFunction = clean;
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