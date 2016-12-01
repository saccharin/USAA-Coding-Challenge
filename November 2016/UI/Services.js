// Services.js

class Services {
	
	constructor(baseUrl, apiKey, chaosMonkey) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.chaosMonkey = chaosMonkey || 0;
	}
	
	getServiceUrl(api, service) {
		var svc = this.baseUrl + api;
		if(service)
			svc += '?service=' + service;
		return svc;
	}
	
	buildAjaxRequest(url, id, onSuccess, onError) {
		return {
			url: url,
			method: 'GET',
			data: { id: id, chaosMonkey: this.chaosMonkey },
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