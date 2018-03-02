// window.location.href
// @2016.12.31/2017.11.30
(function($) {
	$.Url = {
		PageWithParams: function() {
			var url = window.location.href;
			var page = url.split('/');
			if ($.Val.IsArray(page) && page.length > 0) {
				return page[page.length - 1];
			}
			return NULL;
		},
		// index.html?x=a or ?x=a
		// index.html#token or #token
		PageOnly: function() {
			var url = $.Url.PageWithParams();
			var page = url.split('#');
			if (page.length < 1) {
				page = url.split('?');
			}
			return page[0];
		},
		// get value by key from url
		Get: function(key) {
			var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) {
				return unescape(r[2]);
			}
			return null;
		},
		// redirect
		GotoAnchor: function(url) {
			$(window.location).attr('href', url);
		}
	},
    $.Tab = {
		// "F5" refresh
		Reload: function() {
			window.location.reload();
		},
		// "^W"
		Close: function() {
			window.opener = null;
			window.open(".", "_self");
			window.close();
			if (window) {
				window.location.href = "about: blank";
			}
		}
	};
})(jQuery);

// Check values
(function($) {
	$.Val = {
		IsValid: function(val) {
			if (val && val != 'undefined' && val != 'null' && val != '') {
				// console.log('$.Val.IsValid said: val =', val);
				return true;
			}
			return false;
		},
		IsArray: function(data) {
			return (data && $.Val.IsValid(data.length));
		},
		IsNumber: function(val) {
            // snatched from the internet
			return (val == (+val));
		},
        IsInt: function(val) {
            // snatched from the internet
            return ($.Val.IsValid(val) && (val % 1 === 0)); 
        },
		IsString: function(val) {
            // snatched from the internet
			return (val == val + ''); 
		}
	}
})(jQuery);

// Ajax Requests
// 2017.09.13 pickup $.Ajax.Query
(function($) {
	$.Ajax = {
		// done_cb: function(resp);
		// error_cb: function(xhr, status, error);
		Query: function(url, data, done_cb, error_cb, timeout) {
			$.ajax({
				url: url,
				data: data,
				method: 'post',
				success: done_cb,
				error: error_cb,
				timeout: timeout || 5000,
				dataType: 'json',
			// scriptCharset: 'utf-8',
			// contentType: "application/x-www-form-urlencoded; charset=utf-8",
			});
		}
	}
})(jQuery);
