<?php
// by Qige <qigezhao@gmail.com> at 2017.11.29
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/Common/BaseInterface.php';
require_once BPATH . '/OMC3/OMCBaseDAO.php';

// authentication related, share OMCBaseDAO with OMCDeviceDAO
final class OMCAuthDAO extends OMCBaseDAO
{

    private static $DB_AUTH_TABLE = 'arn_auth';

    // query if user & passwd pair matches
    static public function IsUserPasswdValid($user = NULL, $passwd = NULL)
    {
        if ($user && $passwd) {
            $table = self::$DB_AUTH_TABLE;
            $sql = "select id from {$table} where user='{$user}' and passwd=password('{$passwd}')";
            $records = self::OMCDbFetchBySQL($sql, __FUNCTION__);
            return (true && count($records));
        }
        return false;
    }

    // query if token exists
    // FIXME: add token timeout ts
    static public function IsTokenValid($token = NULL)
    {
        if ($token) {
            $table = self::$DB_AUTH_TABLE;
            $sql = "select id from {$table} where token='{$token}'";
            $records = self::OMCDbFetchBySQL($sql, __FUNCTION__);
            return ($token && count($records));
        }
        return false;
    }

    // save token to database
    static public function SaveToken($user = NULL, $token = NULL)
    {
        if ($user && $token) {
            $table = self::$DB_AUTH_TABLE;
            $now = date('Y-m-d H:i:s');
            $updates = "token='{$token}',ts='{$now}'";
            $sql = "update {$table} set {$updates} where user='{$user}'";
            $result = self::OMCDbQuery($sql, __FUNCTION__);
            return $result;
        }
        return NULL;
    }
}

?>
