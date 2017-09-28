/*
* by Qige <qigezhao@gmail.com>
* 2017.09.07 SementicUI|$.App|$.SementicUI|$.Install
* 2017.09.22 $.Lite|$.LiteUI|$.Request|$.GWS|$.BingMaps|$.CB
* 2017.09.28 Re-format
*
* 1 [TAB] = 2 [SPACEs]
* TODO:
*     1. Remove "DBG_MODAL" button;
*     2. Read & valid "input:text" before send Ajax requests;
*     3. When assign deviceID in URL, will be replaced by [Devices.List.first()];
*
* Fixed:
*     1. Step_II.Prev takes too much time; Qige@2017.09.08
*     2. Progress bar: invalid after "reset"; Qige@2017.09.08
*     3. Add "$.AutoTest.Start()" script; Qige@2017.09.15
*     4. Parse URL; Qige@2017.09.15
*/

// Handle url/signin/token/devices/maps/tools
(function($) {
  $.Lite = {
    defaults: {
      username: 'admin', password: '6harmonics'
    },
    // TOKEN/Timer handles
    data: {},

    // Web Application Starts here
    // #list: Devices
    // #maps: Maps
    // #tools: Tools
    // #a1b2c3d4f5a1b2c3-maps-211
    Url: {
      parser: function(idx) {
        var paramAll  = null, param = null;
        var url       = $.Url.PageWithParams();
        var sections  = url.split('#', 2);
        if (sections && sections.length >= 2) {
          paramAll = sections[1].split('-', 3);
          if (idx >= 0 && paramAll && paramAll.length > idx) {
            param = paramAll[idx];
          }
        }
        return param;
      },
      TOKEN: function() {
        var token = $.Lite.Url.parser(0);
        return token;
      },
      Section: function() {
        var section = $.Lite.Url.parser(1);
        return section;
      },
      DeviceID: function() {
        var did = $.Lite.Url.parser(2);
        return did;
      },
      Set: function(sec, did) {
        var page = $.Url.PageOnly();
        var token = $.Lite.Url.TOKEN(), section = '', deviceid = '';
        if ($.Val.isValid(sec)) {
          section = sec;
        } else {
          section = $.Lite.Url.Section();
        }
        if ($.Val.isValid(did)) {
          deviceid = did;
        } else {
          deviceid = $.Lite.Url.DeviceID();
        }

        var url = '#';
        if ($.Val.isValid(token)) {
          url = page + '#' + token + '-' + section + '-' + deviceid;
        } else {
          url = page;
        }
        $.Url.Goto(url);
      },
      Clear: function() {
        var page = $.Url.PageOnly();
        var url = page + '#';
        $.Url.Goto(url);
      }
    },
    Start: function() {
      $.LiteUI.Init();

      // #{TOKEN}-maps-{DeviceID}
      var token   = $.Lite.Url.TOKEN();
      var section = $.Lite.Url.Section();
      var did     = $.Lite.Url.DeviceID();
      console.log('$.Lite.Start()> token/section/did =', token, section, did);

      // {TOKEN} will be validated when send Ajax requests
      // and will be redirect to Signin if error = "noauth"
      if ($.Val.isValid(token)) {
        // Which iOMC3 Section to display
        switch(section) {
          case 'tools':
          case 'options':
          case 'scan':
            $.Lite.Run.Tools(section, did);
            break;
          case 'maps':
          case 'latlng':
          case 'pos':
            $.Lite.Run.Maps(did);
            break;
          case 'devices':
          case 'device':
          case 'config':
          case 'search':
          default:
            var flagAutoLoad = true;
            $.Lite.Run.Devices(flagAutoLoad, did);
            break;
        }
        // Start background ARN.iOMC3.Audit
        $.BG.AuditStart('all');
      } else {
        $.BG.AuditStop('all');

        $.Lite.Url.Clear();
        $.Lite.Run.Signin();
      }
    },
    // Goto [*] Blocks
    Run: {
      Signin: function() {
        $.LiteUI.Display.Signin();
      },
      Dashboard: function() {
        $.LiteUI.Display.Dashboard();
      },
      // display Devices/Maps/Tools
      // load data via Ajax using valid {TOKEN}
      Devices: function(flagAutoLoad) {
        $.LiteUI.Display.Devices();
        if ($.Val.isValid(flagAutoLoad)) {
          var deviceid = $.Lite.Url.DeviceID();
          $.Request.DevicesList(deviceid);
        }
      },
      DeviceAlarms: function() {
        $.LiteUI.Display.DeviceAlarms();
        //$.Request.DeviceAlarms();
      },
      Maps: function(flagAutoLoad) {
        $.LiteUI.Display.Maps();
        if ($.Val.isValid(flagAutoLoad)) {
          $.Request.MapsDevicesList(flagAutoLoad);
        }
      },
      Tools: function(flagAutoLoad) {
        $.LiteUI.Display.Tools();
        if ($.Val.isValid(flagAutoLoad)) {
          $.Request.Tools(flagAutoLoad);
        }
      },
    },
    Update: {
      DevicesStatus: function(msg) {
        $("#qz-devices-status").SUIMessageSuccess(msg).show();
      },
      // Update device details via Ajax
      DeviceDetail: function(did) {
        console.log('$.Lite.Device.DeviceDetail()> did=', did);
        if ($.Val.isValid(did)) {
          $("#qz-device-detail").attr('did', did);
          $.Request.DeviceDetail(did);

          // FIXME: trigger config update right away
          //$.Lite.Update.DeviceConfig();
        }
      },
      DeviceCollectConfig: function(did) {
        if ($.Val.isValid(did)) {
          $.LiteUI.Config.Saving();
          var name = $("#qz-device-config-name").val();
          var ip = $("#qz-device-config-ip").val();
          var mask = $("#qz-device-config-netmask").val();
          var gw = $("#qz-device-config-gw").val();
          var mode = $("#qz-device-config-mode").find('input').val();
          var rgn = $("#qz-device-config-region").find('input').val();
          var freq = $("#qz-device-config-freq").val();
          var channel = $("#qz-device-config-channel").val();
          var txpwr = $("#qz-device-config-txpower").find('input').val();
          $.Request.DeviceSet(did, {
            ops: 'set-params',
            name: name, ip: ip, mask: mask, gw: gw, mode: mode,
            rgn: rgn, freq: freq, channel: channel, txpwr: txpwr
          });
        }
      },
      DeviceConfig: function(did, opt) {
        if ($.Val.isValid(did)) {
          $.Request.DeviceConfig(did);
        }
      }
    },
    InitAll: function() {
      $.Lite.Init.Nav();
      $.Lite.Init.Signin();
      $.Lite.Init.Devices();
      $.Lite.Init.Maps();
      $.Lite.Init.Tools();
    },
    Init: {
      Nav: function() {
        $("#qz-nav-devices").click(function() {
          var url = $.Lite.Url.Set('devices');
          $.Url.Goto(url);

          var flagAutoLoad = true;
          $.Lite.Run.Devices(flagAutoLoad);
        });
        $("#qz-nav-maps").click(function() {
          var url = $.Lite.Url.Set('maps');
          $.Url.Goto(url);

          var flagAutoLoad = true;
          $.Lite.Run.Maps(flagAutoLoad);
        });
        $("#qz-nav-tools").click(function() {
          var url = $.Lite.Url.Set('tools');
          $.Url.Goto(url);

          $.Lite.Run.Tools();
        });

        // [Nav].[SEARCH]
        $("#qz-nav-text-keyword").focus(function() {
          $(this).select();
        }).keydown(function(e) {
          //console.log('search when hit ENTER');
          if (e.keyCode == 13) {
            $(this).select();
            $("#qz-nav-btn-search").trigger('click');
            $("#qz-devices-text-keyword").select(); // focus
          }
        });
        // wrapper of Devices.Search
        $("#qz-nav-btn-search").click(function() {
          var keyword = $("#qz-nav-text-keyword").val();
          console.log('qz-nav-text-keyword =', keyword);

          // Devices.Search
          var flagAutoLoad = false;
          $.Lite.Run.Devices(flagAutoLoad);

          $("#qz-devices-text-keyword").val(keyword).select(); // focus
          $("#qz-devices-btn-search").trigger('click');
        });

        // FIXME: need Ajax to let server know that {TOKEN} is expired?
        $("#qz-nav-btn-signout").click(function() {
          var url = '/iOMC3/';
          $.Url.Goto(url);
        });
      },
      Signin: function() {
        // Signin
        $("#qz-signin-user,#qz-signin-passwd").focus(function() {
          $(this).select();
        }).change(function() {
          var user    = $("#qz-signin-user").val();
          var passwd  = $("#qz-signin-passwd").val();
          if ($.Val.isValid(user) && $.Val.isValid(passwd)) {
            $("#qz-signin-btn-go").BtnDisable();
          } else {
            $("#qz-signin-btn-go").BtnEnable();
          }
        })
        $("#qz-signin-btn-go").click(function() {
          var user    = $("#qz-signin-user").val();
          var passwd  = $("#qz-signin-passwd").val();
          $("#qz-signin-btn-go,#qz-signin-btn-default").BtnDisable();
          $.Request.Signin(user, passwd, $.CB.CB_SigninDone, $.CB.CB_SigninError);
        });
        $("#qz-signin-btn-default").click(function() {
          $("#qz-btn-signin-default").BtnDisable();

          $("#qz-signin-user").val($.Lite.defaults.username);
          $("#qz-signin-passwd").val($.Lite.defaults.password);
          $("#qz-signin-btn-go").BtnEnable();

          $("#qz-signin-btn-go").trigger('click');
        });
      },
      Devices: function() {
        // Devices.[FILTER]: Combined keywords:
        // Status: :offline/:online/:alarms/:all
        // Orderby: +ip/+name/+search
        $("#qz-devices-filter").find(".item").click(function() {
          var keyword           = $("#qz-devices-text-keyword").val();
          var keyword_selected  = $(this).attr('alt');
          var keyword_target    = keyword_selected;
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

          console.log('$.Lite.Init.Devices()> ', keyword, keyword_selected, keyword_target);
          $("#qz-devices-text-keyword").val(keyword_target);
          $("#qz-devices-btn-search").trigger('click');
        });

        // search when keyword/pattern not empty
        // Devices [SEARCH]
        $("#qz-devices-text-keyword").focus(function() {
          $(this).select();
        }).keydown(function(e) { //console.log('search when hit ENTER');
          if (e.keyCode == 13) {
            //$(this).select();
            $("#qz-devices-btn-search").trigger('click');
          }
        });
        $("#qz-devices-btn-search").click(function() {
          var keyword = $("#qz-devices-text-keyword").val();
          console.log('qz-devices-text-keyword =', keyword);
          $.Request.DevicesList(keyword);
        });

        $("#qz-devices-qrcode").popup({
          position: 'right center',
          target: '#qz-devices-qrcode',
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
        $("#qz-device-btn-update").click(function() {
          var deviceID = $("#qz-device-detail").attr('did');
          $.Lite.Update.DeviceDetail(deviceID);
        });
        $("#qz-device-btn-config,#qz-device-btn-config-update").click(function() {
          var did = $("#qz-device-detail").attr('did');
          $.Lite.Update.DeviceConfig(did, 'load-config');
          $.LiteUI.Config.Show();
          $.LiteUI.Config.Saved();
        });
        $("#qz-device-btn-config-done").click(function() {
          // save, prompt, hide
          $.LiteUI.Config.Hide();
        });
        $("#qz-device-btn-maps").click(function() {
          var did = $("#qz-device-detail").attr('did');
          $.Lite.Url.Set('maps', did);
          $.Lite.Run.Maps();
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

        // Bind Region/Channel/Frequency calculation
        // TODO: support Model# in the future
        $("#qz-device-config-region").change(function() {
          $.LiteUI.Config.GWS('region');
        });
        $("#qz-device-config-channel").blur(function() {
          $.LiteUI.Config.GWS('channel');
        }).keydown(function(e) {
          //console.log('search when hit ENTER');
          if (e.keyCode == 13) {
            $.LiteUI.Config.GWS('channel');
          }
        });
        $("#qz-device-config-freq").blur(function() {
          $.LiteUI.Config.GWS('freq');
        }).keydown(function(e) {
          //console.log('search when hit ENTER');
          if (e.keyCode == 13) {
            $.LiteUI.Config.GWS('freq');
          }
        });

        // ask user first in case wrong click
        $("#qz-device-btn-config-save").click(function() {
          $("#qz-device-config-confirm").attr('ops', 'save').modal('show');
        });
        $("#qz-device-btn-reset-network").click(function() {
          $("#qz-device-config-confirm").attr('ops', 'reset-network').modal('show');
        });
        $("#qz-device-config-reset-wireless").click(function() {
          $("#qz-device-config-confirm").attr('ops', 'reset-wireless').modal('show');
        });
        $("#qz-device-config-confirm-yes").click(function() {
          $("#qz-device-config-confirm").modal('hide');

          var did = $("#qz-device-detail").attr('did');
          var ops = $("#qz-device-config-confirm").attr('ops') || 'unknown';
          switch(ops) {
            case 'unknown':
              console.log('#qz-device-config-confirm> did/ops =', did, ops);
              break;
            case 'save':
              $.Lite.Update.DeviceCollectConfig(did);
              break;
            default:
              $.Request.DeviceSet(did, { ops: ops });
              break;
          }
        });
        $("#qz-device-config-confirm-no").click(function() {
          $("#qz-device-config-confirm").modal('hide');
          $.LiteUI.Config.SaveAbort();
        });

        $("#qz-device-config-wireless-tools").click(function() {
          $.Lite.Url.Set('tools', 'radio');
          $.Lite.Run.Tools(); // TODO: display radio tool
        });
      },
      Maps: function() { // TODO: bind all button/input event(s) here
        $("#qz-maps-btn-search").click(function() {
          console.log('ARN.iOMC3.Maps.SearchBtn clicked');
        });
      },
      Tools: function() {
        $("#qz-tools-tools").click(function() {
          $.LiteUI.Tools.Tools();
        });
        $("#qz-tools-services").click(function() {
          $.LiteUI.Tools.Services();
        });
      }
    }
  }
}) (jQuery);

// ARN.iOMC3.Audit: run in background
// setup Timers
(function($) {
  $.BG = {
    // call for ARN.iOMC3.Audit result
    AuditStart: function(which) {
      console.log('$.BG.AuditStart()> called');
      $.BG.UI.NavAlarms(0);
      $.BG.UI.NavDeviceQty(10, 4, 6);
    },
    AuditStop: function(which) {
      console.log('$.BG.AuditStop()> called');
      $.BG.UI.NavAlarms('-');
      $.BG.UI.NavDeviceQty('-');
    },
    UI: {
      NavDeviceQty: function(vtotal, voffline, vonline) {
        var nav = $("#qz-nav-devices").find('.label');
        if ($.Val.isValid(voffline)) {
          var qty = '';
          if ($.Val.isValid(vtotal)) {
            qty += (vtotal+'/');
          } else {
            qty += '-/';
          }
          qty += (voffline+'/');
          if ($.Val.isValid(vonline)) {
            qty += vonline;
          } else {
            qty += '-';
          }
          // write qty to [Nav].[.label]
          if (voffline > 0) {
            nav.removeClass('green yellow').addClass('red');
          } else {
            nav.removeClass('red yellow').addClass('green');
          }
          nav.html(qty);
        } else {
          nav.removeClass('green red').addClass('yellow')
            .html('-');
        }
      },
      NavAlarms: function(val) {
        var nav = $("#qz-nav-tools").find('.label');
        if (val && val > 0) {
          nav.removeClass('green yellow').addClass('red')
            .html(val.toString());
        } else {
          nav.removeClass('red yellow').addClass('green')
            .html('-');
        }
      }
    },
    TimerStart: function(id, callback) {
      ;
    },
    TimerStop: function(id, callback) {
      ;
    },
    TimerStopAll: function() {
      $.each($.Lite.Data.Timer, function(idx, tmrHandle) {
        clearInterval(tmrHandle);
      });
    }
  }
}) (jQuery);


(function($) {
  $.CB = {
    CB_SigninError: function(xhr, status, error) {
      console.log('$.Request.CB_SigninError()');
      $("#qz-signin-message").SUIMessageError('通信错误，请重试').show();

      $("#qz-signin-btn-go,#qz-signin-btn-default").BtnEnable();
      $("#qz-signin-mask").SUILoaderHide();
    },
    CB_SigninDone: function(resp) {
      var error = '404';
      if ($.Val.isValid(resp) && $.Val.isValid(resp.error)) {
        error = resp.error;
      }
      console.log('$.CB.CB_SigninDone()> error =', error);
      switch(error) {
        case 'epasswd':
          $("#qz-signin-message").SUIMessageError('用户名或密码不正确，请重试').show();
          break;
        case 'none':
          $("#qz-signin-message").SUIMessageSuccess('登录成功，正在载入数据').show();
          setTimeout(function() {
            var token = resp.auth.token;
            var page = $.Url.PageOnly();
            var url = page + '#'+token;
            $.Url.Goto(url);
            console.log('$.CB.CB_SigninDone()> url = ', url);

            var flagAutoLoad = true;
            $.Lite.Run.Devices(flagAutoLoad);
          }, 1000);
          break;
        case '404':
        default:
          $("#qz-signin-message").SUIMessageError('通信失败，请重试').show();
          break;
      }
      $("#qz-signin-btn-go,#qz-signin-btn-default").BtnEnable();
      $("#qz-signin-mask").SUILoaderHide();
    },
    CB_DevicesDone: function(resp) {
      var error = '404';
      if ($.Val.isValid(resp) && $.Val.isValid(resp.error)) {
        error = resp.error;
      }
      switch(error) {
        case 'none':
          var data = resp.data;
          $.LiteUI.Update.DevicesList(data);
          break;
        case 'noauth':
          console.log('$.CB.CB_DevicesDone()> +noauth');
          $.Lite.Run.Signin();
          break;
        case '404':
        default:
          break;
      }

      // update Timestamp
      var ts = new Date().toTimeString();
      $.Lite.Update.DevicesStatus('设备列表已更新 @'+ts);

      $("#qz-devices-search").removeClass("loading");
    },
    CB_DevicesError: function(xhr, status, error) {
      var ts = new Date().toTimeString();
      $.Lite.Update.DevicesStatus('设备列表获取失败 @'+ts);

      $("#qz-devices-search").removeClass("loading");
    },
    CB_DeviceDone: function(resp) {
      var error = '404';
      if ($.Val.isValid(resp) && $.Val.isValid(resp.error)) {
        error = resp.error;
      }
      console.log('$.CB.CB_DeviceDone()> error =', error);
      switch(error) {
        case 'none':
          if ($.LiteUI.Update.Device(resp.data)) {
            var did = $("#qz-device-detail").attr('did');
            $.Lite.Url.Set('device', did);

            // update Timestamp
            var ts = new Date().toTimeString();
            $.Lite.Update.DevicesStatus('设备信息已更新 @'+ts);
          } else {
            $.CB.CB_DeviceError();
          }
          break;
        case 'noauth':
          $.Lite.Run.Signin();
          break;
        case '404':
        default:
          $.CB.CB_DeviceError();
          break;
      }

      $("#qz-device-mask").SUILoaderHide();
    },
    CB_DeviceError: function(xhr, status, error) {
      var ts = new Date().toTimeString();
      $("#qz-devices-status").SUIMessageError('设备信息获取失败 @'+ts).show();

      $("#qz-device-mask").SUILoaderHide();
    },
    CB_DeviceConfigDone: function(resp) {
      var error = '404';
      if ($.Val.isValid(resp) && $.Val.isValid(resp.error)) {
        error = resp.error;
      }
      console.log('$.CB.CB_DeviceConfigDone> error =', error);
      switch(error) {
        case 'none':
          if ($.LiteUI.Update.DeviceConfig(resp.data)) {
            var ts = new Date().toTimeString();
            $.Lite.Update.DevicesStatus('设备配置已更新 @'+ts);
          } else {
            $.CB.CB_DeviceConfigError();
          }
          break;
        case '404':
        default:
          $.CB.CB_DeviceConfigError();
          break;
      }

      $("#qz-device-mask").SUILoaderHide();
    },
    CB_DeviceConfigError: function(xhr, status, error) {
      var ts = new Date().toTimeString();
      $("#qz-devices-status").SUIMessageError('设备配置获取失败 @'+ts).show();

      $("#qz-device-mask").SUILoaderHide();
    },
    CB_DeviceSetDone: function(resp) {
      var error = '404';
      if ($.Val.isValid(resp) && $.Val.isValid(resp.error)) {
        error = resp.error;
      }
      console.log('$.CB.CB_DeviceSetDone> error =', error);
      switch(error) {
        case 'none':
          var ts = new Date().toTimeString();
          $.Lite.Update.DevicesStatus('设备操作已完成 @'+ts);
          break;
        case '404':
        default:
          $.CB.CB_DeviceSetError();
          break;
      }

      $.LiteUI.Config.Saved()
      $("#qz-device-mask").SUILoaderHide();
    },
    CB_DeviceSetError: function(xhr, status, error) {
      var ts = new Date().toTimeString();
      $("#qz-devices-status").SUIMessageError('设备操作失败 @'+ts).show();

      $.LiteUI.Config.Saved()
      $("#qz-device-mask").SUILoaderHide();
    },
    CB_MapsDeviceDone: function(resp) {
      var error = '404';
      if ($.Val.isValid(resp) && $.Val.isValid(resp.error)) {
        error = resp.error;
      }
      switch(error) {
        case 'none':
          var data = resp.data;
          $.LiteUI.Update.MapsDevicesList(data);
          break;
        case 'noauth':
          $.Lite.Run.Signin();
          break;
        case '404':
        default:
          break;
      }

      // update Timestamp
      var ts = new Date().toTimeString();
      $.Lite.Update.MapsDevicesStatus('设备列表已更新 @'+ts);

      $("#qz-maps-search").removeClass("loading");
      $("#qz-device-mask").SUILoaderHide();
    },
    CB_MapsDevicesError: function(xhr, status, error) {
      var ts = new Date().toTimeString();
      $.Lite.Update.MapsDevicesStatus('设备列表获取失败 @'+ts);

      $("#qz-maps-search").removeClass("loading");
    },
  }
}) (jQuery);
(function($) {
  $.LiteUI = {
    Init: function() {
      $.SUIInit();
    },
    Display: {
      init: function() {
        $("#qz-signin,#qz-devices,#qz-maps,#qz-tools").hide();
        $("#qz-nav-devices,#qz-nav-maps,#qz-nav-tools").removeClass('active');
      },
      Signin: function() {
        $.LiteUI.Display.init();
        $("#qz-signin").show();
      },
      Dashboard: function() {
        console.log('$.LiteUI.Display.Dashboard> called < TODO');
      },
      Devices: function() {
        $.LiteUI.Display.init();
        $("#qz-nav-devices").addClass('active');

        // init tabs
        $.LiteUI.Device.Wireless();
        $.LiteUI.Config.Wireless();;
        $.LiteUI.KPI.Thrpt();
        $.LiteUI.Config.Hide();

        $("#qz-devices").show();
      },
      DeviceAlarms: function() {
        console.log('$.LiteUI.Display.DeviceAlarms()> called < TODO');
      },
      Maps: function() {
        $.LiteUI.Display.init();
        $("#qz-nav-maps").addClass('active');
        $("#qz-maps").show();

        // TODO: reload devices' icons
        $("#qz-maps-mask").show();
        setTimeout(function() {
          $("#qz-maps-mask").hide();
        }, 200);
      },
      Tools: function() {
        $.LiteUI.Display.init();
        $("#qz-nav-tools").addClass('active');
        $("#qz-tools").show();

        $.LiteUI.Tools.Init();
        $.LiteUI.Tools.Tools();
      }
    },
    Config: {
      // TODO: container don't have enough space to display all
      // decide which block to display
      Show: function() {
        $.LiteUI.Config.Wireless();
        $("#qz-device-config-title,#qz-device-config").show();
      },
      Hide: function() {
        $("#qz-device-config-title,#qz-device-config").hide();
        $.LiteUI.Config.Saved();
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
      },
      Saving: function() {
        $("#qz-device-btn-config-save").find('.icon')
          .removeClass('close save').addClass('circle notched loading');
      },
      Saved: function() {
        $("#qz-device-btn-config-save").find('.icon')
          .removeClass('close circle notched loading').addClass('save');
      },
      SaveAbort: function() {
        $("#qz-device-btn-config-save").find('.icon')
          .removeClass('circle notched loading').addClass('close');
        // Restore save icon
        setTimeout(function() {
          $.LiteUI.Config.Saved();
        }, 3000);
      },
      GWS: function(by) {
        // FIXME: when data not available
        var region = $("#qz-device-config-region").find('input').val();
        var channel, freq;

        switch(by) {
          case 'freq':
            freq = $("#qz-device-config-freq").val();
            channel = $.GWS.FreqToChannel(region, freq);
            console.log('qz-device-config-frequency changed', region, channel, freq);
            break;
          case 'region':
          case 'channel':
          default:
            channel = $("#qz-device-config-channel").val();
            freq = $.GWS.Freq(region, channel);
            console.log('qz-device-config-channel changed', region, channel, freq);
            break;
        }

        // use calculated values
        var freqCalc = $.GWS.Freq(region, channel);
        var channelCalc = $.GWS.FreqToChannel(region, freqCalc);
        var freqDesc = $.GWS.FreqDesc(region, channelCalc, freqCalc);
        $("#qz-device-config-channel-detail").val(freqDesc);
        $("#qz-device-config-channel").val(channelCalc);
        $("#qz-device-config-freq").val(freqCalc);
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
    Tools: {
      Init: function() {
        $("#qz-tools-tools-detail,#qz-tools-services-detail").hide();
        $("#qz-tools-tools,#qz-tools-services").removeClass('active');
      },
      Tools: function() {
        $.LiteUI.Tools.Init();
        $("#qz-tools-tools").addClass('active');
        $("#qz-tools-tools-detail").show();
      },
      Services: function() {
        $.LiteUI.Tools.Init();
        $("#qz-tools-services").addClass('active');
        $("#qz-tools-services-detail").show();
      }
    },
    Update: {
      Device: function(data) {
        //console.log(data.device, data.device.mac);
        if (data && data.device) {
          if (data.device.mac) {
            var device = data.device;
            $("#qz-devices-device-name").val(device.name);
            $("#qz-devices-device-id").val(device.mac + ' / ' + device.wmac);
            $("#qz-devices-device-hwver").val(device.hwver);
            $("#qz-devices-device-fwver").val(device.fwver);

            var mdesc = $.GWS.Mode(device.base.mode);
            var fdesc = $.GWS.Freq(device.wireless.region, device.wireless.channel, device.wireless.freq);
            var tdesc = $.GWS.Txpower(device.wireless.txpower, device.wireless.watt);
            $("#qz-devices-device-mode").val(mdesc);
            $("#qz-devices-device-ssid").val(device.base.ssid);
            $("#qz-devices-device-freq").val(fdesc);
            $("#qz-devices-device-txpower").val(tdesc);
            $("#qz-devices-device-chanbw").val(device.wireless.chanbw + ' MHz');

            $("#qz-devices-device-ifname").val(device.network.ifname);
            $("#qz-devices-device-vlan").val(device.network.vlan);
            $("#qz-devices-device-ip").val(device.network.ip);
            $("#qz-devices-device-netmask").val(device.network.netmask);
            $("#qz-devices-device-gw").val(device.network.gateway);

            // update Devices.Device.[.label]
            $("#qz-device-network").find('.label')
              .text(device.ip);
            $("#qz-devices-device-name-alarm").text(device.name);
            $("#qz-device-wireless").find('.label')
              .text(device.wireless.chanbw+'+'+device.wireless.freq);
          }
          // update peers
          console.log('Device Peers');
          var links_tbody = $("#qz-device-links-detail").find('tbody');
          var links_tbody_html = '';
          var links_peer_qty = data.peers.length;
          $("#qz-device-links").find('.label')
            .html(links_peer_qty);
          if (links_peer_qty > 0) {
            $.each(data.peers, function(idx, peer) {
              var desc = peer.wmac +' ( '+peer.ip+' )';
              var rx = 'MCS '+ peer.rx_mcs + ' ( ' + peer.rx_br + ' Mbit/s)';
              var tx = 'MCS '+ peer.tx_mcs + ' ( ' + peer.tx_br + ' Mbit/s)';
              var note = peer.inactive + ' ms';
              links_tbody_html += '<tr>';
              links_tbody_html += '<td>'+desc+'</td>';
              links_tbody_html += '<td>'+rx+'</td>';
              links_tbody_html += '<td>'+tx+'</td>';
              links_tbody_html += '<td>'+note+'</td>';
              links_tbody_html += '</tr>';
            });
          } else {
            links_tbody_html = '<tr><td colspan="4">无线没有连接</td></tr>';
          }
          links_tbody.nextAll().remove()
            .end().html(links_tbody_html);
          // update network
          console.log('Device Network');
          var thrpt_tbody = $("#qz-device-thrpt-detail").find('tbody');
          // TODO: handle unit Kbps & Mbps
          var thrpt_tbody_html = '', icon_html = '0+0 Mbps';
          if (data.network.length > 0) {
            var total_dl = 0, total_ul = 0, total_unit = 'Mbps';
            $.each(data.network, function(idx, nw) {
              var desc = nw.ifname;
              var unit = nw.unit;
              var dl = nw.rx, ul = nw.tx;
              var dlul = dl + ul;
              thrpt_tbody_html += '<tr>';
              thrpt_tbody_html += '<td>'+desc+'</td>';
              thrpt_tbody_html += '<td>'+dlul.toFixed(3)+' '+unit+'</td>';
              thrpt_tbody_html += '<td>'+dl+' '+unit+'</td>';
              thrpt_tbody_html += '<td>'+ul+' '+unit+'</td>';
              thrpt_tbody_html += '</tr>';
              total_dl += dl; total_ul += ul;
            });
            icon_html = total_dl.toFixed(3) +'+' + total_ul.toFixed(3) + total_unit;
          } else {
            thrpt_tbody_html = '<tr><td colspan="4">没有读取取数据，请稍候重试</td></tr>';
          }
          $("#qz-device-thrpt").find('.label').html(icon_html);
          thrpt_tbody.nextAll().remove()
            .end().html(thrpt_tbody_html);
          return true;
        }
        return false;
      },
      DevicesList: function(data) {
        if (data && data.devices_qty) {
          var total = data.devices_total;
          var offline = data.devices_offline ? data.devices_offline : 0;
          var online = data.devices_online ? data.devices_online : 0;
          var qty = data.devices_qty;
          var qty_desc = total+'/'+offline+'/'+online;
          console.log('$.Lite.DevicesListUpdate()', total, qty);
          /*
          // replace by $.BG.AuditStart()
          if (total > 0) {
            // Update Nav.[DEVICES].Qty
            var nav_devices = $("#qz-nav-devices").find('.label');
            nav_devices.text(qty_desc);
            if (offline > 0) {
              nav_devices.removeClass('green').addClass('red');
            } else {
              nav_devices.removeClass('red').addClass('green');
            }
          }
          */
          if (qty > 0) {
            // update Devices.[LIST]
            var list_header = $("#qz-devices-list-header");
            list_header.nextAll().remove();
            var list = data.devices;
            $.each(list, function() {
              var $this =$(this)[0];
              var id = $this.id, name = $this.name, alarms = $this.alarms, html = '';
              if (alarms > 0) {
                html = '<a class="item" id="'+id+'">'+name+'<div class="ui yellow label">'+alarms+'</div></a>';
              } else {
                html = '<a class="item" id="'+ id +'">'+name+'</a>';
              }
              list_header.after(html);
            });

            // update Device Qty
            var qty_icon = list_header.find(".label");
            qty_icon.text(qty_desc);
            if (offline > 0) {
              qty_icon.removeClass('green').addClass('red');
            } else {
              qty_icon.removeClass('red').addClass('green');
            }

            // Bind [CLICK] again
            var devices = list_header.nextAll();
            devices.click(function() {
              $("#qz-devices-list-header").nextAll()
                .removeClass('active');
              $(this).addClass('active');

              var id = $(this).attr('id');
              console.log('try first child > id=', id);
              $.Lite.Update.DeviceDetail(id);
            });

            // select first result when done
            devices.first().trigger('click');
          }
        } else {

        }
      },
      DeviceConfig: function(data) {
        //console.log(data.device, data.device.name);
        if (data && data.device && data.device.name) {
          var device = data.device;
          $("#qz-device-config-name").val(device.name);
          $("#qz-device-config-latlng").val(device.latlng);

          $("#qz-device-config-ip").val(device.network.ip);
          $("#qz-device-config-netmask").val(device.network.netmask);
          $("#qz-device-config-gw").val(device.network.gateway);

          if (device.abb) {
            $("#qz-device-config-ssid").val(device.abb.ssid);
            $("#qz-device-config-mode").dropdown(
              'set selected', device.abb.mode
            );
          }
          if (device.radio) {
            $("#qz-device-config-chanbw").dropdown(
              'set selected', device.radio.chanbw
            );
            var region = new Number(device.radio.region);
            $("#qz-device-config-region").dropdown(
              'set selected', region.toString()
            );
            $("#qz-device-config-channel").val(device.radio.channel);
            $("#qz-device-config-txpower").dropdown(
              'set selected', device.radio.txpower
            );
            $.LiteUI.Config.GWS('channel');
          }
          return true;
        }
        return false;
      }
    }
  }
}) (jQuery);

(function($) {
  $.Request = {
    Signin: function(user, passwd, done_cb, error_cb) {
      if ($.Val.isValid(user) && user.length >= 5 && $.Val.isValid(passwd) && passwd.length >= 5) {
        console.log('$.Request.Signin()> signin with user/passwd =', user, passwd);
        $("#qz-btn-signin").BtnDisable();
        $("#qz-signin-mask").SUILoaderShow();
        $.Ajax.Query(
          "/iOMC3/user.php?do=signin",
          { user: user, passwd: passwd },
          done_cb, error_cb
        );
      }
    },
    DevicesList: function(keyword) {
      var kw = '';
      var token = $.Lite.Url.TOKEN();
      if ($.Val.isValid(token)) {
        var url = '/iOMC3/lite.php?token='+token+'&do=devices';
        if (keyword && keyword != 'undefined') {
          kw = keyword.toString();
          url += ('&keyword='+kw);
        };
        console.log('keyword of before request =', kw, keyword);

        // Ajax search keyword, then update Devices [LIST]
        $("#qz-devices-search").SUILoaderShow();
        $.Ajax.Query( // qz-common.js: $.Ajax.Query(url, data, done_cb, error_cb);
          url, null,
          $.CB.CB_DevicesDone, $.CB.CB_DevicesError
        );
      } else {
        $.Lite.Start();
      }
    },
    DeviceDetail: function(did) {
      var token = $.Lite.Url.TOKEN();
      if ($.Val.isValid(token) && $.Val.isValid(did)) {
        var url = '/iOMC3/lite.php?token='+token+'&do=device&did='+did;
        $("#qz-device-mask").SUILoaderShow();
        $.Ajax.Query(
          url, null,
          $.CB.CB_DeviceDone, $.CB.CB_DevicesError
        );
      } else {
        $.Lite.Start();
      }
    },
    DeviceConfig: function(did) {
      var token = $.Lite.Url.TOKEN();
      if ($.Val.isValid(token)) {
        $("#qz-device-mask").SUILoaderShow();
        $.Ajax.Query(
          '/iOMC3/lite.php?token='+token+'&do=config&did='+did, null,
          $.CB.CB_DeviceConfigDone, $.CB.CB_DeviceConfigError
        );
      }
    },
    DeviceSet: function(did, ops) {
      var token = $.Lite.Url.TOKEN();
      if ($.Val.isValid(token)) {
        $("#qz-device-mask").SUILoaderShow();
        $.Ajax.Query(
          '/iOMC3/lite.php?token='+token+'&do=set&did='+did, ops,
          $.CB.CB_DeviceSetDone, $.CB.CB_DeviceSetError
        );
      } else {
        $.Lite.Start();
      }
    },
    DeviceAlarms: function() {
      console.log('$.Request.DeviceAlarms()> called < TODO');
    },
    MapsDevicesList: function(keyword) {
      var token = $.Lite.Url.TOKEN();
      if ($.Val.isValid(token)) {
        var kw = keyword;
        if (kw == 'undefined') {
          kw = '';
        };
        console.log('keyword of before request =', kw, keyword);
        // TODO: load devices list here
        $("#qz-maps-search").SUILoaderShow();
        // Ajax search keyword, then update Devices [LIST]
        $.Ajax.Query( // qz-common.js: $.Ajax.Query(url, data, done_cb, error_cb);
          '/iOMC3/lite.php?token='+token+'&do=devices&keyword='+kw, null,
          $.CB.CB_MapsDevicesDone, $.CB.CB_MapsDevicesError
        );
      } else {
        $.Lite.Start();
      }
    },
    Tools: function() {

    }
  }
}) (jQuery);


// by Qige <qigezhao@gmail.com> @2017.09.12
// load Microsoft Bing Maps
(function($) {
  $.BingMaps = {
    init: function() {
      console.log('Loading Microsoft Bing Maps');
      if (! $.Lite.data.map) {
        console.log('$.BingMaps.init()');
        $.Lite.data.map = new Microsoft.Maps.Map(document.getElementById('qz-maps-box'), {
          center: new Microsoft.Maps.Location(40.0492, 116.2902),
          credentials: 'AsHiUhyyE-3PP8A82WyPhdS6_Z18NL2cuaySXTGPviswZ_WDmgDlaSZ7xpEF77-3',
          //credentials: '{Your Bing Maps Key}',
          showMapTypeSelector: false, showBreadcrumb: true, enableClickableLogo: false,
          enableSearchLogo: false,
          //mapTypeId: Microsoft.Maps.MapTypeId.aerial,
          maxZoom: 16, minZoom: 10, zoom: 14
        });
      }
    },
    start: function(id) {
    }
  }
}) (jQuery);

// ARN.iOMC3.Lite
var loadMap = $.BingMaps.init; // FIXME: Microsoft Bing Maps Wrapper
$(function() {
  // Application start (lite version)
  $.Lite.InitAll();

  // now wait for user click/input/timer
  $.Lite.Start();
});
