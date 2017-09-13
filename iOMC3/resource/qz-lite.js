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
    data: {},
    init: function() {
      console.log('$.App.init()');
      // hide & show sth.
      $.Lite.Init();
    },
    start: function() {
      // start step_I
      $.Lite.start();
    },
    bind: function() {
      $("#qz-nav-options").click(function() {
        $.LiteUI.Nav.Options();
      });
      $("#qz-nav-maps").click(function() {
        $.LiteUI.Nav.Maps();
      });
      $("#qz-nav-devices").click(function() {
        $.LiteUI.Nav.Devices();
      });
      // wrapper of Devices.Search
      $("#qz-nav-btn-search").click(function() {
        var keyword = $("#qz-nav-text-keyword").val();
        console.log('qz-nav-text-keyword =', keyword);
        $("#qz-devices-text-keyword").val(keyword);
        $("#qz-nav-devices").trigger("click");
        $("#qz-devices-btn-search").trigger('click');
      });
      $("#qz-nav-text-keyword").keydown(function(e) {
        //console.log('search when hit ENTER');
        if (e.keyCode == 13) {
          $("#qz-nav-btn-search").trigger('click');
        }
      });
      
      // search when keyword/pattern not empty
      $("#qz-devices-btn-search").click(function() {
        var keyword = $("#qz-devices-text-keyword").val();
        console.log('qz-devices-text-keyword =', keyword);
      });
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
    }
  }
}) (jQuery);

(function($) {
  $.Lite = {
    Init: function() {
      $.LiteUI.Init();
    },
    start: function() {
      // Nav: Start with devices
      $("#qz-nav-devices,#qz-device-base,#qz-device-thrpt").trigger('click');
      
      // Devices.Config: hide
      $("#qz-device-btn-config-done").trigger('click');
      
      // Options.Tab: tools
      $("#qz-options-tools").trigger('click');
    }
  }
}) (jQuery);

(function($) {
  $.LiteUI = {
    Init: function() {
      $(".ui.dropdown").dropdown({
        useLabels: false
      });
      $('.ui.accordion').accordion();      
    },
    Nav: {
      Init: function() {
        $("#qz-devices,#qz-maps,#qz-options").hide();
        $("#qz-nav-devices,#qz-nav-maps,#qz-nav-options").removeClass('active');
      },
      Devices: function() {
        $.LiteUI.Nav.Init();
        $("#qz-nav-devices").addClass('active');
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
        $("#qz-options").show();
      }
    },
    Config: {
      // TODO: container don't have enough space to display all
      // decide which block to display
      Show: function() {
        $.LiteUI.Config.Basic();
        $("#qz-device-config-title,#qz-device-config").show();
        //$("#qz-device-kpi-title,#qz-device-kpi").hide();
        //$("#qz-device-details").hide();
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
  // call App, then wait for user click/input
  $.App.init();
  
  // bind events
  $.App.bind();
  $.App.start();
  
  // now wait for user click/input
});

