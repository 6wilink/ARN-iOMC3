/*
 * by Qige <qigezhao@gmail.com>
 * 2017.09.07 SementicUI|$.App|$.SementicUI|$.Install
 * 2017.09.13 re-format naming rules
 *
 * TODO:
 *     1. Remove "DBG_MODAL" button;
 *     2. Read & valid "input:text" before send Ajax requests;
 *
 * Fixed:
 *     1. StepII.Prev takes too much time; Qige@2017.09.08
 *     2. Progress bar: invalid after "reset"; Qige@2017.09.08
 *     3. Re-format with jQuery.fn.exnted(); Qige@2017.09.13
 */
(function($) {
	$.App = {
		Init : function() {
			console.log('$.App.Init()');
			// hide & show sth.
			$.Install.Init();
		},
		Start : function() {
			// start step_I
			$.Install.Start();
		},
		Bind : function() {
			// buttons, hide & show sth.
			/*
			 * $("#qz-btn-env-ok").click(function() { $('#qz-env-h5js').hide();
			 * $("#qz-app").show(); });
			 */
			$("#qz-btn-model").click(function() {
				$("#qz-s4-congrates").modal('show');
			}), $("#qz-s1-btn-recheck").click(function() {
				$.Install.Recheck();
			});
			$("#qz-s2-btn-prev").click(function() {
				console.log('StepII.Prev');
				$.Install.StepI();
			});
			$("#qz-s1-btn-reinstall").click(function() {
				$.SementicUI.BtnDisable($(this));
				$.Install.Reinstall();
			});
			$("#qz-s1-btn-next").click(function() {
				console.log('StepI.Next');
				$.Install.StepII();
			});
			$("#qz-s3-btn-prev").click(function() {
				console.log('StepIII.Prev');
				$.Install.StepII();
			});
			$("#qz-s2-btn-copy").click(function() {
				$.Install.CopyFiles();
			});
			$("#qz-s2-btn-default").click(function() {
				$.Install.CopyFilesDefault();
				$("#qz-s2-btn-copy").trigger('click');
			});
			$("#qz-s2-btn-next").click(function() {
				console.log('StepII.Next');
				$.Install.StepIII();
			});
			$("#qz-s3-btn-next").click(function() {
				console.log('StepIII.Next');
				$.Install.StepIV();
			});
			$("#qz-s3-btn-import").click(function() {
				$.Install.DatabaseImport();
			});
			$("#qz-s3-btn-default").click(function() {
				$.Install.DatabaseImportDefault();
				$("#qz-s3-btn-import").trigger('click');
			});
		}
	}
})(jQuery);

// Handle all ARN.OMC3.Install processes
(function($) {
	$.Install = {
		Init : function() {
			console.log('$.Install.Init()');
			console.log('(todo) hide html5/javascript, show app');

			$.SUIInit();

			$("#qz-s1-progress,#qz-s2-progress,#qz-s3-progress")
					.SUIProgressReset();
			$("#qz-s1-btn-next,#qz-s2-btn-next,#qz-s3-btn-next").BtnDisable();
		},
		Start : function() {
			$.Install.StepI();
			$.Request.StepI();
		},
		Recheck : function() {
			$.Install.Start();
		},
		StepI : function() {
			console.log('$.Install.StepI');
			$("#qz-nav-s1").removeClass("disabled").addClass("active");
			$("#qz-nav-s2,#qz-nav-s3").removeClass("active").addClass(
					"disabled");
			$("#qz-block-s2,#qz-block-s3").hide();
			$("#qz-block-s1").show();
		},
		StepII : function() {
			console.log('$.Install.StepII');
			$("#qz-nav-s1").removeClass("disabled active");
			$("#qz-nav-s2").removeClass("disabled").addClass("active");
			$("#qz-nav-s3").removeClass("active").addClass("disabled");
			$("#qz-block-s1,#qz-block-s3").hide();
			$("#qz-block-s2").show();
		},
		StepIII : function() {
			console.log('$.Install.StepIII');
			$("#qz-nav-s1,#qz-nav-s2").removeClass("disabled active");
			$("#qz-nav-s3").removeClass("disabled").addClass("active");
			$("#qz-block-s1,#qz-block-s2").hide();
			$("#qz-block-s3").show();
		},
		StepIV : function() {
			console
					.log('Installation completed! Redirect to index.html in 30 seconds');
			$("#qz-s4-congrates").modal('show');
		},
		Reinstall : function() {
			console.log('$.Install.Reinstall()');
		},
		CopyFiles : function() {
			$.Install.StepII();
			$.Request.StepII();
		},
		CopyFilesDefault : function() {
			$("#qz-s2-app-path").val('/var/www/html/iOMC3/');
			$("#qz-s2-app-user").val('admin');
			$("#qz-s2-app-passwd").val('6wilink');
			// $.Install.CopyFiles();
		},
		DatabaseImport : function() {
			$.Install.StepIII();
			$.Request.StepIII();
		},
		DatabaseImportDefault : function() {
			$("#qz-s3-db-ip").val('127.0.0.1');
			$("#qz-s3-db-user").val('root');
			$("#qz-s3-db-passwd").val('');
			// $.Install.DatabaseImport(); // TODO?
		}
	}
})(jQuery);

