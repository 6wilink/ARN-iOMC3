/*
* by Qige <qigezhao@gmail.com>
* 2017.09.07 SementicUI|$.App|$.SementicUI|$.Install
*/
(function($) {
  $.App = {
    init: function() {
      console.log('$.App.init()');
      // hide & show sth.
      $.Install.init();
    },
    start: function() {
      // start step_I
      $.Install.start();
    },
    bind: function() {
      // buttons, hide & show sth.
      $("#qz-btn-env-ok").click(function() {
        $('#qz-env-h5js').hide();
        $("#qz-app").show();
      });
      $("#qz-s1-btn-next").click(function(){
        console.log('STEP_I.Next');
        $.Install.step_II();
      });
      $("#qz-s2-btn-next").click(function(){
        console.log('STEP_II.Next');
        $.Install.step_III();
      });
      $("#qz-s2-btn-prev").click(function() {
        console.log('STEP_II.Prev');
        $.Install.step_I();
      });
      $("#qz-s3-btn-next").click(function(){
        console.log('STEP_III.Next');
        $.Install.step_done();
      });
      $("#qz-s3-btn-prev").click(function() {
        console.log('STEP_III.Prev');
        $.Install.step_II();
      });
      $("#qz-s1-btn-reinstall").click(function() {
        $.SementicUI.btn_disable($(this));
        $.Install.reinstall();
      });
      $("#qz-s2-btn-copy").click(function() {
        $.SementicUI.btn_disable($(this));
        $.Install.copy_files();
      });
      $("#qz-s2-btn-default").click(function() {
        $.SementicUI.btn_disable($(this));
        $.SementicUI.step_II_default();
        $("#qz-s2-btn-copy").trigger('click');
      });
      $("#qz-s3-btn-import").click(function() {
        $.SementicUI.btn_disable($(this));
        $.Install.database_import();
      });
      $("#qz-s3-btn-default").click(function() {
        $.SementicUI.btn_disable($(this));
        $.SementicUI.step_III_default();
        $("#qz-s3-btn-import").trigger('click');
      });
    }
  }
}) (jQuery);

// Handle all ARN.OMC3.Install processes
(function($) {
  $.Install = {
    init: function() {
      console.log('$.Install.init()');
      console.log('(todo) hide html5/javascript, show app');
      
      $.SementicUI.init();
    },
    start: function() {
      $.Install.step_I();
    },
    step_I: function() {
      console.log('$.Install.step_I');
      $.SementicUI.tips_info($("#qz-s1-info"), '请确认下列检查均已经成功完成，然后点击“下一步”');
      $.SementicUI.progress_increase($("#qz-s1-progress"));
      $.SementicUI.progress_increase($("#qz-s1-progress"));
      $.SementicUI.progress_increase($("#qz-s1-progress"));
      $.SementicUI.progress_increase($("#qz-s1-progress"));
      $.SementicUI.step_I();
      $.ajax.step_I();
    },
    step_II: function() {
      console.log('$.Install.step_II');
      $.SementicUI.step_II();
    },
    step_III: function() {
      console.log('$.Install.step_III');
      $.SementicUI.step_III();
    },
    step_done: function() {
      console.log('Installation completed! Redirect to index.html in 30 seconds');
    },
    copy_files: function() {
      $.ajax.step_II();

      // if all ok
      // simulate Ajax requests, parse result
      setTimeout(function() {
        $.SementicUI.progress_increase($("#qz-s2-progress"));
      }, 100);
      setTimeout(function() {
        $.SementicUI.progress_increase($("#qz-s2-progress"));
      }, 200);
      setTimeout(function() {
        $.SementicUI.progress_increase($("#qz-s2-progress"));
      }, 300);
      setTimeout(function() {
        {
          $.SementicUI.progress_increase($("#qz-s2-progress"));
          $.SementicUI.btn_enable($("#qz-s2-btn-next"));
          $.SementicUI.btn_primary($("#qz-s2-btn-next"));
          $.SementicUI.btn_normal($("#qz-s2-btn-copy"));
        }
      }, 600);
      
      // something wrong
    },
    reinstall: function() {
      console.log('$.Install.reinstall()');
    },
    database_import: function() {
      $.ajax.step_III();
      $.SementicUI.btn_enable($("#qz-s3-btn-next"));
      $.SementicUI.btn_primary($("#qz-s3-btn-next"));
      $.SementicUI.btn_normal($("#qz-s3-btn-import"));
      $.SementicUI.progress_increase($("#qz-s3-progress"));
      $.SementicUI.progress_increase($("#qz-s3-progress"));
      $.SementicUI.progress_increase($("#qz-s3-progress"));
      $.SementicUI.progress_increase($("#qz-s3-progress"));
    }
  }
}) (jQuery);

