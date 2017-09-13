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

// 2017.09.13 re-write SemanticUI into jQuery.fn.extend
// Handle all SemanticUI operations
(function($) {
  $.extend({
    SUIInit: function() {
      $('.ui.model').modal({
        inverted: true
      }).modal('hide');
      
      return this;
    }    
  });
  $.fn.extend({
    BtnEnable: function() {
      this.each(function() {
        $(this).attr('disabled', false);
      });
      return this;
    },
    BtnDisable: function() {
      this.each(function() {
        $(this).attr('disabled', true);
      });
      return this;
    },
    SUIBtnPrimary: function() {
      this.each(function() {
        $(this).addClass('primary');
      });
      return this;
    },
    SUIBtnNormal: function() {
      this.each(function() {
        $(this).removeClass('primary');
      });
      return this;
    },
    SUIProgressReset: function() {
      this.each(function() {
        $(this).removeClass('success').addClass('active').progress('reset');          
      });
      return this;
    },
    SUIProgressIncrease: function(obj) {
      this.each(function() {
        $(this).progress('increment');          
      });
      return this;
    },
    SUIProgressDecrease: function(obj) {
      this.each(function() {
        $(this).progress('decrement');          
      });
      return this;
    },
    SUIListItemWait: function(text) {
      this.each(function() {
        $(this).find('.icon').removeClass('remove red checkmark green').addClass('wait grey');
        $(this).find('.description').html(text);
      });
      return this;
    },
    SUIListItemSuccess: function(text) {
      this.each(function() {
        $(this).find('.icon').removeClass('wait grey remove red').addClass('checkmark green');
        $(this).find('.description').html(text);
      });
      return this;
    },
    SUIListItemFailed: function(text) {
      this.each(function() {
        $(this).find('.icon').removeClass('wait grey checkmark green').addClass('remove red');
        $(this).find('.description').html(text);
      });
      return this;
    },
    SUIMessageSuccess: function(msg) {      
      this.each(function() {
        $(this).html('<p>' + msg + '</p>');
        $(this).removeClass('info error warning').addClass('success');
      });
      return this;
    },
    SUIMessageError: function(msg) {      
      this.each(function() {
        $(this).html('<p>' + msg + '</p>');
        $(this).removeClass('info warning success').addClass('error');
      });
      return this;
    },
    SUIMessageWarning: function(msg) {
      this.each(function() {
        $(this).html('<p>' + msg + '</p>');
        $(this).removeClass('info error success').addClass('warning');
      });
      return this;
    },
    SUIMessageInfo: function( msg) {
      this.each(function() {
        $(this).html('<p>' + msg + '</p>');
        $(this).removeClass('warning error success').addClass('info');
      });
      return this;
    },
    SUILoaderHide: function() {
      this.each(function() {
        $(this).removeClass('active');
      });
      return this;
    },
    SUILoaderShow: function() {
      this.each(function() {
        $(this).addClass('active');
      });
      return this;
    }
  });
}) (jQuery);
