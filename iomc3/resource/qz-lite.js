/*
 * by Qige <qigezhao@gmail.com>
 * 2017.09.07 SementicUI|$.App|$.SementicUI|$.Install
 * 2017.09.22 $.Lite|$.LiteUI|$.Request|$.GWS|$.BingMaps|$.CB
 * 2017.09.28 Re-format
 * 2017.11.29 Request Signin/Devices realtime, re-format with Eclipse
 *
 * 1 [TAB] = 4 [SPACEs]
 */

// Handle url/signin/token/devices/maps/tools
(function($) {
	$.Lite = {
		defaults : {
			signin : {
				username : 'admin',
				password : '6harmonics'
			},
			interval : {
				deviceDetail : 2000
			}
		},
		// Timer handlers: $.Lite.data.Timers.UISync,
		// $.Lite.data.Timers.DeviceFetchLatest
		// Device Detail id;
		data : {},

		// Web Application Starts here
		// #devices: Devices
		// #maps: Maps
		// #tools: Tools
		// #a1b2c3d4f5aa1b2c3d4f5aa1b2c3d4f5aa1b2c3d4f5a-maps-211
		Url : {
			parser : function(idx) {
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
			TOKEN : function() {
				var token = $.Lite.Url.parser(0);
				return token;
			},
			Section : function() {
				var section = $.Lite.Url.parser(1);
				return section;
			},
			DeviceID : function() {
				var did = $.Lite.Url.parser(2);
				return did;
			},
			Set : function(sec, did) {
				var token = $.Lite.Url.TOKEN();
				if ($.Val.IsValid(token)) {
					var section = '', deviceId = '';
					var page = $.Url.PageOnly();
					if ($.Val.IsValid(sec)) {
						section = sec;
					} else {
						section = $.Lite.Url.Section();
					}
					if ($.Val.IsValid(did)) {
						deviceId = did;
					} else {
						deviceId = $.Lite.Url.DeviceID();
					}

					var url = page + '#' + token;
					url += '-';
					if ($.Val.IsValid(section)) {
						url += section;
					}
					url += '-';
					if ($.Val.IsValid(deviceId)) {
						url += deviceId;
					}
					$.Url.GotoAnchor(url);
				} else {
					$.Lite.Run.Signout();
				}
			},
			Clear : function() {
				$.Lite.Url.Set();
			}
		},
		Start : function() {
			$.LiteUI.Init();

			// #{TOKEN}-{Section}-{DeviceID}
			var token = $.Lite.Url.TOKEN();
			var section = $.Lite.Url.Section();
			var did = $.Lite.Url.DeviceID();
			console.log('$.Lite.Start said: t/s/d =', token, section, did);

			// {TOKEN} will be validated when send Ajax requests
			// and will be redirect to Signin if error = "noauth"
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
				$.Lite.Run.Signin();
			}
		},
		// Goto [*] Blocks
		Run : {
			Signin : function() {
				$.LiteUI.Display.Signin();
			},
			Signout : function() {
				var url = '/iomc3/';
				$.Url.GotoAnchor(url);
			},
			Dashboard : function() {
				$.LiteUI.Display.Dashboard();
			},
			// display Devices/Maps/Tools
			// load data via Ajax using valid {TOKEN}
			Devices : function(flagAutoLoad, did) {
				$.LiteUI.Display.Devices();

				var did = $.Lite.Url.DeviceID();
				$.Request.Devices(flagAutoLoad, did);
			},
			Maps : function(flagAutoLoad) {
				$.LiteUI.Display.Maps();
				$.Request.DevicesForMaps(flagAutoLoad);
			},
			Tools : function(flagAutoLoad) {
				$.LiteUI.Display.Tools();
				$.Request.Tools(flagAutoLoad);
			},
		},
		Update : {
			DevicesStatus : function(msg) {
				$("#qz-devices-status").SUIMessageSuccess(msg).show();
			},

			// Update device details via Ajax
			// NOTE: must pass in a valid device id
			DeviceDetail : function(did) {
				if (did) {
					// console.log('$.Lite.Device.DeviceDetail() did=', did);
					var data = $.Val.IsValid($.Lite.data) ? $.Lite.data : null;
					if (!data) {
						data = {};
					}
					if (!data.Deviceid) {
						data.DeviceId = did;
					}
					$.Lite.data = data;

					$.Request.DeviceDetail(did);

					// FIXME: trigger config update right away
					// $.Lite.Update.DeviceConfig();
				}
			},
			DeviceCollectConfig : function(did) {
				if ($.Val.IsValid(did)) {
					$.LiteUI.DeviceConfig.Saving();
					var name = $("#qz-device-config-name").val();
					var ip = $("#qz-device-config-ip").val();
					var mask = $("#qz-device-config-netmask").val();
					var gw = $("#qz-device-config-gw").val();
					var mode = $("#qz-device-config-mode").find('input').val();
					var rgn = $("#qz-device-config-region").find('input').val();
					var freq = $("#qz-device-config-freq").val();
					var channel = $("#qz-device-config-channel").val();
					var txpwr = $("#qz-device-config-txpower").find('input')
							.val();
					$.Request.DeviceSet(did, {
						ops : 'config_save',
						name : name,
						ip : ip,
						mask : mask,
						gw : gw,
						mode : mode,
						rgn : rgn,
						freq : freq,
						channel : channel,
						txpwr : txpwr
					});
				}
			},
			DeviceConfigLoad : function(did, opt) {
				if ($.Val.IsValid(did)) {
					$.Request.DeviceConfigLoad(did);
				}
			}
		},
		InitAll : function() {
			$.Lite.Init.Nav();
			$.Lite.Init.Signin();
			$.Lite.Init.Devices();
			$.Lite.Init.Maps();
			$.Lite.Init.Tools();
		},
		Init : {
			Nav : function() {
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
					$.Lite.Url.Set('tools');
					$.Lite.Run.Tools();
				});

				// [Nav].[SEARCH]
				$("#qz-nav-text-keyword").focus(function() {
					$(this).select();
				}).keydown(function(e) {
					// console.log('search when hit ENTER');
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
					$.Lite.Run.Signout();
				});
			},
			Signin : function() {
				// Signin
				$("#qz-signin-user,#qz-signin-passwd").focus(function() {
					$(this).select();
				}).blur(function() {
					var user = $("#qz-signin-user").val();
					var passwd = $("#qz-signin-passwd").val();
					if ($.Val.IsValid(user) && $.Val.IsValid(passwd)) {
						$("#qz-signin-btn-go").BtnEnable();
					} else {
						$("#qz-signin-btn-go").BtnDisable();
					}
				});
				$("#qz-signin-btn-go").click(
						function() {
							var user = $("#qz-signin-user").val();
							var passwd = $("#qz-signin-passwd").val();
							if ($.Val.IsValid(user) && $.Val.IsValid(passwd)) {
								$.Request
										.Signin(user, passwd,
												$.CB.CB_SigninDone,
												$.CB.CB_SigninError);
								$("#qz-signin-btn-go,#qz-signin-btn-default")
										.BtnDisable();
							}
						});
				$("#qz-signin-btn-default").click(
						function() {
							$("#qz-btn-signin-default").BtnDisable();

							$("#qz-signin-user").val(
									$.Lite.defaults.signin.username);
							$("#qz-signin-passwd").val(
									$.Lite.defaults.signin.password);
							$("#qz-signin-btn-go").BtnEnable();

							$("#qz-signin-btn-go").trigger('click');
						});
			},
			Devices : function() {
				// Devices.[FILTER]: Combined keywords:
				// Status: :offline/:online/:alarms/:all
				// Orderby: +ip/+name/+search
				$("#qz-devices-filter").find(".item").click(
						function() {
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

							console.log('$.Lite.Init.Devices()> ', keyword,
									keyword_selected, keyword_target);
							$("#qz-devices-text-keyword").val(keyword_target);
							$("#qz-devices-btn-search").trigger('click');
						});

				// search when keyword/pattern not empty
				// Devices [SEARCH]
				$("#qz-devices-text-keyword").focus(function() {
					$(this).select();
				}).keydown(function(e) { // console.log('search when hit
					// ENTER');
					if (e.keyCode == 13) {
						// $(this).select();
						$("#qz-devices-btn-search").trigger('click');
					}
				});
				$("#qz-devices-btn-search").click(function() {
					var keyword = $("#qz-devices-text-keyword").val();
					console.log('qz-devices-text-keyword =', keyword);
					var flagAutoLoad = true;
					$.Request.Devices(flagAutoLoad, keyword);
				});

				$("#qz-devices-qrcode").popup({
					position : 'right center',
					target : '#qz-devices-qrcode',
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
					$.LiteUI.DeviceAlarms.Show();
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
				$("#qz-device-btn-update")
						.click(
								function() {
									var data = $.Val.IsValid($.Lite.data) ? $.Lite.data
											: null;
									var did = data
											&& $.Val.IsValid(data.DeviceId) ? $.Lite.data.DeviceId
											: null;
									$.Lite.Update.DeviceDetail(did);
								});
				$("#qz-device-btn-config,#qz-device-btn-config-update")
						.click(
								function() {
									console
											.log('TODO: read device id from $.Lite.data');
									var data = $.Val.IsValid($.Lite.data) ? $.Lite.data
											: null;
									var did = data
											&& $.Val.IsValid(data.DeviceId) ? $.Lite.data.DeviceId
											: null;
									$.Lite.Update.DeviceConfigLoad(did,
											'config_load');
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
					$.Lite.Run.Maps();
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
				$("#qz-device-config-channel").blur(function() {
					$.LiteUI.DeviceConfig.GWS('channel');
				}).keydown(function(e) {
					// console.log('search when hit ENTER');
					if (e.keyCode == 13) {
						$.LiteUI.DeviceConfig.GWS('channel');
					}
				});
				$("#qz-device-config-freq").blur(function() {
					$.LiteUI.DeviceConfig.GWS('freq');
				}).keydown(function(e) {
					// console.log('search when hit ENTER');
					if (e.keyCode == 13) {
						$.LiteUI.DeviceConfig.GWS('freq');
					}
				});

				// ask user first in case wrong click
				$("#qz-device-btn-config-save").click(
						function() {
							$("#qz-device-config-confirm").attr('ops', 'save')
									.modal('show');
						});
				$("#qz-device-btn-reset-network").click(
						function() {
							$("#qz-device-config-confirm").attr('ops',
									'reset-network').modal('show');
						});
				$("#qz-device-config-reset-wireless").click(
						function() {
							$("#qz-device-config-confirm").attr('ops',
									'reset-wireless').modal('show');
						});
				$("#qz-device-config-confirm-yes").click(
						function() {
							$("#qz-device-config-confirm").modal('hide');

							var did = $("#qz-device-detail").attr('did');
							var ops = $("#qz-device-config-confirm")
									.attr('ops')
									|| 'unknown';
							switch (ops) {
							case 'unknown':
								console.log(
										'#qz-device-config-confirm> did/ops =',
										did, ops);
								break;
							case 'save':
								$.Lite.Update.DeviceCollectConfig(did);
								break;
							default:
								$.Request.DeviceConfigSave(did, {
									ops : ops
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
					$.Lite.Run.Tools(); // TODO: display radio tool
				});
			},
			Maps : function() { // TODO: bind all button/input event(s) here
				$("#qz-maps-btn-search").click(function() {
					console.log('ARN.iOMC3.Maps.SearchBtn clicked');
				});
			},
			Tools : function() {
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
		TimerStartAll : function() {
			console.log('$.BG.AuditStart() called');
			$.BG.UITmrAdd.Sync();
			$.BG.UITmrAdd.DeviceFetchLatest();
			// $.BG.UI.NavAlarms(0);
			// $.BG.UI.NavDeviceQty(10, 4, 6);
		},
		TimerStopAll : function() {
			console.log('$.BG.AuditStop() called');
			$.BG.timerStopByHandlers();
			// $.BG.UI.NavAlarms('-');
			// $.BG.UI.NavDeviceQty('-');
		},
		UITmrAdd : {
			Sync : function() {
				var data = $.Val.IsValid($.Lite.data) ? $.Lite.data : null;
				var tmrs = data && $.Val.IsValid(data.Timers) ? $.Lite.data.Timers
						: null;
				var tmr = tmrs && $.Val.IsValid(tmrs.UISync) ? tmrs.UISync
						: null;
				if (!$.Val.IsValid(tmr)) {
					var t = setInterval($.Request.UISync,
							$.Lite.defaults.interval.deviceDetail);
					if (!data)
						$.Lite.data = {};
					if (!tmrs)
						$.Lite.data.Timers = {};
					$.Lite.data.Timers.UISync = t;
				}
			},
			DeviceFetchLatest : function() {
				var data = $.Val.IsValid($.Lite.data) ? $.Lite.data : null;
				var tmrs = data && $.Val.IsValid(data.Timers) ? data.Timers
						: null;
				var tmr = tmrs && $.Val.IsValid(tmrs.DeviceFetchLatest) ? tmrs.DeviceFetchLatest
						: null;
				if (!$.Val.IsValid(tmr)) {
					var t = setInterval($.Request.DeviceFetchLatest,
							$.Lite.defaults.interval.deviceDetail);
					if (!data) {
						$.Lite.data = {};
					}
					if (!tmrs) {
						$.Lite.data.Timers = {};
					}
					$.Lite.data.Timers.DeviceFetchLatest = t;
				}
			}
		},
		/*
		 * UI : { NavDeviceQty : function(vtotal, voffline, vonline) { var nav =
		 * $("#qz-nav-devices").find('.label'); if ($.Val.IsValid(voffline)) {
		 * var qty = ''; if ($.Val.IsValid(vtotal)) { qty += (vtotal + '/'); }
		 * else { qty += '-/'; } qty += (voffline + '/'); if
		 * ($.Val.IsValid(vonline)) { qty += vonline; } else { qty += '-'; } //
		 * write qty to [Nav].[.label] if (voffline > 0) {
		 * nav.removeClass('green yellow').addClass('red'); } else {
		 * nav.removeClass('red yellow').addClass('green'); } nav.html(qty); }
		 * else { nav.removeClass('green red').addClass('yellow').html('-'); } },
		 * NavAlarms : function(val) { var nav =
		 * $("#qz-nav-tools").find('.label'); if (val && val > 0) {
		 * nav.removeClass('green yellow').addClass('red').html(
		 * val.toString()); } else { nav.removeClass('red
		 * yellow').addClass('green').html('-'); } } }, timerStart :
		 * function(tid, callback) { ; }, timerStop : function(tid, callback) { ; },
		 */
		timerStopByHandlers : function() {
			var data = $.Val.IsValid($.Lite.data) ? $.Lite.data : null;
			var tmrs = $.Val.IsValid(data.Timers) ? $.Lite.data.Timers : null;
			if ($.Val.IsValid(tmrs) && $.Val.IsArray(tmrs)) {
				$.each(tmrs, function(idx, tmr) {
					console.log(tmr);
					clearInterval(tmr);
				});
			}

			// FIXME: clean all data here
			$.Lite.data = null;
		}
	}
})(jQuery); // $.BG

// callback of Ajax
(function($) {
	$.CB = {
		CB_SigninError : function(xhr, status, error) {
			console.log('$.Request.CB_SigninError()');
			$("#qz-signin-message").SUIMessageError('登录失败，请重试').show();

			$("#qz-signin-btn-go,#qz-signin-btn-default").BtnEnable();
			$("#qz-signin-mask").SUILoaderHide();
		},
		CB_SigninDone : function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}
			console.log('$.CB.CB_SigninDone()> error =', error);
			switch (error) {
			case 'bad_auth_user_or_password':
				$("#qz-signin-message").SUIMessageError('用户名或密码不正确，请重试').show();
				break;
			case 'none':
				$("#qz-signin-message").SUIMessageSuccess('登录成功，正在载入数据').show();
				setTimeout(function() {
					// FIXME: verify data iterately
					var data = $.Val.IsValid(resp.data) ? resp.data : null;
					var auth = data && $.Val.IsValid(data.auth) ? data.auth
							: null;
					var token = auth && $.Val.IsValid(auth.token) ? auth.token
							: null;
					var page = $.Url.PageOnly();
					var url = page + '#' + token;
					$.Url.GotoAnchor(url); // QZ_TODO: set url, then call
					// $.Lite.Set() at 2017.11.30
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
		CB_DevicesDone : function(resp) {
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
				console.log('$.CB.CB_DevicesDone()> +noauth');
				$.CB.CB_DevicesError();
				$.Lite.Run.Signout();
				break;
			}

			// update Timestamp
			var ts = new Date().toTimeString();
			$.Lite.Update.DevicesStatus('设备列表已更新 @' + ts);

			$("#qz-devices-search").removeClass("loading");
		},
		CB_DevicesError : function(xhr, status, error) {
			var ts = new Date().toTimeString();
			$.Lite.Update.DevicesStatus('设备列表获取失败 @' + ts);

			$("#qz-devices-search").removeClass("loading");
		},
		CB_DeviceDone : function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}
			// console.log('$.CB.CB_DeviceDone()> error =', error);
			switch (error) {
			case 'none':
				if ($.LiteUI.Update.Device(resp.data)) {
					var data = $.Val.IsValid($.Lite.data) ? $.Lite.data : null;
					var did = data && $.Val.IsValid(data.DeviceId) ? $.Lite.data.DeviceId
							: null;
					if ($.Val.IsValid(did)) {
						$.Lite.Url.Set('devices', did);
					}

					// update Timestamp
					var ts = new Date().toTimeString();
					$.Lite.Update.DevicesStatus('设备信息已更新 @' + ts);
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
		CB_DeviceError : function(xhr, status, error) {
			var ts = new Date().toTimeString();
			$("#qz-devices-status").SUIMessageError('设备信息获取失败 @' + ts).show();

			$("#qz-device-mask").SUILoaderHide();
		},
		CB_DeviceConfigDone : function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}
			console.log('$.CB.CB_DeviceConfigDone> error =', error);
			switch (error) {
			case 'none':
				if ($.LiteUI.Update.DeviceConfig(resp.data)) {
					var ts = new Date().toTimeString();
					$.Lite.Update.DevicesStatus('设备配置已更新 @' + ts);
				} else {
					$.CB.CB_DeviceConfigError();
				}
				break;
			case '404':
			default:
				$.CB.CB_DeviceConfigError();
				// $.Lite.Run.Signout();
				break;
			}

			$("#qz-device-mask").SUILoaderHide();
		},
		CB_DeviceConfigError : function(xhr, status, error) {
			var ts = new Date().toTimeString();
			$("#qz-devices-status").SUIMessageError('设备配置获取失败 @' + ts).show();

			$("#qz-device-mask").SUILoaderHide();
		},
		CB_DeviceSetDone : function(resp) {
			var error = '404';
			if ($.Val.IsValid(resp) && $.Val.IsValid(resp.error)) {
				error = resp.error;
			}
			console.log('$.CB.CB_DeviceSetDone> error =', error);
			switch (error) {
			case 'none':
				var ts = new Date().toTimeString();
				$.Lite.Update.DevicesStatus('设备操作已完成 @' + ts);
				break;
			case '404':
			default:
				$.CB.CB_DeviceSetError();
				// $.Lite.Run.Singout();
				break;
			}

			$.LiteUI.DeviceConfig.Saved()
			$("#qz-device-mask").SUILoaderHide();
		},
		CB_DeviceSetError : function(xhr, status, error) {
			var ts = new Date().toTimeString();
			$("#qz-devices-status").SUIMessageError('设备操作失败 @' + ts).show();

			$.LiteUI.DeviceConfig.Saved()
			$("#qz-device-mask").SUILoaderHide();
		},
		CB_MapsDeviceDone : function(resp) {
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
			var ts = new Date().toTimeString();
			$.Lite.Update.MapsDevicesStatus('设备列表已更新 @' + ts);

			$("#qz-maps-search").removeClass("loading");
			$("#qz-device-mask").SUILoaderHide();
		},
		CB_MapsDevicesError : function(xhr, status, error) {
			var ts = new Date().toTimeString();
			// $.Lite.Update.MapsDevicesStatus('设备列表获取失败 @' + ts);

			$("#qz-maps-search").removeClass("loading");
		},
	}
})(jQuery); // $.CB

// all Ajax requests
(function($) {
	$.Request = {
		UISync : function() {
			var data = $.Val.IsValid($.Lite.data) ? $.Lite.data : null;
		},
		DeviceFetchLatest : function() {
			var data = $.Val.IsValid($.Lite.data) ? $.Lite.data : null;
			var did = data && $.Val.IsValid(data.DeviceId) ? $.Lite.data.DeviceId
					: null;
			if ($.Val.IsValid(did)) {
				$.Request.DeviceDetail(did);
			}
		},
		Signin : function(user, passwd, done_cb, error_cb) {
			var url = "/iomc3/ws.php?do=signin";
			if ($.Val.IsValid(user) && user.length >= 5
					&& $.Val.IsValid(passwd) && passwd.length >= 5) {
				console.log('$.Request.Signin()> signin with user/passwd =',
						user, passwd);
				$("#qz-btn-signin").BtnDisable();
				$("#qz-signin-mask").SUILoaderShow();
				$.Ajax.Query(url, {
					user : user,
					passwd : passwd
				}, done_cb, error_cb);
			}
		},
		Devices : function(flagAutoLoad, keyword) {
			var kw = '';
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token)) {
				if (flagAutoLoad) {
					var url = '/iomc3/ws.php?token=' + token + '&do=devices';
					if (keyword && keyword != 'undefined') {
						kw = keyword.toString();
						url += ('&keyword=' + kw);
					}

					// Ajax search keyword, then update Devices [LIST]
					$("#qz-devices-search").SUILoaderShow();
					console.log('keyword of before request =', kw, keyword);
					$.Ajax.Query(url, null, $.CB.CB_DevicesDone,
							$.CB.CB_DevicesError);
				}
			} else {
				$.Lite.Start();
			}
		},
		DeviceDetail : function(did) {
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token)) {
				if ($.Val.IsValid(did)) {
					var url = '/iomc3/ws.php?token=' + token
							+ '&do=detail&did=' + did;
					// $("#qz-device-mask").SUILoaderShow();
					$.Ajax.Query(url, null, $.CB.CB_DeviceDone,
							$.CB.CB_DevicesError);
				}
			} else {
				$.Lite.Start();
			}
		},
		DeviceConfigLoad : function(did) {
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token) && $.Val.IsValid(did)) {
				var url = '/iomc3/ws.php?token=' + token
						+ '&do=config_load&did=' + did;
				// $("#qz-device-mask").SUILoaderShow();
				$.Ajax.Query(url, null, $.CB.CB_DeviceConfigDone,
						$.CB.CB_DeviceConfigError);
			}
		},
		DeviceConfigSave : function(did, ops) {
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token)) {
				var url = '/iomc3/ws.php?token=' + token
						+ '&do=config_save&did=' + did;
				$("#qz-device-mask").SUILoaderShow();
				$.Ajax.Query(url, ops, $.CB.CB_DeviceSetDone,
						$.CB.CB_DeviceSetError);
			} else {
				$.Lite.Start();
			}
		},
		DeviceAlarms : function() {
			console.log('$.Request.DeviceAlarms()> called < TODO');
		},
		DevicesForMaps : function(flagAutoLoad, keyword) {
			var token = $.Lite.Url.TOKEN();
			if ($.Val.IsValid(token)) {
				if (flagAutoLoad) {
					var kw = keyword;
					if (!$.Val.IsValid(kw)) {
						kw = '';
					}
					console.log('keyword of before request =', kw, keyword);
					var url = '/iomc3/ws.php?token=' + token
							+ '&do=maps_devices&keyword=' + kw;
					$("#qz-maps-search").SUILoaderShow();
					$.Ajax.Query(url, null, $.CB.CB_MapsDevicesDone,
							$.CB.CB_MapsDevicesError);
				}
			} else {
				$.Lite.Start();
			}
		},
		Tools : function() {

		}
	}
})(jQuery); // $.Request

