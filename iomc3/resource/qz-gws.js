/*
* by Qige <qigezhao@gmail.com>
*
* TODO: 1. let GWS support Model#;
*/

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
    FreqDesc: function(region, channel, freq) {
      return '区域' + region + ' / 频道' + channel + ' / ' + freq + ' MHz';
    },
    Txpower: function(dbm, watt) {
      return dbm + ' dBm / ' + watt + '瓦';
    },
    Freq: function(region, channel) {
      var freq = 0;
      var freqStart, freqStop, chanBw, chanStart;
      if (region > 0) {
        freqStart = 474, freqStop = 790, chanBw = 8, chanStart = 21;
      } else {
        freqStart = 473, freqStop = 790, chanBw = 6, chanStart = 14;
      }
      if (channel >= chanStart) {
        freq = freqStart + (channel - chanStart) * chanBw;
      } else {
        freq = freqStart;
      }
      return freq;
    },
    FreqToChannel: function(region, freq) {
      var channel = 0;
      var freqStart, freqStop, chanBw, chanStart;
      if (region > 0) {
        freqStart = 474, freqStop = 790, chanBw = 8, chanStart = 21;
      } else {
        freqStart = 473, freqStop = 790, chanBw = 6, chanStart = 14;
      }

      channel = chanStart;
      while(freq < freqStop && (channel - chanStart) * chanBw < (freq - freqStart)) {
        channel ++;
      }
      return channel;
    }
  }
}) (jQuery);
