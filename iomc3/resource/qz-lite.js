/*
 * by Qige <qigezhao@gmail.com> since 2017.09.07
 * 1 [TAB] = 4 [SPACEs]
 * last update: 20180226
 * last update: 20180414

 */

// Handle url/signin/token/devices/maps/tools
(function($) {
	$.Lite = {
		defaults: {
			signin: {
				username: 'admin',
				password: '6harmonics'
			},
			interval: {
				auditAll: 1000,
				deviceDetail: 2000
			}
		},
		// Timer handlers: $.Lite.data.Timers.UISync,
		// $.Lite.data.Timers.DeviceFetchLatest
		// Device Detail id;
		data: {},

		// Web Application Starts here
        // #devices|search|maps|tools
		// Eg. #a1b2c3d4f5aa1b2c3d4f5aa1b2c3d4f5aa1b2c3d4f5a-maps-211
		Url: {
			parser: function(idx) {
				var paramAll = null, param = null;
				var url = $.Url.PageWithParams();
				var sections = url.split('#', 2);
				if (idx >= 0 && sections && sections.length >= 2) {
					paramAll = sections[1].split('-', 3);
					if (paramAll && paramAll.length > idx) {
						param = paramAll[idx];
					}
				}
				return param;
			},
			TOKEN: function() {
				return $.Lite.Url.parser(0);
			},
			Section: function() {
				return $.Lite.Url.parser(1);
			},
			DeviceID: function() {
				var did = $.Lite.Url.parser(2);
                return ($.Val.IsInt(did) ? did : null);
			},
			Set: function(sec, did) {
				var token = $.Lite.Url.TOKEN();
				if ($.Val.IsValid(token)) {
                    // make url
					var page = $.Url.PageOnly();
					var section = ($.Val.IsValid(sec) ? sec : $.Lite.Url.Section());
                    var deviceId = ($.Val.IsValid(did) ? did : $.Lite.Url.DeviceID());
                    var param = [token, section, deviceId];

                    var url = page + '#' + param.join('-');
					$.Url.GotoAnchor(url);
				} else {
					$.Lite.Run.Signout();
				}
			},
			Clear: function() {
				$.Lite.Url.Set();
			}
		},
		Start: function() {
			$.LiteUI.Init();

			// #{TOKEN}-{Section}-{DeviceID}
			var token = $.Lite.Url.TOKEN();
			var section = $.Lite.Url.Section();
			var did = $.Lite.Url.DeviceID();
			//console.log('$.Lite.Start said: t/s/d =', token, section, did);

			// {TOKEN} will be validated when send Ajax requests
			// and will be redirect to Signout if error
			if ($.Val.IsValid(token)) {
				// Which iOMC3 Section to display
				switch (section) {
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
                        var flagAutoLoad = true;
                        $.Lite.Run.Devices(flagAutoLoad);
                        break;
                    case 'msg':
                    case 'config':
                    case 'search':
                    default:
                        var flagAutoLoad = true;
                        $.Lite.Run.Devices(flagAutoLoad, did);
                        break;
				}
				// Start background ARN.iOMC3.Audit
				$.BG.TimerStartAll();
			} else {
				$.BG.TimerStopAll();
				// default: disply signin
                // NOTE: NEVER REPLACE this Signin with Signout
				$.Lite.Run.Signin();
			}
		},
		// Goto [*] Blocks
		Run: {
			Signin: function() {
				$.LiteUI.Display.Signin();
			},
			Signout: function() {
				var url = '/iomc3/';
				$.Url.GotoAnchor(url);
			},
			Dashboard: function() {
				$.LiteUI.Display.Dashboard();
			},
			// display Devices/Maps/Tools
			// load data via Ajax using valid {TOKEN}
			Devices: function(flagAutoLoad) {
				$.LiteUI.Display.Devices();
				$.Request.Devices(flagAutoLoad);
			},
			Maps: function(flagAutoLoad) {
				$.LiteUI.Display.Maps();
				$.Request.DevicesInMaps(flagAutoLoad);
			},
			Tools: function(flagAutoLoad) {
				$.LiteUI.Display.Tools();
				$.Request.Tools(flagAutoLoad);
			},
		},
		Update: {
			DevicesStatus: function(msg, flagSuccessful) {
                if (flagSuccessful) {
                    $("#qz-devices-status").SUIMessageSuccess(msg).show();
                } else {
                    $("#qz-devices-status").SUIMessageError(msg).show();
                }
			},

			// Update device details via Ajax
			// NOTE: must pass in a valid device id
			DeviceDetail: function(did) {
				if (did) {
					var data = $.Val.IsValid($.Lite.data) ? $.Lite.data: null;
					if (! data) {
						data = {};
					}
                    data.DeviceId = did;

					$.Lite.data = data;
					$.Request.DeviceDetail(did);

					// FIXME: trigger config update right away
					//$.Lite.Update.DeviceConfig();
				}
			},
			DeviceCollectConfig: function(did) {
				if ($.Val.IsValid(did)) {
					$.LiteUI.DeviceConfig.Saving();
					var name = $("#qz-device-config-name").val();
					var latlng = $("#qz-device-config-latlng").val();

                    var ip = $("#qz-device-config-ip").val();
					var mask = $("#qz-device-config-netmask").val();
					var gw = $("#qz-device-config-gw").val();

                    var mode = $("#qz-device-config-mode").find('input').val();

                    var region = $("#qz-device-config-region").find('input').val();
					var freq = $("#qz-device-config-freq").val();
					var channel = $("#qz-device-config-channel").val();
					var txpower = $("#qz-device-config-txpower").find('input').val();

					$.Request.DeviceConfigSave(did, {
                        did: did, ops: 'config',
						name: name, latlng: latlng,
						ip: ip, mask: mask, gw: gw,
						mode: mode,
						region: region, freq: freq, channel: channel, txpower: txpower
					});
				}
			},
			DeviceConfigOptions: function(did) {
				if ($.Val.IsInt(did)) {
					$.Request.DeviceConfigOptions(did);
				}
			},
            MapsDeviceDetail: function(did, lat, lng) {
                //console.log('* should move maps center to this device pos:', lat, lng);
                var dmap = $.Lite.data.map;
                if ($.Val.IsValid(dmap)) {
                    var center = new Microsoft.Maps.Location(lat, lng);
                    dmap.setView({
                        center: center
                    });
                } else {
                    console.log('* ERROR: Maps is not ready.');
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
				$("#qz-nav-dashboard").click(function() {
					$.Lite.Url.Set('dashboard');
				});
				$("#qz-nav-devices").click(function() {
					$.Lite.Url.Set('devices');

					var flagAutoLoad = true;
					$.Lite.Run.Devices(flagAutoLoad);
				});
				$("#qz-nav-maps").click(function() {
					$.Lite.Url.Set('maps');

					var flagAutoLoad = true;
					$.Lite.Run.Maps(flagAutoLoad);
				});
				$("#qz-nav-tools").click(function() {
					//$.Lite.Url.Set('tools');
					//$.Lite.Run.Tools();
				});

				// [Nav].[SEARCH]
				$("#qz-nav-text-keyword").focus(function() {
					$(this).select();
				}).keydown(function(e) {
					// console.log('search when hit ENTER');
					if (e.keyCode == 13) {
						$(this).select();
						$("#qz-nav-btn-search").trigger('click');
					}
				});
				// wrapper of Devices.Search
				$("#qz-nav-btn-search").click(function() {
					var keyword = $("#qz-nav-text-keyword").val();

					// Devices.Search
					var flagAutoLoad = false;
					$.Lite.Run.Devices(flagAutoLoad);

					$("#qz-devices-text-keyword").val(keyword);
					$("#qz-devices-btn-search").trigger('click');
				});

				// FIXME: need Ajax to let server know that {TOKEN} is expired?
				$("#qz-nav-btn-signout").click(function() {
					$.Lite.Run.Signout();
				});
			},
			Signin: function() {
				// Signin
				$("#qz-signin-user,#qz-signin-passwd").focus(function() {
					$(this).select();
				}).bind('blur focus', function() {
                    // FIXME: require minimum length?
					var user = $("#qz-signin-user").val();
					var passwd = $("#qz-signin-passwd").val();
					if ($.Val.IsValid(user) && $.Val.IsValid(passwd)) {
						$("#qz-signin-btn-go").BtnEnable();
					} else {
						$("#qz-signin-btn-go").BtnDisable();
					}
				});
				$("#qz-signin-btn-go").click(function() {
                    var user = $("#qz-signin-user").val();
                    var passwd = $("#qz-signin-passwd").val();
                    if ($.Val.IsValid(user) && $.Val.IsValid(passwd)) {
                        $.Request.Signin(user, passwd, $.CB.CB_SigninDone, $.CB.CB_SigninError);
                        $("#qz-signin-btn-go,#qz-signin-btn-default").BtnDisable();
                    }
                });
				$("#qz-signin-btn-default").click(function() {
                    $("#qz-btn-signin-default").BtnDisable();

                    $("#qz-signin-user").val($.Lite.defaults.signin.username);
                    $("#qz-signin-passwd").val($.Lite.defaults.signin.password);
                    $("#qz-signin-btn-go").BtnEnable().trigger('click');
                });
			},
			Devices: function() {
				// Devices.[FILTER]: Combined keywords:
				// Status::offline/:online/:alarms/:all
				// Orderby: +ip/+name/+search
				$("#qz-devices-filter").find(".item").click(function() {
                    var keyword = $("#qz-devices-text-keyword").val();
                    var keyword_selected = $(this).attr('title');
                    var keyword_target = keyword_selected;
                    if (keyword.indexOf(':') > -1
                            && keyword.indexOf('+') > -1) {
                        // FIXME: replace equal keywords, not assign it
                        // directly
                        keyword_target = keyword_selected;
                    } else {
                        if (keyword.indexOf(':') > -1) {
                            if (keyword_selected.indexOf('+') > -1) {
                                keyword_target = keyword + ' '
                                        + keyword_selected;
                            }
                        }
                        if (keyword.indexOf('+') > -1) {
                            if (keyword_selected.indexOf(':') > -1) {
                                keyword_target = keyword + ' '
                                        + keyword_selected;
                            }
                        }
                    }

                    $("#qz-devices-text-keyword").val(keyword_target);
                    $("#qz-devices-btn-search").trigger('click');
                });

				// search when keyword/pattern not empty
				// Devices [SEARCH]
				$("#qz-devices-text-keyword").focus(function() {
					$(this).select();
				}).keydown(function(e) {
					if (e.keyCode == 13) {
						$("#qz-devices-btn-search").trigger('click');
					}
				});
				$("#qz-devices-btn-search").click(function() {
                    var kw_input = $("#qz-devices-text-keyword");
					var keyword = kw_input.val();

					var flagAutoLoad = true;
					$.Request.Devices(flagAutoLoad, keyword);
                    kw_input.select();

                    if ($.Val.IsInt(keyword)) {
                        $.Lite.Url.Set('search', keyword);
                    }
				});

                // TODO: reserved
				$("#qz-devices-qrcode").popup({
					position: 'right center',
					target: '#qz-devices-qrcode',
				});

				// Devices.Detail.[Tab]
				$("#qz-device-base").click(function() {
					$.LiteUI.Device.Base();
				});
				$("#qz-device-wireless").click(function() {
					$.LiteUI.Device.Wireless();
				});
				$("#qz-device-network").click(function() {
					$.LiteUI.Device.Network();
				});

				// Devices.Alarms.[Tab]
				$("#qz-device-btn-alarms").click(function() {
					//$.LiteUI.DeviceAlarms.Show();
				});
				$("#qz-device-btn-alarms-close").click(function() {
					$.LiteUI.DeviceAlarms.Hide();
				});
				$("#qz-device-alarms-all").click(function() {
					$.LiteUI.DeviceAlarms.All();
				});
				$("#qz-device-alarms-tofix").click(function() {
					$.LiteUI.DeviceAlarms.Tofix();
				});
				$("#qz-device-alarms-history").click(function() {
					$.LiteUI.DeviceAlarms.History();
				});

				$("#qz-device-links").click(function() {
					$.LiteUI.KPI.Links();
				});
				$("#qz-device-thrpt").click(function() {
					$.LiteUI.KPI.Thrpt();
				});
				$("#qz-device-btn-update").click(function() {
                    var data = $.Val.IsValid($.Lite.data) ? $.Lite.data : null;
                    var did = data && $.Val.IsValid(data.DeviceId) ? $.Lite.data.DeviceId : null;
                    $.Lite.Update.DeviceDetail(did);
                });
				$("#qz-device-btn-config,#qz-device-btn-config-update").click(function() {
                    var data = $.Val.IsValid($.Lite.data) ? $.Lite.data : null;
                    var did = data && $.Val.IsValid(data.DeviceId) ? $.Lite.data.DeviceId : null;
                    $.Lite.Update.DeviceConfigOptions(did);
                    $.LiteUI.DeviceConfig.Show();
                    $.LiteUI.DeviceConfig.Saved();
                });
				$("#qz-device-btn-config-close").click(function() {
					// save, prompt, hide
					$.LiteUI.DeviceConfig.Hide();
				});
				$("#qz-device-btn-maps").click(function() {
					var did = $("#qz-device-detail").attr('did');
					$.Lite.Url.Set('maps', did);

                    var flagAutoLoad = true;
					$.Lite.Run.Maps(flagAutoLoad);
				});
				$("#qz-device-config-basic").click(function() {
					$.LiteUI.DeviceConfig.Basic();
				});
				$("#qz-device-config-wireless").click(function() {
					$.LiteUI.DeviceConfig.Wireless();
				});
				$("#qz-device-config-advanced").click(function() {
					$.LiteUI.DeviceConfig.Advanced();
				});

				// Bind Region/Channel/Frequency calculation
				// TODO: support Model# in the future
				$("#qz-device-config-region").change(function() {
					$.LiteUI.DeviceConfig.GWS('region');
				});
				$("#qz-device-config-channel").on('blur change', function() {
					$.LiteUI.DeviceConfig.GWS('channel');
				}).keydown(function(e) {
					if (e.keyCode == 13) {
						$.LiteUI.DeviceConfig.GWS('channel');
					}
				});
				$("#qz-device-config-freq").on('blur change', function() {
					$.LiteUI.DeviceConfig.GWS('freq');
				}).keydown(function(e) {
					if (e.keyCode == 13) {
						$.LiteUI.DeviceConfig.GWS('freq');
					}
				});

				// ask user first in case wrong click
				$("#qz-device-btn-config-save").click(function() {
                    $("#qz-device-config-confirm").attr('ops', 'save-config').modal('show');
                });
				$("#qz-device-btn-reset-network").click(function() {
                    $("#qz-device-config-confirm").attr('ops', 'reset-network').modal('show');
                });
				$("#qz-device-config-reset-wireless").click(function() {
                    $("#qz-device-config-confirm").attr('ops', 'reset-wireless').modal('show');
                });
				$("#qz-device-config-confirm-yes").click(function() {
                    $("#qz-device-config-confirm").modal('hide');

                    var data = $.Val.IsValid($.Lite.data) ? $.Lite.data: null;
                    var did = data && $.Val.IsValid(data.DeviceId) ? data.DeviceId : null;
                    var ops = $("#qz-device-config-confirm").attr('ops') || 'unknown';
                    switch (ops) {
                        case 'undefined':
                        case 'unknown':
                        case null:
                        case 'null':
                            break;
                        case 'save-config':
                            $.Lite.Update.DeviceCollectConfig(did);
                            break;
                        default:
                            $.Request.DeviceConfigSave(did, {
                                ops: ops
                            });
                            break;
                    }
                });
				$("#qz-device-config-confirm-no").click(function() {
					$("#qz-device-config-confirm").modal('hide');
					$.LiteUI.DeviceConfig.SaveAbort();
				});

				$("#qz-device-config-wireless-tools").click(function() {
					$.Lite.Url.Set('tools', 'radio');
					$.Lite.Run.Tools();
				});
			},
			Maps: function() { // TODO: bind all button/input event(s) here
				$("#qz-maps-text-keyword").focus(function() {
					$(this).select();
				}).keydown(function(e) {
					if (e.keyCode == 13) {
						$("#qz-maps-btn-search").trigger('click');
					}
				});
				$("#qz-maps-btn-search").click(function() {
                    var kw_input = $("#qz-maps-text-keyword");
					var keyword = kw_input.val();

					var flagAutoLoad = true;
                    $.Request.DevicesInMaps(flagAutoLoad, keyword);
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
})(jQuery); // $.Lite

// ARN.iOMC3.Audit: run in background
// setup Timers
(function($) {
	$.BG = {
		// call for ARN.iOMC3.Audit result
		TimerStartAll: function() {
			$.BG.UITmrAdd.AuditAll();
			$.BG.UITmrAdd.DeviceFetchLatest();
		},
		TimerStopAll: function() {
			$.BG.timerStopByHandlers();
		},
		UITmrAdd: {
			AuditAll: function() {
				var data = $.Val.IsValid($.Lite.data) ? $.Lite.data: null;
				var tmrs = data && $.Val.IsValid(data.Timers) ? data.Timers : null;
				var tmr = tmrs && $.Val.IsValid(tmrs.auditAll) ? tmrs.auditAll : null;
				if (! $.Val.IsValid(tmr)) {
					var t = setInterval($.Request.AuditAll, $.Lite.defaults.interval.auditAll);

					if (! data) $.Lite.data = {};
					if (! tmrs) $.Lite.data.Timers = {};
					$.Lite.data.Timers.auditAll = t;
				}
			},
			DeviceFetchLatest: function() {
				var data = $.Val.IsValid($.Lite.data) ? $.Lite.data: null;
				var tmrs = data && $.Val.IsValid(data.Timers) ? data.Timers : null;
				var tmr = tmrs && $.Val.IsValid(tmrs.DeviceFetchLatest) ? tmrs.DeviceFetchLatest : null;
				if (!$.Val.IsValid(tmr)) {
					var t = setInterval($.Request.DeviceFetchLatest, $.Lite.defaults.interval.deviceDetail);

                    if (!data) $.Lite.data = {};
					if (!tmrs) $.Lite.data.Timers = {};
					$.Lite.data.Timers.DeviceFetchLatest = t;
				}
			}
		},
		timerStopByHandlers: function() {
			var data = $.Val.IsValid($.Lite.data) ? $.Lite.data: null;
			var tmrs = $.Val.IsValid(data.Timers) ? $.Lite.data.Timers: null;
			if ($.Val.IsValid(tmrs) && $.Val.IsArray(tmrs)) {
				$.each(tmrs, function(idx, tmr) {
					clearInterval(tmr);
					console.log('* timer stopped', tmr);
				});
			}

			// FIXME: clean all data here
			$.Lite.data.Timers = {};
		}
	}
})(jQuery); // $.BG

// callback of Ajax
(function($) {
	$.CB = {
		CB_SigninError: function(xhr, status, error) {
			console.log('$.Request.CB_SigninError()');
			$("#qz-signin-message").SUIMessageError('登录失败，请重试').show();

			$("#qz-signin-btn-go,#qz-signin-btn-default").BtnEnable();
			$("#qz-signin-mask").SUILoaderHide();
		},
		CB_SigninDone: function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}
			//console.log('$.CB.CB_SigninDone()> error =', error);
			switch (error) {
                case 'bad_auth_user_or_password':
                    $("#qz-signin-message").SUIMessageError('用户名或密码不正确，请重试').show();
                    break;
                case 'none':
                    $("#qz-signin-message").SUIMessageSuccess('登录成功，正在载入数据').show();
                    setTimeout(function() {
                        // FIXME: verify data iterately
                        var data = $.Val.IsValid(resp.data) ? resp.data: null;
                        var auth = data && $.Val.IsValid(data.auth) ? data.auth : null;
                        var token = auth && $.Val.IsValid(auth.token) ? auth.token : null;
                        var page = $.Url.PageOnly();

                        // set url & call
                        var url = page + '#' + token;
                        $.Url.GotoAnchor(url);

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
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}
			switch (error) {
                case 'none':
                    var data = resp.data;
                    $.LiteUI.Update.DevicesList(data);
                    break;
                case 'bad_auth_token':
                    $.Lite.Run.Signout();
                    break;
                case '404':
                default:
                    $.CB.CB_DevicesError();
                    $.Lite.Run.Signout();
                    break;
			}

			// update Timestamp
			var ts = new Date().toLocaleString();
            var flagSuccessful = true;
			$.Lite.Update.DevicesStatus('设备列表已更新 @' + ts, flagSuccessful);

			$("#qz-devices-search").removeClass("loading");
		},
		CB_DevicesError: function(xhr, status, error) {
			var ts = new Date().toLocaleString();
            var flagSuccessful = false;
			$.Lite.Update.DevicesStatus('设备列表获取失败 @' + ts, flagSuccessful);

			$("#qz-devices-search").removeClass("loading");
		},
		CB_DeviceDone: function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}

			switch (error) {
                case 'none':
                    if ($.LiteUI.Update.Device(resp.data)) {
                        var data = $.Val.IsValid($.Lite.data) ? $.Lite.data: null;
                        var did = data && $.Val.IsValid(data.DeviceId) ? $.Lite.data.DeviceId : null;

                        // fix "maps" -> "devices", due to detail update interval
                        /*if ($.Val.IsInt(did)) {
                            $.Lite.Url.Set('devices', did);
                        }*/
                    } else {
                        $.CB.CB_DeviceError();
                    }
                    break;
                case 'bad_auth_token':
                    $.Lite.Run.Signout();
                    break;
                case '404':
                default:
                    $.CB.CB_DeviceError();
                    break;
			}

			// $("#qz-device-mask").SUILoaderHide();
		},
		CB_DeviceError: function(xhr, status, error) {
			var ts = new Date().toLocaleString();
			$("#qz-devices-status").SUIMessageError('设备信息获取失败 @' + ts).show();

			$("#qz-device-mask").SUILoaderHide();
		},
		CB_DeviceConfigDone: function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}

			switch (error) {
                case 'none':
                    if ($.LiteUI.Update.DeviceConfig(resp.data)) {
                        var ts = new Date().toLocaleString();
                        var flagSuccessful = true;
                        $.Lite.Update.DevicesStatus('设备配置已更新 @' + ts, flagSuccessful);
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
			var ts = new Date().toLocaleString();
			$("#qz-devices-status").SUIMessageError('设备配置获取失败 @' + ts).show();

			$("#qz-device-mask").SUILoaderHide();
		},
		CB_DeviceSetDone: function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}

			switch (error) {
                case 'none':
                    var ts = new Date().toLocaleString();
                    var flagSuccessful = true;
                    $.Lite.Update.DevicesStatus('设备操作已完成 @' + ts, flagSuccessful);

                    // reload device list
                    var flagAutoLoad = true;
                    $.Lite.Run.Devices(flagAutoLoad);
                    break;
                case '404':
                default:
                    $.CB.CB_DeviceSetError();
                    break;
			}

			$.LiteUI.DeviceConfig.Saved()
			$("#qz-device-mask").SUILoaderHide();
		},
		CB_DeviceSetError: function(xhr, status, error) {
			var ts = new Date().toLocaleString();
			$("#qz-devices-status").SUIMessageError('设备操作失败 @' + ts).show();

			$.LiteUI.DeviceConfig.Saved();
			$("#qz-device-mask").SUILoaderHide();
		},
		CB_DeviceInMapsDone: function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}

			switch (error) {
                case 'none':
                    var data = resp.data;
                    $.LiteUI.Update.MapsDevicesList(data);
                    break;
                case 'noauth':
                case '404':
                default:
                    $.Lite.Run.Signout();
                    break;
			}

			// update Timestamp
			var ts = new Date().toLocaleString();
            var flagSuccessful = true;
			$.Lite.Update.DevicesStatus('地图设备列表已更新 @' + ts, flagSuccessful);

			$("#qz-maps-search").removeClass("loading");
			$("#qz-maps-mask").SUILoaderHide();
		},
		CB_DeviceInMapsError: function(xhr, status, error) {
			var ts = new Date().toLocaleString();
			$.Lite.Update.DevicesStatus('地图设备列表获取失败 @' + ts);

			$("#qz-maps-search").removeClass("loading");
		},
        CB_AuditAll: function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}

			switch (error) {
                case 'none':
                    var data = resp.data;
                    $.LiteUI.Update.NavBar(data);
                    break;
                case 'noauth':
                case '404':
                default:
                    $.Lite.Run.Signout();
                    break;
			}
        },
        CB_AuditAllError: function(xhr, status, error) {
            $.LiteUI.Update.NavBar(null);
        }
	}
})(jQuery); // $.CB

