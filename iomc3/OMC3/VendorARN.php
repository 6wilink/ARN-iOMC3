<?php
// by Qige <qigezhao@gmail.com> since 2017.11.29
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
        switch ($txpwr) {
            case 40:
            case 39:
            case 38:
                $val = 8;
                break;
            case 37:
            case 36:
            case 35:
                $val = 4;
                break;
            case 34:
            case 33:
            case 32:
                $val = 2;
                break;
            case 31:
            case 30:
                $val = 1;
                break;
            case 27:
                $val = 0.5;
                break;
            case 24:
                $val = 0.25;
                break;
            case 23:
                $val = 0.2;
                break;
            case 20:
                $val = 0.1;
                break;
            case 17:
                $val = 0.05;
                break;
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
        switch ($emode) {
            case 'adhoc':
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