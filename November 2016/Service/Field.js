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