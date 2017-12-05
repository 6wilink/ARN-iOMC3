<?php
// by Qige <qigezhao@gmail.com>
// 2017.11.15 v3.0.1
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// Http: [page.ext?]k1=v1&l2=v2&k3=v3
final class FormatHttp
{
    
    static public function Encode($data = NULL)
    {
        $str = '';
        if ($data) {
            if (is_array($data)) {
                foreach ($data as $key => $value) {
                    if ($str != '') {
                        $str .= '&';
                    }
                    if (is_array($value)) {
                        $str .= self::Encode($value);
                    } else {
                        $str .= "{$key}={$value}";
                    }
                }
            } else {
                $str = $data;
            }
        }
        return $str;
    }
    
    // k1=v1&k2=v2&k3=v3
    // "first=value&arr[]=foo+bar&arr[]=baz"
    static public function Decode($str = NULL)
    {
        $data = $str;
        if ($str) {
            parse_str($str, $data);
        }
        return $data;
    }
    
    // reply/response
    static public function Response($data = NULL)
    {
        if ($data) {
            echo($data);
        } else {
            echo("\n");
        }
    }

}

?>
