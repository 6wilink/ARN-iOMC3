<?php
// by Qige <qigezhao@gmail.com> since 2017.11.29/2017.12.25
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// unit convert
final class VendorARN
{

    static public function ConvertChannelToFreq($region = 0, $channel = 0)
    {
        $val = 0;
        if ($region > 0 && $channel >= 21 && $channel <= 60) {
            $val = 474 + ($channel - 21) * 8;
        }
        if ($region < 1 && $channel >= 14 && $channel <= 60) {
            $val = 473 + ($channel - 14) * 6;
        }
        return $val;
    }

    static public function ConvertFreqToChannel($region = 0, $freq = 0)
    {
        $val = 0;
        if ($region > 0 && $freq >= 474 && $freq <= 790) {
            $val = ((int) ($freq - 474) / 8) + 21;
        }
        if ($region < 1 && $freq >= 473 && $freq <= 790) {
            $val = ((int) ($freq - 473) / 6) + 14;
        }
        return $val;
    }

    static public function ConvertTxpwrToWatt($txpwr = NULL)
    {
        $val = 0;
        if ($txpwr >= 37) {
            $val = 8;
        } else if ($txpwr >= 35) {
            $val = 4;
        } else if ($txpwr >= 32) {
            $val = 2;
        } else if ($txpwr >= 29) {
            $val = 1;
        } else if ($txpwr >= 26) {
            $val = 0.5;
        } else if ($txpwr >= 23) {
            $val = 0.2;
        } else if ($txpwr >= 20) {
            $val = 0.1;
        } else if ($txpwr >= 17) {
            $val = 0.05;
        } else {
            $val = 0.02;
        }
        return $val;
    }

    static public function ConvertModeToEnumMode($mode = NULL)
    {
        $emode = NULL;
        switch (strtolower($mode)) {
            case 'car':
            case 'ap':
                $emode = 'ap';
                break;
            case 'ear':
            case 'sta':
                $emode = 'sta';
                break;
            case 'mesh':
                $emode = 'mesh';
                break;
            case 'adhoc':
            case 'ad-hoc':
                $emode = 'adhoc';
                break;
            default:
                $emode = 'unknown';
                break;
        }
        return $emode;
    }

    static public function ConvertEnumModeToMode($emode = NULL)
    {
        $mode = NULL;
        switch (strtolower($emode)) {
            case 'adhoc':
            case 'ad-hoc':
                $mode = 'Ad-Hoc';
                break;
            case 'ap':
                $mode = 'WDS AP';
                break;
            case 'sta':
                $mode = 'WDS EAR';
                break;
            case 'mesh':
                $mode = 'Mesh Point';
                break;
            case 'unknown':
            default:
                $mode = 'unknown';
                break;
        }
        return $mode;
    }
}

?>
