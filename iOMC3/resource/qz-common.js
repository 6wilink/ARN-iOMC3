// window.location.href
// @2016.12.31
(function($) {
	$.url = {
		// get value by key from url
		get: function(key) {
			var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]); return null;
		},
		// redirect
		goto: function(url, reason) {
			if (confirm('Will leave current page due to ' + reason)) {
					$(window.location).attr('href', url);
			}
		}
  },
  tab = {
		// "F5" refresh
		reload: function() {
			window.location.reload();
		},
		// "^W"
		close: function() {
			window.opener = null; window.open(".", "_self"); window.close();
			if (window) { window.location.href = "about: blank"; }
		}
	};
}) (jQuery);