/*
 * 1 loading mask; 2 do Ajax request; 2.1 if error, unmask, print error; 2.2 if
 * done, parse result; 2.2.1 if any step error, unmask, print error; 2.2.2 if
 * all done, unmask, print done; 3. enable buttons;
 */
(function($) {
	$.Request = {
		StepI : function() {
			console.log('$.Request.StepI()');
			$("#qz-s1-mask").SUILoaderShow(); // hide when Ajax done/error
			$("#qz-s1-btn-recheck").BtnDisable();
			$("#qz-s1-progress").SUIProgressReset();
			$.Ajax.Query('/iOMC3/install.php?step=I', '',
					$.Request.CB_WhenStepIReply, $.Request.CB_WhenStepIFailed);
		},
		CB_WhenStepIReply : function(resp) {
			console.log('$.Request.CB_WhenStepIReply()');
			var error = (resp && resp.error) ? resp.error : '404';
			console.log('error =', error);
			switch (error) {
			case '404':
				$.Request.CB_WhenStepIFailed(null, 'error', 'Bad Result');
				break;
			case 'env_lock': // FIXME: Even installed, do all checks
				$("#qz-s1-info").SUIMessageError('下列检查有错误，请联络管理员后，点击“重新检查”');
				$("#qz-s1-f1").SUIListItemFailed('安装被锁定');
				$("#qz-s1-f2").SUIListItemWait('安装被锁定，停止检查');
				$("#qz-s1-f3").SUIListItemWait('等待检查');
				$("#qz-s1-f4").SUIListItemWait('等待检查');
				break;
			case 'env_os':
				$("#qz-s1-info").SUIMessageError('下列检查有错误，请联络管理员后，点击“重新检查”');
				$("#qz-s1-f1").SUIListItemSuccess('安装未锁定');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-f2").SUIListItemFailed('条件不符合');
				$("#qz-s1-f3").SUIListItemWait('由于条件不满足，停止检查');
				$("#qz-s1-f4").SUIListItemWait('等待检查');
				break;
			case 'env_amp':
				$("#qz-s1-info").SUIMessageError('下列检查有错误，请联络管理员后，点击“重新检查”');
				$("#qz-s1-f1").SUIListItemSuccess('安装未锁定');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-f2").SUIListItemSuccess('条件符合');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-f3").SUIListItemFailed('环境不符合');
				$("#qz-s1-f4").SUIListItemWait('等待检查由于条件不满足，停止检查');
				break;
			case 'env_dep':
				$("#qz-s1-info").SUIMessageError('下列检查有错误，请联络管理员后，点击“重新检查”');
				$("#qz-s1-f1").SUIListItemSuccess('安装未锁定');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-f2").SUIListItemSuccess('条件符合');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-f3").SUIListItemSuccess('环境符合');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-f4").SUIListItemFailed('依赖包不符合');
				break;
			case 'none':
			default: // FIXME: DEBUG USE ONLY! when bad response, do nothing
				$("#qz-s1-info").SUIMessageSuccess('请确认下列检查均已经成功完成，然后点击“下一步”');
				$("#qz-s1-f1").SUIListItemSuccess('安装未锁定');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-f2").SUIListItemSuccess('条件符合');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-f3").SUIListItemSuccess('环境符合');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-f4").SUIListItemSuccess('依赖包符合');
				$("#qz-s1-progress").SUIProgressIncrease();
				$("#qz-s1-btn-next").BtnEnable();
				break;
			// default: // TODO
			// break;
			}
			$("#qz-s1-btn-recheck").BtnEnable();
			$("#qz-s1-mask").SUILoaderHide();
		},
		CB_WhenStepIFailed : function(xhr, status, error) {
			console.log('$.Request.CB_WhenStepIFailed()', status, error);
			$("#qz-s1-info").SUIMessageError('下列检查有错误，请联络管理员后，点击“重新检查”');
			$("#qz-s1-f1").SUIListItemFailed('检查失败');
			$("#qz-s1-f2").SUIListItemWait('安装被锁定，停止检查');
			$("#qz-s1-f3").SUIListItemWait('等待检查');
			$("#qz-s1-f4").SUIListItemWait('等待检查');

			$("#qz-s1-btn-recheck").BtnEnable();
			$("#qz-s1-btn-next").BtnDisable();
			$("#qz-s1-mask").SUILoaderHide();
		},
		StepII : function() {
			console.log('$.Request.StepII')
			$("#qz-s2-mask").SUILoaderShow();
			$("#qz-s2-btn-copy,#qz-s2-btn-default").BtnDisable();
			$("#qz-s2-progress").SUIProgressReset();
			// TODO: collect path/user/passwd from input:text
			$.Ajax.Query('/iOMC3/install.php?step=II', {
				path : '/var/html/www/iOMC3/',
				user : 'admin',
				passwd : '6wilink'
			}, $.Request.CB_WhenStepIIReply, $.Request.CB_WhenStepIIFailed);
		},
		CB_WhenStepIIReply : function(resp) {
			console.log('$.Request.CB_WhenStepIIReply()');
			var error = (resp && resp.error) ? resp.error : '404';
			console.log('error =', error);
			switch (error) {
			case '404':
				$.Request.CB_WhenStepIIFailed(null, 'error', 'Bad Result');
				break;
			case 'file_rw':
				$("#qz-s2-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
				$("#qz-s2-f1").SUIListItemFailed('文件读写失败');
				$("#qz-s2-f2").SUIListItemWait('等待检查由于条件不满足，停止检查');
				$("#qz-s2-f3").SUIListItemWait('等待检查');
				$("#qz-s2-f4").SUIListItemWait('等待检查');
				$("#qz-s2-btn-copy").SUIBtnPrimary().BtnEnable();
				$("#qz-s2-btn-default").SUIBtnNormal().BtnEnable();
				break;
			case 'file_cp':
				$("#qz-s2-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
				$("#qz-s2-f1").SUIListItemSuccess('权限符合');
				$("#qz-s2-progress").SUIProgressIncrease();
				$("#qz-s2-f2").SUIListItemFailed('复制失败');
				$("#qz-s2-f3").SUIListItemWait('等待检查由于条件不满足，停止检查');
				$("#qz-s2-f4").SUIListItemWait('等待检查');
				$("#qz-s2-btn-copy").SUIBtnPrimary().BtnEnable();
				$("#qz-s2-btn-default").SUIBtnNormal().BtnEnable();
				break;
			case 'file_conf':
				$("#qz-s2-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
				$("#qz-s2-f1").SUIListItemSuccess('权限符合');
				$("#qz-s2-progress").SUIProgressIncrease();
				$("#qz-s2-f2").SUIListItemSuccess('复制完成');
				$("#qz-s2-progress").SUIProgressIncrease();
				$("#qz-s2-f3").SUIListItemFailed('保存失败');
				$("#qz-s2-f4").SUIListItemWait('等待检查由于条件不满足，停止检查');
				$("#qz-s2-btn-copy").SUIBtnPrimary().BtnEnable();
				$("#qz-s2-btn-default").SUIBtnNormal().BtnEnable();
				break;
			case 'http_visit':
				$("#qz-s2-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
				$("#qz-s2-f1").SUIListItemSuccess('权限符合');
				$("#qz-s2-progress").SUIProgressIncrease();
				$("#qz-s2-f2").SUIListItemSuccess('复制完成');
				$("#qz-s2-progress").SUIProgressIncrease();
				$("#qz-s2-f3").SUIListItemSuccess('权限符合');
				$("#qz-s2-progress").SUIProgressIncrease();
				$("#qz-s2-f4").SUIListItemFailed('测试失败');
				$("#qz-s2-btn-copy").SUIBtnPrimary().BtnEnable();
				$("#qz-s2-btn-default").SUIBtnNormal().BtnEnable();
				break;
			case 'none':
			default: // FIXME: DEBUG USE ONLY! when bad response, do nothing
				$("#qz-s2-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
				$("#qz-s2-f1").SUIListItemSuccess('权限符合');
				$("#qz-s2-progress").SUIProgressIncrease();
				$("#qz-s2-f2").SUIListItemSuccess('复制完成');
				$("#qz-s2-progress").SUIProgressIncrease();
				$("#qz-s2-f3").SUIListItemSuccess('权限符合');
				$("#qz-s2-progress").SUIProgressIncrease();
				$("#qz-s2-f4").SUIListItemSuccess('测试完成');
				$("#qz-s2-progress").SUIProgressIncrease();

				$("#qz-s2-btn-copy,#qz-s2-btn-default").SUIBtnNormal()
						.BtnDisable();
				$("#qz-s2-btn-next").SUIBtnPrimary().BtnEnable();
				break;
			// default: // TODO
			// break;
			}
			$("#qz-s2-mask").SUILoaderHide();
		},
		CB_WhenStepIIFailed : function(xhr, status, error) {
			console.log('$.Request.CB_WhenStepIIFailed()', status, error);
			$("#qz-s2-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
			$("#qz-s2-f1").SUIListItemFailed('检查失败');
			$("#qz-s2-f2").SUIListItemWait('等待检查由于条件不满足，停止检查');
			$("#qz-s2-f3").SUIListItemWait('等待检查');
			$("#qz-s2-f4").SUIListItemWait('等待检查');

			$("#qz-s2-btn-copy").SUIBtnPrimary().BtnEnable();
			$("#qz-s2-btn-default").SUIBtnNormal().BtnEnable();
			$("#qz-s2-btn-next").SUIBtnPrimary().BtnDisable();

			$("#qz-s2-mask").SUILoaderHide();
		},
		StepIII : function() {
			console.log('$.Request.StepIII')
			$("#qz-s3-mask").SUILoaderShow();
			$("#qz-s3-btn-import,#qz-s3-btn-default").BtnDisable();
			$("#qz-s3-progress").SUIProgressReset();
			$.Ajax.Query('/iOMC3/install.php?step=III', {
				db_host : '127.0.0.1',
				db_user : 'root',
				db_passwd : ''
			}, $.Request.CB_WhenStepIIIReply, $.Request.CB_WhenStepIIIFailed);
		},
		CB_WhenStepIIIReply : function(resp) {
			console.log('$.Request.CB_WhenStepIIIReply()');
			var error = (resp && resp.error) ? resp.error : '404';
			console.log('error =', error);
			switch (error) {
			case '404':
				$.Request.CB_WhenStepIIIFailed(null, 'error', 'Bad Result');
				break;
			case 'db_host':
				$("#qz-s3-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
				$("#qz-s3-f1").SUIListItemFailed('连接失败');
				$("#qz-s3-f2").SUIListItemWait('等待检查由于条件不满足，停止检查');
				$("#qz-s3-f3").SUIListItemWait('等待检查');
				$("#qz-s3-btn-import").SUIBtnPrimary().BtnEnable();
				$("#qz-s3-btn-import").SUIBtnNormal().BtnEnable();
				break;
			case 'db_auth':
				$("#qz-s3-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
				$("#qz-s3-progress").SUIProgressIncrease();
				$("#qz-s3-f1").SUIListItemFailed('连接失败');
				$("#qz-s3-f2").SUIListItemWait('等待检查由于条件不满足，停止检查');
				$("#qz-s3-f3").SUIListItemWait('等待检查');
				$("#qz-s3-btn-import").SUIBtnPrimary().BtnEnable();
				$("#qz-s3-btn-import").SUIBtnNormal().BtnEnable();
				break;
			case 'db_init':
				$("#qz-s3-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
				$("#qz-s3-f1").SUIListItemSuccess('连接成功');
				$("#qz-s3-progress").SUIProgressIncrease();
				$("#qz-s3-progress").SUIProgressIncrease();
				$("#qz-s3-f2").SUIListItemFailed('初始化数据库失败');
				$("#qz-s3-f3").SUIListItemWait('等待检查由于条件不满足，停止检查');
				$("#qz-s3-btn-import").SUIBtnPrimary().BtnEnable();
				$("#qz-s3-btn-import").SUIBtnNormal().BtnEnable();
				break;
			case 'db_select':
				$("#qz-s3-info").SUIMessageError('下列检查有错误，请联络管理员后重试');
				$("#qz-s3-f1").SUIListItemSuccess('连接成功');
				$("#qz-s3-progress").SUIProgressIncrease();
				$("#qz-s3-progress").SUIProgressIncrease();
				$("#qz-s3-f2").SUIListItemSuccess('初始化成功');
				$("#qz-s3-progress").SUIProgressIncrease();
				$("#qz-s3-f3").SUIListItemFailed('尝试使用数据库失败');
				$("#qz-s3-btn-import").SUIBtnPrimary().BtnEnable();
				$("#qz-s3-btn-import").SUIBtnNormal().BtnEnable();
				break;
			case 'none':
			default:
				$("#qz-s3-info").SUIMessageSuccess('数据库初始化完成，请点击“开始使用”');
				$("#qz-s3-f1").SUIListItemSuccess('连接成功');
				$("#qz-s3-progress").SUIProgressIncrease();
				$("#qz-s3-progress").SUIProgressIncrease();
				$("#qz-s3-f2").SUIListItemSuccess('初始化成功');
				$("#qz-s3-progress").SUIProgressIncrease();
				$("#qz-s3-f3").SUIListItemSuccess('尝试使用数据库成功');
				$("#qz-s3-progress").SUIProgressIncrease();

				$("#qz-s3-btn-import,#qz-s3-btn-default").SUIBtnNormal()
						.BtnDisable();
				$("#qz-s3-btn-next").SUIBtnPrimary().BtnEnable();
				break;
			}
			;

			$("#qz-s3-mask").SUILoaderHide();
		},
		CB_WhenStepIIIFailed : function(xhr, status, error) {
			console.log('$.ajax.step_III_error()', status, error);
			$("#qz-s3-info").SUIMessageError('下列检查有错误，请联络管理员后，点击“开始初始化”');
			$("#qz-s3-f1").SUIListItemFailed('检查失败');
			$("#qz-s3-f2").SUIListItemWait('等待检查由于条件不满足，停止检查');
			$("#qz-s3-f3").SUIListItemWait('等待检查');

			$("#qz-s3-btn-import").SUIBtnPrimary().BtnEnable();
			$("#qz-s3-btn-default").SUIBtnNormal().BtnEnable();
			$("#qz-s3-btn-next").SUIBtnPrimary().BtnDisable();

			$("#qz-s3-mask").SUILoaderHide();
		}
	}
})(jQuery);

// ARN.OMC3.Install
$(function() {
	// call App, then wait for user click/input
	$.App.Init();
	// Bind events
	$.App.Bind();
	$.App.Start();

	// now wait for user click/input
});