// all Ajax requests
(function($) {
	$.Request = {
		AuditAll: function() {
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token)) {
				var url = '/iomc3/ws.php?do=audit_all&token=' + token;
				$.Ajax.Query(url, null, $.CB.CB_AuditAll, $.CB.CB_AuditAllError);
			} else {
				$.Lite.Start();
			}
		},
		DeviceFetchLatest: function() {
			var data = $.Val.IsValid($.Lite.data) ? $.Lite.data: null;
			var did = data && $.Val.IsValid(data.DeviceId) ? data.DeviceId : null;
			if ($.Val.IsValid(did)) {
				$.Request.DeviceDetail(did);
			}
		},
		Signin: function(user, passwd, done_cb, error_cb) {
			var url = "/iomc3/ws.php?do=signin";
			if ($.Val.IsValid(user) && user.length >= 5
					&& $.Val.IsValid(passwd) && passwd.length >= 5)
            {
				$("#qz-btn-signin").BtnDisable();
				$("#qz-signin-mask").SUILoaderShow();
				$.Ajax.Query(url, {
					user: user,
					passwd: passwd
				}, done_cb, error_cb);
			}
		},
		Devices: function(flagAutoLoad, keyword) {
			var kw = '';
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token)) {
				if (flagAutoLoad) {
					var url = '/iomc3/ws.php?do=devices&token=' + token;
					if (keyword && keyword != 'undefined') {
						kw = keyword.toString();
						url += ('&keyword=' + kw);
					}

					// Ajax search keyword, then update Devices [LIST]
					$("#qz-devices-search").SUILoaderShow();
					$.Ajax.Query(url, null, $.CB.CB_DevicesDone, $.CB.CB_DevicesError);
				}
			} else {
				$.Lite.Start();
			}
		},
		DeviceDetail: function(did) {
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token)) {
				if ($.Val.IsValid(did)) {
					var url = '/iomc3/ws.php?do=detail&did=' + did + '&token=' + token;
					// $("#qz-device-mask").SUILoaderShow();
					$.Ajax.Query(url, null, $.CB.CB_DeviceDone, $.CB.CB_DevicesError);
				}
			} else {
				$.Lite.Start();
			}
		},
		DeviceConfigOptions: function(did) {
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token) && $.Val.IsValid(did)) {
				var url = '/iomc3/ws.php?do=options&did=' + did + '&token=' + token;
				// $("#qz-device-mask").SUILoaderShow();
				$.Ajax.Query(url, null, $.CB.CB_DeviceConfigDone, $.CB.CB_DeviceConfigError);
			}
		},
		DeviceConfigSave: function(did, ops) {
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token)) {
				var url = '/iomc3/ws.php?do=config&did=' + did + '&token=' + token;
				$("#qz-device-mask").SUILoaderShow();
				$.Ajax.Query(url, ops, $.CB.CB_DeviceSetDone, $.CB.CB_DeviceSetError);
			} else {
				$.Lite.Start();
			}
		},
		DeviceAlarms: function() {
			console.log('$.Request.DeviceAlarms()> called < TODO');
		},
		DevicesInMaps: function(flagAutoLoad, keyword) {
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token)) {
				if (flagAutoLoad) {
					var kw = keyword;
					if (! $.Val.IsValid(kw)) {
						kw = '';
					}
					var url = '/iomc3/ws.php?do=maps&keyword=' + kw + '&token=' + token;
					$("#qz-maps-search").SUILoaderShow();
					$.Ajax.Query(url, null, $.CB.CB_DeviceInMapsDone, $.CB.CB_DeviceInMapsError);
				}
			} else {
				$.Lite.Start();
			}
		},
		Tools: function() {

		}
	}
})(jQuery); // $.Request

