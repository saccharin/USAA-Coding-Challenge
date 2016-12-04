// Services.js

class Services {
	
	constructor(baseUrl, apiKey, chaosMonkey) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.chaosMonkey = chaosMonkey || 0;
	}
	
	getServiceUrl(api, service) {
		var svc = this.baseUrl + api + '?';
		
		var extras = [];
		if(service)
			extras.push('service=' + service);
		if(this.chaosMonkey && this.chaosMonkey > 0)
			extras.push('chaosMonkey=' + chaosMonkey.toString());
		
		svc = svc + extras.join('&');
		
		return svc;
	}
	
	buildAjaxRequest(url, id, onSuccess, onError, data) {
		var body = data || {};
		body.id = id;
		//body.chaosMonkey = this.chaosMonkey;
		
		return {
			url: url,
			method: 'GET',
			data: body,
			contentType: 'application/json',
			headers: { 'x-api-key': this.apiKey },
			success: onSuccess,
			error: onError
		};
	}
	buildAjaxPutRequest(url, onSuccess, onError, data) {
		data = data || {};
		data.chaosMonkey = this.chaosMonkey;
		
		return {
			url: url,
			type: 'PUT',
			data: JSON.stringify(data),
			contentType: 'application/json',
			headers: { 'x-api-key': this.apiKey },
			success: onSuccess,
			error: onError
		};
	}
	
	getBasicInformation(id, onSuccess, onError) {
		$.ajax(this.buildAjaxRequest(
			this.getServiceUrl('member-information', 'basicinformation'),
			id, onSuccess, onError)
			);
	}
	
	getMilitaryService(id, onSuccess, onError) {
		$.ajax(this.buildAjaxRequest(
			this.getServiceUrl('member-information', 'militaryservice'),
			id, onSuccess, onError)
			);
	}
	
	getIdentifications(id, onSuccess, onError) {
		$.ajax(this.buildAjaxRequest(
			this.getServiceUrl('member-information', 'identifications'),
			id, onSuccess, onError)
			);
	}
	
	getProducts(id, onSuccess, onError) {
		$.ajax(this.buildAjaxRequest(
			this.getServiceUrl('member-information', 'products'),
			id, onSuccess, onError)
			);
	}
	
	getEmployment(id, onSuccess, onError) {
		$.ajax(this.buildAjaxRequest(
			this.getServiceUrl('member-information', 'employmentinformation'),
			id, onSuccess, onError)
			);
	}
	putEmployment(id, data, onSuccess, onError) {
		console.log(arguments);
		$.ajax(this.buildAjaxPutRequest(
			this.getServiceUrl('member-information', 'employmentinformation'),
			onSuccess, onError, data)
			);
	}
	
	postSearch(searchTerm, onSuccess, onError) {
		$.ajax({
			url: this.getServiceUrl('search'),
			type: 'POST',
			data: JSON.stringify({ search: searchTerm, chaosMonkey: this.chaosMonkey }),
			contentType: 'application/json',
			headers: { 'x-api-key': this.apiKey },
			success: onSuccess,
			error: onError
		});
	}
		
}