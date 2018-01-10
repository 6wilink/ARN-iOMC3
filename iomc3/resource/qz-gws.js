/*
 * by Qige <qigezhao@gmail.com>
 *
 * TODO: 1. let GWS support Model#;
 */

(function($) {
	$.GWS = {
		Mode : function(mode) {
			var mode_str = '子站 (WDS STA)';
			switch (mode) {
			case 'mesh':
            case '0':
            case 0:
				mode_str = '自组网I (WDS Mesh)';
				break;
			case 'adhoc':
			case 'ad-hoc':
            case '3':
            case 3:
				mode_str = '自组网II (WDS Ad-Hoc)';
				break;
			case 'car':
			case 'ap':
            case '1':
            case 1:
				mode_str = '基站 (WDS AP)';
				break;
			case 'ear':
			case 'sta':
            case '0':
            case 0:
			default:
				mode_str = '子站 (WDS STA)';
				break;
			}
			return mode_str;
		},
		FreqDesc : function(region, channel, freq) {
			return '区域' + region + ' / 频道' + channel + ' / ' + freq + ' MHz';
		},
		Txpower : function(dbm, watt) {
			return dbm + ' dBm / ' + watt + '瓦';
		},
		Freq : function(region, channel) {
			var freq, fdesc = '';
			var freqStart, freqStop, chanBw, chanStart;
			switch(region) {
            case '1':
            case 1:
				freqStart = 474, freqStop = 790, chanBw = 8, chanStart = 21;
                if (channel >= chanStart) {
                    freq = freqStart + (channel - chanStart) * chanBw;
                } else {
                    freq = freqStart;
                }
                break;
            case '0':
            case 0:
				freqStart = 473, freqStop = 790, chanBw = 6, chanStart = 14;
                if (channel >= chanStart) {
                    freq = freqStart + (channel - chanStart) * chanBw;
                } else {
                    freq = freqStart;
                }
                break;
            case '-':
            default:
                freq = '-';
                break;
			}
            return freq;
        },
        WirelessDesc: function(region, channel, freq, chanbw) {
			var fdesc = '区域' + region + ' / 频道' + channel + ' / '+ freq + 'MHz / 调制'+ chanbw +'M';
            return fdesc;
		},
		FreqToChannel : function(region, freq) {
			var channel = 0;
			var freqStart, freqStop, chanBw, chanStart;
			if (region > 0) {
				freqStart = 474, freqStop = 790, chanBw = 8, chanStart = 21;
			} else {
				freqStart = 473, freqStop = 790, chanBw = 6, chanStart = 14;
			}

			channel = chanStart;
			while (freq < freqStop
					&& (channel - chanStart) * chanBw < (freq - freqStart)) {
				channel++;
			}
			return channel;
		}
	}
})(jQuery);