// UI related
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
				$('#qz-signin-message').SUIMessageInfo('请填写正确的用户名和密码，然后点击“登录”。');
				$("#qz-signin").show();
			},
			Dashboard: function() {
				console.log('TODO: $.LiteUI.Display.Dashboard called');
			},
			Devices: function() {
				$.LiteUI.Display.init();
				$("#qz-nav-devices").addClass('active');

				// init tabs
				$.LiteUI.Device.Wireless();
				$.LiteUI.DeviceAlarms.Hide();
				$.LiteUI.DeviceConfig.Hide();
				// $.LiteUI.DeviceConfig.Wireless();
				$.LiteUI.KPI.Thrpt();

				// $('#qz-nav-text-keyword').val('');
				$("#qz-devices").show();
				$('#qz-devices-text-keyword').val('');
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
		DeviceConfig: {
			// TODO: container don't have enough space to display all
			// decide which block to display
			Show: function() {
				$.LiteUI.DeviceConfig.Wireless();
				$("#qz-device-config-title,#qz-device-config").show();
			},
			Hide: function() {
				$("#qz-device-config-title,#qz-device-config").hide();
				$.LiteUI.DeviceConfig.Saved();
				// $("#qz-device-kpi-title,#qz-device-kpi").show();
				// $("#qz-device-details").show();
			},
			Init: function() {
				$("#qz-device-config-basic-detail,#qz-device-config-wireless-detail")
                    .hide();
				$("#qz-device-config-basic,#qz-device-config-wireless")
                    .removeClass('active');

				$("#qz-device-config-advanced-detail").hide();
				$("#qz-device-config-advanced").removeClass('active');
			},
			Basic: function() {
				$.LiteUI.DeviceConfig.Init();
				$("#qz-device-config-basic-detail").show();
				$("#qz-device-config-basic").addClass('active');
			},
			Wireless: function() {
				$.LiteUI.DeviceConfig.Init();
				$("#qz-device-config-wireless-detail").show();
				$("#qz-device-config-wireless").addClass('active');
			},
			Advanced: function() {
				$.LiteUI.DeviceConfig.Init();
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
					$.LiteUI.DeviceConfig.Saved();
				}, 3000);
			},
			GWS: function(by) {
				// FIXME: when data not available
				var region = $("#qz-device-config-region").find('input').val();
				var channel, freq;

				switch (by) {
                    case 'freq':
                        freq = $("#qz-device-config-freq").val();
                        channel = $.GWS.FreqToChannel(region, freq);
                        break;
                    case 'region':
                    case 'channel':
                    default:
                        channel = $("#qz-device-config-channel").val();
                        freq = $.GWS.Freq(region, channel);
                        break;
				}

				// use calculated values
				var freqDesc = $.GWS.FreqDesc(region, channelCalc, freqCalc);
				var channelCalc = $.GWS.FreqToChannel(region, freq);
				var freqCalc = $.GWS.Freq(region, channel);
				$("#qz-device-config-channel-detail").val(freqDesc);
				$("#qz-device-config-channel").val(channelCalc);
				$("#qz-device-config-freq").val(freqCalc);
			}
		},
		Device: {
			Init: function() {
				$("#qz-device-base-detail,#qz-device-wireless-detail,#qz-device-network-detail")
                    .hide();
				$("#qz-device-base,#qz-device-wireless,#qz-device-network")
                    .removeClass('active');
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
		DeviceAlarms: {
			init: function() {
				// $("#qz-device-alarms-title,#qz-device-alarms-list").hide();
				$("#qz-device-alarms-all,#qz-device-alarms-history,#qz-device-alarms-tofix")
                    .removeClass('active');
			},
			Show: function() {
				$.LiteUI.DeviceAlarms.All();
				$("#qz-device-alarms,#qz-device-alarms-title").show();
			},
			Hide: function() {
				$.LiteUI.DeviceAlarms.init();
				$("#qz-device-alarms,#qz-device-alarms-title").hide();
			},
			All: function() {
				$.LiteUI.DeviceAlarms.init();
				$("#qz-device-alarms-all").addClass('active');
				$("#qz-device-alarms-list").show();
			},
			Tofix: function() {
				$.LiteUI.DeviceAlarms.init();
				$("#qz-device-alarms-tofix").addClass('active');
				$("#qz-device-alarms-list").show();
			},
			History: function() {
				$.LiteUI.DeviceAlarms.init();
				$("#qz-device-alarms-history").addClass('active');
				$("#qz-device-alarms-list").show();
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
        Reset: {
            DeviceList: function() {
                $("#qz-devices-text-keyword").val('');

                var list_header = $("#qz-devices-list-header");
                var html = '<a class="item" id="0">正在读取，请稍候……</a>';
                list_header.nextAll().remove().after(html);
            },
            DeviceDetail: function() {
                $("#qz-devices-device-name,#qz-devices-device-id").val('');
                $("#qz-devices-device-hwver,#qz-devices-device-fwver").val('');
                $("#qz-devices-device-mode,#qz-devices-device-ssid").val('');
                $("#qz-devices-device-freq,#qz-devices-device-txpower").val('');
                $("#qz-devices-device-chanbw").val('');
                $("#qz-device-wireless").find('.label').text('--/-');
                $("#qz-devices-device-ifname,#qz-devices-device-vlan").val('');
                $("#qz-devices-device-ip,#qz-devices-device-netmask").val('');
                $("#qz-devices-device-gw").val('');
                $("#qz-device-network").find('.label').text('');

                var links_tbody = $("#qz-device-links-detail").find('tbody');
                var links_tbody_html = '<tr><td class="disabled" colspan="4">无线空闲（没有连接到其它设备）</td></tr>';
                links_tbody.nextAll().remove().end().html(links_tbody_html);

                var thrpt_tbody = $("#qz-device-thrpt-detail").find('tbody');
                var thrpt_tbody_html = '<tr><td colspan="4">正在统计，请稍候</td></tr>';
                thrpt_tbody.nextAll().remove().end().html(thrpt_tbody_html);
            },
            DeviceOptions: function() {
                $("#qz-device-config-name,#qz-device-config-latlng").val('');
                $("#qz-device-config-ip,#qz-device-config-netmask").val('');
                $("#qz-device-config-gw").val('');
                $("#qz-device-config-ssid").val('');
                $("#qz-device-config-mode").dropdown('set selected', 'ear');
                $("#qz-device-config-region").dropdown('set selected', '1');
                $("#qz-device-config-chanbw").dropdown('set selected', '8');
                $("#qz-device-config-channel").val('');
                $("#qz-device-config-txpower").dropdown('set selected', 'min');
            },
            DeviceInMaps: function() {
                $("#qz-maps-text-keyword").val('');

                var list_header = $("#qz-maps-list-header");
                var html = '<a class="item" id="0">正在读取，请稍候……</a>';
                list_header.nextAll().remove().after(html);
            }
        },
		Update: {
            NavBar: function(data) {
                if ($.Val.IsValid(data)) {
                    var ds = data && $.Val.IsValid(data.ds) ? data.ds: null;
                    var total = ds && $.Val.IsInt(ds.total) ? parseInt(ds.total): 0;
                    var online = ds && $.Val.IsInt(ds.online) ? parseInt(ds.online): 0;
                    var offline = ds && $.Val.IsInt(ds.offline) ? parseInt(ds.offline): 0;
                    var lbl = $("#qz-nav-devices").find('.label');
                    if (offline < 1) {
                        lbl.removeClass('red').addClass('green');
                    } else {
                        lbl.removeClass('green').addClass('red');
                    }

                    var cache = $.Lite.data;
                    var ds_total = cache && $.Val.IsInt(cache.ds_total) ? cache.ds_total : 0;
                    var ds_offline = cache && $.Val.IsInt(cache.ds_offline) ? cache.ds_offline : 0;
                    if (total != ds_total) {
                        lbl.text(total);
                        $("#qz-nav-devices").trigger('click');
                    }
                    $.Lite.data.ds_total = total;
                    $.Lite.data.ds_offline = offline;
                } else {
                    $("#qz-nav-devices,#qz-nav-maps,#qz-nav-tools").find('.lable').text('-');
                }
            },
            DeviceKPIPeers: function(peers, peer_qty) {
                //console.log(peer_qty, peers);
                var links_tbody = $("#qz-device-links-detail").find('tbody');
                var links_tbody_html = '';
                if ($.Val.IsArray(peers) && $.Val.IsValid(peer_qty)) {
					// update peers
                    $("#qz-device-links").find('.label')
                        .removeClass('yellow').addClass('green')
                        .html(peer_qty);
                    $.each(peers, function(idx, peer) {
                        var pwmac = peer && $.Val.IsValid(peer.pwmac) ? peer.pwmac : '-';
                        var psignal = peer && $.Val.IsValid(peer.psignal) ? peer.psignal : '-';
                        var pbar = $.GWS.dBmToBar(psignal);
                        var pipaddr = peer && $.Val.IsValid(peer.pipaddr) ? peer.pipaddr : '-';
                        var prx = peer  && $.Val.IsValid(peer.prx) ? peer.prx : '-';
                        var rx = prx.split(',');
                        var ptx = peer && $.Val.IsValid(peer.ptx) ? peer.ptx : '-';
                        var tx = ptx.split(',');

                        var desc = pwmac + ' | ' + pipaddr;
                        links_tbody_html += '<tr>';
                        links_tbody_html += '<td>' + desc
                            + '</td>';
                        links_tbody_html += '<td>' + pbar + ' (' + psignal + ' dBm)'
                            + '</td>';
                        links_tbody_html += '<td>' + rx[0] + 'Mbit/s | MCS '
                            + rx[1] + ' | Short GI '
                            + rx[2] + '</td>';
                        links_tbody_html += '<td>' + tx[0] + 'Mbit/s | MCS '
                            + tx[1] + ' | Short GI '
                            + tx[2] + '</td>';
                        links_tbody_html += '</tr>';
                    });
                } else {
                    $("#qz-device-links").find('.label')
                        .removeClass('green').addClass('yellow')
                        .html('-');
                    links_tbody_html = '<tr><td class="disabled" colspan="4">无线空闲（没有连接到其它设备）</td></tr>';
                }
                links_tbody.nextAll().remove().end().html(links_tbody_html);
            },
            DeviceKPIThrpt: function(thrpt) {
                var thrpt_tbody = $("#qz-device-thrpt-detail").find('tbody');
                var thrpt_tbody_html = '', icon_html = '0+0 Mbps';
                if ($.Val.IsValid(thrpt)) {
					// update network
					// console.log('Device Network');
					// TODO: handle unit Kbps & Mbps
					var thrpt_qty = thrpt && $.Val.IsValid(thrpt.qty) ? thrpt.qty : 0;
					var rxtx = thrpt && $.Val.IsValid(thrpt.rxtx) ? thrpt.rxtx : 0;
					if (thrpt_qty > 0 && $.Val.IsArray(rxtx)) {
						var total_dl = 0, total_ul = 0, total_unit = 'Mbps';
						$.each(rxtx, function(idx, rt) {
							var desc = rt.ifname;
							var unit = rt.unit;
							var dl = parseFloat(rt.rx), ul = parseFloat(rt.tx);
							var dlul = dl + ul;

							thrpt_tbody_html += '<tr>';
							thrpt_tbody_html += '<td>' + desc + '</td>';
							thrpt_tbody_html += '<td>' + dlul.toFixed(3) + ' '
                                + unit + '</td>';
							thrpt_tbody_html += '<td>' + dl + ' ' + unit
                                + '</td>';
							thrpt_tbody_html += '<td>' + ul + ' ' + unit
                                + '</td>';
							thrpt_tbody_html += '</tr>';
							total_dl += dl;
							total_ul += ul;
						});
						icon_html = total_dl.toFixed(3) + '+'
                            + total_ul.toFixed(3) + total_unit;
					}
                } else {
                    icon_html = '0+0 Mbps';
                    thrpt_tbody_html = '<tr><td colspan="4">正在统计，请稍候</td></tr>';
                }
                $("#qz-device-thrpt").find('.label').html(icon_html);
                thrpt_tbody.nextAll().remove().end().html(thrpt_tbody_html);
            },
			Device: function(data) {
				// console.log(data.device, data.device.mac);
				if (data) {
                    $.LiteUI.Reset.DeviceDetail();
					var device = $.Val.IsValid(data.device) ? data.device : null;
                    // TODO: reserved report ts
					//var rpt_ts = $.Val.IsValid(data.ts) ? data.ts : null;
					var basic = device && $.Val.IsValid(device.basic) ? device.basic : null;
					var wireless = device && $.Val.IsValid(device.wireless) ? device.wireless : null;
					var abb = wireless && $.Val.IsValid(wireless.abb) ? wireless.abb : null;
					var peers = abb && $.Val.IsValid(abb.peers) ? abb.peers : null;
					var radio = wireless && $.Val.IsValid(wireless.radio) ? wireless.radio : null;
					var network = device && $.Val.IsValid(device.network) ? device.network : null;
					var thrpt = device && $.Val.IsValid(device.thrpt) ? device.thrpt : null;
					var msg = device && $.Val.IsValid(device.msg) ? device.msg : null;

                    var h1 = '';
                    var wmac = basic && $.Val.IsValid(basic.wmac) ? basic.wmac : null;
					if (wmac) {
						var name = $.Val.IsValid(basic.name) ? basic.name : '未命名新设备';
						var mac = $.Val.IsValid(basic.mac) ? basic.mac : null;
						var hw_ver = $.Val.IsValid(basic.hw_ver) ? basic.hw_ver : '-';
						var fw_ver = $.Val.IsValid(basic.fw_ver) ? basic.fw_ver : '-';

						$("#qz-devices-device-name").val(name);
						$("#qz-devices-device-id").val(mac ? wmac + ', ' + mac: wmac);
						$("#qz-devices-device-hwver").val(hw_ver);
						$("#qz-devices-device-fwver").val(fw_ver);
                    }
                    if (abb) {
						var ssid = abb && $.Val.IsValid(abb.ssid) ? abb.ssid : '-';
						var mdesc = $.GWS.Mode(abb && $.Val.IsValid(abb.emode) ? abb.emode : 0);
						var rgn = radio && $.Val.IsValid(radio.region) ? radio.region : '-';
						var channel = radio && $.Val.IsValid(radio.channel) ? radio.channel : '-';
						var txpower = radio && $.Val.IsValid(radio.txpwr) ? radio.txpwr : '-';
						var watt = radio && $.Val.IsValid(radio.watt) ? radio.watt : '-';
						var chanbw = radio && $.Val.IsValid(radio.chanbw) ? radio.chanbw : '-';

                        var freq = $.GWS.Freq(rgn, channel);
                        var fdesc = $.GWS.WirelessDesc(rgn, channel, freq, chanbw);
						$("#qz-devices-device-mode").val(mdesc);
						$("#qz-devices-device-ssid").val(ssid);
						$("#qz-devices-device-freq").val(fdesc);
						$("#qz-devices-device-txpower").val($.GWS.Txpower(txpower, watt));
						$("#qz-devices-device-chanbw").val(chanbw + ' MHz');

                        // label
						$("#qz-device-wireless").find('.label')
                            .text(rgn + '-' + freq + '/' + chanbw);

                        h1 = mdesc+' - '+name;
                        if ($.Val.IsValid(txpower)) {
                            h1 += (' - '+txpower+' dBm');
                        }
                        if ($.Val.IsValid(freq)) {
                            h1 += (' - '+freq+' MHz');
                        }
                        if ($.Val.IsValid(chanbw)) {
                            h1 += (' - '+chanbw+' MHz');
                        }
                    }
                    if (network) {
						var ifname = network && $.Val.IsValid(network.ifname) ? network.ifname : '-';
						var vlan = network && $.Val.IsValid(network.vlan) ? network.vlan : '-';
						var ip = network && $.Val.IsValid(network.ipaddr) ? network.ipaddr : '-';
						var netmask = network && $.Val.IsValid(network.netmask) ? network.netmask : '-';
						var gateway = network && $.Val.IsValid(network.gateway) ? network.gateway : '-';

						$("#qz-devices-device-ifname").val(ifname);
						$("#qz-devices-device-vlan").val(vlan);
						$("#qz-devices-device-ip").val(ip);
						$("#qz-devices-device-netmask").val(netmask);
						$("#qz-devices-device-gw").val(gateway);

						// update Devices.Device.[.label]
						$("#qz-device-network").find('.label').text(ip);
                        if ($.Val.IsValid(ip)) {
                            h1 += (' - '+ip);
                        }
                    }

                    // set header
                    $("#qz-devices-device-name-header").text(h1);

                    var peer_qty = abb && $.Val.IsValid(abb.peer_qty) ? abb.peer_qty : 0;
					var peers = abb && $.Val.IsValid(abb.peers) ? abb.peers : null;
                    $.LiteUI.Update.DeviceKPIPeers(peers, peer_qty);

                    $.LiteUI.Update.DeviceKPIThrpt(thrpt);

                    var rpt_ts = new Date().toLocaleString();
                    var flagSuccessful = true;
                    $.Lite.Update.DevicesStatus('设备信息已更新 @' + rpt_ts, flagSuccessful);

					return true;
				}
				return false;
			},
			DevicesList: function(data) {
				if (data) {
                    $.LiteUI.Reset.DeviceList();

					var ds = data.ds;
					var total = ds.total;
					var offline = ds.offline ? ds.offline: 0;
					var online = ds.online ? ds.online: 0;
					var qty = data.qty;
					var qty_desc = total + '=' + offline + '+' + online;

					// update Devices.[LIST]
					var list_header = $("#qz-devices-list-header");
					list_header.nextAll().remove();
					if (qty > 0) {
						var list = data.devices;
						$.each(list, function() {
                            var $this = $(this)[0];
                            var id = $this.id, name = $this.name, ipaddr = $this.ipaddr;
                            var peer_qty = $this.peer_qty, html = '';
                            var alive = $this.alive;

                            if (!$.Val.IsValid(name)) name = '未命名的新设备';
                            if (!$.Val.IsValid(peer_qty)) peer_qty = 0;

                            if (peer_qty > 0 && $.Val.IsValid(alive)) {
                                html = '<a class="item" id="'
                                    + id
                                    + '">('
                                    + ipaddr
                                    + ') '
                                    + name
                                    + '<div class="ui green label">'
                                    + peer_qty
                                    + 'p</div></a>';
                            } else if (peer_qty == 0 && $.Val.IsValid(alive)) {
                                html = '<a class="item" id="'
                                    + id
                                    + '">('
                                    + ipaddr
                                    + ') '
                                    + name
                                    + '<div class="ui yellow label">'
                                    + peer_qty
                                    + 'p</div></a>';
                            } else {
                                html = '<a class="item" id="'
                                    + id
                                    + '">('
                                    + ipaddr
                                    + ') '
                                    + name
                                    + '<div class="ui red label">x</div></a>';
                            }
                            // append all
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
							$.Lite.Update.DeviceDetail(id);
                            $.Lite.Url.Set('devices', id);

                            // Hide "Config" when list refreshed
                            $.LiteUI.DeviceConfig.Hide();
                        });

						// select first result when done
                        var did = $.Lite.Url.DeviceID();
                        if ($.Val.IsValid(did) && $.Val.IsArray(devices)) {
                            $.each(devices, function() {
                                var $this = $(this)[0];
                                var id = $($this).attr('id');
                                if (did == id) {
                                    $($this).trigger('click');
                                }
                            });
                        } else {
                            devices.first().trigger('click');
                        }
                        //devices.first().trigger('click'); // < 2018.02.07
					} else {
						// $.Lite.data.DeviceId = 0;
						// TODO: remove update device id
						var html = '<a class="item" id="0">(未找到符合条件的设备)</a>';
						list_header.after(html);
					}
				} else {
					// $.Lite.data.DeviceId = 0;
					// TODO: remove update device id
					var html = '<a class="item" id="0">(未找到符合条件的设备)</a>';
					list_header.after(html);
				}
			},
			DeviceConfig: function(data) {
				if (data) {
                    $.LiteUI.Reset.DeviceOptions();

					var device = data.device;
                    var basic = device && device.basic;
                    var network = device && device.network;
                    var wireless = device && device.wireless;
                    var abb = wireless && wireless.abb;
                    var radio = wireless && wireless.radio;
                    if (basic) {
                        var name = $.Val.IsValid(basic.name) ? basic.name : null;
                        var latlng = $.Val.IsValid(basic.latlng) ? basic.latlng : null;
                        $("#qz-device-config-name").val(name);
                        $("#qz-device-config-latlng").val(latlng);
                    }
                    if (network) {
                        $("#qz-device-config-ip").val(network.ipaddr);
                        $("#qz-device-config-netmask").val(network.netmask);
                        $("#qz-device-config-gw").val(network.gateway);
                    }
                    if (abb) {
                        $("#qz-device-config-ssid").val(abb.ssid);
                        $("#qz-device-config-mode").dropdown('set selected', abb.emode);
                    }
                    if (radio) {
                        var region = new Number(radio.region);
                        $("#qz-device-config-region").dropdown('set selected', region.toString());
                        $("#qz-device-config-channel").val(radio.channel);
                        $("#qz-device-config-chanbw").dropdown('set selected', radio.chanbw);

                        var txpwr = parseInt(radio.txpwr);
                        switch(txpwr) {
                            case 33:
                                txpwr = 33;
                                break;
                            case 32:
                                txpwr = 32;
                                break;
                            case 31:
                                txpwr = 31;
                                break;
                            case 30:
                            case 29:
                                txpwr = 30;
                                break;
                            case 28:
                            case 27:
                            case 26:
                                txpwr = 27;
                                break;
                            case 25:
                            case 24:
                                txpwr = 24;
                                break;
                            case 23:
                            case 22:
                                txpwr = 23;
                                break;
                            case 21:
                            case 20:
                            case 19:
                                txpwr = 20;
                                break;
                            case 18:
                            case 17:
                            case 16:
                                txpwr = 17;
                                break;
                            case 15:
                            case 14:
                                txpwr = 14;
                                break;
                            case 13:
                            case 12:
                                txpwr = 13;
                                break;
                            default:
                                txpwr = 10;
                                break;
                        }
                        $("#qz-device-config-txpower").dropdown('set selected', txpwr);
                        $.LiteUI.DeviceConfig.GWS('channel');
                    }
                    return true;
                }
				return false;
			},
            MapsDevicesList: function(data) {
				if (data) {
                    $.LiteUI.Reset.DeviceInMaps();

					var ds = data.ds;
					var total = ds.total;
					var offline = ds.offline ? ds.offline: 0;
					var online = ds.online ? ds.online: 0;
					var qty = data.qty;
					var qty_desc = total + '=' + offline + '+' + online;

					// update Maps.[LIST]
					var list_header = $("#qz-maps-list-header");
					list_header.nextAll().remove();

					if (qty > 0) {
						var list = data.devices;

                        // update device icons
                        var icons = [];
						$.each(list, function() {
                            var $this = $(this)[0];
                            var id = $this.id, name = $this.name, ipaddr = $this.ipaddr;
                            var latlng = $this.gps;
                            var emode = $this.emode;
                            var lat = latlng.lat;
                            var lng = latlng.lng;
                            var peer_qty = $this.peer_qty, html = '';

                            var p = { lat: lat, lng: lng, emode: emode };
                            icons.push(p);

                            if (!$.Val.IsValid(name)) name = '未命名的新设备';
                            if (!$.Val.IsValid(peer_qty)) peer_qty = 0;

                            if (peer_qty > 0) {
                                html = '<a class="item" id="'
                                    + id
                                    + '" lat="'
                                    + lat
                                    + '" lng="'
                                    + lng
                                    + '">('
                                    + ipaddr
                                    + ') '
                                    + name
                                    + '<div class="ui green label">'
                                    + peer_qty
                                    + 'p</div></a>';
                            } else {
                                html = '<a class="item" id="'
                                    + id
                                    + '" lat="'
                                    + lat
                                    + '" lng="'
                                    + lng
                                    + '">('
                                    + ipaddr
                                    + ') '
                                    + name
                                    + '<div class="ui yellow label">-</div></a>';
                            }
                            list_header.after(html);
                        });

                        // update icons
                        $.BingMaps.UpdateIcons(icons);

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
							$("#qz-maps-list-header").nextAll().removeClass('active');
							$(this).addClass('active');

							var did = $(this).attr('id');
							var lat = $(this).attr('lat');
							var lng = $(this).attr('lng');
							$.Lite.Update.MapsDeviceDetail(did, lat, lng);

                            // set URL
                            $.Lite.Url.Set('maps', did);
                        });

						// select first result when done
                        var did = $.Lite.Url.DeviceID();
                        if ($.Val.IsValid(did) && $.Val.IsArray(devices)) {
                            $.each(devices, function() {
                                var $this = $(this)[0];
                                var id = $($this).attr('id');
                                if (did == id) {
                                    $($this).trigger('click');
                                    var _x = $($this);
                                    setTimeout(function() {
                                        _x.trigger('click');
                                    }, 5000);
                                }
                            });
                        } else {
                            devices.first().trigger('click');
                            var _x = devices.first();
                            setTimeout(function() {
                                _x.trigger('click');
                            }, 5000);
                        }
                        //devices.first().trigger('click'); // < 2018.02.07
					} else {
						// $.Lite.data.DeviceId = 0;
						// TODO: remove update device id
						var html = '<a class="item" id="0">(未找到符合条件的设备)</a>';
						list_header.after(html);
					}
				} else {
					// $.Lite.data.DeviceId = 0;
					// TODO: remove update device id
					var html = '<a class="item" id="0">(未找到符合条件的设备)</a>';
					list_header.after(html);
				}
			}
		}
	}
})(jQuery); // $.LiteUI