// UI related
(function($) {
	$.LiteUI = {
		Init : function() {
			$.SUIInit();
		},
		Display : {
			init : function() {
				$("#qz-signin,#qz-devices,#qz-maps,#qz-tools").hide();
				$("#qz-nav-devices,#qz-nav-maps,#qz-nav-tools").removeClass(
						'active');
			},
			Signin : function() {
				$.LiteUI.Display.init();
				$('#qz-signin-message')
						.SUIMessageInfo('请填写正确的用户名和密码，然后点击“登录”。');
				$("#qz-signin").show();
			},
			Dashboard : function() {
				console.log('TODO: $.LiteUI.Display.Dashboard called');
			},
			Devices : function() {
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
			DeviceAlarms : function() {
				console.log('$.LiteUI.Display.DeviceAlarms()> called < TODO');
			},
			Maps : function() {
				$.LiteUI.Display.init();
				$("#qz-nav-maps").addClass('active');
				$("#qz-maps").show();

				// TODO: reload devices' icons
				$("#qz-maps-mask").show();
				setTimeout(function() {
					$("#qz-maps-mask").hide();
				}, 200);
			},
			Tools : function() {
				$.LiteUI.Display.init();
				$("#qz-nav-tools").addClass('active');
				$("#qz-tools").show();

				$.LiteUI.Tools.Init();
				$.LiteUI.Tools.Tools();
			}
		},
		DeviceConfig : {
			// TODO: container don't have enough space to display all
			// decide which block to display
			Show : function() {
				$.LiteUI.DeviceConfig.Wireless();
				$("#qz-device-config-title,#qz-device-config").show();
			},
			Hide : function() {
				$("#qz-device-config-title,#qz-device-config").hide();
				$.LiteUI.DeviceConfig.Saved();
				// $("#qz-device-kpi-title,#qz-device-kpi").show();
				// $("#qz-device-details").show();
			},
			Init : function() {
				$(
						"#qz-device-config-basic-detail,#qz-device-config-wireless-detail")
						.hide();
				$("#qz-device-config-basic,#qz-device-config-wireless")
						.removeClass('active');

				$("#qz-device-config-advanced-detail").hide();
				$("#qz-device-config-advanced").removeClass('active');
			},
			Basic : function() {
				$.LiteUI.DeviceConfig.Init();
				$("#qz-device-config-basic-detail").show();
				$("#qz-device-config-basic").addClass('active');
			},
			Wireless : function() {
				$.LiteUI.DeviceConfig.Init();
				$("#qz-device-config-wireless-detail").show();
				$("#qz-device-config-wireless").addClass('active');
			},
			Advanced : function() {
				$.LiteUI.DeviceConfig.Init();
				$("#qz-device-config-advanced-detail").show();
				$("#qz-device-config-advanced").addClass('active');
			},
			Saving : function() {
				$("#qz-device-btn-config-save").find('.icon').removeClass(
						'close save').addClass('circle notched loading');
			},
			Saved : function() {
				$("#qz-device-btn-config-save").find('.icon').removeClass(
						'close circle notched loading').addClass('save');
			},
			SaveAbort : function() {
				$("#qz-device-btn-config-save").find('.icon').removeClass(
						'circle notched loading').addClass('close');
				// Restore save icon
				setTimeout(function() {
					$.LiteUI.DeviceConfig.Saved();
				}, 3000);
			},
			GWS : function(by) {
				// FIXME: when data not available
				var region = $("#qz-device-config-region").find('input').val();
				var channel, freq;

				switch (by) {
				case 'freq':
					freq = $("#qz-device-config-freq").val();
					channel = $.GWS.FreqToChannel(region, freq);
					console.log('qz-device-config-frequency changed', region,
							channel, freq);
					break;
				case 'region':
				case 'channel':
				default:
					channel = $("#qz-device-config-channel").val();
					freq = $.GWS.Freq(region, channel);
					console.log('qz-device-config-channel changed', region,
							channel, freq);
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
		Device : {
			Init : function() {
				$(
						"#qz-device-base-detail,#qz-device-wireless-detail,#qz-device-network-detail")
						.hide();
				$("#qz-device-base,#qz-device-wireless,#qz-device-network")
						.removeClass('active');
			},
			Base : function() {
				$.LiteUI.Device.Init();
				$("#qz-device-base").addClass('active');
				$("#qz-device-base-detail").show();
			},
			Wireless : function() {
				$.LiteUI.Device.Init();
				$("#qz-device-wireless").addClass('active');
				$("#qz-device-wireless-detail").show();
			},
			Network : function() {
				$.LiteUI.Device.Init();
				$("#qz-device-network").addClass('active');
				$("#qz-device-network-detail").show();
			}
		},
		DeviceAlarms : {
			init : function() {
				// $("#qz-device-alarms-title,#qz-device-alarms-list").hide();
				$(
						"#qz-device-alarms-all,#qz-device-alarms-history,#qz-device-alarms-tofix")
						.removeClass('active');
			},
			Show : function() {
				$.LiteUI.DeviceAlarms.All();
				$("#qz-device-alarms,#qz-device-alarms-title").show();
			},
			Hide : function() {
				$.LiteUI.DeviceAlarms.init();
				$("#qz-device-alarms,#qz-device-alarms-title").hide();
			},
			All : function() {
				$.LiteUI.DeviceAlarms.init();
				$("#qz-device-alarms-all").addClass('active');
				$("#qz-device-alarms-list").show();
			},
			Tofix : function() {
				$.LiteUI.DeviceAlarms.init();
				$("#qz-device-alarms-tofix").addClass('active');
				$("#qz-device-alarms-list").show();
			},
			History : function() {
				$.LiteUI.DeviceAlarms.init();
				$("#qz-device-alarms-history").addClass('active');
				$("#qz-device-alarms-list").show();
			}
		},
		KPI : {
			Init : function() {
				$("#qz-device-links-detail,#qz-device-thrpt-detail").hide();
				$("#qz-device-links,#qz-device-thrpt").removeClass('active');
			},
			Links : function() {
				$.LiteUI.KPI.Init();
				$("#qz-device-links").addClass('active');
				$("#qz-device-links-detail").show();
			},
			Thrpt : function() {
				$.LiteUI.KPI.Init();
				$("#qz-device-thrpt").addClass('active');
				$("#qz-device-thrpt-detail").show();
			}
		},
		Tools : {
			Init : function() {
				$("#qz-tools-tools-detail,#qz-tools-services-detail").hide();
				$("#qz-tools-tools,#qz-tools-services").removeClass('active');
			},
			Tools : function() {
				$.LiteUI.Tools.Init();
				$("#qz-tools-tools").addClass('active');
				$("#qz-tools-tools-detail").show();
			},
			Services : function() {
				$.LiteUI.Tools.Init();
				$("#qz-tools-services").addClass('active');
				$("#qz-tools-services-detail").show();
			}
		},
		Update : {
			Device : function(data) {
				// console.log(data.device, data.device.mac);
				if (data) {
					var device = $.Val.IsValid(data.device) ? data.device
							: null;
					var wmac = device && $.Val.IsValid(device.wmac) ? device.wmac : null;

					var base = device && $.Val.IsValid(device.base) ? device.base : null;
					var wireless = device && $.Val.IsValid(device.wireless) ? device.wireless
							: null;
					var network = device && $.Val.IsValid(device.network) ? device.network
							: null;
					var thrpt = device && $.Val.IsValid(device.thrpt) ? device.thrpt
							: null;

					if (wmac) {
						var name = $.Val.IsValid(device.name) ? device.name
								: '-';
						var mac = $.Val.IsValid(device.mac) ? device.mac : '-';
						var hwver = $.Val.IsValid(device.hwver) ? device.hwver
								: '-';
						var fwver = $.Val.IsValid(device.fwver) ? device.fwver
								: '-';

						$("#qz-devices-device-name").val(name);
						$("#qz-devices-device-id").val(wmac + ', ' + mac);
						$("#qz-devices-device-hwver").val(hwver);
						$("#qz-devices-device-fwver").val(fwver);

						var ssid = base && $.Val.IsValid(base.ssid) ? base.ssid
								: '-';
						var wireless = $.Val.IsValid(device.wireless) ? device.wireless
								: null;

						var mdesc = $.GWS
								.Mode(base && $.Val.IsValid(base.mode) ? base.mode
										: 0);
						var rgn = wireless && $.Val.IsValid(wireless.region) ? wireless.region
								: 0;
						var channel = wireless
								&& $.Val.IsValid(wireless.channel) ? wireless.channel
								: 0;
						// var freq = wireless && $.Val.IsValid(wireless.freq) ?
						// wireless.freq : 0;
						var txpower = wireless
								&& $.Val.IsValid(wireless.txpower) ? wireless.txpower
								: 0;
						var watt = wireless && $.Val.IsValid(wireless.watt) ? wireless.watt
								: 0;
						var chanbw = wireless && $.Val.IsValid(wireless.chanbw) ? wireless.chanbw
								: 0;

						var fdesc = $.GWS.Freq(rgn, channel);
						var tdesc = $.GWS.Txpower(txpower, watt);

						$("#qz-devices-device-mode").val(mdesc);
						$("#qz-devices-device-ssid").val(ssid);
						$("#qz-devices-device-freq").val(fdesc);
						$("#qz-devices-device-txpower").val(tdesc);
						$("#qz-devices-device-chanbw").val(chanbw + ' MHz');

						var ifname = network && $.Val.IsValid(network.ifname) ? network.ifname
								: '-';
						var vlan = network && $.Val.IsValid(network.vlan) ? network.vlan
								: '-';
						var ip = network && $.Val.IsValid(network.ip) ? network.ip
								: '-';
						var netmask = network && $.Val.IsValid(network.netmask) ? network.netmask
								: '-';
						var gateway = network && $.Val.IsValid(network.gateway) ? network.gateway
								: '-';

						$("#qz-devices-device-ifname").val(ifname);
						$("#qz-devices-device-vlan").val(vlan);
						$("#qz-devices-device-ip").val(ip);
						$("#qz-devices-device-netmask").val(netmask);
						$("#qz-devices-device-gw").val(gateway);

						// update Devices.Device.[.label]
						$("#qz-device-network").find('.label').text(device.ip);
						$("#qz-devices-device-name-alarm").text(name);
						$("#qz-device-wireless").find('.label').text(chanbw);
					}

					// update peers
					// console.log('Device Peers');
					var links_tbody = $("#qz-device-links-detail")
							.find('tbody');
					var links_tbody_html = '';

					var peer_qty = wireless && $.Val.IsValid(wireless.peer_qty) ? wireless.peer_qty
							: 0;
					var peers = wireless && $.Val.IsValid(wireless.peers) ? wireless.peers
							: null;
					$("#qz-device-links").find('.label').html(peer_qty);
					if (peer_qty > 0 && peers) {
						$
								.each(
										peers,
										function(idx, peer) {
											var wmac = peer
													&& $.Val.IsValid(peer.wmac) ? peer.wmac
													: '-';
											var ip = peer
													&& $.Val.IsValid(peer.ip) ? peer.ip
													: '-';
											var rx_mcs = peer
													&& $.Val
															.IsValid(peer.rx_mcs) ? peer.rx_mcs
													: '-';
											var rx_br = peer
													&& $.Val
															.IsValid(peer.rx_br) ? peer.rx_br
													: '-';
											var tx_mcs = peer
													&& $.Val
															.IsValid(peer.tx_mcs) ? peer.tx_mcs
													: '-';
											var tx_br = peer
													&& $.Val
															.IsValid(peer.tx_br) ? peer.tx_br
													: '-';
											var inactive = peer
													&& $.Val
															.IsValid(peer.inactive) ? peer.inactive
													: '-';

											var desc = wmac + ' ( ' + ip + ' )';
											var rx = 'MCS ' + rx_mcs + ' ( '
													+ rx_br + ' Mbit/s)';
											var tx = 'MCS ' + tx_mcs + ' ( '
													+ tx_br + ' Mbit/s)';
											var note = inactive + ' ms';

											links_tbody_html += '<tr>';
											links_tbody_html += '<td>' + desc
													+ '</td>';
											links_tbody_html += '<td>' + rx
													+ '</td>';
											links_tbody_html += '<td>' + tx
													+ '</td>';
											links_tbody_html += '<td>' + note
													+ '</td>';
											links_tbody_html += '</tr>';
										});
					} else {
						links_tbody_html = '<tr><td colspan="4">无线空闲（没有连接到其它设备）</td></tr>';
					}
					links_tbody.nextAll().remove().end().html(links_tbody_html);

					// update network
					// console.log('Device Network');
					var thrpt_tbody = $("#qz-device-thrpt-detail")
							.find('tbody');
					// TODO: handle unit Kbps & Mbps
					var thrpt_tbody_html = '', icon_html = '0+0 Mbps';
					var thrpt_qty = thrpt && $.Val.IsValid(thrpt.qty) ? thrpt.qty
							: 0;
					var ifname_rxtx = thrpt && $.Val.IsValid(thrpt.ifname_rxtx) ? thrpt.ifname_rxtx
							: 0;
					if (thrpt_qty > 0 && ifname_rxtx) {
						var total_dl = 0, total_ul = 0, total_unit = 'Mbps';
						$.each(ifname_rxtx, function(idx, rt) {
							var desc = rt.name;
							var unit = rt.unit;
							var dl = rt.rx, ul = rt.tx;
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
					} else {
						thrpt_tbody_html = '<tr><td colspan="4">正在统计，请稍候</td></tr>';
					}
					$("#qz-device-thrpt").find('.label').html(icon_html);
					thrpt_tbody.nextAll().remove().end().html(thrpt_tbody_html);
					return true;
				}
				return false;
			},
			DevicesList : function(data) {
				if (data && data.qty) {
					var ds = data.ds;
					var total = ds.total;
					var offline = ds.offline ? ds.offline : 0;
					var online = ds.online ? ds.online : 0;
					var qty = data.qty;
					var qty_desc = total + '=' + offline + '+' + online;
					console.log('$.Lite.DevicesListUpdate()', total, qty);
					/*
					 * // replace by $.BG.AuditStart() if (total > 0) { //
					 * Update Nav.[DEVICES].Qty var nav_devices =
					 * $("#qz-nav-devices").find('.label');
					 * nav_devices.text(qty_desc); if (offline > 0) {
					 * nav_devices.removeClass('green').addClass('red'); } else {
					 * nav_devices.removeClass('red').addClass('green'); } }
					 */
					if (qty > 0) {
						// update Devices.[LIST]
						var list_header = $("#qz-devices-list-header");
						list_header.nextAll().remove();
						var list = data.devices;
						$
								.each(
										list,
										function() {
											var $this = $(this)[0];
											var id = $this.id, name = $this.name, ipaddr = $this.ipaddr;
											var peer_qty = $this.peer_qty, html = '';

											if (!$.Val.IsValid(name))
												name = '未命名的新设备';
											if (!$.Val.IsValid(peer_qty))
												peer_qty = 0;
											if (peer_qty > 0) {
												html = '<a class="item" id="'
														+ id
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
														+ '">('
														+ ipaddr
														+ ') '
														+ name
														+ '<div class="ui red label">-</div></a>';
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
							$("#qz-devices-list-header").nextAll().removeClass(
									'active');
							$(this).addClass('active');

							var id = $(this).attr('id');
							console.log('try first child: id =', id);
							$.Lite.Update.DeviceDetail(id);
						});

						// select first result when done
						devices.first().trigger('click');
					}
				} else {

				}
			},
			DeviceConfig : function(data) {
				// console.log(data.device, data.device.name);
				if (data && data.device && data.device.name) {
					var device = data.device;
					$("#qz-device-config-name").val(device.name);
					$("#qz-device-config-latlng").val(device.latlng);

					$("#qz-device-config-ip").val(device.network.ip);
					$("#qz-device-config-netmask").val(device.network.netmask);
					$("#qz-device-config-gw").val(device.network.gateway);

					if (device.abb) {
						$("#qz-device-config-ssid").val(device.abb.ssid);
						$("#qz-device-config-mode").dropdown('set selected',
								device.abb.mode);
					}
					if (device.radio) {
						$("#qz-device-config-chanbw").dropdown('set selected',
								device.radio.chanbw);
						var region = new Number(device.radio.region);
						$("#qz-device-config-region").dropdown('set selected',
								region.toString());
						$("#qz-device-config-channel")
								.val(device.radio.channel);
						$("#qz-device-config-txpower").dropdown('set selected',
								device.radio.txpower);
						$.LiteUI.DeviceConfig.GWS('channel');
					}
					return true;
				}
				return false;
			}
		}
	}
})(jQuery); // $.LiteUI

// TODO: load maps asap
// by Qige <qigezhao@gmail.com> @2017.09.12
// load Microsoft Bing Maps
(function($) {
	$.BingMaps = {
		init : function() {
			console.log('Loading Microsoft Bing Maps');
			// *
			if (!$.Lite.data.map) {
				console.log('$.BingMaps.init()');
				$.Lite.data.map = new Microsoft.Maps.Map(
						document.getElementById('qz-maps-box'),
						{
							center : new Microsoft.Maps.Location(40.0492,
									116.2902),
							credentials : 'AsHiUhyyE-3PP8A82WyPhdS6_Z18NL2cuaySXTGPviswZ_WDmgDlaSZ7xpEF77-3',
							// credentials: '{Your Bing Maps Key}',
							showMapTypeSelector : false,
							showBreadcrumb : true,
							enableClickableLogo : false,
							enableSearchLogo : false,
							// mapTypeId: Microsoft.Maps.MapTypeId.aerial,
							maxZoom : 17,
							minZoom : 9,
							zoom : 14
						});
			}
			// */
		},
		UpdateIcons : function(icons) {
		}
	}
})(jQuery); // $.BingMaps

/*
 * TODO: - msg_sync: read msg from database - audit: audit token timeout, audit
 * device offline
 */

// ARN-iOMC3 at 20171130
var loadMap = $.BingMaps.init; // FIXME: load Microsoft Bing Maps async
$(function() {
	// Application start (lite version)
	$.Lite.InitAll();

	// now wait for user click/input/timer
	$.Lite.Start();
});