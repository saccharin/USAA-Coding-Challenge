// Services.js

class Services {
	
	constructor(baseUrl, apiKey, chaosMonkey) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.chaosMonkey = chaosMonkey || 0;
	}
	
	getServiceUrl(service) {
		return this.baseUrl + service;
	}
	
	buildAjaxRequest(url, id, onSuccess, onError) {
		return {
			url: url,
			data: { id: id, chaosMonkey: this.chaosMonkey },
			contentType: 'application/json',
			headers: { 'x-api-key': this.apiKey },
			success: onSuccess,
			error: onError
		};
	}
	
	getBasicInformation(id, onSuccess, onError) {
		$.ajax(this.buildAjaxRequest(
			this.getServiceUrl('basic-information'),
			id, onSuccess, onError)
			);
	}
	
	getMilitaryService(id, onSuccess, onError) {
		$.ajax(this.buildAjaxRequest(
			this.getServiceUrl('military-service'),
			id, onSuccess, onError)
			);
	}
	
	getIdentifications(id, onSuccess, onError) {
		$.ajax(this.buildAjaxRequest(
			this.getServiceUrl('identifications'),
			id, onSuccess, onError)
			);
	}
	
	getProducts(id, onSuccess, onError) {
		$.ajax(this.buildAjaxRequest(
			this.getServiceUrl('products'),
			id, onSuccess, onError)
			);
	}
		
}