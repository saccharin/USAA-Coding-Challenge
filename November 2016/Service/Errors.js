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
		
		else if (typeof err == "object" && err.length > 0) {
			this[key] = this[key].concat(err);
			this.hasError = true;
		}
	}
}