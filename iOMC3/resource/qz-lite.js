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

// Handle url/signin/token/devices/maps/options
(function($) {
  $.Lite = {
    // TOKEN/Timer handles
    data: {
    },
    Init: function() {
      $.LiteUI.Init();
    },
    Start: function() {
      $.Lite.Init();
      $.Lite.Signin();
    },
    Signin: function() {
      $.LiteUI.Nav.Signin();
    },
    // display Devices/Maps/Options after valid [TOKEN]
    Devices: function() {
      $.LiteUI.Nav.Devices();
    },
    DevicesStatus: function() {      
      var ts = new Date().toTimeString();
      $("#qz-devices-status").SUIMessageSuccess('设备列表已更新 @'+ts).show();
    },
    // Update device details via Ajax
    DeviceUpdate: function(did) {
      console.log('$.Lite.DeviceUpdate() did=', did);
      if (did) {
        
      }
    },
    Maps: function() {
      $.LiteUI.Nav.Maps();
    },
    Options: function() {
      $.LiteUI.Nav.Options();
    },
    CB_SigninError: function(xhr, status, error) {
      console.log('$.Request.CB_SigninError()');
      $("#qz-signin-message").SUIMessageError('通信错误，请重试').show();
      $("#qz-signin-mask").SUILoaderHide();
      $("#qz-signin-btn-go,#qz-signin-btn-default").BtnEnable();
    },
    CB_SigninDone: function(resp) {
      var error = (resp && resp.error) ? resp.error : '404';
      console.log('error =', error);      
      switch(error) {
        case 'epasswd':
          $("#qz-signin-message").SUIMessageError('用户名或密码不正确，请重试').show();
          break;
        case 'none':
          $("#qz-signin-message").SUIMessageSuccess('登录成功，正在载入数据').show();
          var token = resp.auth.token;
          console.log('token = ', token);
          $.Lite.data.TOKEN = token;
          setTimeout(function() {
            $.Lite.Devices();            
          }, 1000);
          break;
        case '404':
        default:
          $("#qz-signin-message").SUIMessageError('通信失败，请重试').show();
          break;
      }
      $("#qz-signin-mask").SUILoaderHide();
    },
    Bind: function() {
      $("#qz-nav-devices").click(function() {
        $.Lite.Devices();
      });
      $("#qz-nav-options").click(function() {
        $.Lite.Options();
      });
      $("#qz-nav-maps").click(function() {
        $.Lite.Maps();
      });
      
      // Signin
      $("#qz-signin-user,#qz-signin-passwd").focus(function() {
        $(this).select();
      }).change(function() {
        var user = $("#qz-signin-user").val();
        var passwd = $("#qz-signin-passwd").val();
        if (user == '' && passwd == '') {
          $("#qz-signin-btn-go").BtnDisable();
        } else {
          $("#qz-signin-btn-go").BtnEnable();
        }
      })
      $("#qz-signin-btn-go").click(function() {
        var user = $("#qz-signin-user").val();
        var passwd = $("#qz-signin-passwd").val();
      $("#qz-signin-btn-go,#qz-signin-btn-default").BtnDisable();
        $.Request.Signin(user, passwd, $.Lite.CB_SigninDone, $.Lite.CB_SigninError);
      });
      $("#qz-signin-btn-default").click(function() {
        $("#qz-btn-signin-default").BtnDisable();
        $("#qz-signin-user").val('admin');
        $("#qz-signin-passwd").val('6wilink');
        $("#qz-signin-btn-go").BtnEnable();
        $("#qz-signin-btn-go").trigger('click');
      });

      // Nav [SEARCH]
      $("#qz-nav-text-keyword").focus(function() {
        $(this).select();
      }).keydown(function(e) {
        //console.log('search when hit ENTER');
        if (e.keyCode == 13) {
          $(this).select();
          $("#qz-nav-btn-search").trigger('click');
          $("#qz-devices-text-keyword").select();
        }
      });
      // wrapper of Devices.Search
      $("#qz-nav-btn-search").click(function() {
        var keyword = $("#qz-nav-text-keyword").val();
        console.log('qz-nav-text-keyword =', keyword);
        // Devices.Search
        $("#qz-nav-devices").trigger("click");
        $("#qz-devices-text-keyword").val(keyword);
        $("#qz-devices-btn-search").trigger('click');
      });
      
      // search when keyword/pattern not empty
      // Devices [SEARCH]
      $("#qz-devices-text-keyword").focus(function() {
        $(this).select();
      }).keydown(function(e) {
        //console.log('search when hit ENTER');
        if (e.keyCode == 13) {
          $(this).select();
          $("#qz-devices-btn-search").trigger('click');
        }
      });
      $("#qz-devices-btn-search").click(function() {
        var keyword = $("#qz-devices-text-keyword").val();
        console.log('qz-devices-text-keyword =', keyword);

        // TODO: load devices list here
        $("#qz-devices-search").addClass("loading");
        $("#qz-devices-list-header").nextAll().remove();
        // Ajax search keyword, then update Devices [LIST]
        // qz-common.js: $.Ajax.Query(url, data, done_cb, error_cb);
        //$.Ajax.Query();
        $.Ajax.Query(
          '/iOMC3/lite.php?do=devices&keyword='+keyword, null, 
          $.Lite.CB_DevicesDone, $.Lite.CB_DevicesError
        );
      });
      
      // Devices.[Tab]
      $("#qz-device-base").click(function() {
        $.LiteUI.Device.Base();
      });
      $("#qz-device-wireless").click(function() {
        $.LiteUI.Device.Wireless();
      });
      $("#qz-device-network").click(function() {
        $.LiteUI.Device.Network();
      });
      $("#qz-device-links").click(function() {
        $.LiteUI.KPI.Links();
      });
      $("#qz-device-thrpt").click(function() {
        $.LiteUI.KPI.Thrpt();
      });
      $("#qz-device-btn-config").click(function() {
        $.LiteUI.Config.Show();
      });
      $("#qz-device-btn-config-save").click(function() {
        // save, prompt, hide
        //$.LiteUI.Config.Save();
      });
      $("#qz-device-btn-config-done").click(function() {
        // save, prompt, hide
        $.LiteUI.Config.Hide();
      });
      $("#qz-device-config-basic").click(function() {
        $.LiteUI.Config.Basic();
      });
      $("#qz-device-config-wireless").click(function() {
        $.LiteUI.Config.Wireless();
      });
      $("#qz-device-config-advanced").click(function() {
        $.LiteUI.Config.Advanced();
      });
      $("#qz-options-tools").click(function() {
        $.LiteUI.Options.Tools();
      });
      $("#qz-options-services").click(function() {
        $.LiteUI.Options.Services();
      });
      
      // Combined keywords: 
      // Status: :offline/:online/:alarms/:all
      // Orderby: +ip/+name/+search
      $("#qz-devices-filter").find(".item").click(function() {
        var keyword = $("#qz-devices-text-keyword").val();
        var keyword_selected = $(this).attr('alt');
        var keyword_target = keyword_selected;
        if (keyword.indexOf(':') > -1 && keyword.indexOf('+') > -1) {
          //FIXME: replace equal keywords, not assign it directly
          keyword_target = keyword_selected;
        } else {
          if (keyword.indexOf(':') > -1) {
            if (keyword_selected.indexOf('+') > -1) {
              keyword_target = keyword + ' ' + keyword_selected;
            }
          }
          if (keyword.indexOf('+') > -1) {
            if (keyword_selected.indexOf(':') > -1) {
              keyword_target = keyword + ' ' + keyword_selected;
            }
          }
        }
        console.log(keyword, keyword_selected, keyword_target);
        $("#qz-devices-text-keyword").val(keyword_target);
        $("#qz-devices-btn-search").trigger('click');
      });
      
      // Devices.[LSIT].item
    },
    DevicesListUpdate: function(total, qty, list) {
      console.log('$.Lite.DevicesListUpdate()', total, qty);
      if (total + qty > 0) {
        // Update Nav.[DEVICES].Qty
        $("#qz-nav-devices").find('.label').text(total);
        
        // update Devices.[LIST]
        var list_header = $("#qz-devices-list-header");
        list_header.nextAll().remove();
        
        $.each(list, function() {
          var $this =$(this)[0];
          var id = $this.id, name = $this.name, alarms = $this.alarms, html = '';
          if (alarms > 0) {
            html = '<a class="item" id="'+ id +'">' + name + '</a>';
          } else {
            html = '<a class="item" id="'+ id +'">' + name + '</a>';
          }
          list_header.after(html);
        });
        
        // update Device Qty
        list_header.find(".label").text(qty);
        $("#qz-devices-search").removeClass("loading");
        $.Lite.DevicesStatus();
        
        // Bind [CLICK] again
        var devices = list_header.nextAll();
        devices.click(function() {
          $("#qz-devices-list-header").nextAll().removeClass('active');
          $(this).addClass('active');

          var id = $(this).attr('id');
          console.log('try first child > id=', id);
          $.Lite.DeviceUpdate(id);
        });

        // select first result when done
        devices.first().trigger('click');      
      }
    },
    CB_DevicesDone: function(resp) {
      var error = resp && resp.error ? resp.error : '404';
      switch(error) {
        case 'none':
          var data = resp.data;
          $.Lite.DevicesListUpdate(data.devices_total, data.devices_qty, data.devices);
          break;
        case '404':
        default:
          break;
      }
    },
    CB_DevicesError: function(xhr, status, error) {
      $("#qz-devices-status").SUIMessageError('设备列表获取失败').show();
      $("#qz-devices-search").removeClass("loading");
    }
  }
}) (jQuery);