// Handle all SementicUI operations
(function($) {
  $.SementicUI = {
    progress_increase: function(obj) {
      if (obj) {
        obj.progress('increment');
      }
    },
    progress_decrease: function(obj) {
      if (obj) {
        obj.progress('decrement');
      }
    },
    init: function() {
      console.log('$.SementicUI.init()');
      $.SementicUI.btn_disable($("#qz-s2-btn-next"));
      $.SementicUI.btn_disable($("#qz-s3-btn-next"));
    },
    step_I: function() {
      console.log('$.SementicUI.step_I()');
      $("#qz-nav-s1").removeClass("disabled").addClass("active");
      $("#qz-nav-s2").removeClass("active").addClass("disabled");
      $("#qz-nav-s3").removeClass("active").addClass("disabled");
      $("#qz-block-s1").show();
      $("#qz-block-s2").hide();
      $("#qz-block-s3").hide();
      $.SementicUI.btn_enable($("#qz-s2-btn-copy"));
    },
    step_II: function() {
      $("#qz-nav-s1").removeClass("disabled active");
      $("#qz-nav-s2").removeClass("disabled").addClass("active");
      $("#qz-nav-s3").removeClass("active").addClass("disabled");
      $("#qz-block-s1").hide();
      $("#qz-block-s2").show();
      $("#qz-block-s3").hide();
      $.SementicUI.btn_enable($("#qz-s3-btn-import"));
    },
    step_II_default: function() {
      $("#qz-s2-app-path").val('/var/html/www/iOMC3/');
    },
    step_III: function() {
      $("#qz-nav-s1").removeClass("disabled active");
      $("#qz-nav-s2").removeClass("disabled active");
      $("#qz-nav-s3").removeClass("disabled").addClass("active");
      $("#qz-block-s1").hide();
      $("#qz-block-s2").hide();
      $("#qz-block-s3").show();
    },
    step_III_default: function() {
      $("#qz-s3-db-ip").val('127.0.0.1');
      $("#qz-s3-db-user").val('root');
      $("#qz-s3-db-passwd").val('');
    },
    btn_primary: function(obj) {
      if (obj) {
        obj.addClass('primary');
      }
    },
    btn_normal: function(obj) {
      if (obj) {
        obj.removeClass('primary');
      }
    },
    btn_enable: function(obj) {      
      if (obj) {
        obj.attr('disabled', false);
      }
    },
    btn_disable: function(obj) {
      if (obj) {
        obj.attr('disabled', true);
      }
    },
    tips_success: function(obj, msg) {      
      if (obj) {
        obj.html('<p>' + msg + '</p>');
        obj.removeClass('info error warning').addClass('success');
      }      
    },
    tips_error: function(obj, msg) {      
      if (obj) {
        obj.html('<p>' + msg + '</p>');
        obj.removeClass('info warning success').addClass('error');
      }      
    },
    tips_warning: function(obj, msg) {
      if (obj) {
        obj.html('<p>' + msg + '</p>');
        obj.removeClass('info error success').addClass('warning');
      }      
    },
    tips_info: function(obj, msg) {
      if (obj) {
        obj.html('<p>' + msg + '</p>');
        obj.removeClass('warning error success').addClass('info');
      }
    }
  }
}) (jQuery);

(function($) {
  $.ajax = {
    step_I: function() {
      console.log('$.ajax.step_I()');
      $("#qz-s1-mask").addClass('active');
      setTimeout(function() {
        {
          $("#qz-s1-mask").removeClass('active');
          $.SementicUI.tips_success($("#qz-s1-info"), '检查全部符合要求，请点击“下一步”');
        }
      }, 1000);
    },
    step_II: function() {
      console.log('$.ajax.step_II')
      $("#qz-s2-mask").addClass('active');
      setTimeout(function() {
        {
          $("#qz-s2-mask").removeClass('active');
          $.SementicUI.tips_success($("#qz-s2-info"), '文件全部拷贝完成，请点击“下一步”');
        }
      }, 1000);
    },
    step_III: function() {
      console.log('$.ajax.step_III')
      $("#qz-s3-mask").addClass('active');
      setTimeout(function() {
        {
          $("#qz-s3-mask").removeClass('active');
          $.SementicUI.tips_success($("#qz-s2-info"), '数据库初始化成功，iOMC3服务已就绪。请点击“开始使用”');
        }
      }, 1000);
    }
  }
}) (jQuery);

// ARN.OMC3.Install
$(function() {
  // call App, then wait for user click/input
  $.App.init();
  // bind events
  $.App.bind();
  $.App.start();
  
  // now wait for user click/input
});
