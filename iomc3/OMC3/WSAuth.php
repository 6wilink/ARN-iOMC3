<?php
// by Qige <qigezhao@gmail.com> at 2017.11.29
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/OMC3/WSError.php';
require_once BPATH . '/OMC3/OMCAuthDAO.php';

// take care of signin/signout/token related
final class WSAuth
{

    // TODO: verify all token
    static public function AuditAll()
    {
        $tokens = NULL;
        if ($tokens && is_array($tokens)) {
            foreach ($tokens as $token) {
                // TODO: check if token is no longer valid
            }
        }
    }

    // save token by DAO, return "TOKEN", verified at 2017.12.05
    static public function Signin($host = NULL, $user = NULL, $passwd = NULL)
    {
        $reply = NULL;
        
        if (self::isEnvValid()) {
            if (self::isUserPasswdValid($user, $passwd)) {
                $key = "{$user}:{$passwd}@{$host}";
                $token = self::tokenMaker($key);
                self::tokenSave($user, $token, $host);
                $reply = self::authResultMaker($token, $host);
            } else {
                $reply = OMCError::GetErrorInArray(ERROR_BAD_AUTH_USRPWD, __FUNCTION__);
            }
        } else {
            $reply = OMCError::GetErrorInArray(ERROR_BAD_AUTH_ENV, __FUNCTION__);
        }
        
        return $reply;
    }

    // search token by DAO, verified at 2017.12.05
    static public function IsTokenValid($token = NULL)
    {
        // query token via DAO
        return ($token && OMCAuthDAO::IsTokenValid($token));
    }

    // delete token by DAO
    static public function Signout($host = NULL, $token = NULL)
    {
        if (self::IsTokenValid($token) && $host) {
            return OMCAuthDAO::DeleteToken($token, $host);
        }
        return NULL;
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

    // verify via DAO
    static private function isUserPasswdValid($user = NULL, $passwd = NULL)
    {
        return (true && OMCAuthDAO::IsUserPasswdValid($user, $passwd));
    }

    // save "token", "host" to "user"
    static private function tokenSave($user = NULL, $token = NULL, $host = NULL)
    {
        return OMCAuthDAO::SaveToken($user, $token, $host);
    }

    // call "md5", "sha1" exists of not. 2017.11.29
    static private function isEnvValid()
    {
        return function_exists('md5');
    }

    // candicate: md5, sha1, etc
    static private function tokenMaker($key = ' ')
    {
        $token = NULL;
        if (self::isEnvValid()) {
            $token = md5($key);
        }
        return $token;
    }
}