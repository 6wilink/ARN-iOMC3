<?php
// by Qige <qigezhao@gmail.com>
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// verified since 2017.12.28 17:11
final class BaseEnv
{

    static public function RemoteIPAddr($server = NULL)
    {
        if ($server && is_array($server)) {
            if (! empty($server['REMOTE_ADDR'])) {
                return $server['REMOTE_ADDR'];
            }
        }
        return NULL;
    }

    static public function RemoteUserAgent($serverRaw = NULL)
    {
        if ($serverRaw && is_array($serverRaw)) {
            if (! empty($serverRaw['HTTP_USER_AGENT'])) {
                return $serverRaw['HTTP_USER_AGENT'];
            }
        }
        return NULL;
    }
}

?>