(function($) {
  $.LiteUI = {
    Init: function() {
      $.SUIInit();
    },
    Nav: {
      Init: function() {
        $("#qz-signin,#qz-devices,#qz-maps,#qz-options").hide();
        $("#qz-nav-devices,#qz-nav-maps,#qz-nav-options").removeClass('active');
      },
      Signin: function() {
        $.LiteUI.Nav.Init();
        $("#qz-signin").show();
      },
      Devices: function() {
        $.LiteUI.Nav.Init();
        $("#qz-nav-devices").addClass('active');
        
        // init tabs
        $.LiteUI.Device.Wireless();
        $.LiteUI.Config.Wireless();;
        $.LiteUI.KPI.Thrpt();
        $.LiteUI.Config.Hide();
        
        $("#qz-devices").show();
      },
      Maps: function() {
        $.LiteUI.Nav.Init();
        $("#qz-nav-maps").addClass('active');
        $("#qz-maps").show();
        
        // TODO: reload devices' icons
        $("#qz-maps-mask").show();
        setTimeout(function() {
          $("#qz-maps-mask").hide();
        }, 200);
      },
      Options: function() {
        $.LiteUI.Nav.Init();
        $("#qz-nav-options").addClass('active');
        $("#qz-signin,#qz-devices,#qz-maps").hide();      
        $("#qz-options").show();
      }
    },
    Config: {
      // TODO: container don't have enough space to display all
      // decide which block to display
      Show: function() {
        $.LiteUI.Config.Basic();
        $("#qz-device-config-title,#qz-device-config").show();
      },
      Hide: function() {        
        $("#qz-device-config-title,#qz-device-config").hide();
        //$("#qz-device-kpi-title,#qz-device-kpi").show();
        //$("#qz-device-details").show();
      },
      Init: function() {
        $("#qz-device-config-basic-detail,#qz-device-config-wireless-detail").hide();
        $("#qz-device-config-basic,#qz-device-config-wireless").removeClass('active');

        $("#qz-device-config-advanced-detail").hide();
        $("#qz-device-config-advanced").removeClass('active');
      },
      Basic: function() {
        $.LiteUI.Config.Init();
        $("#qz-device-config-basic-detail").show();
        $("#qz-device-config-basic").addClass('active');
      },
      Wireless: function() {
        $.LiteUI.Config.Init();
        $("#qz-device-config-wireless-detail").show();
        $("#qz-device-config-wireless").addClass('active');        
      },
      Advanced: function() {
        $.LiteUI.Config.Init();
        $("#qz-device-config-advanced-detail").show();
        $("#qz-device-config-advanced").addClass('active');
      }
    },
    Device: {
      Init: function() {
        $("#qz-device-base-detail,#qz-device-wireless-detail,#qz-device-network-detail").hide();
        $("#qz-device-base,#qz-device-wireless,#qz-device-network").removeClass('active');
      },
      Base: function() {
        $.LiteUI.Device.Init();
        $("#qz-device-base").addClass('active');
        $("#qz-device-base-detail").show();        
      },
      Wireless: function() {
        $.LiteUI.Device.Init();
        $("#qz-device-wireless").addClass('active');
        $("#qz-device-wireless-detail").show();
      },
      Network: function() {
        $.LiteUI.Device.Init();
        $("#qz-device-network").addClass('active');
        $("#qz-device-network-detail").show();        
      }
    },
    KPI: {
      Init: function() {
        $("#qz-device-links-detail,#qz-device-thrpt-detail").hide();
        $("#qz-device-links,#qz-device-thrpt").removeClass('active');
      },
      Links: function() {
        $.LiteUI.KPI.Init();
        $("#qz-device-links").addClass('active');
        $("#qz-device-links-detail").show();        
      },
      Thrpt: function() {
        $.LiteUI.KPI.Init();
        $("#qz-device-thrpt").addClass('active');
        $("#qz-device-thrpt-detail").show();               
      }
    },
    Options: {
      Init: function() {
        $("#qz-options-tools-detail,#qz-options-services-detail").hide();
        $("#qz-options-tools,#qz-options-services").removeClass('active');
      },
      Tools: function() {
        $.LiteUI.Options.Init();
        $("#qz-options-tools").addClass('active');
        $("#qz-options-tools-detail").show();
      },
      Services: function() {
        $.LiteUI.Options.Init();
        $("#qz-options-services").addClass('active');
        $("#qz-options-services-detail").show();        
      }
    }
  }
}) (jQuery);

