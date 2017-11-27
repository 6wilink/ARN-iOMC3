// window.location.href
// @2016.12.31
(function($) {
	$.Url = {
    PageWithParams: function() {
      var url = window.location.href;
      var page = url.split('/');
      return page[page.length-1];
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
			if (r != null) return unescape(r[2]); return null;
		},
		// redirect
		Goto: function(url) {
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
			window.opener = null; window.open(".", "_self"); window.close();
			if (window) { window.location.href = "about: blank"; }
		}
	};
}) (jQuery);


// Check values
(function($) {
  $.Val = {
    isValid: function(val) {
      if (val && val != 'undefined' && val != 'null' && val != '') {
        return true;
      }
      return false;
    },
    isArray: function(data) {
      if ($Val.isValid(data)) {
        if (data.length > 0) {
          return true;
        }
      }
      return false;
    },
    isNumber: function(val) {
      return (val == (+val));
    },
    isString: function(val) {
      return (val == val+'');
    }
  }
}) (jQuery);


// Ajax Requests
// 2017.09.13 pickup $.Ajax.Query
(function($) {
  $.Ajax = {
    // done_cb: function(resp);
    // error_cb: function(xhr, status, error);
    Query: function(url, data, done_cb, error_cb, timeout) {
      $.ajax({
        url: url, data: data || null, method: 'post',
        success: done_cb, error: error_cb,
        timeout: timeout || 5000, dataType: 'json',
        //scriptCharset: 'utf-8',
        //contentType: "application/x-www-form-urlencoded; charset=utf-8",
      })
    }
  }
}) (jQuery);


// 2017.09.13 re-write SemanticUI into jQuery.fn.extend
// Handle all SemanticUI operations
(function($) {
  $.extend({
    SUIInit: function() {
      console.log('SematicUI init');
      $('.ui.model').modal({
        inverted: true
      }).modal('hide');

      $(".ui.dropdown").dropdown({
        useLabels: false
      });
      $('.ui.accordion').accordion();
      //$('.ui.popup').popup({ inline: true });

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
