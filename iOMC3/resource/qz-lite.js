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
*     3. Add "$.AutoTest.Start()" script; Qige@2017.09.15
*     4. Parse URL; Qige@2017.09.15
*/

// Handle url/signin/token/devices/maps/tools
(function($) {
  $.Lite = {
    // TOKEN/Timer handles
    data: {},
    
    // Web Application Starts here
    // #list: Devices
    // #maps: Maps
    // #tools: Tools
    // #maps+211+a1b2c3d4f5a1b2c3
    Url: {
      parser: function(idx) {
        var paramAll = null, param = null;
        var url = $.Url.PageWithParams();
        var sections = url.split('#', 2);
        if (sections && sections.length >= 2) {
          paramAll = sections[1].split('+', 3);
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
        var token = $.Lite.Url.TOKEN(), section = null, deviceid = null;
        var page = $.Url.PageOnly();
        if (sec && sec != 'undefined') {
          section = sec;
        } else {
          section = $.Lite.Url.Section();
        }
        if (did && did != 'undefined') {
          deviceid = did;
        } else {
          deviceid = $.Lite.Url.DeviceID();
        }
        var url = page + '#' + token + '+' + section + '+' + deviceid;
        $.Url.Goto(url);
      }
    },
    Start: function() {
      $.LiteUI.Init();
      
      // #TOKEN+maps+122
      var token = $.Lite.Url.TOKEN();
      var section = $.Lite.Url.Section();
      var did = $.Lite.Url.DeviceID();
      console.log('did =', did);
      
      if (token && token != 'undefined' && token != 'null') {
        // TODO: valid TOKEN right away
        
        // Which iOMC3 Section to display
        switch(section) {
          case 'tools':
          case 'options':
            $.Lite.Run.Tools();
            break;
          case 'maps':
            $.Lite.Run.Maps(did);
            break;
          case 'devices':
          case 'device':
          default: 
            var flagAutoLoad = true;
            $.Lite.Run.Devices(flagAutoLoad, did);
            break;
        }
      } else {
        $.Lite.Run.Signin();
      }
    },
    // Goto [*] Blocks
    Run: {
      Signin: function() {
        $.LiteUI.Display.Signin();
      },
      // TODO: display Devices/Maps/Tools after valid [TOKEN]
      Devices: function(flagAutoLoad) {
        $.LiteUI.Display.Devices();
        if (flagAutoLoad && flagAutoLoad != 'undefined') {
          var deviceid = $.Lite.Url.DeviceID();
          $.Request.DevicesList(deviceid);
        }
      },
      Maps: function(flagAutoLoad) {
        $.LiteUI.Display.Maps();
        if (flagAutoLoad && flagAutoLoad != 'undefined') {
          $.Request.MapsDevicesList();
        }
      },
      Tools: function(flagAutoLoad) {
        $.LiteUI.Display.Tools();
        if (flagAutoLoad && flagAutoLoad != 'undefined') {
          $.Request.Tools();
        }
      },
    },
    Update: {
      DevicesStatus: function(msg) {      
        $("#qz-devices-status").SUIMessageSuccess(msg).show();
      },      
      // Update device details via Ajax
      Device: function(did) {
        console.log('$.Lite.DeviceUpdate() did=', did);
        if (did) {
          $("#qz-device-detail").attr('did', did);
          $.Lite.Update.DeviceDetail();
        }
      },
      DeviceDetail: function() {
        var did = $("#qz-device-detail").attr('did');
        if (did) {
          $.Request.DeviceDetail(did);
        }
      },
      DeviceConfig: function() {
        var did = $("#qz-device-detail").attr('did');
        if (did) {
          $.Request.DeviceConfig(did);
        }        
      }
    },
    CB: {
      CB_SigninError: function(xhr, status, error) {
        console.log('$.Request.CB_SigninError()');
        $("#qz-signin-message").SUIMessageError('通信错误，请重试').show();
        
        $("#qz-signin-btn-go,#qz-signin-btn-default").BtnEnable();
        $("#qz-signin-mask").SUILoaderHide();
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
            var page = $.Url.PageOnly();
            var url = page + '#'+token;
            setTimeout(function() {
              console.log('* url after signin> ', url);
              var flagAutoLoad = true;
              $.Url.Goto(url);
              $.Lite.Run.Devices(flagAutoLoad);
            }, 1000);
            break;
          case '404':
          default:
            $("#qz-signin-message").SUIMessageError('通信失败，请重试').show();
            break;
        }
        $("#qz-signin-mask").SUILoaderHide();
      },
      CB_DevicesDone: function(resp) {
        var error = resp && resp.error ? resp.error : '404';
        switch(error) {
          case 'none':
            var data = resp.data;
            $.LiteUI.Update.DevicesList(data.devices_total, data.devices_qty, data.devices);
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
        var error = resp && resp.error ? resp.error : '404';
        console.log('CB_DeviceDone> error =', error);      
        switch(error) {
          case 'none':
            if ($.LiteUI.Update.Device(resp.data)) {
              var did = $("#qz-device-detail").attr('did');
              $.Lite.Url.Set('device', did);
              
              // update Timestamp
              var ts = new Date().toTimeString();
              $.Lite.Update.DevicesStatus('设备信息已更新 @'+ts);
            } else {
              $.Lite.CB.CB_DeviceError();
            }
            break;
          case '404':
          default:
            $.Lite.CB.CB_DeviceError();
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
        var error = resp && resp.error ? resp.error : '404';
        console.log('CB_DeviceConfigDone> error =', error);      
        switch(error) {
          case 'none':
            if ($.LiteUI.Update.DeviceConfig(resp.data)) {        
              var ts = new Date().toTimeString();
              $.Lite.Update.DevicesStatus('设备配置已更新 @'+ts);
            } else {
              $.Lite.CB.CB_DeviceConfigError();
            }
            break;
          case '404':
          default:
            $.Lite.CB.CB_DeviceConfigError();
            break;
        }

        $("#qz-device-mask").SUILoaderHide();
      },
      CB_DeviceConfigError: function(xhr, status, error) {
        var ts = new Date().toTimeString();
        $("#qz-devices-status").SUIMessageError('设备配置获取失败 @'+ts).show();
        
        $("#qz-device-mask").SUILoaderHide();
      },
      CB_MapsDeviceDone: function(resp) {
        var error = resp && resp.error ? resp.error : '404';
        switch(error) {
          case 'none':
            var data = resp.data;
            $.LiteUI.Update.MapsDevicesList(data.devices_total, data.devices_qty, data.devices);
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
          $.Lite.Run.Maps();
        });
        $("#qz-nav-tools").click(function() {
          var url = $.Lite.Url.Set('tools');
          $.Url.Goto(url);
          $.Lite.Run.Tools();
        });

        // Nav [SEARCH]
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
          $.Request.Signin(user, passwd, $.Lite.CB.CB_SigninDone, $.Lite.CB.CB_SigninError);
        });
        $("#qz-signin-btn-default").click(function() {
          $("#qz-btn-signin-default").BtnDisable();
          $("#qz-signin-user").val('admin');
          $("#qz-signin-passwd").val('6wilink');
          $("#qz-signin-btn-go").BtnEnable();
          $("#qz-signin-btn-go").trigger('click');
        });
      },
      Devices: function() {
        // Devices.[FILTER]: Combined keywords: 
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
        
        // search when keyword/pattern not empty
        // Devices [SEARCH]
        $("#qz-devices-text-keyword").focus(function() {
          $(this).select();
        }).keydown(function(e) {
          //console.log('search when hit ENTER');
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
          $.Lite.Update.DeviceDetail();
        });
        $("#qz-device-btn-config,#qz-device-btn-config-update").click(function() {
          $.LiteUI.Config.Show();
          $.Lite.Update.DeviceConfig();
        });
        $("#qz-device-btn-config-done").click(function() {
          // save, prompt, hide
          $.LiteUI.Config.Hide();
        });
        // save, prompt, hide
        $("#qz-device-btn-config-save").click(function() {
          //$.LiteUI.Config.Save();
        });
        $("#qz-device-btn-maps").click(function() {
          var did = $("#qz-device-detail").attr('did');
          $.Lite.Url.Set('maps', did);
          $.Lite.Run.Maps();
          //$.Tab.Reload();
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
      },
      Maps: function() {
        
      },
      Tools: function() {
        $("#qz-tools-tools").click(function() {
          $.LiteUI.Tools.Tools();
        });
        $("#qz-tools-services").click(function() {
          $.LiteUI.Tools.Services();
        });
      }
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
        console.log(data.device, data.device.mac);
        if (data && data.device && data.device.mac) {
          var device = data.device;
          $("#qz-devices-device-name").val(device.name);
          $("#qz-devices-device-id").val(device.mac + ' / ' + device.wmac);
          
          $("#qz-devices-device-mode").val($.GWS.Mode(device.base.mode));
          $("#qz-devices-device-freq").val($.GWS.Freq(device.wireless.region, device.wireless.channel, device.wireless.freq));
          $("#qz-devices-device-txpower").val($.GWS.Txpower(device.wireless.txpower, device.wireless.watt));
          $("#qz-devices-device-chanbw").val(device.wireless.chanbw + ' MHz');

          $("#qz-devices-device-ip").val(device.ip);
          $("#qz-devices-device-netmask").val(device.network.netmask);
          $("#qz-devices-device-gw").val(device.network.gateway);

          // update Devices.Device.[ICON]
          $("#qz-devices-device-ip-icon").text(device.ip);
          $("#qz-devices-device-name-alarm").text(device.name);
          $("#qz-devices-device-freq-icon").text(device.wireless.freq);
          return true;
        }
        return false;
      },
      DevicesList: function(total, qty, list) {
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
              html = '<a class="item" id="'+ id +'">' + name + '<div class="ui yellow label">'+alarms+'</div></a>';
            } else {
              html = '<a class="item" id="'+ id +'">' + name + '</a>';
            }
            list_header.after(html);
          });
          
          // update Device Qty
          list_header.find(".label").text(qty);
                    
          // Bind [CLICK] again
          var devices = list_header.nextAll();
          devices.click(function() {
            $("#qz-devices-list-header").nextAll().removeClass('active');
            $(this).addClass('active');

            var id = $(this).attr('id');
            console.log('try first child > id=', id);
            $.Lite.Update.Device(id);
          });

          // select first result when done
          devices.first().trigger('click');      
        }
      },
      DeviceConfig: function(data) {
        console.log(data.device, data.device.name);
        if (data && data.device && data.device.name) {
          var device = data.device;
          $("#qz-device-config-name").val(device.name);
          $("#qz-device-config-ip").val(device.network.ip);
          $("#qz-device-config-netmask").val(device.network.netmask);
          $("#qz-device-config-gw").val(device.network.gateway);
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
    },
    DevicesList: function(keyword) {
      var kw = '', url = '/iOMC3/lite.php?do=devices';
      if (keyword && keyword != 'undefined') {
        kw = keyword.toString();
        url += ('&keyword='+kw);
      };
      console.log('keyword of before request =', kw, keyword);
      // TODO: load devices list here
      $("#qz-devices-search").SUILoaderShow();
      // Ajax search keyword, then update Devices [LIST]
      $.Ajax.Query( // qz-common.js: $.Ajax.Query(url, data, done_cb, error_cb);
        url, null, 
        $.Lite.CB.CB_DevicesDone, $.Lite.CB.CB_DevicesError
      );
    },
    DeviceDetail: function(did) {
      $("#qz-device-mask").SUILoaderShow();
      $.Ajax.Query(
        '/iOMC3/lite.php?do=device&did='+did, null,
        $.Lite.CB.CB_DeviceDone, $.Lite.CB.CB_DevicesError
      );
    },
    DeviceConfig: function(did) {
      $("#qz-device-mask").SUILoaderShow();
      $.Ajax.Query(
        '/iOMC3/lite.php?do=config&did='+did, null,
        $.Lite.CB.CB_DeviceConfigDone, $.Lite.CB.CB_DeviceConfigError
      );
    },
    MapsDevicesList: function(keyword) {
      var kw = keyword;
      if (kw == 'undefined') {
        kw = '';
      };
      console.log('keyword of before request =', kw, keyword);
      // TODO: load devices list here
      $("#qz-maps-search").SUILoaderShow();
      // Ajax search keyword, then update Devices [LIST]
      $.Ajax.Query( // qz-common.js: $.Ajax.Query(url, data, done_cb, error_cb);
        '/iOMC3/lite.php?do=devices&keyword='+kw, null, 
        $.Lite.CB.CB_MapsDevicesDone, $.Lite.CB.CB_MapsDevicesError
      );
    },
    Tools: function() {
      
    }
  }
}) (jQuery);

(function($) {
  $.GWS = {
    Mode: function(mode) {
      var mode_str = '子站';
      switch(mode) {
        case 'mesh':
        case 'adhoc':
        case 'ad-hoc':
          mode_str = '自组网';
          break;
        case 'car':
        case 'ap':
          mode_str = '基站';
          break;
        case 'ear':
        case 'sta':
        default:
          mode_str = '子站';
          break;
      }
      return mode_str;
    },
    Freq: function(region, channel, freq) {
      return '区域' + region + ' / 频道' + channel + ' / ' + freq + ' MHz';
    },
    Txpower: function(dbm, watt) {
      return dbm + ' dBm / ' + watt + '瓦';
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
  $.Lite.Init.Nav();
  $.Lite.Init.Signin();
  $.Lite.Init.Devices();
  $.Lite.Init.Maps();
  $.Lite.Init.Tools();
  
  $.Lite.Start();
  // now wait for user click/input/timer
});

