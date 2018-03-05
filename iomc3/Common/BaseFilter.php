<?php
// by Qige <qigezhao@gmail.com>
// 2017.11.15 v3.0.2
// 2017.11.17 v3.0.3
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// return safe array/string
// verified since 2017.12.28 17:11
class BaseFilter
{

    // TODO: add more chars
    private static $unsafeItems = array(
        ' ',
        '*',
        '?',
        ';'
    );

    static public function FilterAll($data = null, $unsafeItems = null)
    {
        return self::filterArray($data, $unsafeItems);
    }

    // find the first value with assigned key
    // support "multi-depth arrray search", by Qige at 2017.11.15
    static public function SearchKey($data = NULL, $key = NULL)
    {
        $val = NULL;
        if ($data && $key && is_array($data)) {
            if (key_exists($key, $data)) {
                $val = $data[$key];
                // $val = self::FilterAll($val); // FIXME: return safe value
                return $val;
            } else {
                foreach ($data as $k => $v) {
                    if (is_array($v)) {
                        $val = self::SearchKey($v, $key);
                        if ($val)
                            break;
                    }
                }
            }
        }
        return $val;
    }

    static private function filterArray($data = null, $unsafeItems = null)
    {
        if ($data && is_array($data)) {
            // NOTE: "& $value", not "$value"
            // FIXME: $key maybe not exists (by Qige 2017.11.29)
            // foreach ($data as $key => & $value) {
            foreach ($data as & $value) {
                if ($value && is_array($value)) {
                    $value = self::filterArray($value, $unsafeItems);
                } else {
                    $value = self::filterString($value, $unsafeItems);
                }
            }
        }
        return $data;
    }

    static private function filterString($string = null, $unsafeItems = null)
    {
        $str = '';
        if ($string) {
            if ($unsafeItems) {
                $str = str_replace(self::$unsafeItems, '', trim($string));
            } else {
                $str = str_replace(self::$unsafeItems, '', trim($string));
            }
        }
        return $str;
    }
} // class BaseFilter

?>
