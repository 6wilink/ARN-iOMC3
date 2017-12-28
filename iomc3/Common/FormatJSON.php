<?php
// by Qige <qigezhao@gmail.com>
// 2017.11.15 v3.1.1
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// php >= 5.2.0, 7.0; PECL json >= 1.2.0
// FIXME: check php version first
// if (version_compare("5.2", PHP_VERSION, ">"))
// verified since 2017.12.28 17:11
final class FormatJSON
{

    private static $error = NULL;

    static public function Encode($data = null)
    {
        if ($data) {
            if (function_exists('json_encode')) {
                $json = @ json_encode($data);
                return $json;
            }
        }
        return NULL;
    }

    static public function Decode($data = NULL)
    {
        if ($data) {
            $str = trim($data, chr(239) . chr(187) . chr(191)); // remove utf-8 BOM
            if (function_exists('json_decode')) {
                $array = json_decode($str, $assoc = true);
                return $array;
            }
        }
        return NULL;
    }
}

?>
