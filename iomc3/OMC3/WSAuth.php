<?php
// by Qige <qigezhao@gmail.com> at 2017.11.29
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/OMC3/WSError.php';
require_once BPATH . '/OMC3/OMCAuthDAO.php';

// take care of signin/signout/token related
final class WSAuth
{

    // TODO: find "user", "passwd", verify by DAO
    // return "TOKEN"
    static public function Signin($host = NULL, $user = NULL, $passwd = NULL)
    {
        $reply = NULL;
        
        if (self::isEnvValid()) {
            if (self::isUserPasswdValid($user, $passwd)) {
                $key = "{$host}+{$user}+{$passwd}";
                $token = self::tokenMaker($key);
                self::tokenSave($user, $token);
                $reply = self::authResultMaker($token, $host);
            } else {
                $reply = OMCError::GetErrorInArray(ERROR_BAD_AUTH_USRPWD, __FUNCTION__);
            }
        } else {
            $reply = OMCError::GetErrorInArray(ERROR_BAD_AUTH_ENV, __FUNCTION__);
        }
        
        return $reply;
    }

    static public function IsTokenValid($token = NULL)
    {
        // TODO: query token via DAO
        $reply = NULL;
        $flagTokenValid = ($token && OMCAuthDAO::IsTokenValid($token));
        return $flagTokenValid;
    }

    static public function Signout($host = NULL, $token = NULL)
    {
        if (self::IsTokenValid(($token))) {
            // make sure it's logout from signin host/ipaddr
            // remove token from database;
        }
    }

    // organize auth result in array
    static private function authResultMaker($token = NULL, $host = NULL)
    {
        $reply = NULL;
        if ($token) {
            $reply = array(
                'data' => array(
                    'auth' => array(
                        'token' => $token,
                        'timeout' => 3600 * 24,
                        'src' => ($host ? $host : '-')
                    )
                )
            );
        } else {
            $reply = OMCError::GetErrorInArray(ERROR_BAD_TOKEN_MAKER, __FUNCTION__);
        }
        return $reply;
    }
    
    // TODO: verify via DAO
    static private function isUserPasswdValid($user = NULL, $passwd = NULL)
    {
        return (true && OMCAuthDAO::IsUserPasswdValid($user, $passwd));
    }

    // call "md5", "sha1" exists of not. 2017.11.29
    static private function isEnvValid()
    {
        return function_exists('md5');
    }

    static private function tokenSave($user = NULL, $token = NULL)
    {
        return OMCAuthDAO::SaveToken($user, $token);
    }

    static private function tokenMaker($key = ' ')
    {
        $token = NULL;
        if (self::isEnvValid()) {
            $token = md5($key);
        }
        return $token;
    }
}