// TODO: load maps asap
// by Qige <qigezhao@gmail.com> @2017.09.12
// load Microsoft Bing Maps
(function($) {
	$.BingMaps = {
		Init: function() {
			if (! $.Lite.data) {
                $.Lite.data = {}
            }
            if (! $.Lite.data.map) {
				console.log('* initializing Microsoft Bing Maps');
				$.Lite.data.map = new Microsoft.Maps.Map(
                    $('#qz-maps-box').get(0),
                    //document.getElementById('qz-maps-box'),
                    {
                        center: new Microsoft.Maps.Location(40.0492, 116.2902),
                        credentials: 'AsHiUhyyE-3PP8A82WyPhdS6_Z18NL2cuaySXTGPviswZ_WDmgDlaSZ7xpEF77-3',
                        // credentials: '{Your Bing Maps Key}',
                        showMapTypeSelector: false,
                        showBreadcrumb: true,
                        enableClickableLogo: false,
                        enableSearchLogo: false,
                        // mapTypeId: Microsoft.Maps.MapTypeId.aerial,
                        maxZoom: 17,
                        minZoom: 9,
                        zoom: 14
                    }
                );
			}
            $.BingMaps.UpdateIcons();
			// */
		},
		UpdateIcons: function(icons) {
            // FIXME: wait until maps loaded
            var dmap = $.Lite.data.map;
            var bicons = $.BingMaps.icons;

            if (icons && icons.length > 0) {
                if (bicons) {
                    if (bicons.length <= icons.length) {
                        $.BingMaps.icons = icons;
                    }
                } else {
                    $.BingMaps.icons = icons;
                }
            }

            bicons = $.BingMaps.icons;
            if ($.Val.IsValid(dmap)) {
                dmap.entities.clear();
                $.each(bicons, function() {
                    var _this = $(this)[0];
                    var p = new Microsoft.Maps.Location(_this.lat, _this.lng);
                    var icon = new Microsoft.Maps.Pushpin(p, { icon: $.BingMaps.deviceIcon(_this) });
                    dmap.entities.push(icon);
                });
            }
		},

        deviceIcon: function(bicon) {
            var icon = 'resource/icon-offline.png';
            var emode = bicon.emode;
            var alive = bicon.alive;
            //if (alive) {
                switch(emode) {
                    case 'mesh':
                        icon = 'resource/icon-mesh.png';
                        break;
                    case 'ap':
                        icon = 'resource/icon-ap.png';
                        break;
                    case 'sta':
                    default:
                        icon = 'resource/icon-sta.png';
                        break;
                }
            //}

            return icon;
        },

        deviceColor: function(bicon) {
            var color = 'grey';
            var emode = bicon.emode;
            var alive = bicon.alive;
            if (alive) {
                switch(emode) {
                    case 'mesh':
                        color = 'yellow';
                        break;
                    case 'ap':
                        color = 'red';
                        break;
                    case 'sta':
                    default:
                        color = 'blue';
                        break;
                }
            }

            return color;
        }
	}
})(jQuery); // $.BingMaps

/*
 * TODO: - msg_sync: read msg from database - audit: audit token timeout, audit
 * device offline
 */

// ARN-iOMC3 at 20171130
var loadMap = $.BingMaps.Init; // FIXME: load Microsoft Bing Maps async
$(function() {
	// Application start (lite version)
	$.Lite.InitAll();

	// now wait for user click/input/timer
	$.Lite.Start();
});
