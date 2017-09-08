/*
* by Qige <qigezhao@gmail.com>
* 2017.09.07 SementicUI|$.App|$.SementicUI|$.Install
*
* TODO:
*     1. Remove "DBG_MODAL" button;
*     2. Read & valid "input:text" before send Ajax requests;
*
* Fixed:
*     1. Step_II.Prev takes too much time; Qige@2017.09.08
*     2. Progress bar: invalid after "reset"; Qige@2017.09.08
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
      /*
      $("#qz-btn-env-ok").click(function() {
        $('#qz-env-h5js').hide();
        $("#qz-app").show();
      });
      */
      $("#qz-btn-model").click(function() {
        $("#qz-s4-congrates").modal('show');
      }),
      $("#qz-s1-btn-recheck").click(function(){
        $.Install.recheck();
      });
      $("#qz-s2-btn-prev").click(function() {
        console.log('STEP_II.Prev');
        $.Install.step_I();
      });
      $("#qz-s1-btn-reinstall").click(function() {
        $.SementicUI.btn_disable($(this));
        $.Install.reinstall();
      });
      $("#qz-s1-btn-next").click(function(){
        console.log('STEP_I.Next');
        $.Install.step_II();
      });
      $("#qz-s3-btn-prev").click(function() {
        console.log('STEP_III.Prev');
        $.Install.step_II();
      });
      $("#qz-s2-btn-copy").click(function() {
        $.Install.copy_files();
      });
      $("#qz-s2-btn-default").click(function() {
        $.Install.copy_files_default();
        $("#qz-s2-btn-copy").trigger('click');
      });
      $("#qz-s2-btn-next").click(function(){
        console.log('STEP_II.Next');
        $.Install.step_III();
      });
      $("#qz-s3-btn-next").click(function(){
        console.log('STEP_III.Next');
        $.Install.step_done();
      });
      $("#qz-s3-btn-import").click(function() {
        $.Install.database_import();
      });
      $("#qz-s3-btn-default").click(function() {
        $.Install.database_import_default();
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
      $.ajax.step_I();
    },
    recheck: function() {
      $.Install.start();
    },
    step_I: function() {
      console.log('$.Install.step_I');
      $.SementicUI.step_I();
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
      $("#qz-s4-congrates").modal('show');
    },
    reinstall: function() {
      console.log('$.Install.reinstall()');
    },
    copy_files: function() {
      $.SementicUI.btn_disable($("#qz-s2-btn-copy"));
      $.SementicUI.btn_disable($("#qz-s2-btn-default"));
      
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
        }
      }, 600);
      
      // something wrong
    },
    copy_files_default: function() {
      $.SementicUI.text_val($("#qz-s2-app-path"), '/var/www/html/iOMC3/');
      $.Install.copy_files();
    },
    database_import: function() {
      $.SementicUI.btn_disable($("#qz-s3-btn-import"));
      $.SementicUI.btn_disable($("#qz-s3-btn-default"));
      $.ajax.step_III();
    },
    database_import_default: function() {
      $.SementicUI.text_val($("#qz-s3-db-ip"), '127.0.0.1');
      $.SementicUI.text_val($("#qz-s3-db-user"), 'root');
      $.SementicUI.text_val($("#qz-s3-db-passwd"), '');
      $.Install.database_import();
    }
  }
}) (jQuery);

