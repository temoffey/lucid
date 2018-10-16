'use strict';

var lucid = {
	query: {
		parse: function(string) {

			string = string.split('?');
			string = string[string.length-1];

			var query = {}

			var params = string.split('&');
			for (var i in params) {
				var param = params[i];
				if (param != '') {
					param = param.split('=');
					if (param.length == 1) query[decodeURIComponent(param[0])] = '';
					if (param.length == 2) query[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
				}
			}

			return query;
		},
		sort: function(query) {

			var order = [
				'utm_source',
				'utm_medium',
				'utm_campaign',
				'utm_content',
				'utm_term'
			];

			var keys = [];
			for (var key in query) if (order.indexOf(key) == -1) keys.push(key);
			keys = keys.sort(lucid.query.sort);

			var sort = {}

			for (var i in order) if (typeof query[order[i]] != 'undefined') sort[order[i]] = query[order[i]];
			for (var i in keys) sort[keys[i]] = query[keys[i]];

			return sort;
		},
		stringify: function(query) {

			var params = [];
			for (var key in query) {
				if (query[key] == '') params.push(encodeURIComponent(key));
				if (query[key] != '') params.push(encodeURIComponent(key) + '=' + encodeURIComponent(query[key]));
			}
			var string = params.join('&');

			return string;
		}
	},
	url: {
		parse: function(string) {

			var url = {
				hash: '',
				host: '',
				hostname: '',
				pathname: '',
				port: '',
				protocol: '',
				search: ''
			}

			string = string.split('//');
			if (string.length > 1) url.protocol = string[0];
			string = string[string.length-1];

			string = string.split('/');
			url.host = string.shift();
			string = '/' + string.join('/')

			string = string.split('#');
			if (string.length > 1) url.hash = '#' + string[string.length-1];
			string = string[0];

			string = string.split('?');
			if (string.length > 1) url.search = '?' + string[string.length-1];
			url.pathname = string[0];

			url.host = url.host.split('@');
			url.host = url.host[url.host.length-1];

			url.host = url.host.split(':');
			if (url.host.length > 1) url.port = url.host[url.host.length-1];
			url.hostname = url.host = url.host[0];

			return url;
		},
		domain: function(host) {

			host = host.split('.');
			var domain = '.' + host[host.length-2] + '.' + host[host.length-1];
			if (host[host.length-2] == 'com') domain = '.' + host[host.length-3] + domain;

			return domain;
		},
		stringify: function(url) {

			var string = (url.protocol ? (url.protocol + '//') : '') + url.hostname + (url.port ? (':' + url.port) : '') + url.pathname + url.search + url.hash;

			return string;
		}
	},
	cookie: {
		parse: function(string) {

			var cookie = {}

			return cookie;
		},
		options: function(options = {}) {

			if (typeof options.expires == 'undefined') {
				options.patch = 180 * 24 * 60 * 60;
			}

			if (typeof options.expires == 'number') {
				var date = new Date();
				date.setTime(date.getTime() + options.expires * 1000).toUTCString();
				options.expires = date;
			}

			if (typeof options.patch == 'undefined') {
				options.patch = '/';
			}

			if (typeof options.domain == 'undefined') {
				options.domain = liucid.url.domain(window.location.host);
			}

			return options;
		},
		stringify: function(name, value, options = {}) {

			var params = [];
			params.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
			for (var option in options) params.push(option + '=' + options[option]);
			var string = params.join('; ');

			return string;
		}
	}
}

function UTM() {

	this.data = {}

	this.source = {
		'.*': {
			'utm_medium': 'referral'
		},
		'yandex\.\w+$': {
			'utm_source': 'yandex.ru',
			'utm_medium': 'organic'
		},
		'google\.\w+$': {
			'utm_source': 'google.ru',
			'utm_medium': 'organic'
		},
		'go\.mail\.ru$': {
			'utm_source': 'mail.ru',
			'utm_medium': 'organic'
		},
		'vk\.com$': {
			'utm_source': 'vk.com',
			'utm_medium': 'social'
		},
		'facebook\.com$': {
			'utm_source': 'facebook.com',
			'utm_medium': 'social'
		},
		'twitter\.com$': {
			'utm_source': 'twitter.com',
			'utm_medium': 'social'
		},
		'instagramm\.com$': {
			'utm_source': 'instagramm.com',
			'utm_medium': 'social'
		},
		'^$': {
			'utm_source': '(direct)',
			'utm_medium': '(none)'
		}
	}

	this.set = function(key, value) {

		this.data[key] = value;

		return this;
	}

	this.get = function(key) {

		if (typeof this.data[key] == 'undefined') return null;

		return this.data[key];
	}

	this.load = function(search = null) {

		if (search === null) search = window.location.search;

		this.data = lucid.query.parse(search);

		return this;
	}

	this.check = function(utm = false) {

		if (utm) return (typeof this.data['utm_source'] != 'undefined') && (typeof this.data['utm_medium'] != 'undefined');
		if (!utm) for (var key in this.data) return true;

		return false;
	}

	this.gen = function(referrer = null) {

		if (referrer === null) referrer = document.referrer;

		referrer = lucid.url.parse(referrer);

		if ((referrer.host != '') && (lucid.url.domain(referrer.host) != lucid.url.domain(window.location.host))) {

			this.data['utm_source'] = referrer.host;

			for (var pattern in source) {
				var values = source[pattern];
				var pattern = new RegExp(pattern);

				if (referrer.host.search(pattern) > -1) {
					for (var key in values) {
						this.data[key] = values[key];
					}
				}
			}
		}

		return this;
	}

	this.cookie = function(name) {

		var value = lucid.query.sort(this.data);
		value = lucid.query.stringify(value);
		var options = lucid.cookie.options();
		var cookie = lucid.cookie.stringify(name, value, options);

		document.cookie = cookie;

		return this;
	}

	this.link = function(pattern = null, selector = null) {

		if (selector == null) selector = 'a';

		var elements = document.querySelectorAll(selector);

		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var pattern = new RegExp(pattern);

			if (element.attributes.href.value.search(pattern) > -1) {
				var params = lucid.query.parse(element.search);

				if (typeof params['utm_content'] != 'undefined') {
					var term = this.get('utm_term');
					this.set('utm_term', term + '_' + params['utm_content']);
					var search = lucid.query.sort(this.data);
					element.search = lucid.query.stringify(search);
					this.set('utm_term', term);
				} else {
					var search = lucid.query.sort(this.data);
					element.search = lucid.query.stringify(search);
				}
			}
		}

		var element = document.querySelector('[name=link]');

		if (element && (['', 'null', 'false'].indexOf(element.value) == -1)) {
			var url = lucid.url.parse(element.value);
			var params = lucid.query.parse(url.search);

			if (typeof params['utm_content'] != 'undefined') {
				var term = this.get('utm_term');
				this.set('utm_term', term + '_' + params['utm_content']);
				var search = lucid.query.sort(this.data);
				url.search = '?' + lucid.query.stringify(search);
				this.set('utm_term', term);
			} else {
				var search = lucid.query.sort(this.data);
				url.search = '?' + lucid.query.stringify(search);
			}

			element.value = lucid.url.stringify(url);
		}

		return this;
	}
}

window.document.addEventListener('DOMContentLoaded', function(event) {

	var utm = new UTM();
	utm.load();
	if (!utm.check(true)) utm.gen();

	var landing = 'landing';

	var term = utm.get('utm_term');
	if (term) utm.set('utm_term', term + '_' + landing);

	var element = document.querySelector('[name=landing]');
	if (element) landing += '_' + element.value;

	var pathname = window.location.pathname.split('/');
	if (!element && (pathname[1] == 'promo')) landing += '_' + pathname[2];

	var hostname = window.location.hostname;
	if (!element && (pathname[1] != 'promo')) landing += '_' + hostname;

	utm.set('utm_term', landing);

	var partner = utm.get('partner');
	if (!partner) utm.set('partner', landing);

	utm.cookie('advertInfo');
	utm.link('fonbet\.(ru|kz|com\.cy)\/');

	if (navigator.userAgent.search(/android|phone|mobile/i) > -1) {

		var elements = document.querySelectorAll('a');

		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];

			if (elements[i].hash.search(/#!\/account\/registration/) > -1) {
				elements[i].pathname = '/mobile/registration/start';
				elements[i].hash = '';
			}
		}
	}

});