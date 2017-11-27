/*
* by Qige <qigezhao@gmail.com>
* 2017.09.15
*/

// Test each function by setTimeout();
$(function() {
  console.log('* Auto-Test ENABLED! ', new Date().toTimeString());
  $.AutoTest.Start();  
});


(function($) {
  $.AutoTest = {
    Start: function() {
      var timeoutInMs = 0, timeoutStepInMs = 1000;
      
      timeoutStepInMs = 1000;
      timeoutInMs = $.AutoTest.Signin(timeoutInMs, timeoutStepInMs);
      
      timeoutStepInMs = 1000;
      timeoutInMs = $.AutoTest.Nav(timeoutInMs, timeoutStepInMs);
      
      // void default in "Devices"
      //toInMs += timeoutStepInMs;

      timeoutStepInMs = 1000;
      timeoutInMs = $.AutoTest.Devices(timeoutInMs, timeoutStepInMs);
      
      timeoutStepInMs = 1500;
      timeoutInMs = $.AutoTest.Maps(timeoutInMs, timeoutStepInMs);
      
      timeoutStepInMs = 1000;
      timeoutInMs = $.AutoTest.Options(timeoutInMs, timeoutStepInMs);
      
      $.AutoTest.Reload(timeoutInMs);
    },
    Reload: function(timeoutInMs) {
      setTimeout(function() {
        $.Tab.Reload();      
      }, timeoutInMs+1000);
    },
    Signin: function(timeoutInMs, timeoutStepInMs) {
      console.log("*test Signin> start =", timeoutInMs, ', step =', timeoutStepInMs);
      var toInMs = timeoutInMs;      
      setTimeout(function() {
        console.log('*test> auto login');
        $.Lite.Start();
        
      }, toInMs);
      toInMs += timeoutStepInMs;

      setTimeout(function() {
        console.log('*test> auto login');
        $("#qz-signin-btn-default").trigger('click');
        
      }, toInMs);
      toInMs += timeoutStepInMs;
      
      return toInMs;
    },
    Nav: function(timeoutInMs, timeoutStepInMs) {
      console.log("*test MainProcess> start =", timeoutInMs, ', step =', timeoutStepInMs);
      var toInMs = timeoutInMs;            
      setTimeout(function() {
        console.log('*test> try devices');
        $("#qz-nav-devices").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;
      
      setTimeout(function() {
        console.log('*test> try maps');
        $("#qz-nav-maps").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;

      setTimeout(function() {
        console.log('*test> try options');
        $("#qz-nav-options").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;

      setTimeout(function() {
        console.log('*test> try nav search');
        $("#qz-nav-text-keyword").val('24');
        $("#qz-nav-btn-search").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;

      return toInMs;
    },
    Devices: function(timeoutInMs, timeoutStepInMs) {
      console.log("*test Devices> start =", timeoutInMs, ', step =', timeoutStepInMs);
      // test search
      var toInMs = timeoutInMs;
      
      //*
      setTimeout(function() {
        console.log('*test> try devices');
        $("#qz-nav-devices").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;
      //*/

      //*
      setTimeout(function() {
        console.log('*test> try devices');
        $("#qz-devices-list-header").nextAll().eq(1).trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;
      //*/
      
      setTimeout(function() {
        console.log('*test> try device config');
        $("#qz-device-btn-config").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;
      
      //*
      setTimeout(function() {
        console.log('*test> try device config done');
        $("#qz-device-btn-config-done").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;

      setTimeout(function() {
        console.log('*test> try nav search');
        $("#qz-nav-text-keyword").val('24');
        $("#qz-nav-btn-search").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;
      
      setTimeout(function() {
        console.log('*test> try device config');
        $("#qz-device-btn-config").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;
      
      setTimeout(function() {
        console.log('*test> try device config done');
        $("#qz-device-btn-config-done").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;

      return toInMs;      
    },
    Maps: function(timeoutInMs, timeoutStepInMs) {
      console.log("*test Maps> start =", timeoutInMs, ', step =', timeoutStepInMs);
      var toInMs = timeoutInMs;
      
      setTimeout(function() {
        console.log('*test> try maps');
        $("#qz-nav-maps").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;
      
      setTimeout(function() {
        console.log('*test> try maps search');
        $("#qz-maps-text-keyword").val('24');
        $("#qz-maps-btn-search").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;
      
      setTimeout(function() {
        console.log('*test> try maps list click');
        $("#qz-maps-text-keyword").val('24');
        var lists = $("#qz-maps-list-header").nextAll();
        lists.removeClass('active');
        lists.eq(3).addClass('active');
        lists.last().trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;

      return toInMs;
    },
    Options: function(timeoutInMs, timeoutStepInMs) {
      console.log("*test Options> start =", timeoutInMs, ', step =', timeoutStepInMs);
      var toInMs = timeoutInMs;
      setTimeout(function() {
        console.log('*test> try options');
        $("#qz-nav-options").trigger('click');
      }, toInMs);
      toInMs += timeoutStepInMs;

      return toInMs;      
    }
  };
}) (jQuery);