// Handle all SementicUI operations
(function($) {
  $.SementicUI = {
    init: function() {
      console.log('$.SementicUI.init()');
      $.SementicUI.progress_reset($("#qz-s1-progress"));
      $.SementicUI.btn_disable($("#qz-s1-btn-next"));
      $.SementicUI.progress_reset($("#qz-s2-progress"));
      $.SementicUI.btn_disable($("#qz-s2-btn-next"));
      $.SementicUI.progress_reset($("#qz-s3-progress"));
      $.SementicUI.btn_disable($("#qz-s3-btn-next"));
      $('.ui.model').modal({
        inverted: true
      }).modal('hide');
    },
    step_I: function() {
      console.log('$.SementicUI.step_I()');
      $.SementicUI.progress_reset($("#qz-s1-progress"));
      $("#qz-nav-s1").removeClass("disabled").addClass("active");
      $("#qz-nav-s2").removeClass("active").addClass("disabled");
      $("#qz-nav-s3").removeClass("active").addClass("disabled");
      $("#qz-block-s1").show();
      $("#qz-block-s2").hide();
      $("#qz-block-s3").hide();
    },
    step_II: function() {
      $.SementicUI.progress_reset($("#qz-s2-progress"));
      $("#qz-nav-s1").removeClass("disabled active");
      $("#qz-nav-s2").removeClass("disabled").addClass("active");
      $("#qz-nav-s3").removeClass("active").addClass("disabled");
      $("#qz-block-s1").hide();
      $("#qz-block-s2").show();
      $("#qz-block-s3").hide();
    },
    step_III: function() {
      $.SementicUI.progress_reset($("#qz-s3-progress"));
      $("#qz-nav-s1").removeClass("disabled active");
      $("#qz-nav-s2").removeClass("disabled active");
      $("#qz-nav-s3").removeClass("disabled").addClass("active");
      $("#qz-block-s1").hide();
      $("#qz-block-s2").hide();
      $("#qz-block-s3").show();
    },
    progress_reset: function(obj) {
      if (obj) {
        obj.removeClass('success').addClass('active').progress('reset');
      }
    },
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
    text_val: function(obj, val) {
      if (obj) {
        obj.val(val);
      }
    },
    item_wait: function(obj, text) {
      if (obj) {
        obj.find('.icon').removeClass('remove red checkmark green').addClass('wait grey');
        obj.find('.description').html(text);
      }
    },
    item_pass: function(obj, text) {
      if (obj) {
        obj.find('.icon').removeClass('wait grey remove red').addClass('checkmark green');
        obj.find('.description').html(text);
      }
    },
    item_failed: function(obj, text) {
      if (obj) {
        obj.find('.icon').removeClass('wait grey checkmark green').addClass('remove red');
        obj.find('.description').html(text);
      }
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
          $.SementicUI.tips_info($("#qz-s1-info"), '请确认下列检查均已经成功完成，然后点击“下一步”');
          $.SementicUI.item_pass($("#qz-s1-f1"), '未锁定');
          $.SementicUI.progress_increase($("#qz-s1-progress"));
          $.SementicUI.item_failed($("#qz-s1-f2"), '不符合要求：缺少组件“php_gd2”');
          $.SementicUI.progress_increase($("#qz-s1-progress"));
          $.SementicUI.item_wait($("#qz-s1-f3"), '由于条件不满足，停止检查');
          $("#qz-s1-mask").removeClass('active');
          $.SementicUI.tips_success($("#qz-s1-info"), '检查全部符合要求，请点击“下一步”');
          $.SementicUI.btn_enable($("#qz-s1-btn-next"));
          //$.SementicUI.btn_enable($("#qz-s2-btn-copy"));
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
          $.SementicUI.btn_enable($("#qz-s2-btn-next"));
          //$.SementicUI.btn_enable($("#qz-s3-btn-import"));
          $.SementicUI.btn_primary($("#qz-s2-btn-next"));
          $.SementicUI.btn_normal($("#qz-s2-btn-copy"));
          $.SementicUI.btn_normal($("#qz-s2-btn-default"));
        }
      }, 1000);
    },
    step_III: function() {
      console.log('$.ajax.step_III')
      $("#qz-s3-mask").addClass('active');
      setTimeout(function() {
        {
          $("#qz-s3-mask").removeClass('active');
          $.SementicUI.tips_success($("#qz-s3-info"), '数据库初始化成功，iOMC3服务已就绪。请点击“开始使用”');
          $.SementicUI.btn_enable($("#qz-s3-btn-next"));
          $.SementicUI.btn_primary($("#qz-s3-btn-next"));
          $.SementicUI.btn_normal($("#qz-s3-btn-import"));
          $.SementicUI.progress_increase($("#qz-s3-progress"));
          $.SementicUI.progress_increase($("#qz-s3-progress"));
          $.SementicUI.progress_increase($("#qz-s3-progress"));
          $.SementicUI.progress_increase($("#qz-s3-progress"));
          $.SementicUI.btn_primary($("#qz-s3-btn-next"));
          $.SementicUI.btn_normal($("#qz-s3-btn-default"));
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