(function($) {
  $.Request = {
    Signin: function(user, passwd, done_cb, error_cb) {
      if (user != '' && user.length >= 5 && passwd != '' && passwd.length >= 5) {
        console.log('start signin');
        $("#qz-signin-mask").SUILoaderShow();
        $("#qz-btn-signin").BtnDisable();
        $.Ajax.Query(
          "/iOMC3/user.php?do=signin", 
          { user: user, passwd: passwd },
          done_cb, error_cb
        );
      }
    }
  }
}) (jQuery);

// by Qige <qigezhao@gmail.com> @2017.09.12
// load Microsoft Bing Maps
(function($) {
  $.BingMaps = {
    init: function() {
      /*if (! $.App.data.map) {
        console.log('$.BingMaps.init()');
        $.App.data.map = new Microsoft.Maps.Map(document.getElementById('qz-maps-box'), {
          center: new Microsoft.Maps.Location(40.0492, 116.2902),
          credentials: 'AsHiUhyyE-3PP8A82WyPhdS6_Z18NL2cuaySXTGPviswZ_WDmgDlaSZ7xpEF77-3',
          showMapTypeSelector: false, showBreadcrumb: true, enableClickableLogo: false,
          enableSearchLogo: false, 
          //mapTypeId: Microsoft.Maps.MapTypeId.aerial,
          maxZoom: 16, minZoom: 10, zoom: 14
        });
      }*/
    },
    start: function(id) {      
    }
  }
}) (jQuery);


// ARN.OMC3.Index
var loadMap = $.BingMaps.init; // FIXME: Microsoft Bing Maps Wrapper
$(function() {
  // Application start (lite version)
  $.Lite.Bind();
  $.Lite.Start();
  // now wait for user click/input/timer
});

